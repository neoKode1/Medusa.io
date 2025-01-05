/**
 * @jest-environment node
 */

// Mock environment variables before importing any modules
process.env.FAL_KEY = 'test-key';

// Mock fal-ai client
jest.mock('@fal-ai/client', () => ({
  config: jest.fn(),
  subscribe: jest.fn().mockImplementation(() => ({
    requestId: 'test-id',
    status: 'completed',
    data: {
      diffusers_lora_file: { url: 'https://example.com/lora.safetensors' },
      config_file: { url: 'https://example.com/config.json' }
    }
  }))
}));

// Mock JSZip
jest.mock('jszip', () => {
  return jest.fn().mockImplementation(() => ({
    folder: jest.fn().mockReturnValue({
      file: jest.fn()
    }),
    generateAsync: jest.fn().mockResolvedValue({
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8))
    })
  }));
});

// Import modules after mocking
import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/training/character';
import { ApiResponse, TrainingResponse } from '../../types/api';

describe('Character Training API', () => {
  it('should return 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const responseData = JSON.parse(res._getData()) as ApiResponse<string>;
    expect(responseData.success).toBe(false);
    expect(responseData.error?.message).toBe('Method not allowed');
  });

  it('should return 400 if images are missing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        triggerWord: 'test'
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const responseData = JSON.parse(res._getData()) as ApiResponse<string>;
    expect(responseData.success).toBe(false);
    expect(responseData.error?.message).toBe('Images are required and must be an array');
  });

  it('should return 400 if images is not an array', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        images: 'not an array',
        triggerWord: 'test'
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const responseData = JSON.parse(res._getData()) as ApiResponse<string>;
    expect(responseData.success).toBe(false);
    expect(responseData.error?.message).toBe('Images are required and must be an array');
  });

  it('should successfully process training request', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        images: [
          'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII='
        ],
        triggerWord: 'test_character',
        isStyle: false
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData()) as ApiResponse<TrainingResponse>;
    expect(responseData.success).toBe(true);
    expect(responseData.data).toBeDefined();
    expect(responseData.data?.model_id).toBe('test-id');
    expect(responseData.data?.files).toBeDefined();
    expect(responseData.data?.files.lora).toBe('https://example.com/lora.safetensors');
    expect(responseData.data?.files.config).toBe('https://example.com/config.json');
    expect(responseData.data?.status).toBe('completed');
  });

  it('should handle training request with style mode', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        images: [
          'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII='
        ],
        triggerWord: 'test_style',
        isStyle: true
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData()) as ApiResponse<TrainingResponse>;
    expect(responseData.success).toBe(true);
    expect(responseData.data?.model_id).toBe('test-id');
    expect(responseData.data?.files.lora).toBeDefined();
    expect(responseData.data?.files.config).toBeDefined();
  });
}); 