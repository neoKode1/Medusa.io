import { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import { logger } from '@/lib/logger';
import { APIError } from '@/lib/errors';

export function withLogging(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const requestId = randomUUID();
    const startTime = Date.now();

    // Add request ID to response headers
    res.setHeader('X-Request-ID', requestId);
    
    // Setup logger context
    logger.setRequestId(requestId);

    // Log request
    logger.log('info', 'API Request', {
      method: req.method,
      url: req.url,
      query: req.query,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
      }
    });

    try {
      // Execute handler
      const result = await handler(req, res);

      // Log response time
      const duration = Date.now() - startTime;
      logger.log('info', 'API Response', {
        duration,
        statusCode: res.statusCode
      });

      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      // Log error
      logger.log('error', 'Unhandled Error', {
        error: errorMessage,
        stack: errorStack,
        requestId
      });

      if (error instanceof APIError) {
        res.status(error.statusCode).json({
          error: error.message,
          requestId,
          details: error.details
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        requestId
      });
    } finally {
      logger.clearContext();
    }
  };
} 