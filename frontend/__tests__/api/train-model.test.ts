/**
 * @jest-environment node
 */

// Mock environment variables before importing any modules
process.env.FAL_KEY = 'test-key';

// Mock fal-ai client
jest.mock('@fal-ai/serverless-client', () => ({
  config: jest.fn(),
  subscribe: jest.fn().mockImplementation(() => ({
    requestId: 'test-id',
    status: 'completed',
    output: [],
    error: null
  }))
}));

// Import modules after mocking
import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/training/model';
import { ApiResponse, TrainingResponse } from '../../types/api';

describe('Train Model API', () => {
  it('should return 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const responseData = JSON.parse(res._getData()) as ApiResponse;
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Method not allowed');
  });

  it('should return 400 if required fields are missing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const responseData = JSON.parse(res._getData()) as ApiResponse;
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Missing required fields or insufficient images');
  });
}); 