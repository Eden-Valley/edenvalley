import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, initDb } from '../_lib/db';
import Stripe from 'stripe';
import { sendRefundEmail } from '../_lib/email';

let dbInitialized = false;
async function ensureDb() {
  if (!dbInitialized) {
    await initDb();
    dbInitialized = true;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await ensureDb();
  } catch (error) {
    console.error('DB init error:', error);
  }

  console.log('🔍 Checking for expired priority reviews...');
  
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

    const expiredProfiles = await sql`
      SELECT 
        u.id as user_id,
        u.email,
        p.stripe_payment_intent_id,
        p.refund_status
      FROM users u
      JOIN profiles p ON u.id = p.user_id
      WHERE p.status = 'priority'
        AND p.payment_status = 'paid'
        AND p.priority_deadline_at < NOW()
        AND (p.refund_status IS NULL OR p.refund_status = 'pending')
    `;

    console.log(`Found ${expiredProfiles.length} expired profiles to refund`);

    let processed = 0;

    for (const profile of expiredProfiles) {
      try {
        await sql`
          UPDATE profiles 
          SET refund_status = 'pending', updated_at = NOW()
          WHERE user_id = ${profile.user_id}
        `;

        if (profile.stripe_payment_intent_id) {
          const refund = await stripe.refunds.create({
            payment_intent: profile.stripe_payment_intent_id,
            reason: 'requested_by_customer',
          });

          await sql`
            UPDATE profiles 
            SET refund_status = 'completed', 
                refund_id = ${refund.id},
                updated_at = NOW()
            WHERE user_id = ${profile.user_id}
          `;

          await sendRefundEmail(profile.email, refund.id);
          
          console.log(`✅ Refund processed for ${profile.email}: ${refund.id}`);
          processed++;
        } else {
          console.log(`⚠️ No payment intent found for ${profile.email}`);
        }
      } catch (refundError) {
        console.error(`❌ Refund failed for ${profile.email}:`, refundError);
        
        await sql`
          UPDATE profiles 
          SET refund_status = 'failed', updated_at = NOW()
          WHERE user_id = ${profile.user_id}
        `;
      }
    }

    return res.status(200).json({ 
      success: true, 
      processed,
      message: `Processed ${processed} refunds`
    });
  } catch (error) {
    console.error('❌ Error processing refunds:', error);
    return res.status(500).json({ error: 'Failed to process refunds' });
  }
}
