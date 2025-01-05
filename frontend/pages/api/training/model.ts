import type { NextApiRequest, NextApiResponse } from 'next';
import * as fal from '@fal-ai/serverless-client';
import { ApiResponse, handleApiError, createApiResponse } from '../../../types/api';

interface TrainingResponse {
  id: string;
  status: string;
  output?: string[];
  error?: string;
}

interface FalSubscribeResult {
  requestId: string;
  status: string;
  output?: string[];
  error?: string;
}

// Configure API to handle large payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    },
    responseLimit: false
  }
};

if (!process.env.FAL_KEY) {
  throw new Error('Missing Fal.ai API key');
}

fal.config({
  credentials: process.env.FAL_KEY
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<TrainingResponse>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json(handleApiError(new Error('Method not allowed')));
  }

  try {
    const { images, name, description } = req.body;

    // Validate required fields
    if (!images || !Array.isArray(images) || images.length < 1 || !name || !description) {
      return res.status(400).json(handleApiError(new Error('Missing required fields or insufficient images')));
    }

    const result = await fal.subscribe('fal-ai/fast-sdxl-training', {
      input: req.body,
      pollInterval: 5000,
      logs: true,
      onQueueUpdate: (update) => {
        console.log('Training status:', update.status);
        if (update.status === "IN_PROGRESS" && update.logs) {
          console.log('Training logs:', update.logs);
        }
      },
    }) as FalSubscribeResult;

    return res.status(200).json(createApiResponse({
      id: result.requestId,
      status: result.status,
      output: result.output,
      error: result.error
    }));
  } catch (error) {
    console.error('Training error:', error);
    return res.status(500).json(handleApiError(error));
  }
} 