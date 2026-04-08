import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;
export const sql = neon(DATABASE_URL);

// Initialize database schema
export async function initDb() {
  console.log('🔧 Initializing database schema...');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        first_name TEXT,
        last_name TEXT,
        role TEXT,
        is_validated BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

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
        refund_status TEXT DEFAULT NULL,
        refund_id TEXT DEFAULT NULL,
        referral_code TEXT UNIQUE,
        referred_by TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS invitations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        inviter_id UUID REFERENCES users(id) ON DELETE SET NULL,
        invitee_id UUID REFERENCES users(id) ON DELETE CASCADE,
        code TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Add missing columns if they don't exist
    const columnsToAdd = [
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vision TEXT',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS proof_of_work TEXT',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS proof_of_identity TEXT',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS investor_type TEXT',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_stage TEXT',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sectors TEXT',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ticket_size TEXT',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT \'pending\'',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT \'unpaid\'',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by TEXT',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS priority_deadline_at TIMESTAMP WITH TIME ZONE',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS refund_status TEXT DEFAULT NULL',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS refund_id TEXT DEFAULT NULL',
    ];

    for (const col of columnsToAdd) {
      try {
        await sql([col]);
      } catch {
        // Ignore errors for ALTER TABLE
      }
    }

    console.log('✅ Database schema ready');
    return true;
  } catch (error) {
    console.error('❌ Database init failed:', error);
    return false;
  }
}

// Helper function to generate random password
export function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
