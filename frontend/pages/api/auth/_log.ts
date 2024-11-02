import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Either disable logging
  res.status(200).json({ message: 'Logging disabled' })
  
  // Or implement proper logging
  /*
  if (req.method === 'POST') {
    console.log('Auth log:', req.body)
    res.status(200).json({ message: 'Logged successfully' })
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
  */
} 