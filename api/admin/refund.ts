import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, initDb } from '../../_lib/db';
import { requireAdmin } from '../../_lib/auth';
import Stripe from 'stripe';
import { sendRefundEmail } from '../../_lib/email';

let dbInitialized = false;
async function ensureDb() {
  if (!dbInitialized) {
    await initDb();
    dbInitialized = true;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!requireAdmin(req.headers.authorization)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await ensureDb();
    
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const profile = await sql`
      SELECT 
        u.id as user_id,
        u.email,
        p.stripe_payment_intent_id,
        p.payment_status
      FROM users u
      JOIN profiles p ON u.id = p.user_id
      WHERE u.id = ${userId}
    `;

    if (profile.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { email, stripe_payment_intent_id, payment_status } = profile[0];

    if (payment_status !== 'paid') {
      return res.status(400).json({ error: 'No payment to refund' });
    }

    if (!stripe_payment_intent_id) {
      return res.status(400).json({ error: 'No payment intent found' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

    const refund = await stripe.refunds.create({
      payment_intent: stripe_payment_intent_id,
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

    await sendRefundEmail(email, refund.id);

    return res.status(200).json({ success: true, refundId: refund.id });
  } catch (error) {
    console.error('Manual refund error:', error);
    return res.status(500).json({ error: 'Failed to process refund' });
  }
}
