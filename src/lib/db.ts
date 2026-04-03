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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create profiles table
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
    // Silent fail - no user data logged
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
