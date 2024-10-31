import type { NextApiRequest, NextApiResponse } from 'next';
import Replicate from 'replicate';
import logger from '@/lib/logger';
import { randomUUID } from 'crypto';

interface ReplicateRequestBody {
  prompt: string;
  model: 'flux-schnell' | 'stablediffusion';
  cfg?: number;
  steps?: number;
  width?: number;
  height?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
  refine?: string;
  scheduler?: string;
}

interface ReplicateResponse {
  imageUrl?: string;
  error?: string;
  requestId: string;
}

const MODEL_KEYS = {
  'flux-schnell': 'black-forest-labs/flux-schnell:bf53bdb93d739c9c915091cfa5f49ca662d11273a5eb30e7a2ec1939bcf27a00',
  'stablediffusion': 'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf'
} as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReplicateResponse>
) {
  const requestId = randomUUID();
  const requestLogger = logger.child({ requestId });

  if (req.method !== 'POST') {
    requestLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ error: 'Method not allowed', requestId });
  }

  if (!process.env.REPLICATE_API_TOKEN) {
    requestLogger.error('REPLICATE_API_TOKEN is not set');
    return res.status(500).json({ error: 'Server configuration error', requestId });
  }

  try {
    const { prompt, model, ...options } = req.body as ReplicateRequestBody;

    requestLogger.info('Starting image generation', { prompt, model });

    if (!prompt || !model) {
      requestLogger.warn('Invalid request parameters', { prompt, model });
      return res.status(400).json({ error: 'Prompt and model are required.', requestId });
    }

    const modelKey = MODEL_KEYS[model];
    if (!modelKey) {
      requestLogger.warn('Unsupported model selected', { model });
      return res.status(400).json({ error: 'Unsupported model selected.', requestId });
    }

    const replicateClient = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    });

    const prediction = await replicateClient.run(modelKey, {
      input: {
        prompt,
        ...options,
        go_fast: model === 'flux-schnell',
        num_outputs: 1,
        aspect_ratio: '1:1',
      }
    });

    requestLogger.info('Image generation successful', { requestId });

    return res.status(200).json({
      imageUrl: Array.isArray(prediction) ? prediction[0] : prediction,
      requestId
    });

  } catch (error) {
    requestLogger.error('Error generating image', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestId
    });
    return res.status(500).json({ error: 'Error generating image', requestId });
  }
}
