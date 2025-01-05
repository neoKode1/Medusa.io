import { type NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const ImageResultPage: NextPage = () => {
  const router = useRouter();
  const { url } = router.query;
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (url && typeof url === 'string') {
      try {
        const decodedUrl = decodeURIComponent(url);
        setImageUrl(decodedUrl);
      } catch (error) {
        console.error('Error processing URL:', error);
        setImageUrl(null);
      }
    }
  }, [url]);

  const handleBack = () => {
    router.push('/MedusaPage');
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'generated-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <>
      <Head>
        <title>Generated Image - Medusa</title>
        <meta name="description" content="View your generated image" />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Generated Image</h1>
          <Button onClick={handleBack} variant="secondary">
            Back to Generator
          </Button>
        </div>

        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6">
          {imageUrl ? (
            <div className="space-y-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                <img
                  src={imageUrl}
                  alt="Generated image"
                  className="w-full h-full object-contain"
                />
              </div>
              <Button onClick={handleDownload} className="w-full">
                Download Image
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-white">Loading image...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ImageResultPage;