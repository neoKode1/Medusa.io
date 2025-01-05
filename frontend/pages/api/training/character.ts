import type { NextApiRequest, NextApiResponse } from 'next';
import { fal } from '@fal-ai/client';
import JSZip from 'jszip';
import { ApiResponse, TrainingResponse, handleApiError, createApiResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

// Configure Fal.ai client
fal.config({
  credentials: process.env.FAL_KEY
});

// Configure API to handle large payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    }
  }
};

interface FalApiError {
  body?: {
    detail?: {
      message?: string;
      code?: string;
      [key: string]: unknown;
    };
  };
  message?: string;
  stack?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<TrainingResponse>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json(handleApiError(new Error('Method not allowed')));
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json(handleApiError(new Error('Unauthorized')));
    }

    const { images, triggerWord, isStyle, name } = req.body;

    if (!name) {
      return res.status(400).json(handleApiError(new Error('Name is required')));
    }

    if (!images || !Array.isArray(images)) {
      return res.status(400).json(handleApiError(new Error('Images are required and must be an array')));
    }

    if (images.length < 4) {
      return res.status(400).json(handleApiError(new Error('At least 4 images are required for training')));
    }

    if (images.length > 20) {
      return res.status(400).json(handleApiError(new Error('Maximum 20 images allowed for training')));
    }

    // Create a ZIP file containing the images
    const zip = new JSZip();
    const imageFolder = zip.folder("images");

    if (!imageFolder) {
      throw new Error("Failed to create images folder in ZIP");
    }

    // Add each image to the ZIP with proper naming
    images.forEach((imageData, index) => {
      const base64Data = imageData.split(',')[1];
      const mimeType = imageData.split(';')[0].split(':')[1];
      const extension = mimeType.split('/')[1];
      
      imageFolder.file(`image_${index + 1}.${extension}`, base64Data, { base64: true });
      
      if (triggerWord) {
        imageFolder.file(`image_${index + 1}.txt`, triggerWord);
      }
    });

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipBuffer = await zipBlob.arrayBuffer();
    const zipBase64 = Buffer.from(zipBuffer).toString('base64');

    console.log('Submitting training request with:', {
      imageCount: images.length,
      triggerWord: triggerWord || 'No trigger word',
      isStyle,
      zipSize: Math.round(zipBase64.length / 1024) + 'KB'
    });

    // Create the model in the database
    const model = await prisma.loraModel.create({
      data: {
        name,
        userId: session.user.id,
        status: 'processing',
        files: {}
      }
    });

    // Submit training request to Fal.ai
    const result = await fal.subscribe("fal-ai/flux-lora-fast-training", {
      input: {
        images_data_url: `data:application/zip;base64,${zipBase64}`,
        trigger_word: triggerWord || undefined,
        is_style: isStyle,
        create_masks: !isStyle,
        steps: 1000,
        data_archive_format: 'zip'
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log('Training status:', update.status);
        if (update.status === "IN_PROGRESS" && update.logs) {
          console.log('Training logs:', update.logs);
        }
      },
    });

    console.log('Training completed with model:', result.requestId);

    // Update the model in the database
    await prisma.loraModel.update({
      where: { id: model.id },
      data: {
        status: 'completed',
        files: {
          lora: result.data.diffusers_lora_file.url,
          config: result.data.config_file.url
        }
      }
    });

    return res.status(200).json(createApiResponse({
      model_id: model.id,
      files: {
        lora: result.data.diffusers_lora_file.url,
        config: result.data.config_file.url
      },
      status: 'completed',
      id: model.id
    }));

  } catch (err) {
    const error = err as FalApiError;
    console.error('Detailed training error:', error);
    
    if (error.body?.detail) {
      console.error('API Error Details:', JSON.stringify(error.body.detail, null, 2));
    }

    return res.status(500).json(handleApiError(error));
  }
} 