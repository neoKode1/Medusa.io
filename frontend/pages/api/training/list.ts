import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

interface ApiError {
  message: string;
  details?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        message: 'Method not allowed'
      }
    });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Unauthorized'
        }
      });
    }

    const models = await prisma.loraModel.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      data: models
    });
  } catch (error) {
    console.error('Failed to list trained models:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to list trained models',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
} 