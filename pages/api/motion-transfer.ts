import type { NextApiRequest, NextApiResponse } from 'next';
import Replicate from 'replicate';
import logger from '@/lib/logger';
import { randomUUID } from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const requestId = randomUUID();
  const requestLogger = logger;

  if (req.method !== 'POST') {
    requestLogger.warn('Method not allowed', { method: req.method, requestId });
    return res.status(405).json({ error: 'Method not allowed', requestId });
  }

  try {
    const { prompt, promptImage, n_timesteps } = req.body;

    requestLogger.info('Starting motion-transfer generation', {
      requestId,
      prompt,
      n_timesteps,
      hasImage: !!promptImage,
    });

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const output = await replicate.run(
      'lucataco/motion-transfer:1f927c24b1e57c2c2f4c9fdfa636b30ba5f20ca1e395cf1ee38ecd7cc1cef69f',
      {
        input: {
          prompt,
          image: promptImage,
          n_timesteps,
        },
      }
    );

    requestLogger.info('Motion-transfer generation successful', { requestId, output });
    res.status(200).json({ videoUrl: output, requestId });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;

    requestLogger.error('Motion-transfer generation failed', {
      error: errorMessage,
      stack: errorStack,
      requestId,
      body: req.body,
    });

    res.status(500).json({
      error: 'Failed to generate video',
      requestId,
    });
  }
}
