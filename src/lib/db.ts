import { neon } from '@neondatabase/serverless';

const DATABASE_URL = import.meta.env.VITE_DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('VITE_DATABASE_URL environment variable is required');
}

// @ts-ignore - Neon serverless options
export const sql = neon(DATABASE_URL, {
  disableWarningInBrowsers: true,
});

// Database Schema Initialization
export const initDb = async () => {
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

    // Create profiles table with enhanced fields
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type TEXT, -- 'thinker' or 'doer' or 'funder'
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
        -- Review system
        status TEXT DEFAULT 'pending', -- 'pending', 'priority', 'under_review', 'accepted', 'rejected'
        payment_status TEXT DEFAULT 'unpaid', -- 'unpaid', 'paid', 'refunded'
        priority_deadline_at TIMESTAMP WITH TIME ZONE,
        stripe_payment_intent_id TEXT,
        referral_code TEXT UNIQUE,
        referred_by TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create invitations table (who invited who)
    await sql`
      CREATE TABLE IF NOT EXISTS invitations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        inviter_id UUID REFERENCES users(id) ON DELETE SET NULL,
        invitee_id UUID REFERENCES users(id) ON DELETE CASCADE,
        code TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
  } catch {
    // Silent fail
  }
};

// Types
export type ProfileStatus = 'pending' | 'priority' | 'under_review' | 'accepted' | 'rejected';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

// Create a new founder profile
export const createFounder = async (data: {
  email: string;
  firstName: string;
  lastName: string;
  type: 'thinker' | 'doer';
  vision: string;
  proofOfWork: string;
  referralCode?: string;
  referredBy?: string;
}) => {
  const { email, firstName, lastName, type, vision, proofOfWork, referralCode, referredBy } = data;
  
  try {
    // Generate unique referral code
    const code = `EV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Insert user
    const userResult = await sql`
      INSERT INTO users (email, first_name, last_name, role)
      VALUES (${email}, ${firstName}, ${lastName}, ${type})
      RETURNING id
    `;
    
    const userId = userResult[0].id;
    
    // Insert profile
    await sql`
      INSERT INTO profiles (user_id, type, vision, proof_of_work, status, payment_status, referral_code, referred_by)
      VALUES (${userId}, ${type}, ${vision}, ${proofOfWork}, 'pending', 'unpaid', ${code}, ${referredBy || null})
    `;
    
    return { success: true, userId, referralCode: code };
  } catch {
    return { success: false, error: 'Failed to create profile' };
  }
};

// Create a new funder profile
export const createFunder = async (data: {
  email: string;
  firstName: string;
  lastName: string;
  investorType: string;
  stage: string;
  sectors: string;
  ticketSize: string;
  proofOfIdentity: string;
  referralCode?: string;
  referredBy?: string;
}) => {
  const { email, firstName, lastName, investorType, stage, sectors, ticketSize, proofOfIdentity, referralCode, referredBy } = data;
  
  try {
    const code = `EV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const userResult = await sql`
      INSERT INTO users (email, first_name, last_name, role)
      VALUES (${email}, ${firstName}, ${lastName}, 'funder')
      RETURNING id
    `;
    
    const userId = userResult[0].id;
    
    await sql`
      INSERT INTO profiles (user_id, type, investor_type, preferred_stage, sectors, ticket_size, proof_of_identity, status, payment_status, referral_code, referred_by)
      VALUES (${userId}, 'funder', ${investorType}, ${stage}, ${sectors}, ${ticketSize}, ${proofOfIdentity}, 'pending', 'unpaid', ${code}, ${referredBy || null})
    `;
    
    return { success: true, userId, referralCode: code };
  } catch {
    return { success: false, error: 'Failed to create profile' };
  }
};

// Get all pending profiles for admin
export const getPendingProfiles = async () => {
  try {
    const profiles = await sql`
      SELECT 
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.created_at,
        p.type,
        p.vision,
        p.proof_of_work,
        p.proof_of_identity,
        p.status,
        p.payment_status,
        p.priority_deadline_at,
        p.referral_code,
        p.investor_type,
        p.preferred_stage,
        p.sectors,
        p.ticket_size
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
    return profiles;
  } catch {
    return [];
  }
};

// Update profile status
export const updateProfileStatus = async (userId: string, status: ProfileStatus) => {
  try {
    await sql`
      UPDATE profiles 
      SET status = ${status}, updated_at = NOW()
      WHERE user_id = ${userId}
    `;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

// Update payment status
export const updatePaymentStatus = async (userId: string, paymentStatus: PaymentStatus) => {
  try {
    await sql`
      UPDATE profiles 
      SET payment_status = ${paymentStatus}, updated_at = NOW()
      WHERE user_id = ${userId}
    `;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

// Get profile by email
export const getProfileByEmail = async (email: string) => {
  try {
    const profile = await sql`
      SELECT 
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        p.status,
        p.payment_status
      FROM users u
      JOIN profiles p ON u.id = p.user_id
      WHERE u.email = ${email}
    `;
    return profile[0] || null;
  } catch (error) {
    return null;
  }
};

// Check if email already exists
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const result = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;
    return result.length > 0;
  } catch {
    return false;
  }
};

// GDPR - Data Deletion Procedure
export const deleteUserData = async (userId: string) => {
  try {
    await sql`DELETE FROM users WHERE id = ${userId}`;
    return true;
  } catch {
    return false;
  }
};

// Invitation System
export const createInvitation = async (inviterId: string, inviteeId: string) => {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  try {
    await sql`
      INSERT INTO invitations (inviter_id, invitee_id, code)
      VALUES (${inviterId}, ${inviteeId}, ${code})
    `;
    return code;
  } catch {
    return null;
  }
};

export const getInvitationNetwork = async (userId: string) => {
  try {
    const network = await sql`
      SELECT u.email, u.first_name, u.last_name, i.created_at
      FROM invitations i
      JOIN users u ON i.invitee_id = u.id
      WHERE i.inviter_id = ${userId}
      ORDER BY i.created_at DESC
    `;
    return network;
  } catch {
    return [];
  }
};

// Get total user count for display
export const getUserCount = async () => {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM users`;
    return result[0]?.count || 0;
  } catch {
    return 0;
  }
};
