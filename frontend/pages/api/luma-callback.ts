import { NextApiRequest, NextApiResponse } from 'next';

interface LumaCallbackBody {
  id: string;
  generation_type: "video";
  state: 'pending' | 'processing' | 'completed' | 'failed';
  failure_reason: string | null;
  created_at: string;
  assets?: {
    video?: string;
    image?: string;
  };
  model: string;
  request: {
    generation_type: "video";
    prompt: string;
    aspect_ratio?: string;
    loop?: boolean;
    keyframes?: {
      frame0?: {
        type: "generation" | "image";
        url?: string;
      };
      frame1?: {
        type: "generation" | "image";
        url?: string;
      };
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body as LumaCallbackBody;
    console.log('Luma callback received:', JSON.stringify(data, null, 2));

    // Here you could:
    // 1. Update a database with the generation status
    // 2. Emit a websocket event to update the UI
    // 3. Store the video URL when completed
    // For now, we'll just log the data

    if (data.state === 'completed' && data.assets?.video) {
      console.log('Video generation completed! URL:', data.assets.video);
    } else if (data.state === 'failed') {
      console.error('Video generation failed:', data.failure_reason);
    } else {
      console.log('Video generation status update:', data.state);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handling Luma callback:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}; 