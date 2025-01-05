export const config = jest.fn();
export const subscribe = jest.fn().mockImplementation(() => ({
  requestId: 'test-id',
  status: 'completed',
  output: [],
  error: null
})); 