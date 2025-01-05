import { NextApiRequest, NextApiResponse } from 'next';
import Replicate from 'replicate';
import { ApiResponse, ImageResponse, handleApiError, createApiResponse } from '@/types/api';

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error('Missing Replicate API token');
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

interface ReplicatePrediction {
  id: string;
  status: string;
  output: string[] | null;
  error: string | { message: string } | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ImageResponse>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json(handleApiError(new Error('Method not allowed')));
  }

  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json(handleApiError(new Error('Invalid prediction ID')));
  }

  try {
    const prediction = await replicate.predictions.get(id) as ReplicatePrediction;

    if (prediction.status === 'succeeded' && prediction.output) {
      return res.status(200).json(createApiResponse({
        url: prediction.output[0],
        width: 1024,
        height: 1024,
        content_type: 'image/jpeg',
        id: prediction.id
      }));
    }

    if (prediction.status === 'failed') {
      const errorMessage = typeof prediction.error === 'string' 
        ? prediction.error 
        : prediction.error?.message || 'Image generation failed';
      throw new Error(errorMessage);
    }

    return res.status(200).json(createApiResponse({
      url: '',
      width: 1024,
      height: 1024,
      content_type: 'image/jpeg',
      id: prediction.id
    }));
  } catch (error) {
    console.error('Error fetching prediction:', error);
    return res.status(500).json(handleApiError(error));
  }
} 