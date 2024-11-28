import { NextApiRequest, NextApiResponse } from 'next';
import { LumaAI } from 'lumaai';

const client = new LumaAI({ authToken: process.env.LUMAAI_API_KEY });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { prompt, keyframes, loop } = req.body;

    const generation = await client.generations.create({
      prompt,
      keyframes,
      loop: loop || false
    });

    // Poll for completion
    let completed = false;
    let result = generation;
    while (!completed) {
      result = await client.generations.get(generation.id!);

      if (result.state === "completed") {
        completed = true;
      } else if (result.state === "failed") {
        throw new Error(`Generation failed: ${result.failure_reason}`);
      } else {
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    return res.status(200).json({
      success: true,
      videoUrl: result.assets?.video
    });

  } catch (error) {
    console.error('Luma AI API error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
} 