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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await ensureDb();
    
    const email = req.query.email as string;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await sql`
      SELECT is_validated FROM users WHERE email = ${email} LIMIT 1
    `;

    if (result.length === 0) {
      return res.status(200).json({ isValidated: false });
    }

    return res.status(200).json({ 
      isValidated: result[0].is_validated === true 
    });
  } catch (error) {
    console.error('Validate user error:', error);
    return res.status(500).json({ error: 'Failed to validate user' });
  }
}
