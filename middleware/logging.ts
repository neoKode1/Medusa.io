import { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import logger from '@/lib/logger';
import { APIError } from '@/lib/errors';
import { Logger } from 'winston';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function withLogging(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const requestId = randomUUID();
    const startTime = Date.now();

    // Add request ID to response headers
    res.setHeader('X-Request-ID', requestId);

    // Setup logger context
    const requestLogger = logger;

    // Log request
    requestLogger.info('API Request', {
      requestId,
      method: req.method,
      url: req.url,
      query: req.query,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
      },
    });

    try {
      // Execute handler
      const result = await handler(req, res);

      // Log response time
      const duration = Date.now() - startTime;
      requestLogger.info('API Response', {
        duration,
        statusCode: res.statusCode,
      });

      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorStack = error instanceof Error ? error.stack : undefined;

      // Log error
      requestLogger.error('Unhandled Error', {
        error: errorMessage,
        stack: errorStack,
        requestId,
      });

      if (error instanceof APIError) {
        res.status(error.statusCode).json({
          error: error.message,
          requestId,
          details: error.details,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        requestId,
      });
    }
  };
}

export function loggingMiddleware(logger: Logger) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const requestId = uuidv4();

    // Log with additional context directly
    logger.info('API Request', {
      requestId,
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
      body: req.body,
    });

    // Continue processing
    next();
  };
}
