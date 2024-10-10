// /pages/api/lumaai.js
import LumaAI from 'lumaai';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const client = new LumaAI({
        authToken: process.env.LUMAAI_API_KEY,  // Use environment variable here
      });

      const { prompt, image } = req.body;  // Get prompt and image from request

      // Call LumaAI API using the server-side client
      const generation = await client.generations.create({
        aspect_ratio: '16:9',
        prompt,
        image,  // The image is also passed in if necessary
      });

      res.status(200).json(generation);
    } catch (error) {
      console.error('Error generating video:', error);
      res.status(500).json({ message: 'Failed to generate video', error });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
}
