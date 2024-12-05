import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const VideoResult: React.FC = () => {
  const router = useRouter();
  const { url } = router.query;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setError('No video URL provided');
    }
  }, [url]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Generated Video</h1>
        <div className="aspect-video relative rounded-lg overflow-hidden shadow-xl">
          <video 
            controls 
            autoPlay 
            loop 
            className="w-full h-full"
          >
            <source src={url as string} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => router.push('/text-to-image')}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Generator
          </button>
          <a
            href={url as string}
            download
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download Video
          </a>
        </div>
      </div>
    </div>
  );
};

export default VideoResult; 