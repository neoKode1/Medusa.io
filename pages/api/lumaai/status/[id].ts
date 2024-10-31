import { LumaAI } from 'lumaai';
import logger from '@/lib/logger';
import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const requestId = randomUUID();
  const requestLogger = logger.child({ requestId });
  const { id } = req.query;

  if (req.method !== 'GET') {
    requestLogger.warn('Method not allowed', { method: req.method });
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      error: 'Method not allowed',
      requestId,
    });
  }

  if (typeof id !== 'string') {
    requestLogger.warn('Invalid generation ID', { id });
    return res.status(400).json({
      error: 'Invalid generation ID',
      requestId,
    });
  }

  try {
    requestLogger.info('Fetching generation status', { generationId: id });

    const client = new LumaAI({
      authToken: process.env.LUMAAI_API_KEY,
    });

    const generation = await client.generations.get(id);

    requestLogger.info('Generation status fetched successfully', {
      generationId: id,
      status: generation.state,
      progress: generation.progressPercent,
    });

    res.status(200).json({
      ...generation,
      requestId,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;

    requestLogger.error('Failed to fetch generation status', {
      error: errorMessage,
      stack: errorStack,
      requestId,
      generationId: id,
    });

    res.status(500).json({
      error: 'Failed to get generation status',
      details: errorMessage,
      requestId,
    });
  }
}
