import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    console.log('Auth Client Log:', {
      timestamp: new Date().toISOString(),
      ...req.body
    });
    res.status(200).json({ message: 'Logged successfully' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}