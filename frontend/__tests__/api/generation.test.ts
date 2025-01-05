/**
 * @jest-environment node
 */

import { createMocks } from 'node-mocks-http';
import imageHandler from '../../pages/api/generation/image';
import { MODELS } from '../../constants/models';
import { ApiResponse, ImageResponse } from '../../types/api';

// Mock the MODELS constant
jest.mock('../../constants/models', () => ({
  MODELS: {
    fluxPro: {
      id: 'stability-ai/sdxl-base',
      name: 'Flux Pro',
      description: 'Test model'
    }
  }
}));

// Mock the fetch function
const mockFetch = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      success: true,
      data: {
        url: 'https://example.com/generated-image.jpg',
        id: 'test-id',
        width: 1024,
        height: 1024,
        content_type: 'image/jpeg'
      }
    })
  });
});

global.fetch = mockFetch;

describe('Generation API Tests', () => {
  describe('Image Generation Endpoint', () => {
    beforeEach(() => {
      mockFetch.mockClear();
    });

    it('should return 405 for non-POST requests', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await imageHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const responseData = JSON.parse(res._getData()) as ApiResponse;
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Method not allowed');
    });

    it('should return 400 if model is missing', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          prompt: 'test prompt'
        },
      });

      await imageHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData()) as ApiResponse;
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Invalid model');
    });

    it('should successfully process a valid image generation request', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          prompt: 'test prompt',
          model: 'fluxPro',
          negative_prompt: '',
          width: 1024,
          height: 1024
        },
      });

      await imageHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData()) as ApiResponse<ImageResponse>;
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
      expect(responseData.data.url).toBe('https://example.com/generated-image.jpg');
    });

    it('should handle failed image generation gracefully', async () => {
      mockFetch.mockImplementationOnce(() => {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({
            error: 'Failed to generate image'
          })
        });
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          prompt: 'test prompt',
          model: 'fluxPro',
          negative_prompt: '',
          width: 1024,
          height: 1024
        },
      });

      await imageHandler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData()) as ApiResponse;
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Failed to generate image');
    });
  });
}); 