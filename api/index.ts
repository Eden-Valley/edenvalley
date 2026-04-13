import { neon } from '@neondatabase/serverless';
import Stripe from 'stripe';
import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not set');
      return null;
    }
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

let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe && process.env.STRIPE_SECRET_KEY) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

const BASE_URL = 'https://www.edenvallie.com';
const FROM_EMAIL = 'Eden Valley <onboarding@resend.dev>';

const emailStyles = `
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #0A0A0A; color: #FAFAFA; margin: 0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background-color: #111; border: 1px solid #D4AF37; border-radius: 8px; padding: 40px; }
  h1 { color: #D4AF37; font-size: 28px; margin-bottom: 20px; font-weight: 300; }
  p { color: #A0A0A0; line-height: 1.6; margin-bottom: 16px; }
  .highlight { color: #FAFAFA; font-weight: 500; }
  .button { display: inline-block; background-color: #D4AF37; color: #0A0A0A; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: 600; margin: 20px 0; }
  .button:hover { background-color: #C4A030; }
  .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; font-size: 12px; color: #666; }
  .logo { font-size: 14px; letter-spacing: 0.3em; color: #D4AF37; margin-bottom: 30px; }
`;

const translations: Record<string, Record<string, { subject: string; title: string; body: string[]; button: string; footer: string }>> = {
  en: {
    accepted: {
      subject: 'Your Eden Valley Access',
      title: 'Welcome to Eden Valley',
      body: [
        'Your profile has been accepted.',
        'Click the button below to access your private Eden Valley space.',
        'This link is valid for 24 hours.'
      ],
      button: 'ACCESS EDEN VALLEY',
      footer: 'Eden Valley — Find your half. Build the empire.'
    },
    rejected: {
      subject: 'Your Eden Valley Application',
      title: 'Application Status',
      body: [
        'Thank you for your interest in Eden Valley.',
        'After careful consideration, we are unable to accept your application at this time.',
        'We wish you the best in your journey.'
      ],
      button: '',
      footer: 'Eden Valley'
    },
    priority: {
      subject: 'Priority Review Confirmed',
      title: 'Priority Review Confirmed',
      body: [
        'Your payment has been received.',
        'Our team will manually evaluate your profile within 72 hours.',
        'If we miss this deadline, you will be automatically refunded.'
      ],
      button: '',
      footer: 'Eden Valley — Your application is our priority.'
    },
    refund: {
      subject: 'Your Priority Review Refund',
      title: 'Refund Processed',
      body: [
        'We did not meet our 72-hour decision SLA.',
        'As promised, your refund has been processed.',
        'The refund ID is included below for your records.'
      ],
      button: '',
      footer: 'Eden Valley'
    }
  },
  fr: {
    accepted: {
      subject: 'Votre accès Eden Valley',
      title: 'Bienvenue dans Eden Valley',
      body: [
        'Votre profil a été accepté.',
        'Cliquez sur le bouton ci-dessous pour accéder à votre espace privé Eden Valley.',
        'Ce lien est valable pendant 24 heures.'
      ],
      button: 'ACCÉDER À EDEN VALLEY',
      footer: 'Eden Valley — Trouvez votre moitié. Construisez l\'empire.'
    },
    rejected: {
      subject: 'Votre candidature Eden Valley',
      title: 'Statut de votre candidature',
      body: [
        'Merci pour votre intérêt pour Eden Valley.',
        'Après réflexion, nous ne sommes pas en mesure d\'accepter votre candidature pour le moment.',
        'Nous vous souhaitons le meilleur dans votre parcours.'
      ],
      button: '',
      footer: 'Eden Valley'
    },
    priority: {
      subject: 'Priority Review Confirmé',
      title: 'Priority Review Confirmé',
      body: [
        'Votre paiement a été reçu.',
        'Notre équipe évaluera votre profil sous 72 heures.',
        'Si nous dépassons ce délai, vous serez automatiquement remboursé.'
      ],
      button: '',
      footer: 'Eden Valley — Votre candidature est notre priorité.'
    },
    refund: {
      subject: 'Votre remboursement Priority Review',
      title: 'Remboursement traité',
      body: [
        'Nous n\'avons pas respecté notre SLA de décision de 72h.',
        'Comme promis, votre remboursement a été traité.',
        'L\'ID du remboursement est inclus ci-dessous pour vos dossiers.'
      ],
      button: '',
      footer: 'Eden Valley'
    }
  }
};

function generateMagicToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function buildEmailHtml(type: string, lang: string, magicToken?: string): string {
  const t = translations[lang]?.[type] || translations['en'][type];
  const bodyHtml = t.body.map(p => `<p>${p}</p>`).join('');
  const buttonHtml = t.button && magicToken 
    ? `<a href="${BASE_URL}/auth?token=${magicToken}" class="button">${t.button}</a>` 
    : '';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t.title}</title>
    </head>
    <body style="${emailStyles}">
      <div class="container">
        <div class="logo">EDEN VALLEY</div>
        <h1>${t.title}</h1>
        ${bodyHtml}
        ${buttonHtml}
        ${magicToken && type === 'accepted' ? `<p style="font-size: 12px; color: #666; margin-top: 30px;">Token: ${magicToken.substring(0, 8)}...</p>` : ''}
        <div class="footer">${t.footer}</div>
      </div>
    </body>
    </html>
  `;
}

async function sendStyledEmail(to: string, type: string, lang: string, magicToken?: string) {
  console.log(`Sending ${type} email to ${to} in ${lang}`);
  try {
    const resend = getResend();
    if (!resend) {
      console.error('Resend not initialized');
      return false;
    }
    
    const t = translations[lang]?.[type] || translations['en'][type];
    const html = buildEmailHtml(type, lang, magicToken);
    
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: t.subject,
      html
    });
    
    console.log('Email sent:', result);
    return true;
  } catch (e: any) {
    console.error('Email send failed:', e?.message || e);
    return false;
  }
}

async function initDb() {
  const sql = getSql();
  await sql`CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT UNIQUE NOT NULL, first_name TEXT, last_name TEXT, role TEXT, is_validated BOOLEAN DEFAULT FALSE, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`;
  await sql`CREATE TABLE IF NOT EXISTS profiles (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES users(id) ON DELETE CASCADE, type TEXT, vision TEXT, proof_of_work TEXT, proof_of_identity TEXT, investor_type TEXT, preferred_stage TEXT, sectors TEXT, ticket_size TEXT, status TEXT DEFAULT 'pending', payment_status TEXT DEFAULT 'unpaid', priority_deadline_at TIMESTAMP WITH TIME ZONE, stripe_payment_intent_id TEXT, refund_status TEXT DEFAULT NULL, refund_id TEXT DEFAULT NULL, referral_code TEXT UNIQUE, referred_by TEXT, requested_tier TEXT DEFAULT NULL, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`;
  await sql`CREATE TABLE IF NOT EXISTS magic_tokens (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES users(id) ON DELETE CASCADE, token TEXT UNIQUE NOT NULL, expires_at TIMESTAMP WITH TIME ZONE NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`;

  // New tables for landing page applications
  await sql`CREATE TABLE IF NOT EXISTS thinker_applications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, idea TEXT NOT NULL, progress TEXT, diagnosis TEXT, status TEXT DEFAULT 'pending', created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`;
  await sql`CREATE TABLE IF NOT EXISTS doer_applications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, skill TEXT NOT NULL, shipped TEXT NOT NULL, vision TEXT, status TEXT DEFAULT 'pending', created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`;
  await sql`CREATE TABLE IF NOT EXISTS backer_applications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, amount TEXT NOT NULL, status TEXT DEFAULT 'pending', created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`;
  await sql`CREATE TABLE IF NOT EXISTS investor_applications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, firm TEXT, email TEXT UNIQUE NOT NULL, ticket TEXT NOT NULL, thesis TEXT, status TEXT DEFAULT 'pending', created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`;

  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en'`;
  } catch {}

  try {
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS requested_tier TEXT DEFAULT NULL`;
  } catch {}
}

export default async function handler(req: any, res: any) {
  const { pathname } = new URL(req.url, 'https://example.com');
  const method = req.method;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') return res.status(200).end();

  try {
    await initDb();
  } catch { }

  try {
    if (pathname === '/api/health' && method === 'GET') {
      return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    if (pathname === '/api/stats' && method === 'GET') {
      const sql = getSql();
      const result = await sql`SELECT COUNT(*) as count FROM users`;
      return res.status(200).json({ userCount: parseInt(result[0]?.count || 0) });
    }

    if (pathname === '/api/auth/verify' && method === 'GET') {
      const sql = getSql();
      const token = req.query?.token;
      
      if (!token) return res.status(400).json({ error: 'Token required' });
      
      const tokenRecord = await sql`SELECT mt.user_id, mt.expires_at, u.email, u.first_name, u.language FROM magic_tokens mt JOIN users u ON mt.user_id = u.id WHERE mt.token = ${token} LIMIT 1`;
      
      if (tokenRecord.length === 0) {
        return res.status(404).json({ error: 'Invalid token', valid: false });
      }
      
      const record = tokenRecord[0];
      const expiresAt = new Date(record.expires_at);
      
      if (expiresAt < new Date()) {
        await sql`DELETE FROM magic_tokens WHERE token = ${token}`;
        return res.status(400).json({ error: 'Token expired', valid: false });
      }
      
      await sql`DELETE FROM magic_tokens WHERE user_id = ${record.user_id}`;
      await sql`UPDATE users SET is_validated = TRUE WHERE id = ${record.user_id}`;
      
      return res.status(200).json({ 
        valid: true, 
        userId: record.user_id, 
        email: record.email, 
        firstName: record.first_name,
        language: record.language 
      });
    }

    if (pathname === '/api/founders' && method === 'POST') {
      const sql = getSql();
      const { firstName, lastName, email, type, vision, proofOfWork, tier, referredBy, language } = req.body || {};

      if (!firstName || !lastName || !email || !type || !vision || !proofOfWork) {
        return res.status(400).json({ error: 'All fields required' });
      }

      const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
      if (existing.length > 0) return res.status(400).json({ error: 'Email already registered' });

      const referralCode = `EV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const userLang = language || 'en';

      const userResult = await sql`INSERT INTO users (email, first_name, last_name, role, language) VALUES (${email}, ${firstName}, ${lastName}, ${type}, ${userLang}) RETURNING id`;
      await sql`INSERT INTO profiles (user_id, type, vision, proof_of_work, status, payment_status, referral_code, referred_by, requested_tier) VALUES (${userResult[0].id}, ${type}, ${vision}, ${proofOfWork}, 'pending', 'unpaid', ${referralCode}, ${referredBy || null}, ${tier || null})`;

      return res.status(200).json({ success: true, userId: userResult[0].id, referralCode, status: 'pending', tier: tier });
    }

    if (pathname === '/api/funders' && method === 'POST') {
      const sql = getSql();
      const { firstName, lastName, email, investorType, stage, sectors, ticketSize, proofOfIdentity, language } = req.body || {};

      if (!firstName || !lastName || !email || !investorType || !stage || !sectors || !ticketSize || !proofOfIdentity) {
        return res.status(400).json({ error: 'All fields required' });
      }

      const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
      if (existing.length > 0) return res.status(400).json({ error: 'Email already registered' });

      const referralCode = `EV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const userLang = language || 'en';
      
      const userResult = await sql`INSERT INTO users (email, first_name, last_name, role, language) VALUES (${email}, ${firstName}, ${lastName}, 'funder', ${userLang}) RETURNING id`;
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
      console.log('Admin profiles request, auth:', req.headers.authorization?.substring(0, 20));
      if (!requireAdmin(req.headers.authorization, req.headers['x-admin-email'] as string | undefined)) {
        console.log('Admin auth failed');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const sql = getSql();

      if (method === 'GET') {
        try {
          console.log('Fetching profiles...');
          const profiles = await sql`SELECT u.id as user_id, u.email, u.first_name, u.last_name, u.role, COALESCE(u.language, 'en') as language, u.created_at, p.* FROM users u JOIN profiles p ON u.id = p.user_id WHERE p.status IN ('pending', 'priority', 'under_review') ORDER BY CASE p.status WHEN 'priority' THEN 1 WHEN 'under_review' THEN 2 ELSE 3 END, p.priority_deadline_at ASC NULLS LAST, u.created_at ASC`;
          console.log('Profiles fetched:', profiles.length);
          return res.status(200).json({ profiles });
        } catch (e: any) {
          console.error('Profiles fetch error:', e.message);
          return res.status(500).json({ error: 'Database error', detail: e.message });
        }
      }
    }

    if (pathname === '/api/admin/review') {
      if (!requireAdmin(req.headers.authorization, req.headers['x-admin-email'] as string | undefined)) return res.status(401).json({ error: 'Unauthorized' });
      if (method !== 'POST') return res.status(405).end();

      const { userId, action } = req.body || {};
      const sql = getSql();

      if (action === 'accept') {
        const user = await sql`SELECT email, language FROM users WHERE id = ${userId} LIMIT 1`;
        if (user.length === 0) return res.status(404).json({ error: 'User not found' });

        const token = generateMagicToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await sql`DELETE FROM magic_tokens WHERE user_id = ${userId}`;
        await sql`INSERT INTO magic_tokens (user_id, token, expires_at) VALUES (${userId}, ${token}, ${expiresAt})`;
        await sql`UPDATE profiles SET status = 'accepted', updated_at = NOW() WHERE user_id = ${userId}`;

        await sendStyledEmail(user[0].email, 'accepted', user[0].language || 'en', token);

        return res.status(200).json({ success: true });
      }

      if (action === 'reject') {
        const user = await sql`SELECT email, language FROM users WHERE id = ${userId} LIMIT 1`;
        await sql`UPDATE profiles SET status = 'rejected', updated_at = NOW() WHERE user_id = ${userId}`;
        if (user.length > 0) {
          await sendStyledEmail(user[0].email, 'rejected', user[0].language || 'en');
        }
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
      const expired = await sql`SELECT u.id as user_id, u.email, u.language, p.stripe_payment_intent_id FROM users u JOIN profiles p ON u.id = p.user_id WHERE p.status = 'priority' AND p.payment_status = 'paid' AND p.priority_deadline_at < NOW() AND (p.refund_status IS NULL OR p.refund_status = 'pending')`;

      for (const profile of expired) {
        if (profile.stripe_payment_intent_id) {
          try {
            const stripe = getStripe();
            if (stripe) {
              const refund = await stripe.refunds.create({ payment_intent: profile.stripe_payment_intent_id, reason: 'requested_by_customer' });
              await sql`UPDATE profiles SET refund_status = 'completed', refund_id = ${refund.id}, updated_at = NOW() WHERE user_id = ${profile.user_id}`;
              await sendStyledEmail(profile.email, 'refund', profile.language || 'en');
            }
          } catch {
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

      let event: any;
      try {
        const stripe = getStripe();
        if (webhookSecret && req.headers['stripe-signature'] && !isTestMode && stripe) {
          event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], webhookSecret);
        } else {
          event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        }
      } catch {
        return res.status(400).json({ error: 'Webhook error' });
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const email = session.customer_details?.email;
        const paymentIntent = session.payment_intent || session.id;
        if (email) {
          const sql = getSql();
          const user = await sql`SELECT language FROM users WHERE email = ${email} ORDER BY created_at DESC LIMIT 1`;
          await sql`UPDATE profiles SET payment_status = 'paid', status = 'priority', priority_deadline_at = NOW() + INTERVAL '72 hours', stripe_payment_intent_id = ${paymentIntent} WHERE user_id = (SELECT id FROM users WHERE email = ${email} ORDER BY created_at DESC LIMIT 1)`;
          await sendStyledEmail(email, 'priority', user[0]?.language || 'en');
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

    // New endpoints for landing page applications
    if (pathname === '/api/thinkers' && method === 'POST') {
      const sql = getSql();
      const { name, email, idea, progress, diagnosis } = req.body || {};

      if (!name || !email || !idea) {
        return res.status(400).json({ error: 'Name, email, and idea are required' });
      }

      const existing = await sql`SELECT id FROM thinker_applications WHERE email = ${email} LIMIT 1` as any[];
      if (existing.length > 0) return res.status(400).json({ error: 'Email already registered' });

      await sql`INSERT INTO thinker_applications (name, email, idea, progress, diagnosis) VALUES (${name}, ${email}, ${idea}, ${progress || null}, ${diagnosis || null})`;

      return res.status(200).json({ success: true, message: 'Application received' });
    }

    if (pathname === '/api/doers' && method === 'POST') {
      const sql = getSql();
      const { name, email, skill, shipped, vision } = req.body || {};

      if (!name || !email || !skill || !shipped) {
        return res.status(400).json({ error: 'Name, email, skill, and shipped are required' });
      }

      const existing = await sql`SELECT id FROM doer_applications WHERE email = ${email} LIMIT 1` as any[];
      if (existing.length > 0) return res.status(400).json({ error: 'Email already registered' });

      await sql`INSERT INTO doer_applications (name, email, skill, shipped, vision) VALUES (${name}, ${email}, ${skill}, ${shipped}, ${vision || null})`;

      return res.status(200).json({ success: true, message: 'Application received' });
    }

    if (pathname === '/api/backers' && method === 'POST') {
      const sql = getSql();
      const { name, email, amount } = req.body || {};

      if (!name || !email || !amount) {
        return res.status(400).json({ error: 'Name, email, and amount are required' });
      }

      const existing = await sql`SELECT id FROM backer_applications WHERE email = ${email} LIMIT 1` as any[];
      if (existing.length > 0) return res.status(400).json({ error: 'Email already registered' });

      await sql`INSERT INTO backer_applications (name, email, amount) VALUES (${name}, ${email}, ${amount})`;

      return res.status(200).json({ success: true, message: 'Application received' });
    }

    if (pathname === '/api/investors' && method === 'POST') {
      const sql = getSql();
      const { name, firm, email, ticket, thesis } = req.body || {};

      if (!name || !email || !ticket) {
        return res.status(400).json({ error: 'Name, email, and ticket are required' });
      }

      const existing = await sql`SELECT id FROM investor_applications WHERE email = ${email} LIMIT 1` as any[];
      if (existing.length > 0) return res.status(400).json({ error: 'Email already registered' });

      await sql`INSERT INTO investor_applications (name, firm, email, ticket, thesis) VALUES (${name}, ${firm || null}, ${email}, ${ticket}, ${thesis || null})`;

      return res.status(200).json({ success: true, message: 'Application received' });
    }

    // Admin endpoints for new applications
    if (pathname === '/api/admin/thinkers') {
      if (!requireAdmin(req.headers.authorization, req.headers['x-admin-email'] as string | undefined)) return res.status(401).json({ error: 'Unauthorized' });
      const sql = getSql();
      if (method === 'GET') {
        const applications = await sql`SELECT * FROM thinker_applications ORDER BY created_at DESC`;
        return res.status(200).json({ applications });
      }
    }

    if (pathname === '/api/admin/doers') {
      if (!requireAdmin(req.headers.authorization, req.headers['x-admin-email'] as string | undefined)) return res.status(401).json({ error: 'Unauthorized' });
      const sql = getSql();
      if (method === 'GET') {
        const applications = await sql`SELECT * FROM doer_applications ORDER BY created_at DESC`;
        return res.status(200).json({ applications });
      }
    }

    if (pathname === '/api/admin/backers') {
      if (!requireAdmin(req.headers.authorization, req.headers['x-admin-email'] as string | undefined)) return res.status(401).json({ error: 'Unauthorized' });
      const sql = getSql();
      if (method === 'GET') {
        const applications = await sql`SELECT * FROM backer_applications ORDER BY created_at DESC`;
        return res.status(200).json({ applications });
      }
    }

    if (pathname === '/api/admin/investors') {
      if (!requireAdmin(req.headers.authorization, req.headers['x-admin-email'] as string | undefined)) return res.status(401).json({ error: 'Unauthorized' });
      const sql = getSql();
      if (method === 'GET') {
        const applications = await sql`SELECT * FROM investor_applications ORDER BY created_at DESC`;
        return res.status(200).json({ applications });
      }
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error: any) {
    console.error('API error:', error?.message || error);
    return res.status(500).json({ error: 'Internal server error', detail: error?.message });
  }
}

function requireAdmin(authHeader: string | undefined, adminEmail?: string | undefined) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.split(' ')[1];
  const validToken = token === process.env.ADMIN_TOKEN;
  const validEmail = !process.env.ADMIN_EMAIL || (adminEmail && adminEmail === process.env.ADMIN_EMAIL);
  return validToken && validEmail;
}
