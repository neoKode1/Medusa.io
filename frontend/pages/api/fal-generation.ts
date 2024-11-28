import { NextApiRequest, NextApiResponse } from 'next';
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
  baseURL: 'https://rest.fal.ai/v1'
});

type FluxModel = 
  | 'FLUX 1.1 Pro Ultra'
  | 'FLUX 1.1 Pro'
  | 'FLUX 1 Pro'
  | 'FLUX 1 Dev'
  | 'FLUX Realism'
  | 'FLUX LoRA Fill'
  | 'FLUX Inpainting'
  | 'FLUX Pro Redux'
  | 'FLUX Canny Pro'
  | 'FLUX Depth Pro'
  | 'FLUX Redux Pro Ultra'
  | 'FLUX Redux Pro'
  | 'Stable Diffusion XL'
  | 'Kling Video'
  | 'Luma Dream Machine';

const MODEL_ENDPOINTS: Record<FluxModel, string> = {
  'FLUX 1.1 Pro Ultra': 'fal-ai/flux-pro/v1.1-ultra',
  'FLUX 1.1 Pro': 'fal-ai/flux-pro/v1.1',
  'FLUX 1 Pro': 'fal-ai/flux-pro/v1',
  'FLUX 1 Dev': 'fal-ai/flux/dev',
  'FLUX Realism': 'fal-ai/flux-realism',
  'FLUX LoRA Fill': 'fal-ai/flux-lora-fill',
  'FLUX Inpainting': 'fal-ai/flux-inpainting',
  'FLUX Pro Redux': 'fal-ai/flux-pro/redux',
  'FLUX Canny Pro': 'fal-ai/flux-canny-pro',
  'FLUX Depth Pro': 'fal-ai/flux-depth-pro',
  'FLUX Redux Pro Ultra': 'fal-ai/flux-pro/redux-ultra',
  'FLUX Redux Pro': 'fal-ai/flux-pro/redux',
  'Stable Diffusion XL': 'fal-ai/stable-diffusion-xl',
  'Kling Video': 'fal-ai/kling-video',
  'Luma Dream Machine': 'fal-ai/luma-dream-machine'
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { prompt, model, image_url, options } = req.body;

    const result = await fal.run(MODEL_ENDPOINTS[model], {
      input: {
        prompt,
        image_url,
        ...options
      }
    });

    // Log the response for debugging
    console.log('FAL API response:', result);

    // Ensure we're returning a properly structured response
    if (!result.data?.images?.[0]) {
      throw new Error('No image generated');
    }

    return res.status(200).json({
      data: {
        images: result.data.images.map(img => {
          // Handle both string URLs and object formats
          return typeof img === 'string' ? img : img.url;
        }),
        ...result.data
      }
    });

  } catch (error) {
    console.error('FAL API error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate image' 
    });
  }
} 