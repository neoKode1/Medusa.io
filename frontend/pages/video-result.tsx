import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-hot-toast';

type GenerationStatus = 'pending' | 'dreaming' | 'completed' | 'failed';

interface GenerationResult {
  state: GenerationStatus;
  assets?: {
    video?: string;
  };
  failure_reason?: string;
}

export default function VideoResult() {
  const router = useRouter();
  const { id } = router.query;
  const [status, setStatus] = useState<GenerationStatus>('pending');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [pollInterval, setPollInterval] = useState(3000); // Start with 3 seconds

  useEffect(() => {
    if (!id) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/check-video-status?id=${id}`);
        const data: GenerationResult = await response.json();

        console.log('Poll response:', data);

        // Handle rate limiting
        if (response.status === 429) {
          setPollInterval(prev => Math.min(prev * 2, 30000)); // Exponential backoff up to 30s
          setRetryCount(prev => prev + 1);
          if (retryCount > 5) {
            throw new Error('Too many retries due to rate limiting');
          }
          return false;
        }

        // Reset polling interval if successful
        setPollInterval(3000);
        setRetryCount(0);

        if (data.state === 'completed' && data.assets?.video) {
          setStatus('completed');
          setVideoUrl(data.assets.video);
          toast.success('Video generation complete!');
          return true; // Stop polling
        } else if (data.state === 'failed') {
          setStatus('failed');
          setError(data.failure_reason || 'Generation failed');
          toast.error(data.failure_reason || 'Generation failed');
          return true; // Stop polling
        } else {
          setStatus(data.state);
          return false; // Continue polling
        }
      } catch (error) {
        console.error('Error polling status:', error);
        
        // Handle different error cases
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            setError('Generation not found');
            toast.error('Generation not found');
            return true; // Stop polling
          } else if (error.message.includes('Too many retries')) {
            setError('Too many retries. Please try again later.');
            toast.error('Too many retries. Please try again later.');
            return true; // Stop polling
          }
        }

        setStatus('failed');
        setError('Failed to check generation status');
        toast.error('Failed to check generation status');
        return true; // Stop polling on error
      }
    };

    const startPolling = () => {
      const poll = async () => {
        const shouldStop = await pollStatus();
        if (!shouldStop) {
          setTimeout(poll, pollInterval);
        }
      };
      poll();
    };

    startPolling();
  }, [id, pollInterval, retryCount]);

  const getStatusMessage = () => {
    switch (status) {
      case 'pending':
        return 'Initializing your video generation...';
      case 'dreaming':
        return 'Creating your video... This may take a few minutes.';
      case 'completed':
        return 'Your video is ready!';
      case 'failed':
        return `Generation failed: ${error}`;
      default:
        return 'Unknown status';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'text-yellow-300';
      case 'dreaming':
        return 'text-blue-300';
      case 'completed':
        return 'text-green-300';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <>
      <Head>
        <title>Video Result - Medusa</title>
        <meta name="description" content="View your generated video" />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-white">Video Result</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white mb-2">Status</h2>
            <p className={`${getStatusColor()} font-medium`}>{getStatusMessage()}</p>
            {status === 'dreaming' && (
              <div className="mt-2">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
          </div>

          {status === 'completed' && videoUrl && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Your Video</h2>
              <div className="aspect-video relative bg-black rounded-lg overflow-hidden">
                <video
                  className="w-full h-full"
                  controls
                  autoPlay
                  loop
                  src={videoUrl}
                />
              </div>
              <div className="mt-4 flex gap-4">
                <a
                  href={videoUrl}
                  download
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                >
                  Download Video
                </a>
                <button
                  onClick={() => router.push('/MedusaVideoPage')}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                >
                  Generate Another Video
                </button>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="mt-4">
              <div className="text-red-400 mb-4">
                <p>{error}</p>
              </div>
              <button
                onClick={() => router.push('/MedusaVideoPage')}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {(status === 'pending' || status === 'dreaming') && (
            <div className="mt-4 text-gray-400 text-sm">
              <p>This process may take a few minutes. You can safely leave this page and come back later.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 