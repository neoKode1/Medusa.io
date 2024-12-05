import type { NextApiRequest, NextApiResponse } from 'next';
import { fal } from '@fal-ai/client';
import JSZip from 'jszip';

fal.config({
  credentials: process.env.FAL_KEY
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    }
  }
};

interface FalApiError {
  body?: {
    detail?: any;
  };
  message?: string;
  stack?: string;
}

interface TrainingResult {
  success: boolean;
  error?: string;
  data: {
    model_id?: string;
    diffusers_lora_file?: {
      url: string;
      name?: string;
    };
    config_file?: {
      url: string;
      name?: string;
    };
  };
  requestId: string;
}

interface FluxLoraFastTrainingOutput {
  requestId: string;
  data: {
    diffusers_lora_file: {
      url: string;
      content_type: string;
      file_name: string;
      file_size: number;
    };
    config_file: {
      url: string;
      content_type: string;
      file_name: string;
      file_size: number;
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { images, triggerWord, isStyle } = req.body;

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        error: 'Images are required and must be an array'
      });
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
    console.log('Request ID:', result.requestId);

    // After successful training, return structured data
    return res.status(200).json({
      success: true,
      data: {
        model_id: result.requestId,
        diffusers_lora_file: {
          url: result.data.diffusers_lora_file.url,
          name: result.data.diffusers_lora_file.file_name
        },
        config_file: {
          url: result.data.config_file.url,
          name: result.data.config_file.file_name
        }
      },
      requestId: result.requestId
    } as TrainingResult);

  } catch (err) {
    const error = err as FalApiError;
    console.error('Detailed training error:', error);
    
    if (error.body?.detail) {
      console.error('API Error Details:', JSON.stringify(error.body.detail, null, 2));
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred',
      details: error.body?.detail || error.stack
    });
  }
} 