import { LumaAI } from 'lumaai';
import { logger } from '@/lib/logger';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    logger.log('warn', 'Method not allowed', { method: req.method });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const lumaai = new LumaAI(process.env.LUMAAI_API_KEY);

  try {
    const { prompt, promptImage, model = 'gen3a_turbo', duration = 10, ratio = '16:9' } = req.body;

    logger.log('info', 'Starting LumaAI generation', {
      prompt,
      model,
      duration,
      ratio,
      hasImage: !!promptImage
    });

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      logger.log('error', 'Invalid prompt provided', { prompt });
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
      logger.log('info', 'Generation created', { generationId: generation.id });
    } catch (createError) {
      logger.log('error', 'Error creating generation', {
        error: createError.message,
        stack: createError.stack
      });
      throw new Error(`Failed to create generation: ${createError.message}`);
    }

    let completed = false;
    const maxRetries = 30;
    let retryCount = 0;

    while (!completed && retryCount < maxRetries) {
      try {
        generation = await lumaai.generations.get(generation.id);
        logger.log('info', 'Generation status', {
          state: generation.state,
          progressPercent: generation.progressPercent || 0
        });

        if (generation.state === "completed") {
          completed = true;
        } else if (generation.state === "failed") {
          throw new Error(`Generation failed: ${generation.failure_reason || 'Unknown reason'}`);
        } else {
          logger.log('info', 'Generation in progress', {
            state: generation.state,
            attempt: retryCount + 1,
            maxRetries: maxRetries
          });
          await new Promise(r => setTimeout(r, 15000)); // Wait 15 seconds between checks
          retryCount++;
        }
      } catch (pollError) {
        logger.log('error', 'Error polling generation status', {
          error: pollError.message,
          stack: pollError.stack
        });
        if (pollError.message.includes('temporary') || pollError.message.includes('timeout')) {
          logger.log('info', 'Temporary error, retrying', {
            attempt: retryCount + 1,
            maxRetries: maxRetries
          });
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
    logger.log('info', 'Video generation completed', { videoUrl });
    res.status(200).json({ videoUrl });
  } catch (error) {
    logger.log('error', 'Error generating video with LumaAI', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({ error: error.message });
  }
}
