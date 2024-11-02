import { NextApiRequest, NextApiResponse } from 'next';

// Define the correct type for LumaAI options
interface LumaAIOptions {
  apiKey?: string;
  version?: string;
}

class LumaAI {
  private apiKey: string;
  private version: string;

  constructor(options: LumaAIOptions) {
    this.apiKey = options.apiKey || process.env.LUMAAI_API_KEY || '';
    this.version = options.version || 'v1.1.0';
  }
  
  // ... rest of your LumaAI implementation
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const lumaai = new LumaAI({
      apiKey: process.env.LUMAAI_API_KEY,
      version: 'v1.1.0'
    });

    // ... rest of your handler code
  } catch (error) {
    console.error('LumaAI Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 