import type { NextApiRequest, NextApiResponse } from 'next';
import { fal } from '@fal-ai/client';

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

// Define model endpoints
const MODEL_ENDPOINTS = {
  TEXT_TO_VIDEO: {
    'Minimax': 'fal-ai/minimax-video',
    'Haiper V2': 'fal-ai/haiper-video-v2',
    'Kling Pro': 'fal-ai/kling-video/v1.5/pro/text-to-video',
    'CogVideo-X': 'fal-ai/cogvideox-5b',
    'Hunyuan': 'fal-ai/hunyuan-video',
    'LTX': 'fal-ai/ltx-video',
    'Fast SVD': 'fal-ai/fast-svd/text-to-video',
    'T2V Turbo': 'fal-ai/t2v-turbo',
    'Luma Dream': 'fal-ai/luma-dream-machine',
    'Mochi V1': 'fal-ai/mochi-v1',
    'AnimateDiff Turbo': 'fal-ai/fast-animatediff/turbo/text-to-video'
  },
  IMAGE_TO_VIDEO: {
    'Minimax I2V': 'fal-ai/minimax-video/image-to-video',
    'Haiper I2V': 'fal-ai/haiper-video-v2/image-to-video',
    'CogVideo-X I2V': 'fal-ai/cogvideox-5b/image-to-video',
    'LTX I2V': 'fal-ai/ltx-video/image-to-video',
    'Stable Video': 'fal-ai/stable-video',
    'Kling I2V Pro': 'fal-ai/kling-video/v1.5/pro/image-to-video',
    'Luma I2V': 'fal-ai/luma-dream-machine/image-to-video',
    'Live Portrait': 'fal-ai/live-portrait',
    'SadTalker': 'fal-ai/sadtalker'
  }
} as const;

// First, let's add type safety to our model parameter
type VideoModelName = keyof typeof MODEL_ENDPOINTS.TEXT_TO_VIDEO | keyof typeof MODEL_ENDPOINTS.IMAGE_TO_VIDEO;

const getModelEndpoint = (model: VideoModelName, mode: string): string => {
  console.log('Debug - Input:', { model, mode });
  
  if (!model) {
    console.error('No model provided');
    throw new Error('Model selection is required');
  }

  // Strict mode checking
  if (mode === 'image-to-video') {
    // Only allow I2V models for image-to-video mode
    if (!model.includes('I2V') && model !== 'Live Portrait' && model !== 'SadTalker' && model !== 'Stable Video') {
      throw new Error('Selected model does not support image-to-video mode');
    }
    const endpoint = MODEL_ENDPOINTS.IMAGE_TO_VIDEO[model as keyof typeof MODEL_ENDPOINTS.IMAGE_TO_VIDEO];
    if (!endpoint) {
      throw new Error(`No endpoint found for model: ${model}`);
    }
    console.log('Using I2V endpoint:', endpoint);
    return endpoint;
  }

  // Text-to-video mode
  if (model.includes('I2V') || model === 'Live Portrait' || model === 'SadTalker' || model === 'Stable Video') {
    throw new Error('Selected model does not support text-to-video mode');
  }
  const endpoint = MODEL_ENDPOINTS.TEXT_TO_VIDEO[model as keyof typeof MODEL_ENDPOINTS.TEXT_TO_VIDEO];
  if (!endpoint) {
    throw new Error(`No endpoint found for model: ${model}`);
  }
  console.log('Using T2V endpoint:', endpoint);
  return endpoint;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { prompt, model, image_url, mode = 'text-to-video', options } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const modelEndpoint = getModelEndpoint(model, mode);
    
    // Default parameters based on fal API documentation
    const defaultParams = {
      num_frames: 16,
      num_inference_steps: 25,
      guidance_scale: 7.5,
      fps: 8,
      video_size: "square"
    };

    // Combine default parameters with any custom options
    const inputParams = {
      prompt,
      ...(image_url && { image_url }),
      ...defaultParams,
      ...options
    };

    console.log('Starting video generation:', { 
      modelEndpoint,
      inputParams
    });

    const result = await fal.subscribe(modelEndpoint, {
      input: inputParams,
      logs: true,
      onQueueUpdate: (update) => {
        console.log('Queue update:', update);
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    if (!result.data?.video?.url) {
      throw new Error('No video URL in response');
    }

    console.log('Video generation successful:', result.data);

    return res.status(200).json({
      success: true,
      data: {
        video: {
          url: result.data.video.url
        },
        requestId: result.requestId,
        processingTime: result.data?.timings?.inference_time || 
                       result.data?.timings?.total
      }
    });

  } catch (error) {
    console.error('Error generating video:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
}