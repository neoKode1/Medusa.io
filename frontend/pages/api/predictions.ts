import { NextApiRequest, NextApiResponse } from 'next';
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

type ModelConfig = {
  version: string;
  input: Record<string, any>;
};

const modelConfigs: Record<string, ModelConfig> = {
  'stability-ai/sdxl': {
    version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    input: {
      negative_prompt: "ugly, bad art, poor quality, low quality"
    }
  },
  'stability-ai/stable-diffusion-3.5-large': {
    version: 'e6c4657fe1b3f078fb26d68a1413bc8013e2b085504dd84a33e26e16fb95a593',
    input: {
      cfg: 4.5,
      output_format: 'webp',
      output_quality: 90,
      prompt_strength: 0.85,
      aspect_ratio: "1:1"
    }
  },
  'recraft-ai/recraft-v3': {
    version: '5a5970827138fb94ff24a7583baa4ae9a000bfb38836f915816761de4f480fd5',
    input: {
      style: "any"
    }
  },
  'black-forest-labs/flux-dev': {
    version: '0cce3d40843963ebc7b6d976778e977c8f3ae3d0980a37cb5204f8fa0289e3d2',
    input: {
      go_fast: true,
      guidance: 3.5,
      output_format: 'webp',
      output_quality: 80,
      prompt_strength: 0.8,
      scheduler: 'K_EULER_ANCESTRAL',
      negative_prompt: "ugly, bad art, poor quality, low quality"
    }
  },
  'black-forest-labs/flux-pro': {
    version: 'caf8d6bf110808c53bb90767ea81e1bbd0f0690ba37a4a24b27b17e2f9a5c011',
    input: {
      interval: 2,
      safety_tolerance: 2,
      scheduler: 'K_EULER_ANCESTRAL',
      negative_prompt: "ugly, bad art, poor quality, low quality"
    }
  },
  'black-forest-labs/flux-1.1-pro': {
    version: 'a91bed9b0301d9d10b34b89b1f4d0255f2e2499c59576bfcd13405575dacdb25',
    input: {
      output_format: 'webp',
      output_quality: 80,
      safety_tolerance: 2,
      prompt_upsampling: true,
      aspect_ratio: "1:1"
    }
  }
};

const RECRAFT_ALLOWED_SIZES = [
  "1024x1024", "1365x1024", "1024x1365", 
  "1536x1024", "1024x1536", "1820x1024", 
  "1024x1820", "1024x2048", "2048x1024", 
  "1434x1024", "1024x1434", "1024x1280", 
  "1280x1024", "1024x1707", "1707x1024"
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      prompt,
      model_id,
      steps,
      width,
      height,
      guidance,
      scheduler
    } = req.body;

    const modelConfig = modelConfigs[model_id];
    if (!modelConfig) {
      return res.status(400).json({ error: `Unsupported model: ${model_id}` });
    }

    const input = {
      prompt,
      ...(steps && { num_inference_steps: steps }),
      ...((width && height) ? { width, height } : {}),
      ...(guidance && { guidance_scale: guidance }),
      ...modelConfig.input,
      ...(scheduler && model_id.includes('flux') ? { scheduler } : {})
    };

    const prediction = await replicate.run(
      `${model_id}:${modelConfig.version}` as `${string}/${string}:${string}`,
      { input }
    );

    let imageUrl = null;
    if (prediction instanceof ReadableStream) {
      // Create prediction with proper parameters
      const predictionResponse = await replicate.predictions.create({
        model: model_id,
        version: modelConfig.version,
        input: input
      });

      // Poll for results
      let attempts = 0;
      const maxAttempts = 30;
      while (attempts < maxAttempts) {
        const result = await replicate.predictions.get(predictionResponse.id);
        console.log('Polling status:', result.status); // Debug log
        
        if (result.status === 'succeeded') {
          imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
          break;
        } else if (result.status === 'failed') {
          throw new Error(`Model prediction failed: ${result.error}`);
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!imageUrl) {
        throw new Error('Prediction timed out');
      }
    } else if (typeof prediction === 'string') {
      imageUrl = prediction;
    } else if (Array.isArray(prediction)) {
      imageUrl = prediction[0];
    } else if (prediction && typeof prediction === 'object') {
      imageUrl = Array.isArray((prediction as { output: string | string[] }).output) 
        ? (prediction as { output: string[] }).output[0] 
        : (prediction as { output: string }).output;
    }

    if (!imageUrl) {
      throw new Error('No valid image URL in response');
    }

    return res.status(200).json({ imageUrl });

  } catch (error) {
    console.error('Prediction error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate image'
    });
  }
} 