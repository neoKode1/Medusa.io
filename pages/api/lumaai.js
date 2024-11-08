import formidable from 'formidable';
import fs from 'fs';
import { LumaAI } from 'lumaai';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = new formidable.IncomingForm({
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      keepExtensions: true,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const prompt = fields.prompt;
    const model = fields.model;
    let referenceImageBase64 = null;

    if (files.referenceImage) {
      const imageFile = files.referenceImage;
      const imageBuffer = fs.readFileSync(imageFile.filepath);
      referenceImageBase64 = `data:${imageFile.mimetype};base64,${imageBuffer.toString('base64')}`;
    }

    const client = new LumaAI({
      authToken: process.env.LUMAAI_API_KEY,
    });

    let generation = await client.generations.create({
      prompt,
      model: 'gen3a_turbo',
      duration: 10,
      ratio: '16:9',
      image: referenceImageBase64, // Add reference image if available
    });

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
    console.error('Error in video generation:', error);
    res.status(500).json({ message: 'Error generating video', error: error.message });
  }
}