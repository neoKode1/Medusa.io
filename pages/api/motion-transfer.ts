import type { NextApiRequest, NextApiResponse } from 'next';
import Replicate from 'replicate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const { prompt, promptImage, n_timesteps } = req.body;

    const output = await replicate.run(
      "lucataco/motion-transfer:1f927c24b1e57c2c2f4c9fdfa636b30ba5f20ca1e395cf1ee38ecd7cc1cef69f",
      {
        input: {
          prompt,
          image: promptImage,
          n_timesteps,
        },
      }
    );

    res.status(200).json({ videoUrl: output });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate video' });
  }
} 