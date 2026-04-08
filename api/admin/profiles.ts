import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, initDb } from '../_lib/db';
import { requireAdmin } from '../_lib/auth';

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

  if (!requireAdmin(req.headers.authorization)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await ensureDb();
  } catch (error) {
    console.error('DB init error:', error);
    return res.status(500).json({ error: 'Database initialization failed' });
  }

  if (req.method === 'GET') {
    try {
      const profiles = await sql`
        SELECT 
          u.id as user_id,
          u.email,
          u.first_name,
          u.last_name,
          u.role,
          u.created_at,
          p.type,
          p.vision,
          p.proof_of_work,
          p.proof_of_identity,
          p.investor_type,
          p.preferred_stage,
          p.sectors,
          p.ticket_size,
          p.status,
          p.payment_status,
          p.priority_deadline_at,
          p.referral_code,
          p.refund_status,
          p.refund_id
        FROM users u
        JOIN profiles p ON u.id = p.user_id
        WHERE p.status IN ('pending', 'priority', 'under_review')
        ORDER BY 
          CASE p.status 
            WHEN 'priority' THEN 1 
            WHEN 'under_review' THEN 2 
            ELSE 3 
          END,
          p.priority_deadline_at ASC NULLS LAST,
          u.created_at ASC
      `;
      return res.status(200).json({ profiles });
    } catch (error) {
      console.error('Admin profiles error:', error);
      return res.status(500).json({ error: 'Failed to fetch profiles' });
    }
  }

  if (req.method === 'POST') {
    const { userId, action } = req.body;

    if (!userId || !action) {
      return res.status(400).json({ error: 'userId and action are required' });
    }

    try {
      if (action === 'accept') {
        await sql`
          UPDATE profiles 
          SET status = 'accepted', updated_at = NOW()
          WHERE user_id = ${userId}
        `;

        const user = await sql`SELECT email FROM users WHERE id = ${userId}`;
        if (user.length > 0) {
          const { sendWelcomeEmail } = await import('../_lib/email');
          await sendWelcomeEmail(user[0].email);
        }

        return res.status(200).json({ success: true, message: 'Profile accepted.' });
      } 
      else if (action === 'reject') {
        const user = await sql`SELECT email FROM users WHERE id = ${userId}`;
        const email = user.length > 0 ? user[0].email : null;

        await sql`
          UPDATE profiles 
          SET status = 'rejected', updated_at = NOW()
          WHERE user_id = ${userId}
        `;

        if (email) {
          const profile = await sql`
            SELECT stripe_payment_intent_id, payment_status 
            FROM profiles 
            WHERE user_id = ${userId}
          `;

          if (profile.length > 0 && profile[0].payment_status === 'paid' && profile[0].stripe_payment_intent_id) {
            const Stripe = (await import('stripe')).default;
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
            
            try {
              const refund = await stripe.refunds.create({
                payment_intent: profile[0].stripe_payment_intent_id,
                reason: 'requested_by_customer',
              });

              await sql`
                UPDATE profiles 
                SET refund_status = 'completed',
                    refund_id = ${refund.id},
                    payment_status = 'refunded',
                    updated_at = NOW()
                WHERE user_id = ${userId}
              `;

              const { sendRefundEmail, sendRejectionEmail } = await import('../_lib/email');
              await sendRefundEmail(email, refund.id);
              await sendRejectionEmail(email);
              
              return res.status(200).json({ success: true, message: 'Profile rejected. Refund processed.', refundId: refund.id });
            } catch (refundError) {
              console.error('Refund failed:', refundError);
            }
          }

          const { sendRejectionEmail } = await import('../_lib/email');
          await sendRejectionEmail(email);
        }

        return res.status(200).json({ success: true, message: 'Profile rejected.' });
      }
      else if (action === 'start_review') {
        await sql`
          UPDATE profiles 
          SET status = 'under_review', updated_at = NOW()
          WHERE user_id = ${userId}
        `;
        return res.status(200).json({ success: true, message: 'Review started.' });
      }
      else {
        return res.status(400).json({ error: 'Invalid action' });
      }
    } catch (error) {
      console.error('Admin action error:', error);
      return res.status(500).json({ error: 'Failed to process action' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
