import type { NextApiRequest, NextApiResponse } from 'next';
import Replicate from 'replicate';
import logger from '@/lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    logger.log('warn', 'Method not allowed', { method: req.method });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, promptImage, motion_module, guidance_scale, num_inference_steps } = req.body;

    logger.log('info', 'Starting animate-diff generation', {
      prompt,
      motion_module,
      guidance_scale,
      num_inference_steps,
      hasImage: !!promptImage,
    });

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const output = await replicate.run(
      'zsxkib/animate-diff:1f7d3802327e6c14d0d1cf9be0e3d2ac2d1f7eaf2d62efd3785cc6fb807d3b3b',
      {
        input: {
          prompt,
          negative_prompt: 'bad quality, worse quality, low quality',
          motion_module,
          guidance_scale,
          num_inference_steps,
          image: promptImage,
        },
      }
    );

    logger.log('info', 'Animate-diff generation successful', { output });
    res.status(200).json({ videoUrl: output });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.log('error', 'Animate-diff generation failed', {
        error: error.message,
        stack: error.stack,
        body: req.body,
      });
    } else {
      logger.log('error', 'Animate-diff generation failed', {
        error: 'An unknown error occurred',
        body: req.body,
      });
    }

    return res.status(500).json({
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
}
