import type { NextApiRequest, NextApiResponse } from 'next';
import { fal } from '@fal-ai/client';
import { MODELS, isVideoModel } from '@/constants/models';
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { prompt, model, image_url, options } = req.body as { 
      prompt: string;
      model: ModelName;
      image_url?: string;
      options?: Record<string, any>;
    };

    if (!MODELS[model]) {
      throw new Error(`Invalid model: ${model}`);
    }

    const input = {
      model,
      modelEndpoint: MODELS[model].id,
      prompt,
      image_url,
      options
    };

    const result = await fal.subscribe(input.modelEndpoint, {
      input: {
        prompt: input.prompt,
        image_url: input.image_url,
        ...input.options
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log('Queue update:', update);
      },
    });

    if (isVideoModel(model)) {
      if (!result.data?.video?.url) {
        throw new Error('No video URL in response');
      }
      return res.status(200).json({
        success: true,
        data: {
          images: [],
          video: {
            url: result.data.video.url
          },
          requestId: result.requestId
        }
      });
    }

    const images = result.data?.images?.map((img: any) => {
      if (typeof img === 'string') return img;
      if (img.url) return img.url;
      if (img.image_url) return img.image_url;
      throw new Error('Invalid image data in response');
    });

    if (!images?.length) {
      throw new Error('No images generated');
    }

    return res.status(200).json({
      success: true,
      data: {
        images,
        videoUrl: null,
        seed: result.data?.seed,
        timings: result.data?.timings,
        requestId: result.requestId
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
} 