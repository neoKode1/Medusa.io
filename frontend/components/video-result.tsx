import { useEffect, useState } from 'react';

interface VideoResultProps {
  generationId: string;
}

interface PollResponse {
  id: string;
  state: 'completed' | 'failed' | 'dreaming';
  failure_reason: string | null;
  video_url?: string;
  created_at: string;
  error?: string;
  assets?: {
    video?: string;
  };
}

export default function VideoResult({ generationId }: VideoResultProps) {
  const [status, setStatus] = useState<PollResponse['state']>('dreaming');
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!generationId) return;

    let mounted = true;
    const pollInterval = 3000; // 3 seconds

    async function pollStatus() {
      try {
        const response = await fetch(`/api/check-generation?id=${generationId}`);
        const data: PollResponse = await response.json();

        console.log('Poll response:', data);

        if (!mounted) return;

        if (data.error) {
          setError(data.error);
          setStatus('failed');
          return;
        }

        setStatus(data.state);

        if (data.state === 'completed') {
          setVideoUrl(data.assets?.video || null);
          return;
        }

        if (data.state === 'failed') {
          setError(data.failure_reason || 'Generation failed');
          return;
        }

        // If not completed or failed, wait and poll again
        await new Promise(r => setTimeout(r, pollInterval));
        pollStatus();
      } catch (error) {
        if (!mounted) return;
        console.error('Error polling status:', error);
        setError(error instanceof Error ? error.message : 'Failed to check generation status');
        setStatus('failed');
      }
    }

    // Start polling
    pollStatus();

    // Cleanup
    return () => {
      mounted = false;
    };
  }, [generationId]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <h3 className="font-semibold">Generation Failed</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (status === 'completed' && videoUrl) {
    return (
      <div className="space-y-4">
        <div className="aspect-video relative rounded-lg overflow-hidden">
          <video
            src={videoUrl}
            controls
            autoPlay
            loop
            className="w-full h-full object-cover"
          />
        </div>
        <a
          href={videoUrl}
          download
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Download Video
        </a>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
        <span className="text-gray-700">
          Dreaming...
        </span>
      </div>
    </div>
  );
} 