import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import Stripe from 'stripe';
import { Resend } from 'resend';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize services
const DATABASE_URL = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('\n❌ ERROR: DATABASE_URL environment variable is not set.\n');
  console.log('Please set one of these environment variables:');
  console.log('  - DATABASE_URL (recommended)');
  console.log('  - VITE_DATABASE_URL (fallback)\n');
  console.log('Example (PowerShell):');
  console.log('  $env:DATABASE_URL="postgresql://user:pass@host/dbname"\n');
  console.log('Example (Command Prompt):');
  console.log('  set DATABASE_URL=postgresql://user:pass@host/dbname\n');
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware - Allow multiple origins for dev and prod
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://edenvalley.at.eu.org',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stats API (public)
app.get('/api/stats', async (req, res) => {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM users`;
    res.json({ userCount: parseInt(result[0]?.count || 0) });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ============================================
// DATABASE SCHEMA INITIALIZATION
// ============================================

async function initDb() {
  console.log('🔧 Initializing database schema...');
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        first_name TEXT,
        last_name TEXT,
        role TEXT,
        is_validated BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ users table ready');

    // Create profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type TEXT,
        vision TEXT,
        energy TEXT,
        investor_type TEXT,
        preferred_stage TEXT,
        sectors TEXT,
        ticket_size TEXT,
        annual_capital TEXT,
        deals_per_year TEXT,
        proof_of_work TEXT,
        proof_of_identity TEXT,
        status TEXT DEFAULT 'pending',
        payment_status TEXT DEFAULT 'unpaid',
        priority_deadline_at TIMESTAMP WITH TIME ZONE,
        stripe_payment_intent_id TEXT,
        referral_code TEXT UNIQUE,
        referred_by TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ profiles table ready');

    // Create invitations table
    await sql`
      CREATE TABLE IF NOT EXISTS invitations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        inviter_id UUID REFERENCES users(id) ON DELETE SET NULL,
        invitee_id UUID REFERENCES users(id) ON DELETE CASCADE,
        code TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ invitations table ready');

    // Add missing columns to existing profiles table
    try {
      await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vision TEXT;`;
      await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS proof_of_work TEXT;`;
      await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS proof_of_identity TEXT;`;
      await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS investor_type TEXT;`;
      await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_stage TEXT;`;
      await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sectors TEXT;`;
      await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ticket_size TEXT;`;
      await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';`;
      await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';`;
      await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;`;
      await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by TEXT;`;
      await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS priority_deadline_at TIMESTAMP WITH TIME ZONE;`;
      await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;`;
      await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS refund_status TEXT DEFAULT NULL;`;
      await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS refund_id TEXT DEFAULT NULL;`;
      console.log('✅ profiles columns migrated');
    } catch (e) {
      console.log('⚠️ Some columns may already exist:', e.message);
    }

    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// Initialize DB on startup
initDb();

// ============================================
// FOUNDERS API
// ============================================

app.post('/api/founders', async (req, res) => {
  try {
    const { firstName, lastName, email, type, vision, proofOfWork, tier, referredBy } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !type || !vision || !proofOfWork) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate referral code
    const referralCode = `EV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Insert user
    const userResult = await sql`
      INSERT INTO users (email, first_name, last_name, role)
      VALUES (${email}, ${firstName}, ${lastName}, ${type})
      RETURNING id
    `;

    const userId = userResult[0].id;

    // Set status based on tier
    const status = tier === 'priority' ? 'priority' : 'pending';

    // Insert profile
    await sql`
      INSERT INTO profiles (user_id, type, vision, proof_of_work, status, payment_status, referral_code, referred_by)
      VALUES (${userId}, ${type}, ${vision}, ${proofOfWork}, ${status}, 'unpaid', ${referralCode}, ${referredBy || null})
    `;

    res.json({ 
      success: true, 
      userId, 
      referralCode,
      status,
      message: tier === 'priority' 
        ? 'Profile created. Proceed to payment.' 
        : 'Profile submitted for review.'
    });
  } catch (error) {
    console.error('Founder submission error:', error);
    res.status(500).json({ error: 'Failed to submit profile' });
  }
});

// ============================================
// FUNDERS API
// ============================================

app.post('/api/funders', async (req, res) => {
  try {
    const { firstName, lastName, email, investorType, stage, sectors, ticketSize, proofOfIdentity, referredBy } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !investorType || !stage || !sectors || !ticketSize || !proofOfIdentity) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate referral code
    const referralCode = `EV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Insert user
    const userResult = await sql`
      INSERT INTO users (email, first_name, last_name, role)
      VALUES (${email}, ${firstName}, ${lastName}, 'funder')
      RETURNING id
    `;

    const userId = userResult[0].id;

    // Insert profile
    await sql`
      INSERT INTO profiles (user_id, type, investor_type, preferred_stage, sectors, ticket_size, proof_of_identity, status, payment_status, referral_code, referred_by)
      VALUES (${userId}, 'funder', ${investorType}, ${stage}, ${sectors}, ${ticketSize}, ${proofOfIdentity}, 'pending', 'unpaid', ${referralCode}, ${referredBy || null})
    `;

    res.json({ 
      success: true, 
      userId, 
      referralCode,
      message: 'Application submitted for review.'
    });
  } catch (error) {
    console.error('Funder submission error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// ============================================
// LANDING PAGE APPLICATIONS API
// ============================================

// Initialize tables for landing page applications
async function initLandingPageTables() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS thinker_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        idea TEXT NOT NULL,
        progress TEXT,
        diagnosis TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS doer_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        skill TEXT NOT NULL,
        shipped TEXT NOT NULL,
        vision TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS backer_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        amount TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS investor_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        firm TEXT,
        email TEXT UNIQUE NOT NULL,
        ticket TEXT NOT NULL,
        thesis TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Landing page application tables ready');
  } catch (e) {
    console.error('❌ Failed to create landing page tables:', e);
  }
}

// Create tables on startup
initLandingPageTables();

// Thinker applications
app.post('/api/thinkers', async (req, res) => {
  try {
    const { name, email, idea, progress, diagnosis } = req.body;

    if (!name || !email || !idea) {
      return res.status(400).json({ error: 'Name, email, and idea are required' });
    }

    const existing = await sql`SELECT id FROM thinker_applications WHERE email = ${email} LIMIT 1`;
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    await sql`
      INSERT INTO thinker_applications (name, email, idea, progress, diagnosis)
      VALUES (${name}, ${email}, ${idea}, ${progress || null}, ${diagnosis || null})
    `;

    res.json({ success: true, message: 'Application received' });
  } catch (error) {
    console.error('Thinker submission error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Doer applications
app.post('/api/doers', async (req, res) => {
  try {
    const { name, email, skill, shipped, vision } = req.body;

    if (!name || !email || !skill || !shipped) {
      return res.status(400).json({ error: 'Name, email, skill, and shipped are required' });
    }

    const existing = await sql`SELECT id FROM doer_applications WHERE email = ${email} LIMIT 1`;
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    await sql`
      INSERT INTO doer_applications (name, email, skill, shipped, vision)
      VALUES (${name}, ${email}, ${skill}, ${shipped}, ${vision || null})
    `;

    res.json({ success: true, message: 'Application received' });
  } catch (error) {
    console.error('Doer submission error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Backer applications
app.post('/api/backers', async (req, res) => {
  try {
    const { name, email, amount } = req.body;

    if (!name || !email || !amount) {
      return res.status(400).json({ error: 'Name, email, and amount are required' });
    }

    const existing = await sql`SELECT id FROM backer_applications WHERE email = ${email} LIMIT 1`;
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    await sql`
      INSERT INTO backer_applications (name, email, amount)
      VALUES (${name}, ${email}, ${amount})
    `;

    res.json({ success: true, message: 'Application received' });
  } catch (error) {
    console.error('Backer submission error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Investor applications
app.post('/api/investors', async (req, res) => {
  try {
    const { name, firm, email, ticket, thesis } = req.body;

    if (!name || !email || !ticket) {
      return res.status(400).json({ error: 'Name, email, and ticket are required' });
    }

    const existing = await sql`SELECT id FROM investor_applications WHERE email = ${email} LIMIT 1`;
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    await sql`
      INSERT INTO investor_applications (name, firm, email, ticket, thesis)
      VALUES (${name}, ${firm || null}, ${email}, ${ticket}, ${thesis || null})
    `;

    res.json({ success: true, message: 'Application received' });
  } catch (error) {
    console.error('Investor submission error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// ============================================
// ADMIN API
// ============================================

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'kheirlissi@icloud.com';

// Middleware to check admin auth
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // For now, we'll use a simple token check
  const token = authHeader.split(' ')[1];
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Get pending profiles
app.get('/api/admin/profiles', requireAdmin, async (req, res) => {
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
        p.referral_code
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
    res.json({ profiles });
  } catch (error) {
    console.error('Admin profiles error:', error);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// Admin endpoints for landing page applications
app.get('/api/admin/thinkers', requireAdmin, async (req, res) => {
  try {
    const applications = await sql`SELECT * FROM thinker_applications ORDER BY created_at DESC`;
    res.json({ applications });
  } catch (error) {
    console.error('Admin thinkers error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

app.get('/api/admin/doers', requireAdmin, async (req, res) => {
  try {
    const applications = await sql`SELECT * FROM doer_applications ORDER BY created_at DESC`;
    res.json({ applications });
  } catch (error) {
    console.error('Admin doers error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

app.get('/api/admin/backers', requireAdmin, async (req, res) => {
  try {
    const applications = await sql`SELECT * FROM backer_applications ORDER BY created_at DESC`;
    res.json({ applications });
  } catch (error) {
    console.error('Admin backers error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

app.get('/api/admin/investors', requireAdmin, async (req, res) => {
  try {
    const applications = await sql`SELECT * FROM investor_applications ORDER BY created_at DESC`;
    res.json({ applications });
  } catch (error) {
    console.error('Admin investors error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Accept/Reject profile
app.post('/api/admin/review', requireAdmin, async (req, res) => {
  try {
    const { userId, action } = req.body;

    if (!userId || !action) {
      return res.status(400).json({ error: 'userId and action are required' });
    }

    if (action === 'accept') {
      // Update status
      await sql`
        UPDATE profiles 
        SET status = 'accepted', updated_at = NOW()
        WHERE user_id = ${userId}
      `;

      // Get user email
      const user = await sql`SELECT email FROM users WHERE id = ${userId}`;
      if (user.length > 0) {
        const email = user[0].email;
        const tempPassword = generatePassword();

        // Create Neon Auth account
        // Note: This requires Neon Auth API - implementation depends on their API
        // For now, we'll send a notification email
        
        // Send welcome email via Resend
        await sendWelcomeEmail(email);
      }

      res.json({ success: true, message: 'Profile accepted. User notified.' });
    } 
    else if (action === 'reject') {
      // Get user email and payment status first
      const user = await sql`SELECT email FROM users WHERE id = ${userId}`;
      const email = user.length > 0 ? user[0].email : null;

      // Update status
      await sql`
        UPDATE profiles 
        SET status = 'rejected', updated_at = NOW()
        WHERE user_id = ${userId}
      `;

      // If paid, trigger refund automatically
      if (email) {
        const refundResult = await handleRejection(userId, email);
        
        if (refundResult.refunded) {
          console.log(`✅ Refund processed for rejected user ${email}`);
          res.json({ success: true, message: 'Profile rejected. Refund processed.', refundId: refundResult.refundId });
          return;
        }
      }

      // Send rejection email
      if (email) {
        await sendRejectionEmail(email);
      }

      res.json({ success: true, message: 'Profile rejected. User notified.' });
    }
    else if (action === 'start_review') {
      await sql`
        UPDATE profiles 
        SET status = 'under_review', updated_at = NOW()
        WHERE user_id = ${userId}
      `;
      res.json({ success: true, message: 'Review started.' });
    }
    else {
      res.status(400).json({ error: 'Invalid action. Use accept, reject, or start_review.' });
    }
  } catch (error) {
    console.error('Admin review error:', error);
    res.status(500).json({ error: 'Failed to process review' });
  }
});

// ============================================
// STRIPE WEBHOOK
// ============================================

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    let event;

    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // For testing without webhook signature
      event = req.body;
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerEmail = session.customer_details?.email;

        if (customerEmail) {
          // Update profile to paid
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

          // Send confirmation email
          await sendPriorityConfirmationEmail(customerEmail);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const customerEmail = paymentIntent.receipt_email;

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
        // Handle refund
        console.log('Refund processed for charge:', charge.id);
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

// ============================================
// EMAIL FUNCTIONS
// ============================================

async function sendWelcomeEmail(email) {
  try {
    await resend.emails.send({
      from: 'Eden Valley <no-reply@edenvalley.at.eu.org>',
      to: email,
      subject: 'Welcome to Eden Valley',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a472a;">Welcome to Eden Valley</h1>
          <p>Your application has been accepted.</p>
          <p>You will receive your access credentials shortly.</p>
          <p>In the meantime, you can explore the platform.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

async function sendRejectionEmail(email) {
  try {
    await resend.emails.send({
      from: 'Eden Valley <no-reply@edenvalley.at.eu.org>',
      to: email,
      subject: 'Your application to Eden Valley',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a472a;">Application Status</h1>
          <p>Thank you for your interest in Eden Valley.</p>
          <p>After careful review, your application was not retained at this time. Our ecosystem is designed around specific cognitive profiles that match our architectural requirements.</p>
          <p>You may revisit your application in the future if your profile evolves.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send rejection email:', error);
  }
}

async function sendPriorityConfirmationEmail(email) {
  try {
    await resend.emails.send({
      from: 'Eden Valley <no-reply@edenvalley.at.eu.org>',
      to: email,
      subject: 'Priority Review Confirmed - Eden Valley',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a472a;">Priority Review Confirmed</h1>
          <p>Your payment has been received.</p>
          <p>Our team will manually evaluate your profile within <strong>72 hours</strong>.</p>
          <p>You will receive your access credentials once your application is approved.</p>
          <p style="color: #666; font-size: 12px;">Note: Payment does not guarantee acceptance.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send priority confirmation email:', error);
  }
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// ============================================
// REFUND FUNCTIONS
// ============================================

async function sendRefundEmail(email, refundId) {
  try {
    await resend.emails.send({
      from: 'Eden Valley <no-reply@edenvalley.at.eu.org>',
      to: email,
      subject: 'Your refund from Eden Valley',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a472a;">Refund Processed</h1>
          <p>Your payment of $49 has been refunded.</p>
          <p>After the 72-hour review period, your profile was not retained. As promised, your refund has been processed.</p>
          <p>Refund ID: ${refundId}</p>
          <p>The funds should appear in your account within 5-10 business days, depending on your bank.</p>
          <p>You may reapply in the future if your profile evolves.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send refund email:', error);
  }
}

async function processRefunds() {
  console.log('🔍 Checking for expired priority reviews...');
  
  try {
    // Find profiles where:
    // - status = 'priority'
    // - payment_status = 'paid'
    // - priority_deadline_at < NOW()
    // - refund_status IS NULL or 'pending'
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

    for (const profile of expiredProfiles) {
      try {
        // Mark as refund pending
        await sql`
          UPDATE profiles 
          SET refund_status = 'pending', updated_at = NOW()
          WHERE user_id = ${profile.user_id}
        `;

        if (profile.stripe_payment_intent_id) {
          // Process refund via Stripe
          const refund = await stripe.refunds.create({
            payment_intent: profile.stripe_payment_intent_id,
            reason: 'requested_by_customer',
          });

          // Update status
          await sql`
            UPDATE profiles 
            SET refund_status = 'completed', 
                refund_id = ${refund.id},
                updated_at = NOW()
            WHERE user_id = ${profile.user_id}
          `;

          // Send refund email
          await sendRefundEmail(profile.email, refund.id);
          
          console.log(`✅ Refund processed for ${profile.email}: ${refund.id}`);
        } else {
          console.log(`⚠️ No payment intent found for ${profile.email}`);
        }
      } catch (refundError) {
        console.error(`❌ Refund failed for ${profile.email}:`, refundError);
        
        // Mark as failed
        await sql`
          UPDATE profiles 
          SET refund_status = 'failed', updated_at = NOW()
          WHERE user_id = ${profile.user_id}
        `;
      }
    }

    return { processed: expiredProfiles.length };
  } catch (error) {
    console.error('❌ Error processing refunds:', error);
    throw error;
  }
}

// Cron endpoint for Vercel (can also be called manually)
app.post('/api/cron/process-refunds', async (req, res) => {
  // Verify cron secret for security
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await processRefunds();
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process refunds' });
  }
});

// GET version for easier testing
app.get('/api/cron/process-refunds', async (req, res) => {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await processRefunds();
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process refunds' });
  }
});

// ============================================
// MANUAL REFUND ENDPOINT (Admin only)
// ============================================

app.post('/api/admin/refund', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get profile
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

    // Process refund
    const refund = await stripe.refunds.create({
      payment_intent: stripe_payment_intent_id,
      reason: 'requested_by_customer',
    });

    // Update DB
    await sql`
      UPDATE profiles 
      SET refund_status = 'completed',
          refund_id = ${refund.id},
          payment_status = 'refunded',
          updated_at = NOW()
      WHERE user_id = ${userId}
    `;

    // Send email
    await sendRefundEmail(email, refund.id);

    res.json({ success: true, refundId: refund.id });
  } catch (error) {
    console.error('Manual refund error:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

// ============================================
// UPDATE REJECT ACTION TO INCLUDE REFUND
// ============================================

// Update the reject action to trigger refund when payment_status === 'paid'
// (This is already handled in the existing code, but we need to add the actual refund call)

async function handleRejection(userId, email) {
  const profile = await sql`
    SELECT stripe_payment_intent_id, payment_status FROM profiles WHERE user_id = ${userId}
  `;

  if (profile.length > 0 && profile[0].payment_status === 'paid' && profile[0].stripe_payment_intent_id) {
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

      await sendRefundEmail(email, refund.id);
      return { refunded: true, refundId: refund.id };
    } catch (error) {
      console.error('Refund failed during rejection:', error);
      await sql`
        UPDATE profiles 
        SET refund_status = 'failed', updated_at = NOW()
        WHERE user_id = ${userId}
      `;
      return { refunded: false, error: error.message };
    }
  }
  return { refunded: false };
}

// Start server
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});

export default app;
