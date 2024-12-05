import { NextApiRequest, NextApiResponse } from 'next';
import { fal } from "@fal-ai/client";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    }
  }
};

fal.config({
  credentials: process.env.FAL_KEY
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Convert base64 to binary data
    const base64Data = image.split(',')[1];
    const binaryData = atob(base64Data);
    const byteArray = new Uint8Array(binaryData.length);
    
    for(let i = 0; i < binaryData.length; i++) {
      byteArray[i] = binaryData.charCodeAt(i);
    }
    
    const file = new File([byteArray], "image.jpg", { type: "image/jpeg" });
    const uploadedUrl = await fal.storage.upload(file);

    return res.status(200).json({ url: uploadedUrl });
  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to upload image'
    });
  }
}