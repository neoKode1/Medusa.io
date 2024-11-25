import type { NextApiRequest, NextApiResponse } from 'next';
import Replicate from 'replicate';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Log incoming request
  console.log('🔵 GET /api/[id]', {
    method: req.method,
    query: req.query,
    headers: req.headers
  });

  if (req.method !== 'GET') {
    console.warn('⚠️ Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const predictionId = req.query.id as string;
  console.log('🔍 Checking prediction status for ID:', predictionId);

  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const prediction = await replicate.predictions.get(predictionId);
    console.log('✅ Prediction status:', { id: predictionId, status: prediction.status });
    return res.status(200).json(prediction);

  } catch (error) {
    console.error('❌ Prediction status error:', {
      id: predictionId,
      error: error instanceof Error ? error.message : error
    });
    return res.status(500).json({ 
      message: 'Failed to check prediction status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 