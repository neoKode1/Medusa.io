import type { NextApiRequest, NextApiResponse } from 'next';
import { fal } from '@fal-ai/client';
import { MODELS } from '@/constants/models';
import type { ModelName } from '@/constants/models';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    }
  }
};

fal.config({
  credentials: process.env.FAL_KEY
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { prompt, model } = req.body as {
      prompt: string;
      model: ModelName;
    };

    if (!prompt || !model) {
      return res.status(400).json({
        success: false,
        error: 'Prompt and model are required'
      });
    }

    console.log('Starting image generation:', { prompt, model });

    const result = await fal.subscribe(MODELS[model].id, {
      input: {
        prompt,
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log('Queue update:', update);
      },
    });

    console.log('Generation complete:', result);

    const imageUrl = result.data?.images?.[0]?.url || 
                    result.data?.images?.[0]?.image_url || 
                    (typeof result.data?.images?.[0] === 'string' ? result.data.images[0] : null);

    if (!imageUrl) {
      throw new Error('No image URL in response');
    }

    return res.status(200).json({
      success: true,
      imageUrl,
      id: result.requestId,
      processingTime: result.data?.timings?.inference_time || null
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
} 