import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, ImageResponse, handleApiError, createApiResponse } from '../../../types/api';
import { MODELS, ModelName } from '../../../constants/models';

interface LogData {
  [key: string]: string | number | boolean | null | undefined;
}

// Configure API to handle large payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    },
    responseLimit: false
  }
};

const logGeneration = (requestId: string, message: string, data?: LogData) => {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({
    timestamp,
    requestId,
    message,
    ...data
  }));
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ImageResponse>>
) {
  const requestId = Math.random().toString(36).substring(7);
  logGeneration(requestId, 'Image generation request received', { method: req.method });

  if (req.method !== 'POST') {
    logGeneration(requestId, 'Method not allowed', { method: req.method });
    return res.status(405).json(handleApiError(new Error('Method not allowed')));
  }

  try {
    const { prompt, model, negative_prompt, aspect_ratio = '1:1' } = req.body;

    // Validate model
    if (!model || !MODELS[model as ModelName]) {
      logGeneration(requestId, 'Invalid model', { model });
      return res.status(400).json(handleApiError(new Error('Invalid model')));
    }

    const modelConfig = MODELS[model as ModelName];

    // Calculate dimensions based on aspect ratio
    let width = 1024;
    let height = 1024;
    if (aspect_ratio === '16:9') {
      width = 1024;
      height = 576;
    } else if (aspect_ratio === '9:16') {
      width = 576;
      height = 1024;
    }

    // Forward the request to the predictions endpoint
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/replicate/predictions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        model: modelConfig.id,
        negative_prompt,
        width,
        height,
        num_inference_steps: 25
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate image');
    }

    const result = await response.json();
    logGeneration(requestId, 'Image generation completed', { result });
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to generate image');
    }

    return res.status(200).json(createApiResponse({
      url: result.data.url,
      id: result.data.id,
      width: result.data.width,
      height: result.data.height,
      content_type: result.data.content_type
    }));
  } catch (error) {
    logGeneration(requestId, 'Request processing failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return res.status(500).json(handleApiError(error));
  }
} 