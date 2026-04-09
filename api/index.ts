import { neon } from '@neondatabase/serverless';

let _resend: any = null;
function getResend() {
  if (!_resend) {
    const { Resend } = require('resend');
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

let _sql: ReturnType<typeof neon> | null = null;
function getSql() {
  if (!_sql) {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) throw new Error('DATABASE_URL not set');
    _sql = neon(DATABASE_URL);
  }
  return _sql;
}

let _stripe: any = null;
function getStripe() {
  if (!_stripe) {
    const Stripe = require('stripe');
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
  }
  return _stripe;
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

function requireAdmin(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  return authHeader.split(' ')[1] === process.env.ADMIN_TOKEN;
}

async function initDb() {
  const sql = getSql();
  await sql`CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT UNIQUE NOT NULL, first_name TEXT, last_name TEXT, role TEXT, is_validated BOOLEAN DEFAULT FALSE, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`;
  await sql`CREATE TABLE IF NOT EXISTS profiles (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES users(id) ON DELETE CASCADE, type TEXT, vision TEXT, proof_of_work TEXT, proof_of_identity TEXT, investor_type TEXT, preferred_stage TEXT, sectors TEXT, ticket_size TEXT, status TEXT DEFAULT 'pending', payment_status TEXT DEFAULT 'unpaid', priority_deadline_at TIMESTAMP WITH TIME ZONE, stripe_payment_intent_id TEXT, refund_status TEXT DEFAULT NULL, refund_id TEXT DEFAULT NULL, referral_code TEXT UNIQUE, referred_by TEXT, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`;
}

async function sendEmail(to, subject, html) {
  try {
    await getResend().emails.send({ from: 'Eden Valley <no-reply@edenvalley.at.eu.org>', to, subject, html });
    return true;
  } catch () { return false; }
}

async function sendWelcomeEmail(email) {
  await sendEmail(email, 'Welcome to Eden Valley', '<h1>Welcome</h1><p>Your application has been accepted.</p>');
}

async function sendRejectionEmail(email) {
  await sendEmail(email, 'Your application to Eden Valley', '<h1>Application Status</h1><p>Thank you for your interest in Eden Valley.</p>');
}

async function sendRefundEmail(email, refundId) {
  await sendEmail(email, 'Your Priority Review Refund - Eden Valley', `<h1>Refund Processed</h1><p>Your Priority Review payment has been refunded.</p><p>We did not meet our 72-hour decision SLA. As promised, your refund has been processed.</p><p>Refund ID: ${refundId}</p>`);
}

async function sendPriorityEmail(email) {
  await sendEmail(email, 'Priority Review Confirmed - Eden Valley', '<h1>Priority Review Confirmed</h1><p>Your payment has been received. Our team will manually evaluate your profile within 72 hours.</p>');
}

export default async function handler(req, res) {
  const { pathname } = new URL(req.url, 'https://example.com');
  const method = req.method;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') return res.status(200).end();

  try {
    await initDb();
  } catch () {}

  try {
    if (pathname === '/api/health' && method === 'GET') {
      return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    if (pathname === '/api/stats' && method === 'GET') {
      const sql = getSql();
      const result = await sql`SELECT COUNT(*) as count FROM users`;
      return res.status(200).json({ userCount: parseInt(result[0]?.count || 0) });
    }

    if (pathname === '/api/founders' && method === 'POST') {
      const sql = getSql();
      const { firstName, lastName, email, type, vision, proofOfWork, tier, referredBy } = req.body || {};

      if (!firstName || !lastName || !email || !type || !vision || !proofOfWork) {
        return res.status(400).json({ error: 'All fields required' });
      }

      const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
      if (existing.length > 0) return res.status(400).json({ error: 'Email already registered' });

      const referralCode = `EV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const status = tier === 'priority' ? 'priority' : 'pending';

      const userResult = await sql`INSERT INTO users (email, first_name, last_name, role) VALUES (${email}, ${firstName}, ${lastName}, ${type}) RETURNING id`;
      await sql`INSERT INTO profiles (user_id, type, vision, proof_of_work, status, payment_status, referral_code, referred_by) VALUES (${userResult[0].id}, ${type}, ${vision}, ${proofOfWork}, ${status}, 'unpaid', ${referralCode}, ${referredBy || null})`;

      return res.status(200).json({ success: true, userId: userResult[0].id, referralCode, status });
    }

    if (pathname === '/api/funders' && method === 'POST') {
      const sql = getSql();
      const { firstName, lastName, email, investorType, stage, sectors, ticketSize, proofOfIdentity } = req.body || {};

      if (!firstName || !lastName || !email || !investorType || !stage || !sectors || !ticketSize || !proofOfIdentity) {
        return res.status(400).json({ error: 'All fields required' });
      }

      const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
      if (existing.length > 0) return res.status(400).json({ error: 'Email already registered' });

      const referralCode = `EV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const userResult = await sql`INSERT INTO users (email, first_name, last_name, role) VALUES (${email}, ${firstName}, ${lastName}, 'funder') RETURNING id`;
      await sql`INSERT INTO profiles (user_id, type, investor_type, preferred_stage, sectors, ticket_size, proof_of_identity, status, payment_status, referral_code) VALUES (${userResult[0].id}, 'funder', ${investorType}, ${stage}, ${sectors}, ${ticketSize}, ${proofOfIdentity}, 'pending', 'unpaid', ${referralCode})`;

      return res.status(200).json({ success: true, userId: userResult[0].id, referralCode });
    }

    if (pathname === '/api/validate-user' && method === 'GET') {
      const sql = getSql();
      const email = req.query?.email;
      if (!email) return res.status(400).json({ error: 'Email required' });
      const result = await sql`SELECT is_validated FROM users WHERE email = ${email} LIMIT 1`;
      return res.status(200).json({ isValidated: result.length > 0 && result[0].is_validated === true });
    }

    if (pathname === '/api/admin/profiles') {
      if (!requireAdmin(req.headers.authorization)) return res.status(401).json({ error: 'Unauthorized' });

      const sql = getSql();

      if (method === 'GET') {
        const profiles = await sql`SELECT u.id as user_id, u.email, u.first_name, u.last_name, u.role, u.created_at, p.* FROM users u JOIN profiles p ON u.id = p.user_id WHERE p.status IN ('pending', 'priority', 'under_review') ORDER BY CASE p.status WHEN 'priority' THEN 1 WHEN 'under_review' THEN 2 ELSE 3 END, p.priority_deadline_at ASC NULLS LAST, u.created_at ASC`;
        return res.status(200).json({ profiles});
      }

      if (method === 'POST') {
        const { userId, action } = req.body || {};

        if (action === 'accept') {
          await sql`UPDATE profiles SET status = 'accepted', updated_at = NOW() WHERE user_id = ${userId}`;
          const user = await sql`SELECT email FROM users WHERE id = ${userId}`;
          if (user.length > 0) await sendWelcomeEmail(user[0].email);
          return res.status(200).json({ success: true });
        }

        if (action === 'reject') {
          await sql`UPDATE profiles SET status = 'rejected', updated_at = NOW() WHERE user_id = ${userId}`;
          const user = await sql`SELECT email FROM users WHERE id = ${userId}`;
          if (user.length > 0) await sendRejectionEmail(user[0].email);
          return res.status(200).json({ success: true });
        }

        if (action === 'start_review') {
          await sql`UPDATE profiles SET status = 'under_review', updated_at = NOW() WHERE user_id = ${userId}`;
          return res.status(200).json({ success: true });
        }

        return res.status(400).json({ error: 'Invalid action' });
      }
    }

    if (pathname === '/api/admin/review') {
      if (!requireAdmin(req.headers.authorization)) return res.status(401).json({ error: 'Unauthorized' });
      if (method !== 'POST') return res.status(405).end();

      const { userId, action } = req.body || {};
      const sql = getSql();

      if (action === 'accept') {
        await sql`UPDATE profiles SET status = 'accepted', updated_at = NOW() WHERE user_id = ${userId}`;
        const user = await sql`SELECT email FROM users WHERE id = ${userId}`;
        if (user.length > 0) await sendWelcomeEmail(user[0].email);
        return res.status(200).json({ success: true });
      }

      if (action === 'reject') {
        await sql`UPDATE profiles SET status = 'rejected', updated_at = NOW() WHERE user_id = ${userId}`;
        const user = await sql`SELECT email FROM users WHERE id = ${userId}`;
        if (user.length > 0) await sendRejectionEmail(user[0].email);
        return res.status(200).json({ success: true });
      }

      if (action === 'start_review') {
        await sql`UPDATE profiles SET status = 'under_review', updated_at = NOW() WHERE user_id = ${userId}`;
        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    if (pathname === '/api/cron/process-refunds') {
      if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const sql = getSql();
      const expired = await sql`SELECT u.id as user_id, p.stripe_payment_intent_id FROM users u JOIN profiles p ON u.id = p.user_id WHERE p.status = 'priority' AND p.payment_status = 'paid' AND p.priority_deadline_at < NOW() AND (p.refund_status IS NULL OR p.refund_status = 'pending')`;

      for (const profile of expired) {
        if (profile.stripe_payment_intent_id) {
          try {
            const refund = await getStripe().refunds.create({ payment_intent: profile.stripe_payment_intent_id, reason: 'requested_by_customer' });
            await sql`UPDATE profiles SET refund_status = 'completed', refund_id = ${refund.id}, updated_at = NOW() WHERE user_id = ${profile.user_id}`;
            await sendRefundEmail('user', refund.id);
          } catch () {
            await sql`UPDATE profiles SET refund_status = 'failed', updated_at = NOW() WHERE user_id = ${profile.user_id}`;
          }
        }
      }

      return res.status(200).json({ success: true, processed: expired.length });
    }

    if (pathname === '/api/stripe/webhook') {
      if (method !== 'POST') return res.status(405).end();

      const url = new URL(req.url, 'https://example.com');
      const isTestMode = url.searchParams.get('test') === 'true';

      let event;
      try {
        if (webhookSecret && req.headers['stripe-signature'] && !isTestMode) {
          event = getStripe().webhooks.constructEvent(req.body, req.headers['stripe-signature'], webhookSecret);
        } else {
          event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        }
      } catch () {
        return res.status(400).json({ error: 'Webhook error' });
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const email = session.customer_details?.email;
        const paymentIntent = session.payment_intent || session.id;
        if (email) {
          const sql = getSql();
          await sql`UPDATE profiles SET payment_status = 'paid', status = 'priority', priority_deadline_at = NOW() + INTERVAL '72 hours', stripe_payment_intent_id = ${paymentIntent} WHERE user_id = (SELECT id FROM users WHERE email = ${email} ORDER BY created_at DESC LIMIT 1)`;
          await sendPriorityEmail(email);
        }
      }

      if (event.type === 'charge.refunded') {
        const charge = event.data.object;
        if (charge.payment_intent) {
          const sql = getSql();
          await sql`UPDATE profiles SET refund_status = 'completed', payment_status = 'refunded' WHERE stripe_payment_intent_id = ${charge.payment_intent}`;
        }
      }

      return res.status(200).json({ received: true });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch () {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
