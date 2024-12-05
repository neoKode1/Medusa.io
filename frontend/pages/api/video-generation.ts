import { NextApiRequest, NextApiResponse } from 'next';
import { LumaAI } from 'lumaai';
import { fal } from '@fal-ai/client';

const client = new LumaAI({ authToken: process.env.LUMAAI_API_KEY });
const lumaClient = new LumaAI({ authToken: process.env.LUMAAI_API_KEY });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] New video generation request received:`, {
    timestamp: new Date().toISOString(),
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent']
    }
  });

  try {
    const { prompt, image_url, model, options } = req.body;

    console.log(`[${requestId}] Request parameters:`, {
      model,
      promptLength: prompt?.length,
      hasImageUrl: !!image_url,
      options: options || 'No additional options'
    });

    if (!image_url) {
      console.error(`[${requestId}] Missing reference image`);
      throw new Error('Reference image is required for video generation');
    }

    console.log(`[${requestId}] Starting video generation with model:`, model);
    const startTime = performance.now();
    let result;

    switch (model) {
      case 'Haiper Video v2':
        console.log(`[${requestId}] Using Haiper Video v2 model`);
        result = await fal.subscribe('fal-ai/haiper-video-v2/image-to-video', {
          input: { prompt, image_url, ...options },
          logs: true,
          onQueueUpdate: (update) => {
            console.log(`[${requestId}] Queue update:`, {
              status: update.status,
              timestamp: new Date().toISOString()
            });
          },
        });
        break;
      default:
        console.error(`[${requestId}] Unsupported model:`, model);
        throw new Error('Unsupported video model');
    }

    const endTime = performance.now();
    console.log(`[${requestId}] Generation completed:`, {
      processingTime: `${(endTime - startTime).toFixed(2)}ms`,
      success: !!result.data?.video?.url,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      videoUrl: result.data?.video?.url,
    });

  } catch (error) {
    console.error(`[${requestId}] Video generation error:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
} 