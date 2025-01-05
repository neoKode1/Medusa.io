import { NextApiRequest, NextApiResponse } from 'next';
import { LumaAI } from 'lumaai';

const LUMA_API_TOKEN = process.env.LUMA_API_TOKEN;

// Initialize Luma client
const client = new LumaAI({
  authToken: LUMA_API_TOKEN
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Generation ID is required' });
  }

  if (!LUMA_API_TOKEN) {
    return res.status(500).json({ error: 'LUMA_API_TOKEN not configured' });
  }

  try {
    // Get generation status using Luma client
    const generation = await client.generations.get(id);
    
    // Return the generation object directly
    return res.status(200).json(generation);
  } catch (error) {
    console.error('Error checking generation:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to check generation status'
    });
  }
} 