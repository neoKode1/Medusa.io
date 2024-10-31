import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import logger from '@/lib/logger';
import { APIError } from 'replicate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const requestId = randomUUID();
  const requestLogger = logger.child({ 
    requestId,
    prefix: 'ANIMATE-DIFF'
  });

  if (req.method !== 'POST') {
    requestLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ error: 'Method not allowed', requestId });
  }

  try {
    const { prompt, promptImage, strength, guidance_scale, num_inference_steps } = req.body;

    requestLogger.info('Starting vid2vid generation', {
      prompt,
      strength,
      guidance_scale,
      num_inference_steps,
      hasImage: !!promptImage,
    });

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const output = await replicate.run(
      'lucataco/animate-diff:41a8977f0a11461fc8bccf1e97df7fe6d1afeb39bdc4c13c8838f3928b83b4b7',
      {
        input: {
          prompt,
          negative_prompt: 'bad quality, worse quality, low quality',
          strength,
          guidance_scale,
          num_inference_steps,
          video: promptImage,
        },
      }
    );

    requestLogger.info('Vid2vid generation successful', { output });
    res.status(200).json({ videoUrl: output, requestId });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;

    requestLogger.error('Vid2vid generation failed', {
      error: errorMessage,
      stack: errorStack,
      body: req.body,
    });

    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        error: error.message,
        requestId,
        details: error.details,
      });
    }

    res.status(500).json({ error: 'Failed to generate video', requestId });
  }
}
