import { jest } from '@jest/globals';
import { ReplicateError } from './types/replicate';

// Mock environment variables
process.env.REPLICATE_API_TOKEN = 'test-replicate-token';
process.env.FAL_KEY = 'test-fal-key';
process.env.LUMAAI_API_KEY = 'test-luma-key';

// Mock Replicate client
jest.mock('replicate', () => {
  return {
    default: jest.fn().mockImplementation(() => {
      return {
        predictions: {
          create: jest.fn().mockImplementation((args: { version: string; input: { prompt?: string } }) => {
            if (!args.input.prompt) {
              throw new ReplicateError('Prompt is required', 400);
            }
            return Promise.resolve({
              status: 'succeeded',
              id: 'mock-id',
              output: ['mock-output-url'],
              error: null,
            });
          }),
        },
      };
    }),
  };
});

// Mock models constant
jest.mock('./constants/models', () => ({
  MODELS: {
    'fluxPro': {
      id: 'deeptechai/stable-diffusion-v2-1-base-aesthetic',
      name: 'Flux Pro',
      description: 'High-quality image generation model with aesthetic focus',
      features: {
        isVideo: false,
        defaultParams: {
          model: 'dev',
          go_fast: false,
          lora_scale: 1,
          megapixels: '1',
          num_outputs: 1,
          output_format: 'webp',
          guidance_scale: 3,
          output_quality: 80,
          prompt_strength: 0.8,
          extra_lora_scale: 1,
          num_inference_steps: 28
        }
      }
    },
    'lumaI2V': {
      id: 'lumaI2V',
      name: 'Luma I2V',
      description: 'Luma Image to Video model',
      type: 'video'
    }
  },
  ModelName: {
    'fluxPro': 'fluxPro',
    'lumaI2V': 'lumaI2V'
  },
  isVideoModel: (model: string) => model === 'lumaI2V'
}));

// Custom error type for Replicate
class ReplicateError extends Error {
  response: { status: number; data: { detail: string } };
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ReplicateError';
    this.response = {
      status,
      data: { detail: message }
    };
  }
}

// Mock fetch for Luma API
const originalFetch = global.fetch;
global.fetch = jest.fn().mockImplementation((url: string, options?: any) => {
  if (url === 'https://api.lumalabs.ai/v1/videos') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        id: 'test-video',
        status: 'pending'
      })
    });
  }
  if (url.includes('api.lumalabs.ai/v1/videos/test-video')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        status: 'completed',
        video: {
          url: 'https://example.com/generated-video.mp4'
        }
      })
    });
  }
  return originalFetch(url, options);
});

// Mock external API clients
jest.mock('replicate', () => {
  const mockPrediction = {
    id: 'test-prediction',
    status: 'succeeded',
    output: ['https://example.com/generated-image.jpg'],
    error: null
  };

  return function() {
    return {
      predictions: {
        create: jest.fn().mockImplementation(({ version, input }) => {
          if (!input.prompt) {
            throw new ReplicateError('Prompt is required', 400);
          }
          if (version === 'error-model') {
            throw new ReplicateError('Failed to create prediction');
          }
          return Promise.resolve({ ...mockPrediction, status: 'processing' });
        }),
        get: jest.fn().mockImplementation((id) => {
          if (id === 'test-prediction') {
            return Promise.resolve(mockPrediction);
          }
          throw new ReplicateError('Prediction not found', 404);
        })
      }
    };
  };
});

// Mock Fal.ai client
jest.mock('@fal-ai/serverless-client', () => ({
  auth: jest.fn(),
  subscribe: jest.fn().mockResolvedValue({
    result: {
      image: 'https://example.com/generated-image.jpg'
    }
  })
}));

// Mock Luma SDK
jest.mock('@lumaai/luma-web-sdk', () => ({
  generateVideo: jest.fn().mockImplementation(async ({ model, reference_image }) => {
    if (!reference_image) {
      throw new Error('Missing required fields');
    }
    if (model !== 'lumaI2V') {
      throw new Error('Invalid model selected');
    }
    return {
      id: 'test-video',
      url: 'https://example.com/generated-video.mp4',
      status: 'completed'
    };
  }),
  getVideo: jest.fn().mockImplementation(async (id) => {
    return {
      id,
      url: 'https://example.com/generated-video.mp4',
      status: 'completed'
    };
  })
}));

// Add testing-library jest-dom matchers
require('@testing-library/jest-dom'); 