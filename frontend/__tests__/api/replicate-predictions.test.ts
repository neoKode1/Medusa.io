/**
 * @jest-environment node
 */

import { createMocks } from 'node-mocks-http';
import handlePredictions from '../../pages/api/replicate/predictions';

const MODEL_ID = 'neokode1/deeptechai:8b213982f1bbea47458f320cd02b9d43f8328173e6615c9f1034d66bc690978f';

describe('POST /api/replicate-predictions', () => {
  it('returns 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handlePredictions(req, res);

    expect(res._getStatusCode()).toBe(405);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Method not allowed');
  });

  it('returns 400 for missing required fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {},
    });

    await handlePredictions(req, res);

    expect(res._getStatusCode()).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Missing required fields');
  });

  it('handles successful prediction', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        prompt: 'test prompt',
        model: MODEL_ID,
        width: 1024,
        height: 1024,
        negative_prompt: '',
        num_inference_steps: 28,
        guidance_scale: 3,
        prompt_strength: 0.8,
        num_outputs: 1
      },
    });

    await handlePredictions(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(true);
    expect(responseData.data).toBeDefined();
    expect(responseData.data.url).toBeDefined();
    expect(responseData.data.id).toBeDefined();
  });

  it('handles invalid model', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        prompt: 'test prompt',
        model: 'error-model',
        width: 1024,
        height: 1024,
        negative_prompt: '',
        num_inference_steps: 28,
        guidance_scale: 3,
        prompt_strength: 0.8,
        num_outputs: 1
      },
    });

    await handlePredictions(req, res);

    expect(res._getStatusCode()).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Invalid model');
  });
}); 