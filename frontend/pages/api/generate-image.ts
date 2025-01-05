import { NextApiRequest, NextApiResponse } from 'next';
import Replicate from 'replicate';

const MODEL_VERSION = "8b213982f1bbea47458f320cd02b9d43f8328173e6615c9f1034d66bc690978f";
const POLL_INTERVAL = 1000; // 1 second
const MAX_POLLS = 60; // Maximum number of times to poll (60 seconds timeout)

// Add debug logging for environment variable
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_API_TOKEN) {
  console.error('❌ REPLICATE_API_TOKEN is not set in environment variables');
}
console.log('🔑 API Token status:', REPLICATE_API_TOKEN ? 'Present' : 'Missing');

const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN,
});

type ReplicateResponse = {
  status: string;
  output?: string[];
  error?: string | null;
};

async function pollPrediction(id: string): Promise<any> {
  let polls = 0;
  while (polls < MAX_POLLS) {
    const prediction = await replicate.predictions.get(id);
    console.log('Poll result:', prediction.status);

    if (prediction.status === 'succeeded') {
      return prediction;
    }

    if (prediction.status === 'failed') {
      throw new Error(prediction.error || 'Prediction failed with unknown error');
    }

    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    polls++;
  }

  throw new Error('Prediction timed out');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReplicateResponse>
) {
  if (!REPLICATE_API_TOKEN) {
    return res.status(500).json({
      error: 'Replicate API token not configured',
      status: 'error'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      status: 'error'
    });
  }

  try {
    const {
      prompt,
      model = "dev",
      num_inference_steps = 28,
      guidance_scale = 3,
      prompt_strength = 0.8,
      num_outputs = 1,
      aspect_ratio = "1:1",
      output_format = "webp",
      output_quality = 80,
      go_fast = false,
      lora_scale = 1,
      megapixels = "1",
      extra_lora_scale = 1,
      disable_safety_checker = false,
      image,
      mask,
      seed,
      width,
      height,
      extra_lora
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        error: 'Missing required prompt field',
        status: 'error'
      });
    }

    console.log('Creating prediction with parameters:', req.body);
    
    // Create the prediction
    const prediction = await replicate.predictions.create({
      version: MODEL_VERSION,
      input: {
        prompt,
        model,
        num_inference_steps,
        guidance_scale,
        prompt_strength,
        num_outputs,
        aspect_ratio,
        output_format,
        output_quality,
        go_fast,
        lora_scale,
        megapixels,
        extra_lora_scale,
        disable_safety_checker,
        ...(image && { image }),
        ...(mask && { mask }),
        ...(seed && { seed }),
        ...(width && { width }),
        ...(height && { height }),
        ...(extra_lora && { extra_lora })
      }
    });

    console.log('Created prediction:', prediction.id);

    // Poll until the prediction is complete
    const result = await pollPrediction(prediction.id);
    console.log('Final result:', result);

    if (!result.output || !Array.isArray(result.output)) {
      throw new Error('Invalid output format received');
    }

    return res.status(200).json({
      status: 'succeeded',
      output: result.output
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Error generating image',
      status: 'error'
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}; 