import { NextApiRequest, NextApiResponse } from 'next';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const prediction = await replicate.run(
      "neokode1/deeptechai",
      {
        input: {
          prompt: prompt
        }
      }
    );

    return res.status(200).json(prediction);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Error generating image' });
  }
} 