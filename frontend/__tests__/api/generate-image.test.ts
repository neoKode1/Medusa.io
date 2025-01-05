/**
 * @jest-environment node
 */

import { createMocks } from 'node-mocks-http';
import handleImageGeneration from '../../pages/api/generate-image';

describe('POST /api/generate-image', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handleImageGeneration(req, res);

    expect(res._getStatusCode()).toBe(405);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Method not allowed');
  });

  it('returns 400 for missing prompt', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        model: 'test-model'
      },
    });

    await handleImageGeneration(req, res);

    expect(res._getStatusCode()).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Prompt is required');
  });

  it('returns 400 for invalid model', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        prompt: 'test prompt',
        model: 'invalid-model'
      },
    });

    await handleImageGeneration(req, res);

    expect(res._getStatusCode()).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Invalid model');
  });

  it('handles successful image generation', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        prompt: 'test prompt',
        model: 'test-model',
        aspect_ratio: '1:1'
      },
    });

    await handleImageGeneration(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(true);
    expect(responseData.data).toBeDefined();
    expect(responseData.data.url).toBe('https://example.com/generated-image.jpg');
    expect(responseData.data.id).toBeDefined();
    expect(responseData.data.width).toBe(1024);
    expect(responseData.data.height).toBe(1024);
  });

  it('handles different aspect ratios', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        prompt: 'test prompt',
        model: 'test-model',
        aspect_ratio: '16:9'
      },
    });

    await handleImageGeneration(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(true);
    expect(responseData.data.width).toBe(1024);
    expect(responseData.data.height).toBe(1024);
  });
}); 