import { LumaAI } from 'lumaai';
import logger from '@/lib/logger';
import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';

interface LumaAIResponse {
  videoUrl?: string;
  error?: string;
  requestId: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<LumaAIResponse>) {
  const requestId = randomUUID();
  const requestLogger = logger.child({ requestId });

  if (req.method !== 'POST') {
    requestLogger.warn('Method not allowed', { method: req.method, requestId });
    return res.status(405).json({ error: 'Method not allowed', requestId });
  }

  try {
    const { prompt, promptImage, model = 'gen3a_turbo', duration = 10, ratio = '16:9' } = req.body;

    requestLogger.info('Starting Luma AI generation', {
      requestId,
      prompt,
      model,
      duration,
      ratio,
      hasImage: !!promptImage,
    });

    const lumaai = new LumaAI({
      authToken: process.env.LUMAAI_API_KEY,
    });

    const generation = await lumaai.generations.create({
      prompt,
      model,
      duration,
      ratio,
      image: promptImage,
    });

    requestLogger.info('Luma AI generation successful', { requestId, generationId: generation.id });

    return res.status(200).json({
      videoUrl: generation.videoUrl,
      requestId,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;

    requestLogger.error('Luma AI generation failed', {
      error: errorMessage,
      stack: errorStack,
      requestId,
      body: req.body,
    });

    return res.status(500).json({
      error: 'Failed to generate video',
      requestId,
    });
  }
}
