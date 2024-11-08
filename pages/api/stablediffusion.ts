import type { NextApiRequest, NextApiResponse } from 'next';
import Replicate from 'replicate';

// Add type for request body
interface RequestBody {
  value: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const { value } = req.body as RequestBody;

  // Add input validation
  if (!value || typeof value !== 'string') {
    res.status(400).json({ message: 'Invalid prompt value' });
    return;
  }

  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const output = await replicate.run(
      "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
      {
        input: {
          prompt: value.trim(),
        }
      }
    );

    if (!output) {
      throw new Error('No output received from Stable Diffusion');
    }

    res.status(200).json(output);
  } catch (error) {
    console.error('Stable Diffusion API error:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
};

export default handler;
