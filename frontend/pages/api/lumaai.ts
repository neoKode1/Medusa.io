import { NextApiRequest, NextApiResponse } from 'next';
import { LumaAI } from 'lumaai';

// Increase Next.js body size limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb' // Adjust this value based on your needs
    }
  }
};

const client = new LumaAI({
  authToken: process.env.LUMAAI_API_KEY,
});

interface LumaAIGeneration {
  id: string;
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
    const { prompt, keyframes } = req.body;

    // Check payload size
    if (JSON.stringify(req.body).length > 10 * 1024 * 1024) { // 10MB limit
      return res.status(413).json({ error: 'Request payload too large' });
    }

    let generation: LumaAIGeneration = await client.generations.create({
      prompt,
      keyframes: keyframes ? JSON.parse(JSON.stringify(keyframes)) : undefined,
    });

    let completed = false;
    let attempts = 0;
    const maxAttempts = 30; // Prevent infinite loops

    while (!completed && attempts < maxAttempts) {
      generation = await client.generations.get(generation.id);

      if (generation.state === "completed") {
        completed = true;
      } else if (generation.state === "failed") {
        throw new Error(`Generation failed: ${generation.failure_reason}`);
      } else {
        console.log("Dreaming...");
        await new Promise(r => setTimeout(r, 3000));
        attempts++;
      }
    }

    if (!completed) {
      throw new Error('Generation timed out');
    }

    const videoUrl = generation.assets.video;
    res.status(200).json({ videoUrl });
    
  } catch (error) {
    console.error('LumaAI Error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate video' });
  }
} 