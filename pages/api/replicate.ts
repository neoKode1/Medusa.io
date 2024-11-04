import Replicate from "replicate";

export default async function handler(req, res) {
  console.log('=== Starting Replicate API Handler ===');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    console.log('Received prompt:', prompt);

    // Initialize Replicate client
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Use the exact model ID from documentation
    const MODEL_ID = "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf";
    console.log('Using model:', MODEL_ID);

    // Run the model with proper input format
    const output = await replicate.run(MODEL_ID, {
      input: {
        prompt: prompt
      }
    });

    console.log('Replicate output:', output);

    // The output is an array of URLs - get the first one
    if (!Array.isArray(output) || !output[0]) {
      throw new Error('Invalid response format from Replicate');
    }

    const imageUrl = output[0];
    console.log('Generated image URL:', imageUrl);

    return res.status(200).json({
      success: true,
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error('Replicate API error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
} 