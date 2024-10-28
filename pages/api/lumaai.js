import { LumaAI } from 'lumaai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const lumaai = new LumaAI(process.env.LUMAAI_API_KEY);

  try {
    const { prompt, promptImage, model = 'gen3a_turbo', duration = 10, ratio = '16:9' } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('Invalid or missing prompt.');
    }

    let generation;
    try {
      generation = await lumaai.generations.create({
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
    const maxRetries = 30;
    let retryCount = 0;

    while (!completed && retryCount < maxRetries) {
      try {
        generation = await lumaai.generations.get(generation.id);
        console.log(`Generation status: ${generation.state}, Progress: ${generation.progressPercent || 0}%`);

        if (generation.state === "completed") {
          completed = true;
        } else if (generation.state === "failed") {
          throw new Error(`Generation failed: ${generation.failure_reason || 'Unknown reason'}`);
        } else {
          console.log(`Generation in progress... State: ${generation.state}, Attempt ${retryCount + 1} of ${maxRetries}`);
          await new Promise(r => setTimeout(r, 15000)); // Wait 15 seconds between checks
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
    res.status(500).json({ error: error.message });
  }
}
