import Replicate from 'replicate';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN, // Use environment variable
    });

    // ... rest of your handler code
  } catch (error) {
    console.error('Error in image generation:', error);
    res.status(500).json({ message: 'Error generating image', error: error.message });
  }
}