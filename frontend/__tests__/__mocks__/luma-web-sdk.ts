export const createVideo = jest.fn().mockResolvedValue({
  id: 'test-video-id',
  status: 'completed',
  url: 'https://example.com/video.mp4'
}); 