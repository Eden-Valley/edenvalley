import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, initDb } from '../lib/db';
import Stripe from 'stripe';
import { sendPriorityConfirmationEmail } from '../lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

let dbInitialized = false;
async function ensureDb() {
  if (!dbInitialized) {
    await initDb();
    dbInitialized = true;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await ensureDb();
  } catch (error) {
    console.error('DB init error:', error);
  }

  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = req.body;
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerEmail = session.customer_details?.email || (session.metadata?.email);

        if (customerEmail) {
          await sql`
            UPDATE profiles 
            SET payment_status = 'paid', 
                status = 'priority',
                priority_deadline_at = NOW() + INTERVAL '72 hours',
                stripe_payment_intent_id = ${session.payment_intent || session.id}
            WHERE user_id = (
              SELECT u.id FROM users u 
              WHERE u.email = ${customerEmail}
            )
          `;

          await sendPriorityConfirmationEmail(customerEmail);
          console.log(`✅ Payment confirmed for ${customerEmail}`);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const customerEmail = paymentIntent.receipt_email || paymentIntent.metadata?.email;

        if (customerEmail) {
          await sql`
            UPDATE profiles 
            SET payment_status = 'paid',
                stripe_payment_intent_id = ${paymentIntent.id}
            WHERE user_id = (
              SELECT u.id FROM users u 
              WHERE u.email = ${customerEmail}
            )
          `;
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        console.log('Refund processed for charge:', charge.id);
        
        if (charge.payment_intent) {
          await sql`
            UPDATE profiles 
            SET refund_status = 'completed',
                payment_status = 'refunded'
            WHERE stripe_payment_intent_id = ${charge.payment_intent}
          `;
        }
        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).json({ error: 'Webhook error' });
  }
}
