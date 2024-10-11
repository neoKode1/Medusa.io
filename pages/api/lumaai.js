import { LumaAI } from 'lumaai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} not allowed`);
  }

  try {
    const { prompt, model = 'gen3a_turbo', duration = 10, ratio = '16:9', promptImage } = req.body;

    if (!process.env.LUMAAI_API_KEY) {
      throw new Error('LumaAI API key is missing.');
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('Invalid or missing prompt.');
    }

    const client = new LumaAI({
      authToken: process.env.LUMAAI_API_KEY,
    });

    let generation;
    try {
      generation = await client.generations.create({
        prompt,
        model,
        duration,
        ratio,
        image: promptImage,
      });
      console.log('Generation created:', generation.id);
    } catch (createError) {
      console.error('Error creating generation:', createError);
      throw new Error(`Failed to create generation: ${createError.message}`);
    }

    let completed = false;
    const maxRetries = 30; // Increased max retries
    let retryCount = 0;

    while (!completed && retryCount < maxRetries) {
      try {
        generation = await client.generations.get(generation.id);
        console.log(`Generation status: ${generation.state}, Progress: ${generation.progressPercent || 0}%`);

        if (generation.state === "completed") {
          completed = true;
        } else if (generation.state === "failed") {
          throw new Error(`Generation failed: ${generation.failure_reason || 'Unknown reason'}`);
        } else {
          console.log(`Generation in progress... State: ${generation.state}, Attempt ${retryCount + 1} of ${maxRetries}`);
          await new Promise(r => setTimeout(r, 15000)); // Increased wait time to 15 seconds
          retryCount++;
        }
      } catch (pollError) {
        console.error('Error polling generation status:', pollError);
        if (pollError.message.includes('temporary') || pollError.message.includes('timeout')) {
          console.log(`Temporary error, retrying... Attempt ${retryCount + 1} of ${maxRetries}`);
          await new Promise(r => setTimeout(r, 15000));
          retryCount++;
        } else {
          throw new Error(`Failed to poll generation status: ${pollError.message}`);
        }
      }
    }

    if (!completed) {
      throw new Error('Generation timed out after maximum retries.');
    }

    if (!generation.assets || !generation.assets.video) {
      throw new Error('LumaAI video generation failed or no video asset returned.');
    }

    const videoUrl = generation.assets.video;
    console.log('Video generation completed successfully. URL:', videoUrl);
    res.status(200).json({ videoUrl });
  } catch (error) {
    console.error('Error generating video with LumaAI:', error);
    res.status(500).json({ message: 'Failed to generate video with LumaAI', error: error.message });
  }
}