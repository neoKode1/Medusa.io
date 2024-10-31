import logger from '@/lib/logger';
import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';

interface GeneratePromptRequest {
  description: string;
  genre?: string;
  reference?: string;
  style?: string;
}

interface GeneratePromptResponse {
  enhanced_prompt?: string;
  error?: string;
  requestId: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GeneratePromptResponse>
) {
  const requestId = randomUUID();
  const requestLogger = logger.child({ requestId });

  try {
    if (req.method !== 'POST') {
      requestLogger.warn('Method not allowed', { method: req.method });
      return res.status(405).json({
        error: 'Method not allowed',
        requestId,
      });
    }

    const { description, genre, reference, style } = req.body as GeneratePromptRequest;
    requestLogger.info('Processing prompt request', { description, genre, reference, style });

    // Your prompt generation logic here
    const enhanced_prompt = `Enhanced: ${description}`; // Replace with actual logic

    return res.status(200).json({
      enhanced_prompt,
      requestId,
    });
  } catch (error) {
    requestLogger.error('Error generating prompt', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return res.status(500).json({
      error: 'Failed to generate prompt',
      requestId,
    });
  }
}
