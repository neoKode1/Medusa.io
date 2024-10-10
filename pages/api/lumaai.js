// /pages/api/lumaai.js
import LumaAI from 'lumaai';  // Ensure you have installed the LumaAI package (if exists) or use 'node-fetch' to make direct API requests.

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const client = new LumaAI({
        authToken: process.env.LUMAAI_API_KEY,  // Make sure your environment variable is set correctly
      });

      const { prompt, image } = req.body;

      // Check if the required fields are provided
      if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
      }

      // Create the generation request with or without an image
      const generationPayload = {
        aspect_ratio: '16:9',
        prompt,
      };

      // If image is provided, add it to the payload
      if (image) {
        generationPayload.image = image;
      }

      // Call the LumaAI Generations API
      const generation = await client.generations.create(generationPayload);

      // Return the response
      res.status(200).json(generation);

    } catch (error) {
      console.error('Error generating video:', error);
      res.status(500).json({ message: 'Failed to generate video', error: error.message });
    }
  } else {
    // Handle non-POST methods
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
}
