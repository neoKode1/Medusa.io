import type { NextApiRequest, NextApiResponse } from 'next';
import Replicate from 'replicate';

const getModelInputs = (modelId: string, prompt: string, options?: any) => {
  if (!modelId) throw new Error('Model ID is required');

  // Base FLUX parameters
  const baseFluxParams = {
    prompt,
    raw: false,
    aspect_ratio: '1:1',
    output_format: 'jpg',
    safety_tolerance: 2
  };

  // Text to Image FLUX models
  if (modelId.includes('flux-1.1-pro-ultra')) {
    return {
      ...baseFluxParams,
      quality: 'ultra',
      ...options
    };
  }

  // Structural Conditioning models
  if (modelId.includes('flux-canny-pro')) {
    return {
      ...baseFluxParams,
      image: options?.image,
      detect_resolution: 512,
      image_resolution: 512,
      ...options
    };
  }

  if (modelId.includes('flux-depth-pro')) {
    return {
      ...baseFluxParams,
      image: options?.image,
      depth_map_strength: 0.5,
      ...options
    };
  }

  // Image Variation models
  if (modelId.includes('flux-redux')) {
    return {
      image: options?.image,
      variation_strength: 0.75,
      ...options
    };
  }

  // Default parameters for other models
  return {
    prompt,
    num_outputs: 1,
    guidance_scale: 7.5,
    num_inference_steps: 50
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const { prompt, model, options } = req.body;
    console.log('⏳ Creating prediction with:', { prompt, model, options });

    const modelInputs = getModelInputs(model, prompt, options);
    const output = await replicate.run(model, { input: modelInputs });

    console.log('✨ Generation complete:', output);

    // Handle different response formats
    let imageUrl;
    if (Array.isArray(output)) {
      imageUrl = output[0];
    } else if (typeof output === 'object' && output.image) {
      imageUrl = output.image;
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else {
      throw new Error(`Unexpected output format: ${JSON.stringify(output)}`);
    }

    console.log('🖼️ Generated image URL:', imageUrl);

    return res.status(200).json({
      success: true,
      imageUrl
    });

  } catch (error) {
    console.error('❌ Replicate API error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
}; 