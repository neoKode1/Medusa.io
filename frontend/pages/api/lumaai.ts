import { NextApiRequest, NextApiResponse } from 'next';
import { LumaAI } from 'lumaai';

// Increase Next.js body size limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

if (!process.env.LUMAAI_API_KEY) {
  throw new Error('LUMAAI_API_KEY is not defined in environment variables');
}

const client = new LumaAI({
  authToken: process.env.LUMAAI_API_KEY,
});

interface LumaAIGeneration {
  id: string | undefined;
  state: string;
  failure_reason?: string;
  assets: {
    video?: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, keyframes, isVideo } = req.body;

    // Validate input
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Check payload size
    if (JSON.stringify(req.body).length > 10 * 1024 * 1024) {
      return res.status(413).json({ error: 'Request payload too large' });
    }

    console.log('Starting video generation with prompt:', prompt);
    
    let generation: LumaAIGeneration;
    try {
      generation = await client.generations.create({
        prompt,
        type: isVideo ? 'video' : 'image',
        ...(isVideo && keyframes ? { keyframes: JSON.parse(JSON.stringify(keyframes)) } : {}),
      });
      if (!generation.id) {
        throw new Error('Generation ID is missing');
      }
      console.log('Generation created with ID:', generation.id);
    } catch (error) {
      console.error('Failed to create generation:', error);
      throw new Error('Failed to initiate video generation');
    }

    let completed = false;
    let attempts = 0;
    const maxAttempts = 30;
    const pollingInterval = 3000; // 3 seconds

    while (!completed && attempts < maxAttempts) {
      try {
        generation = await client.generations.get(generation.id);
        console.log(`Generation status (attempt ${attempts + 1}/${maxAttempts}):`, generation.state);

        if (generation.state === "completed") {
          completed = true;
        } else if (generation.state === "failed") {
          throw new Error(`Generation failed: ${generation.failure_reason || 'Unknown reason'}`);
        } else {
          await new Promise(r => setTimeout(r, pollingInterval));
          attempts++;
        }
      } catch (error) {
        console.error(`Polling error (attempt ${attempts + 1}):`, error);
        throw new Error('Failed to check generation status');
      }
    }

    if (!completed) {
      throw new Error(`Generation timed out after ${maxAttempts} attempts`);
    }

    if (!generation.assets.video) {
      throw new Error('No video URL in completed generation');
    }

    console.log('Video generation completed successfully');
    res.status(200).json({ 
      videoUrl: generation.assets.video,
      generationId: generation.id 
    });
    
  } catch (error) {
    console.error('LumaAI Error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate video',
      timestamp: new Date().toISOString()
    });
  }
} 