// Mock environment variables
process.env.REPLICATE_API_TOKEN = 'test-replicate-token';
process.env.LUMAAI_API_KEY = 'test-luma-key';
process.env.FAL_KEY = 'test-fal-key';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
process.env.X_API_KEY = 'test-x-key';

// Mock fetch
const fetchMock = jest.fn(() =>
  Promise.resolve(new Response(JSON.stringify({}), {
    status: 200,
    statusText: 'OK',
    headers: new Headers()
  }))
);

global.fetch = fetchMock; 