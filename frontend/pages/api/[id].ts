import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, VideoResponse, handleApiError, createApiResponse } from '@/types/api';
import Replicate from 'replicate';

interface ReplicatePrediction {
  id: string;
  status: string;
  output: string[] | null;
  error: string | { message: string } | null;
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<ApiResponse<VideoResponse>>
) {
  // Log incoming request
  console.log('🔵 GET /api/[id]', {
    method: _req.method,
    query: _req.query,
    headers: _req.headers
  });

  if (_req.method !== 'GET') {
    console.warn('⚠️ Method not allowed:', _req.method);
    return res.status(405).json(handleApiError(new Error('Method not allowed')));
  }

  const predictionId = _req.query.id as string;
  console.log('🔍 Checking prediction status for ID:', predictionId);

  if (!predictionId) {
    console.error('❌ No prediction ID provided');
    return res.status(400).json(handleApiError(new Error('No prediction ID provided')));
  }

  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const prediction = await replicate.predictions.get(predictionId) as ReplicatePrediction;
    console.log('✅ Prediction status:', prediction.status);

    if (prediction.status === 'succeeded' && prediction.output) {
      return res.status(200).json(createApiResponse({
        url: prediction.output[0],
        id: prediction.id
      }));
    }

    if (prediction.status === 'failed') {
      const errorMessage = typeof prediction.error === 'string' 
        ? prediction.error 
        : prediction.error?.message || 'Video generation failed';
      throw new Error(errorMessage);
    }

    return res.status(200).json(createApiResponse({
      url: '',
      id: prediction.id
    }));
  } catch (error) {
    console.error('❌ Error fetching prediction:', error);
    return res.status(500).json(handleApiError(error));
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 