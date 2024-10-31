import type { NextApiRequest, NextApiResponse } from 'next';
import Replicate from 'replicate';
import logger from '@/lib/logger';
import { randomUUID } from 'crypto';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const requestId = randomUUID();
  const requestLogger = logger;

  if (req.method !== 'POST') {
    requestLogger.warn('Method not allowed', { method: req.method, requestId });
    res.status(405).json({ error: 'Method not allowed', requestId });
    return;
  }

  const { value } = req.body;

  try {
    requestLogger.info('Starting stable diffusion generation', {
      requestId,
      prompt: value,
    });

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const output = await replicate.run(
      'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
      {
        input: {
          prompt: value,
          image_dimensions: '512x512',
          num_inference_steps: 12,
          num_outputs: 1,
          guideance_scale: 3.5,
          scheduler: 'K_EULER',
        },
      }
    );

    requestLogger.info('Stable diffusion generation successful', { requestId, output });
    res.status(200).json({ output, requestId });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;

    requestLogger.error('Stable diffusion generation failed', {
      error: errorMessage,
      stack: errorStack,
      requestId,
      body: req.body,
    });

    res.status(500).json({
      error: 'Internal server error',
      requestId,
    });
  }
};

export default handler;
