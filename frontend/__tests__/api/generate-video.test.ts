/**
 * @jest-environment node
 */

import { createMocks } from 'node-mocks-http';
import handleVideoGeneration from '../../pages/api/generation/video';

describe('POST /api/generate-video', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handleVideoGeneration(req, res);

    expect(res._getStatusCode()).toBe(405);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Method not allowed');
  });

  it('returns 400 for missing required fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        model: 'lumaI2V'
      },
    });

    await handleVideoGeneration(req, res);

    expect(res._getStatusCode()).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Missing required fields');
  });

  it('returns 400 for invalid model', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        model: 'invalid-model',
        reference_image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='
      },
    });

    await handleVideoGeneration(req, res);

    expect(res._getStatusCode()).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Invalid model selected');
  });

  it('handles successful video generation', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        model: 'lumaI2V',
        reference_image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        duration: '5',
        aspect_ratio: '1:1'
      },
    });

    await handleVideoGeneration(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(true);
    expect(responseData.data).toBeDefined();
    expect(responseData.data.url).toBe('https://example.com/generated-video.mp4');
    expect(responseData.data.id).toBe('test-video');
  });
}); 