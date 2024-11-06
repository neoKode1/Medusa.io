import type { NextApiRequest, NextApiResponse } from 'next';
import { LumaAI } from 'lumaai';

const client = new LumaAI({
  authToken: process.env.LUMAAI_API_KEY
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

    const generationOptions = {
      prompt,
      guidance_scale: guidance_scale || 7.5,
      loop: true,
    };

    if (keyframes?.frame0?.url && !keyframes.frame0.url.startsWith('data:image')) {
      generationOptions.keyframes = {
        frame0: {
          type: "image",
          url: keyframes.frame0.url
        }
      };
    }

    const response = await client.generate(generationOptions);
    return res.status(200).json(response);
  } catch (error) {
    console.error('LumaAI API error:', error);
    return res.status(500).json({ error: 'Failed to generate video' });
  }
} 