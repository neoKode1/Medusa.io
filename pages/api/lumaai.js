import { LumaAI } from 'lumaai';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const client = new LumaAI({
        authToken: process.env.LUMAAI_API_KEY,
      });

      const { prompt, image, model, duration, ratio } = req.body;

      if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
      }

      const generationPayload = {
        prompt,
        model: model || 'gen3a_turbo',
        duration: duration || 10,
        ratio: ratio || '16:9',
      };

      if (image) {
        generationPayload.image = image;
      }

      const generation = await client.generations.create(generationPayload);

      res.status(200).json(generation);

    } catch (error) {
      console.error('Error generating video:', error);
      res.status(500).json({ message: 'Failed to generate video', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
}