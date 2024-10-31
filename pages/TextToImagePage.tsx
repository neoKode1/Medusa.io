import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { RefreshCw, ChevronDown, Download } from 'lucide-react';
import Link from 'next/link';
import { clientStorage } from '@/utils/clientStorage';
import logger from '@/lib/logger';

const TextToImagePage = () => {
  const [prompt, setPrompt] = useState<string>(clientStorage.get('lastImagePrompt') || '');
  const [model, setModel] = useState<string>(clientStorage.get('lastImageModel') || 'flux-schnell');
  const [uploadedImage, setUploadedImage] = useState<string | null>(clientStorage.get('lastImageRef') || null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setPrompt(newPrompt);
    clientStorage.set('lastImagePrompt', newPrompt);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    setModel(newModel);
    clientStorage.set('lastImageModel', newModel);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          const imageData = e.target.result as string;
          setUploadedImage(imageData);
          clientStorage.set('lastImageRef', imageData);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt before generating');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const apiEndpoint = '/api/replicate';
      const requestBody = {
        prompt: prompt.trim(),
        model,
      };

      switch (model) {
        case 'sd-3.5-turbo':
          requestBody = {
            ...requestBody,
            cfg: 1,
            steps: 4,
            aspect_ratio: '1:1',
            output_format: 'webp',
            output_quality: 90,
            prompt_strength: 0.85,
          };
          break;
        case 'sd-3.5-large':
          requestBody = {
            ...requestBody,
            cfg: 3.5,
            steps: 28,
            aspect_ratio: '1:1',
            output_format: 'webp',
            output_quality: 90,
          };
          break;
        case 'sdxl':
          requestBody = {
            ...requestBody,
            width: 1024,
            height: 1024,
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 50,
            refine: 'expert_ensemble_refiner',
            scheduler: 'KarrasDPM',
          };
          break;
      }

      if (uploadedImage) {
        requestBody.promptImage = uploadedImage;
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Generation failed (${response.status}): Please try again`
        );
      }

      const data = await response.json();

      if (!data.imageUrl) {
        throw new Error('No image was generated. Please try again.');
      }

      if (data.imageUrl) {
        const content = {
          url: data.imageUrl,
          timestamp: Date.now(),
          prompt,
          model,
          referenceImage: uploadedImage,
        };

        clientStorage.storeContent('image', content);
        setGeneratedContent(data.imageUrl);
        clientStorage.set('lastGeneratedImage', data.imageUrl);
      }
    } catch (error) {
      logger.error('Generation error:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5; // Adjust playback speed if needed
    }
  }, []);

  const handleDownload = async () => {
    if (!generatedContent) return;

    try {
      // Fetch the image
      const response = await fetch(generatedContent);
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-image-${Date.now()}.png`; // Unique filename

      // Programmatically click the link
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('Download failed:', error);
      setError('Failed to download image. Please try again.');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute left-0 top-0 z-0 h-full w-full object-cover"
      >
        <source src="/gen-g.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="relative z-10 mx-4 w-full max-w-2xl rounded-lg p-4 sm:p-6 md:p-8">
        <div className="relative mb-4 sm:mb-8">
          <button
            onClick={toggleDropdown}
            className="flex items-center rounded-lg border border-white px-3 py-1.5 text-sm text-white transition-colors sm:px-4 sm:py-2 sm:text-base"
          >
            Menu
            <ChevronDown className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          {showDropdown && (
            <ul className="absolute left-0 z-20 mt-2 w-48 rounded-lg bg-white shadow-lg">
              <li>
                <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/ImageToVideoPage" className="block px-4 py-2 hover:bg-gray-200">
                  Image to Video
                </Link>
              </li>
              <li>
                <Link href="/TextToImagePage" className="block px-4 py-2 hover:bg-gray-200">
                  Text to Image
                </Link>
              </li>
              <li>
                <Link href="/generate-prompt" className="block px-4 py-2 hover:bg-gray-200">
                  Generate Prompt
                </Link>
              </li>
            </ul>
          )}
        </div>

        <h1 className="mb-6 text-center text-4xl font-bold text-white sm:mb-12 sm:text-5xl md:text-7xl">
          MEDSUSA.io
        </h1>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-2">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="model" className="mb-2 block text-base text-white sm:text-lg">
                Choose Model:
              </label>
              <select
                value={model}
                onChange={handleModelChange}
                className="w-full rounded-lg border-2 border-white bg-transparent p-2 text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="flux-schnell" className="bg-gray-800 text-white">
                  Flux Schnell
                </option>
                <option value="stablediffusion" className="bg-gray-800 text-white">
                  Stable Diffusion
                </option>
                <option value="sd-3.5-turbo" className="bg-gray-800 text-white">
                  SD 3.5 Turbo
                </option>
                <option value="sd-3.5-large" className="bg-gray-800 text-white">
                  SD 3.5 Large
                </option>
                <option value="sdxl" className="bg-gray-800 text-white">
                  SDXL
                </option>
                <option value="dalle3" className="bg-gray-800 text-white">
                  DALL·E 3
                </option>
                <option value="midjourney" className="bg-gray-800 text-white">
                  Midjourney
                </option>
              </select>
            </div>

            <div>
              <label htmlFor="prompt" className="mb-2 block text-base text-white sm:text-lg">
                Enter your prompt:
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={handlePromptChange}
                className="input-glow w-full rounded-lg border border-gray-700 bg-transparent p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
                placeholder="Describe the content you want to generate..."
                rows={4}
              />
            </div>

            <div>
              <label htmlFor="image-upload" className="mb-2 block text-base text-white sm:text-lg">
                Upload reference image (optional):
              </label>
              <div className="flex items-center space-x-4">
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
                <button
                  onClick={() => document.getElementById('image-upload').click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-white bg-transparent py-3 text-xl text-white transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Choose Image
                </button>
              </div>
              {uploadedImage && (
                <div className="mt-2 flex items-center">
                  <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-green-500">Image uploaded successfully</p>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt || isProcessing}
              className="hover-glow w-full rounded-lg border border-white py-2 text-base text-white transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3 sm:text-xl"
            >
              {isProcessing ? 'Generating...' : 'Generate Content'}
            </button>
            {error && <p className="text-sm text-red-500 sm:text-base">{error}</p>}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white sm:text-2xl">Generated Content</h2>
            <div className="bg-white-800 relative aspect-square overflow-hidden rounded-lg">
              {isProcessing ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="h-12 w-12 animate-spin text-blue-500 sm:h-16 sm:w-16" />
                </div>
              ) : generatedContent ? (
                <div className="relative h-full w-full">
                  <Image
                    src={generatedContent}
                    alt="Generated Image"
                    fill={true}
                    style={{ objectFit: 'contain' }} // Changed from "cover" to "contain"
                    className="rounded-lg"
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-white sm:text-base">
                  Your generated content will appear here
                </div>
              )}
            </div>
            {generatedContent && (
              <button
                onClick={handleDownload}
                className="hover-glow flex w-full items-center justify-center gap-2 rounded-lg border border-white px-4 py-2 text-white transition-all duration-300"
              >
                <Download className="h-5 w-5" />
                Download Image
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToImagePage;
