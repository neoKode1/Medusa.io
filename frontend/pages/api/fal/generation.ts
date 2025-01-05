import type { NextApiRequest, NextApiResponse } from 'next';
import { fal } from '@fal-ai/client';
import { MODELS, isVideoModel } from '@/constants/models';
import type { ModelName } from '@/constants/models';
import { ApiResponse, handleApiError, createApiResponse } from '@/types/api';

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

type FalGenerationResponse = {
  images?: string[];
  video?: {
    url: string;
  };
  seed?: number;
  timings?: Record<string, number>;
  requestId: string;
};

type GenerationOptions = {
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
  scheduler?: string;
  [key: string]: unknown;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<FalGenerationResponse>>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json(handleApiError(new Error('Method not allowed')));
  }

  try {
    const { prompt, model, image_url, options } = req.body as { 
      prompt: string;
      model: ModelName;
      image_url?: string;
      options?: GenerationOptions;
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
      return res.status(200).json(createApiResponse({
        video: {
          url: result.data.video.url
        },
        requestId: result.requestId
      }));
    }

    const images = result.data?.images?.map((img: { url?: string; image_url?: string } | string) => {
      if (typeof img === 'string') return img;
      if (img.url) return img.url;
      if (img.image_url) return img.image_url;
      throw new Error('Invalid image data in response');
    });

    if (!images?.length) {
      throw new Error('No images generated');
    }

    return res.status(200).json(createApiResponse({
      images,
      seed: result.data?.seed,
      timings: result.data?.timings,
      requestId: result.requestId
    }));

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json(handleApiError(error));
  }
} 