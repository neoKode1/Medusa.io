import { NextApiRequest, NextApiResponse } from 'next';

const LUMA_API_TOKEN = process.env.LUMA_API_TOKEN;

type LumaApiState = 'pending' | 'processing' | 'completed' | 'failed';

type LumaResponse = {
  state: string;
  assets?: {
    video?: string;
  };
  failure_reason?: string;
};

// Map Luma API states to our frontend states
function mapLumaState(state: LumaApiState): 'pending' | 'dreaming' | 'completed' | 'failed' {
  switch (state) {
    case 'pending':
      return 'pending';
    case 'processing':
      return 'dreaming';
    case 'completed':
      return 'completed';
    case 'failed':
      return 'failed';
    default:
      return 'pending';
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LumaResponse>
) {
  if (!LUMA_API_TOKEN) {
    console.error('LUMA_API_TOKEN not configured');
    return res.status(500).json({
      state: 'failed',
      failure_reason: 'Please configure your LUMA_API_TOKEN in .env.local'
    });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      state: 'failed',
      failure_reason: 'Missing or invalid generation ID'
    });
  }

  try {
    const response = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${LUMA_API_TOKEN}`
      }
    });

    const data = await response.json();
    console.log('Luma API status response:', data);

    if (!response.ok) {
      console.error('Luma API error:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      
      // Handle specific error cases
      if (response.status === 403) {
        throw new Error('Invalid API token or insufficient permissions');
      } else if (response.status === 404) {
        throw new Error('Generation not found');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      throw new Error(data.error || `Failed to check video status: ${response.statusText}`);
    }

    // Validate response data
    if (!data.state) {
      throw new Error('Invalid response from Luma API: missing state');
    }

    // Map the state and prepare response
    const mappedState = mapLumaState(data.state as LumaApiState);
    const responseData: LumaResponse = {
      state: mappedState
    };

    // Add assets if available
    if (mappedState === 'completed' && data.assets?.video) {
      responseData.assets = {
        video: data.assets.video
      };
    }

    // Add failure reason if failed
    if (mappedState === 'failed' && data.failure_reason) {
      responseData.failure_reason = data.failure_reason;
    }

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Error checking video status:', error);
    
    // Handle different types of errors
    let errorMessage = 'Error checking video status';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        statusCode = 404;
        errorMessage = 'Generation not found';
      } else if (error.message.includes('Rate limit')) {
        statusCode = 429;
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (error.message.includes('Invalid API token')) {
        statusCode = 403;
        errorMessage = 'Invalid API token or insufficient permissions';
      }
    }

    return res.status(statusCode).json({
      state: 'failed',
      failure_reason: errorMessage
    });
  }
} 