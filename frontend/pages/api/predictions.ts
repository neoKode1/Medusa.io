import { NextApiRequest, NextApiResponse } from 'next/types';
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

type ModelConfig = {
  version: string;
  input: Record<string, any>;
};

const modelConfigs: Record<string, ModelConfig> = {
  'stability-ai/stable-diffusion-xl-base-1.0': {
    version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    input: {
      negative_prompt: "ugly, bad art, poor quality, low quality",
      scheduler: "K_EULER",
      num_outputs: 1
    }
  },
  'stability-ai/stable-diffusion-3.5-large': {
    version: 'e6c4657fe1b3f078fb26d68a1413bc8013e2b085504dd84a33e26e16fb95a593',
    input: {
      cfg_scale: 7.5,
      output_format: 'webp',
      prompt_strength: 0.8,
      scheduler: "K_EULER"
    }
  },
  'recraft-ai/recraft-v3': {
    version: '5a5970827138fb94ff24a7583baa4ae9a000bfb38836f915816761de4f480fd5',
    input: {
      style: "any",
      scheduler: "K_EULER"
    }
  },
  'black-forest-labs/flux-dev': {
    version: '0cce3d40843963ebc7b6d976778e977c8f3ae3d0980a37cb5204f8fa0289e3d2',
    input: {
      guidance_scale: 7.5,
      output_format: 'webp',
      prompt_strength: 0.8,
      scheduler: 'K_EULER_ANCESTRAL',
      negative_prompt: "ugly, bad art, poor quality, low quality"
    }
  },
  'black-forest-labs/flux-pro': {
    version: 'caf8d6bf110808c53bb90767ea81e1bbd0f0690ba37a4a24b27b17e2f9a5c011',
    input: {
      guidance_scale: 7.5,
      scheduler: 'K_EULER_ANCESTRAL',
      negative_prompt: "ugly, bad art, poor quality, low quality"
    }
  },
  'black-forest-labs/flux-1.1-pro': {
    version: 'a91bed9b0301d9d10b34b89b1f4d0255f2e2499c59576bfcd13405575dacdb25',
    input: {
      output_format: 'webp',
      guidance_scale: 7.5,
      scheduler: 'K_EULER_ANCESTRAL',
      negative_prompt: "ugly, bad art, poor quality, low quality"
    }
  }
};

const MAX_DIMENSIONS = {
  width: 1440,
  height: 1440
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      prompt,
      model_id,
      steps = 30,
      width = 1024,
      height = 1024,
      guidance = 7.5,
      scheduler = 'K_EULER'
    } = req.body;

    // Validate required fields
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    if (!model_id) {
      return res.status(400).json({ error: 'Model ID is required' });
    }

    // Validate and constrain dimensions
    const validatedWidth = Math.min(width, MAX_DIMENSIONS.width);
    const validatedHeight = Math.min(height, MAX_DIMENSIONS.height);

    const modelConfig = modelConfigs[model_id];
    if (!modelConfig) {
      return res.status(400).json({ error: `Unsupported model: ${model_id}` });
    }

    // Construct input with proper defaults and overrides
    const input = {
      prompt,
      num_inference_steps: steps,
      width: validatedWidth,
      height: validatedHeight,
      guidance_scale: guidance,
      scheduler,
      ...modelConfig.input // Model-specific settings override defaults
    };

    console.log('Creating prediction with input:', input);

    const prediction = await replicate.predictions.create({
      version: modelConfig.version,
      input,
    });

    if (!prediction?.id) {
      throw new Error('Failed to create prediction');
    }

    let result = await replicate.predictions.get(prediction.id);
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout

    while (!result?.output && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      result = await replicate.predictions.get(prediction.id);
      attempts++;
    }

    if (!result?.output) {
      throw new Error('Generation timed out');
    }

    const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;

    if (!imageUrl) {
      throw new Error('No valid image URL in response');
    }

    return res.status(200).json({ 
      imageUrl,
      prediction_id: prediction.id 
    });

  } catch (error: any) {
    console.error('Prediction error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to generate image',
      details: error.response?.data
    });
  }
} 