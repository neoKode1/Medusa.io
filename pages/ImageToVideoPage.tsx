import { useState } from 'react';
import { RefreshCw, ChevronDown, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { clientStorage } from '@/utils/clientStorage';
import logger from '../lib/logger';

// Update the interface to include all possible properties
interface VideoRequestBody {
  prompt: string;
  promptImage: string | null;
  // LumaAI properties
  duration?: number;
  ratio?: string;
  // AnimateDiff properties
  motion_module?: string;
  guidance_scale?: number;
  num_inference_steps?: number;
  // AnimateDiff Vid2Vid properties
  strength?: number;
  // Motion Transfer properties
  n_timesteps?: number;
}

const ImageToVideoPage = () => {
  // Initialize state with stored values
  const [prompt, setPrompt] = useState<string>(clientStorage.get('lastVideoPrompt') || '');
  const [model, setModel] = useState<string>(clientStorage.get('lastVideoModel') || 'luma');
  const [uploadedImage, setUploadedImage] = useState<string | null>(
    clientStorage.get('lastVideoImage') || null
  );
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [showDropdown, setShowDropdown] = useState<boolean>(false); // For dropdown menu

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Update handlers with storage
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setPrompt(newPrompt);
    clientStorage.set('lastVideoPrompt', newPrompt);
  };

  const handleModelChange = (value: string) => {
    setModel(value);
    clientStorage.set('lastVideoModel', value);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          const imageData = e.target.result as string;
          setUploadedImage(imageData);
          clientStorage.set('lastVideoImage', imageData);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      let apiEndpoint = '';
      let requestBody: VideoRequestBody = {
        prompt,
        promptImage: uploadedImage,
      };

      // Select API endpoint based on model
      switch (model) {
        case 'luma':
          apiEndpoint = '/api/lumaai';
          requestBody = {
            ...requestBody,
            duration: 10,
            ratio: '16:9',
          } as VideoRequestBody;
          break;
        case 'animate-diff':
          apiEndpoint = '/api/animate-diff';
          requestBody = {
            ...requestBody,
            motion_module: 'mm_sd_v15_v2',
            guidance_scale: 7.5,
            num_inference_steps: 25,
          } as VideoRequestBody;
          break;
        case 'animate-diff-vid2vid':
          apiEndpoint = '/api/animate-diff-vid2vid';
          requestBody = {
            ...requestBody,
            strength: 0.6,
            guidance_scale: 7.5,
            num_inference_steps: 25,
          } as VideoRequestBody;
          break;
        case 'motion-transfer':
          apiEndpoint = '/api/motion-transfer';
          requestBody = {
            ...requestBody,
            n_timesteps: 900,
          } as VideoRequestBody;
          break;
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Generation failed. Status: ${response.status}`);
      }

      const data = await response.json();
      const videoUrl = data.videoUrl || data.assets?.video;

      if (videoUrl) {
        // Store the generated video in history
        clientStorage.storeContent('video', {
          url: videoUrl,
          timestamp: Date.now(),
          prompt,
          model,
          sourceImage: uploadedImage,
        });
        setGeneratedVideo(videoUrl);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedVideo) return;

    try {
      const response = await fetch(generatedVideo);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-video-${Date.now()}.mp4`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('Download failed:', error);
      setError('Failed to download video. Please try again.');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      {/* Fullscreen background video */}
      <video
        src="/Dream Machine AI-2024-07-06 (2).mp4"
        className="absolute left-0 top-0 z-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Content over the video */}
      <div className="relative z-10 w-full max-w-2xl rounded-lg p-8">
        <div className="relative mb-8">
          {/* Menu Button */}
          <button
            onClick={toggleDropdown}
            className="hover-glow flex items-center rounded-lg border border-white px-4 py-2 text-white transition-colors"
            style={{ zIndex: 30 }}
          >
            Menu
            <ChevronDown className="ml-2" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <ul className="absolute left-0 z-20 mt-2 w-48 rounded-lg bg-white shadow-lg">
              <li>
                <Link
                  href="/dashboard"
                  className="block bg-white px-4 py-2 text-black hover:bg-gray-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/ImageToVideoPage"
                  className="block bg-white px-4 py-2 text-black hover:bg-gray-200"
                >
                  Image to Video
                </Link>
              </li>
              <li>
                <Link
                  href="/TextToImagePage"
                  className="block bg-white px-4 py-2 text-black hover:bg-gray-200"
                >
                  Text to Image
                </Link>
              </li>
              <li>
                <Link
                  href="/generate-prompt"
                  className="block bg-white px-4 py-2 text-black hover:bg-gray-200"
                >
                  Generate Prompt
                </Link>
              </li>
            </ul>
          )}
        </div>

        <h1 className="mb-8 rotate-0 transform text-center text-4xl font-bold text-white transition-all duration-300 md:mb-12 md:text-5xl lg:text-7xl landscape:rotate-0">
          MEDSUSA.io
        </h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div>
              <Label htmlFor="model" className="mb-2 block text-lg text-white">
                Choose Model:
              </Label>
              <Select value={model} onValueChange={handleModelChange}>
                <SelectTrigger
                  id="model"
                  className="input-glow w-full rounded-lg border border-gray-700 bg-transparent p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border border-gray-200 bg-white text-black shadow-lg">
                  <SelectItem value="luma" className="cursor-pointer p-2 hover:bg-gray-100">
                    LumaAI
                  </SelectItem>
                  <SelectItem value="animate-diff" className="cursor-pointer p-2 hover:bg-gray-100">
                    AnimateDiff
                  </SelectItem>
                  <SelectItem
                    value="animate-diff-vid2vid"
                    className="cursor-pointer p-2 hover:bg-gray-100"
                  >
                    AnimateDiff Vid2Vid
                  </SelectItem>
                  <SelectItem
                    value="motion-transfer"
                    className="cursor-pointer p-2 hover:bg-gray-100"
                  >
                    Diffusion Motion Transfer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="prompt" className="mb-2 block text-lg text-white">
                Enter your prompt:
              </Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={handlePromptChange}
                className="input-glow w-full rounded-lg border border-gray-700 bg-transparent p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the video you want to generate..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="image-upload" className="mb-2 block text-lg text-white">
                Upload reference image (optional):
              </Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
                <Button
                  asChild
                  variant="secondary"
                  className="hover-glow flex w-full items-center justify-center gap-2 rounded-lg border-2 border-white bg-transparent py-3 text-xl text-white hover:scale-105 hover:bg-white/10 hover:text-white transition-all duration-300"
                >
                  <label
                    htmlFor="image-upload"
                    className="flex w-full cursor-pointer items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-6 w-6"
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
                  </label>
                </Button>
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

            <Button
              onClick={handleGenerate}
              disabled={isProcessing || !prompt}
              className="hover-glow w-full rounded-lg border border-white py-3 text-xl text-white hover:scale-105 hover:bg-white/10 hover:text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? 'Generating...' : 'Generate Video'}
            </Button>
            {error && <p className="text-red-500">{error}</p>}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Generated Video</h2>
            <div className="relative aspect-video overflow-hidden rounded-lg border border-gray-700 bg-transparent">
              {isProcessing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <RefreshCw className="mb-4 h-16 w-16 animate-spin text-blue-500" />
                  <Progress value={progress} className="w-3/4" />
                  <p className="mt-2 text-blue-500">{progress.toFixed(0)}% Complete</p>
                </div>
              ) : generatedVideo ? (
                <div className="flex h-full w-full items-center justify-center bg-black">
                  <video controls className="max-h-full max-w-full">
                    <source src={generatedVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  Your generated video will appear here
                </div>
              )}
            </div>
            {generatedVideo && (
              <Button
                onClick={handleDownload}
                className="hover-glow flex w-full items-center justify-center gap-2 rounded-lg border border-white px-4 py-2 text-white transition-all duration-300"
              >
                <Download className="h-5 w-5" />
                Download Video
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageToVideoPage;
