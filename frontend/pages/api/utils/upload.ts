import { NextApiRequest, NextApiResponse } from 'next';
import { fal } from "@fal-ai/client";
import { ApiResponse, handleApiError, createApiResponse } from '@/types/api';

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

interface UploadResponse {
  url: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<UploadResponse>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json(handleApiError(new Error('Method not allowed')));
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json(handleApiError(new Error('No image provided')));
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

    return res.status(200).json(createApiResponse({ url: uploadedUrl }));
  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json(handleApiError(error));
  }
}