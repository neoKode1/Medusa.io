import { NextApiRequest, NextApiResponse } from 'next';
import Replicate from 'replicate';

// Prevent response caching
export const config = {
  runtime: 'edge',
  unstable_allowDynamic: [
    '/node_modules/function-bind/**',
  ],
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const predictionId = req.query.id as string;

  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const prediction = await replicate.predictions.get(predictionId);
    return res.status(200).json(prediction);

  } catch (error) {
    console.error('Prediction status error:', error);
    return res.status(500).json({ error: 'Failed to check prediction status' });
  }
} 