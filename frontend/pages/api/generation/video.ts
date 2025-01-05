import { NextApiRequest, NextApiResponse } from 'next';
import { MODELS, isVideoModel, ModelName } from '../../../constants/models';
import { ApiResponse, VideoResponse, handleApiError, createApiResponse } from '../../../types/api';

// Configure API to handle large payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    },
    responseLimit: false
  }
};

if (!process.env.LUMAAI_API_KEY) {
  throw new Error('Missing Luma API key');
}

interface LogData {
  [key: string]: string | number | boolean | null | undefined | Record<string, unknown>;
}

const logGeneration = (requestId: string, message: string, data?: LogData) => {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({
    timestamp,
    requestId,
    message,
    ...data
  }));
};

// Add polling configuration
const POLLING_INTERVAL = 2000; // 2 seconds
const MAX_POLLING_ATTEMPTS = 60; // 2 minutes total

interface ErrorResponse {
  error?: string;
  message?: string;
  [key: string]: unknown;
}

// Add polling function
async function pollVideoStatus(videoId: string, requestId: string): Promise<string> {
  let attempts = 0;
  
  while (attempts < MAX_POLLING_ATTEMPTS) {
    try {
      const statusResponse = await fetch(`https://api.lumalabs.ai/v1/videos/${videoId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.LUMAAI_API_KEY}`
        }
      });

      const statusData = await statusResponse.json();
      logGeneration(requestId, 'Video status polled', { status: statusData.status });

      if (statusData.status === 'completed' && statusData.video?.url) {
        return statusData.video.url;
      }

      if (statusData.status === 'failed') {
        throw new Error('Video generation failed');
      }

      // Wait before next polling attempt
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
      attempts++;
    } catch (error) {
      const err = error as Error | ErrorResponse;
      logGeneration(requestId, 'Error polling video status', { 
        error: err instanceof Error ? err.message : 'Unknown error' 
      });
      throw err instanceof Error ? err : new Error('Unknown error during polling');
    }
  }

  throw new Error('Video generation timed out');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<VideoResponse>>
) {
  const requestId = Math.random().toString(36).substring(7);
  console.log('Raw request received:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    query: req.query
  });
  logGeneration(requestId, 'Video generation request received', { method: req.method });

  if (req.method !== 'POST') {
    logGeneration(requestId, 'Method not allowed', { method: req.method });
    return res.status(405).json(handleApiError(new Error('Method not allowed')));
  }

  try {
    const { reference_image, model, duration = '5', aspect_ratio = '1:1' } = req.body as {
      reference_image: string;
      model: ModelName;
      duration?: string;
      aspect_ratio?: string;
    };

    logGeneration(requestId, 'Request parameters validated', {
      model,
      hasReferenceImage: !!reference_image,
      duration,
      aspect_ratio
    });

    if (!reference_image || !model) {
      logGeneration(requestId, 'Missing required fields', {
        hasReferenceImage: !!reference_image,
        hasModel: !!model
      });
      return res.status(400).json(handleApiError(new Error('Missing required fields')));
    }

    const modelConfig = MODELS[model];
    if (!modelConfig) {
      logGeneration(requestId, 'Invalid model selected', { model });
      return res.status(400).json(handleApiError(new Error('Invalid model selected')));
    }

    if (!isVideoModel(model)) {
      logGeneration(requestId, 'Selected model does not support video generation', { model });
      return res.status(400).json(handleApiError(new Error('Selected model does not support video generation')));
    }

    // Generate the video using Luma AI API
    const startTime = Date.now();
    
    try {
      // Create video generation job
      const createResponse = await fetch('https://api.lumalabs.ai/v1/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LUMAAI_API_KEY}`
        },
        body: JSON.stringify({
          image: reference_image,
          duration: parseInt(duration),
          aspect_ratio: aspect_ratio
        })
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json() as ErrorResponse;
        logGeneration(requestId, 'Video creation failed', { error: errorData });
        return res.status(createResponse.status).json(handleApiError(new Error(errorData.error || 'Failed to create video')));
      }

      const createData = await createResponse.json();
      logGeneration(requestId, 'Video creation started', { videoId: createData.id });

      // Poll for video completion
      const videoUrl = await pollVideoStatus(createData.id, requestId);
      
      const endTime = Date.now();
      logGeneration(requestId, 'Video generation completed', {
        duration: endTime - startTime,
        videoUrl
      });

      return res.status(200).json(createApiResponse({ 
        url: videoUrl,
        id: createData.id
      }));

    } catch (error) {
      const err = error as Error | ErrorResponse;
      logGeneration(requestId, 'Error in video generation', { 
        error: err instanceof Error ? err.message : 'Unknown error'
      });
      return res.status(500).json(handleApiError(err instanceof Error ? err : new Error('Unknown error in video generation')));
    }
  } catch (error) {
    const err = error as Error | ErrorResponse;
    logGeneration(requestId, 'Unexpected error', { 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
    return res.status(500).json(handleApiError(err instanceof Error ? err : new Error('Unexpected error')));
  }
}