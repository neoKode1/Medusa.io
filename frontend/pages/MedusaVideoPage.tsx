import { type NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { LuBrain } from 'react-icons/lu';
import { PromptGeneratorModal } from '@/components/PromptGeneratorModal';

const ASPECT_RATIOS = [
  { label: '16:9 (Landscape)', value: '16:9' },
  { label: '9:16 (Portrait)', value: '9:16' },
  { label: '1:1 (Square)', value: '1:1' },
  { label: '4:3 (Classic)', value: '4:3' },
  { label: '3:4 (Portrait Classic)', value: '3:4' }
];

const MedusaVideoPage: NextPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<File | string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [loop, setLoop] = useState(true);
  const [useImageAsStart, setUseImageAsStart] = useState(false);
  const [useImageAsEnd, setUseImageAsEnd] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setImagePreview(file);
    setUseImageAsStart(true);
  };

  const clearImage = () => {
    setImagePreview(null);
    setUseImageAsStart(false);
    setUseImageAsEnd(false);
  };

  const handleGeneration = async () => {
    if (!imagePreview && !prompt.trim()) {
      toast.error('Please enter a prompt when not using an image');
      return;
    }

    if (prompt.trim() && (prompt.length < 3 || prompt.length > 5000)) {
      toast.error('Prompt must be between 3 and 5000 characters');
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl: string | null = null;

      // If we have a string URL, use it directly
      if (typeof imagePreview === 'string') {
        imageUrl = imagePreview;
      }
      // If we have a File object, upload it first
      else if (imagePreview instanceof File) {
        const formData = new FormData();
        formData.append('file', imagePreview);

        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const uploadData = await uploadResponse.json();
        if (typeof uploadData.url !== 'string') {
          throw new Error('Invalid response from upload endpoint');
        }
        imageUrl = uploadData.url;
      }

      // Prepare the request body exactly as per Luma API documentation
      const requestBody: {
        prompt: string;
        aspect_ratio?: string;
        loop?: boolean;
        keyframes?: {
          frame0?: {
            type: "image";
            url: string;
          };
          frame1?: {
            type: "image";
            url: string;
          };
        };
      } = {
        prompt: prompt.trim() || "Generate video from image",
      };

      // Add optional parameters only if they're set
      if (aspectRatio) {
        requestBody.aspect_ratio = aspectRatio;
      }

      if (loop !== undefined) {
        requestBody.loop = loop;
      }

      // Add keyframes if we have an image URL
      if (imageUrl) {
        requestBody.keyframes = {};
        
        if (useImageAsStart) {
          requestBody.keyframes.frame0 = {
            type: "image",
            url: imageUrl
          };
        }
        
        if (useImageAsEnd) {
          requestBody.keyframes.frame1 = {
            type: "image",
            url: imageUrl
          };
        }

        // Validate that at least one frame position is selected
        if (!useImageAsStart && !useImageAsEnd) {
          toast.error('Please select at least one frame position (start or end) when using an image');
          setIsLoading(false);
          return;
        }
      }

      // Log the request body for debugging
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate video');
      }

      if (!data.id) {
        throw new Error('No generation ID received');
      }

      toast.success('Video generation started!');
      router.push(`/video-result?id=${data.id}`);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate video');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (useImageAsStart && useImageAsEnd && loop) {
      setLoop(false);
      toast('Loop is disabled when using both start and end frames', {
        icon: '⚠️'
      });
    }
  }, [useImageAsStart, useImageAsEnd, loop]);

  const getPreviewUrl = useCallback(() => {
    if (!imagePreview) return '';
    if (typeof imagePreview === 'string') return imagePreview;
    return URL.createObjectURL(imagePreview);
  }, [imagePreview]);

  const handlePromptGenerated = (enhancedPrompt: string) => {
    setPrompt(enhancedPrompt);
  };

  return (
    <>
      <Head>
        <title>Video Generation - Medusa</title>
        <meta name="description" content="Generate videos using AI" />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-white">Video Generation</h1>
        
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left Column - Input Controls */}
          <div className="space-y-6">
            {/* Prompt Input */}
            <div>
              <label htmlFor="prompt" className="block text-lg font-medium text-white mb-2">
                Prompt {!imagePreview && <span className="text-red-400">*</span>}
              </label>
              <div className="relative">
                <textarea
                  id="prompt"
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10"
                  placeholder={imagePreview ? "Describe your video (optional)..." : "Describe your video..."}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <button
                  onClick={() => setIsPromptModalOpen(true)}
                  className="absolute right-2 top-2 text-gray-400 hover:text-white"
                  title="Open Prometheus Prompt Generator"
                >
                  <LuBrain className="w-5 h-5" />
                </button>
              </div>
              {prompt.trim() && (
                <div className="mt-1 text-sm">
                  <span className={`${
                    prompt.length < 3 || prompt.length > 5000 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {prompt.length}/5000 characters
                  </span>
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-lg font-medium text-white mb-2">
                Reference Image (Optional)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Upload Image
                </label>
                {imagePreview && (
                  <button
                    onClick={clearImage}
                    className="ml-2 text-red-500 hover:text-red-600"
                  >
                    Clear Image
                  </button>
                )}
              </div>
              {imagePreview && (
                <div className="mt-4">
                  <div className="relative aspect-video w-full max-w-md">
                    <img
                      src={getPreviewUrl()}
                      alt="Preview"
                      className="rounded-lg object-cover w-full h-full"
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={useImageAsStart}
                        onChange={(e) => setUseImageAsStart(e.target.checked)}
                        className="form-checkbox text-blue-500"
                      />
                      <span className="text-white">Use as starting frame</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={useImageAsEnd}
                        onChange={(e) => setUseImageAsEnd(e.target.checked)}
                        className="form-checkbox text-blue-500"
                      />
                      <span className="text-white">Use as ending frame</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Settings and Generation */}
          <div className="space-y-6">
            {/* Video Settings */}
            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Video Settings</h2>
              
              {/* Aspect Ratio */}
              <div>
                <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-300 mb-2">
                  Aspect Ratio
                </label>
                <select
                  id="aspect-ratio"
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {ASPECT_RATIOS.map((ratio) => (
                    <option key={ratio.value} value={ratio.value}>
                      {ratio.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Loop Toggle */}
              <div>
                <label className={`flex items-center space-x-2 cursor-pointer ${
                  useImageAsStart && useImageAsEnd ? 'opacity-50' : ''
                }`}>
                  <input
                    type="checkbox"
                    checked={loop}
                    onChange={(e) => setLoop(e.target.checked)}
                    disabled={useImageAsStart && useImageAsEnd}
                    className="form-checkbox text-blue-500"
                  />
                  <span className="text-white">Loop video</span>
                  {useImageAsStart && useImageAsEnd && (
                    <span className="text-xs text-yellow-400 ml-2">
                      (Not available with both start and end frames)
                    </span>
                  )}
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGeneration}
              disabled={isLoading || (!prompt.trim() && !imagePreview)}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                isLoading || (!prompt.trim() && !imagePreview)
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isLoading ? 'Generating...' : 'Generate Video'}
            </button>

            {/* Help Text */}
            <div className="text-gray-400 text-sm">
              <p>Tips:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Be descriptive in your prompt for better results</li>
                <li>You can use a reference image as start or end frame</li>
                <li>Generation may take a few minutes</li>
                <li>Prompt is optional when using an image</li>
                <li>Loop is disabled when using both start and end frames</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <PromptGeneratorModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        onPromptGenerated={handlePromptGenerated}
      />
    </>
  );
};

export default MedusaVideoPage;
