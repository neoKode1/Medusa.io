import { NextApiRequest, NextApiResponse } from 'next';

const LUMA_API_TOKEN = process.env.LUMA_API_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Generation ID is required' });
  }

  try {
    const response = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${LUMA_API_TOKEN?.trim()}`
      }
    });

    const data = await response.json();
    console.log('Luma API status response:', data);

    if (!response.ok) {
      throw new Error(data.failure_reason || 'Failed to check status');
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Error in test'
    });
  }
} 