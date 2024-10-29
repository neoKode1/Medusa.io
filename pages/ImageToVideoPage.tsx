import { useState } from 'react';
import { RefreshCw, ChevronDown, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [prompt, setPrompt] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [model, setModel] = useState<string>('luma'); // Default is LumaAI
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [showDropdown, setShowDropdown] = useState<boolean>(false); // For dropdown menu
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setUploadedImage(e.target.result as string);
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
            ratio: "16:9",
          } as VideoRequestBody;
          break;
        case 'animate-diff':
          apiEndpoint = '/api/animate-diff';
          requestBody = {
            ...requestBody,
            motion_module: "mm_sd_v15_v2",
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
      setGeneratedVideo(videoUrl || null);
  
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchPromptSuggestions = async (description: string) => {
    try {
      const response = await fetch('/api/generate_prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt_type: 'text_to_video',
          description,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPrompt(data.generated_prompt);
        setPromptSuggestions(data.suggestions);
      } else {
        console.error('Failed to fetch prompt suggestions');
      }
    } catch (error) {
      console.error('Error fetching prompt suggestions:', error);
    }
  };

  const handleDownload = async () => {
    if (!generatedVideo) return;
    
    try {
      // Fetch the video
      const response = await fetch(generatedVideo);
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-video-${Date.now()}.mp4`; // Unique filename
      
      // Programmatically click the link
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download video. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Fullscreen background video */}
      <video
        src="/Dream Machine AI-2024-07-06 (2).mp4"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Content over the video */}
      <div className="relative z-10 p-8 rounded-lg max-w-2xl w-full">
        <div className="relative mb-8">
          {/* Menu Button */}
          <button
            onClick={toggleDropdown}
            className="px-4 py-2 text-white rounded-lg transition-colors flex items-center border border-white hover-glow"
            style={{ zIndex: 30 }}
          >
            Menu
            <ChevronDown className="ml-2" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <ul className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-20">
              <li>
                <Link href="/" className="block px-4 py-2 bg-white text-black hover:bg-gray-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/ImageToVideoPage" className="block px-4 py-2 bg-white text-black hover:bg-gray-200">
                  Image to Video
                </Link>
              </li>
              <li>
                <Link href="/TextToImagePage" className="block px-4 py-2 bg-white text-black hover:bg-gray-200">
                  Text to Image
                </Link>
              </li>
              <li>
                <Link href="/generate-prompt" className="block px-4 py-2 bg-white text-black hover:bg-gray-200">
                  Generate Prompt
                </Link>
              </li>
            </ul>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-8 md:mb-12 text-center text-white transform transition-all duration-300 rotate-0 landscape:rotate-0">MEDSUSA.io</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="model" className="block text-lg mb-2 text-white">Choose Model:</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger 
                  id="model" 
                  className="w-full p-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent text-white input-glow"
                >
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border border-gray-200 rounded-lg shadow-lg">
                  <SelectItem value="luma" className="cursor-pointer hover:bg-gray-100 p-2">LumaAI</SelectItem>
                  <SelectItem value="animate-diff" className="cursor-pointer hover:bg-gray-100 p-2">AnimateDiff</SelectItem>
                  <SelectItem value="animate-diff-vid2vid" className="cursor-pointer hover:bg-gray-100 p-2">AnimateDiff Vid2Vid</SelectItem>
                  <SelectItem value="motion-transfer" className="cursor-pointer hover:bg-gray-100 p-2">Diffusion Motion Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="prompt" className="block text-lg mb-2 text-white">Enter your prompt:</Label>
              <Textarea 
                id="prompt" 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)} 
                className="w-full p-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent text-white input-glow" 
                placeholder="Describe the video you want to generate..." 
                rows={4} 
              />
            </div>

            <div>
              <Label htmlFor="image-upload" className="block text-lg mb-2 text-white">Upload reference image (optional):</Label>
              <div className="flex items-center space-x-4">
                <Input id="image-upload" type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                <Button 
                  asChild 
                  variant="secondary" 
                  className="w-full bg-transparent hover:bg-white/10 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 text-xl border-2 border-white text-white hover:text-white hover-glow flex items-center justify-center gap-2"
                >
                  <label htmlFor="image-upload" className="cursor-pointer flex items-center justify-center w-full">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6 mr-2" 
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
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-2">
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
              className="w-full py-3 rounded-lg transition-all duration-300 transform hover:scale-105 text-xl disabled:opacity-50 disabled:cursor-not-allowed border border-white text-white hover-glow"
            >
              {isProcessing ? 'Generating...' : 'Generate Video'}
            </Button>
            {error && <p className="text-red-500">{error}</p>}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Generated Video</h2>
            <div className="relative aspect-video bg-transparent rounded-lg overflow-hidden border border-gray-700">
              {isProcessing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <RefreshCw className="w-16 h-16 animate-spin text-blue-500 mb-4" />
                  <Progress value={progress} className="w-3/4" />
                  <p className="mt-2 text-blue-500">{progress.toFixed(0)}% Complete</p>
                </div>
              ) : generatedVideo ? (
                <div className="w-full h-full flex items-center justify-center bg-black">
                  <video 
                    controls 
                    className="max-w-full max-h-full"
                  >
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
                className="w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-white border border-white hover-glow transition-all duration-300"
              >
                <Download className="w-5 h-5" />
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
