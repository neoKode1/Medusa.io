// Mock environment variables for testing
process.env.FAL_KEY = 'test-fal-key';
process.env.LUMAAI_API_KEY = 'test-luma-key';
process.env.REPLICATE_API_KEY = 'test-replicate-key';

// Mock external API clients
jest.mock('replicate', () => {
  return jest.fn().mockImplementation(() => ({
    createPrediction: jest.fn().mockResolvedValue({
      id: 'test-prediction',
      status: 'succeeded',
      output: ['https://example.com/output.png']
    })
  }));
});

// Mock other API clients as needed 