import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, initDb } from '../lib/db';

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await ensureDb();
    
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

    return res.status(200).json({ 
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
    return res.status(500).json({ error: 'Failed to submit profile' });
  }
}
