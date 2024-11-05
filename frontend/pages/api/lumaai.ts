import type { NextApiRequest, NextApiResponse } from 'next';
import { LumaAI } from 'lumaai';

const client = new LumaAI({
  authToken: process.env.LUMA_API_KEY
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, keyframes, guidance_scale } = req.body;

    // Log the incoming request
    console.log('Received request:', {
      hasPrompt: !!prompt,
      hasKeyframes: !!keyframes,
      keyframeType: keyframes?.frame0?.type,
      imageUrlLength: keyframes?.frame0?.url?.length
    });

    // Create generation options
    const generationOptions: any = {
      prompt,
      guidance_scale: guidance_scale || 7.5,
      loop: true,
    };

    // Only add keyframes if we have a valid image URL
    if (keyframes?.frame0?.url && keyframes.frame0.url.startsWith('data:image')) {
      // Convert data URL to a proper URL or remove keyframes
      console.log('Reference image provided as data URL');
      delete generationOptions.keyframes;
    } else if (keyframes?.frame0?.url) {
      generationOptions.keyframes = {
        frame0: {
          type: "image",
          url: keyframes.frame0.url
        }
      };
    }

    console.log('Creating generation with options:', {
      prompt: generationOptions.prompt,
      hasKeyframes: !!generationOptions.keyframes
    });

    // Create the generation
    let generation = await client.generations.create(generationOptions);

    // Start polling for completion
    let completed = false;
    let attempts = 0;
    const maxAttempts = 30;

    while (!completed && attempts < maxAttempts) {
      if (!generation.id) {
        throw new Error('Generation ID is missing');
      }
      generation = await client.generations.get(generation.id);

      if (generation.state === "completed") {
        completed = true;
        break;
      } else if (generation.state === "failed") {
        throw new Error(`Generation failed: ${generation.failure_reason}`);
      } else {
        console.log(`Generation in progress... Attempt ${attempts + 1}/${maxAttempts}`);
        await new Promise(r => setTimeout(r, 5000));
        attempts++;
      }
    }

    if (!completed) {
      throw new Error('Generation timed out');
    }

    return res.status(200).json({
      success: true,
      videoId: generation.id,
      videoUrl: generation.assets?.video || null,
      status: generation.state || 'pending'
    });

  } catch (error) {
    console.error('LumaAI Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to initiate video generation'
    });
  }
} 