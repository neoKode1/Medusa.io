import { useState } from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      const apiEndpoint = '/api/lumaai';  // Specify your API endpoint
  
      // Ensure the uploaded image is being passed into the request
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,  // Uses the raw prompt from user input
          promptImage: uploadedImage,
          model,
          duration: 10,
          ratio: "16:9",
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Generation failed. Status: ${response.status}`);
      }
  
      const data = await response.json();
      const videoUrl = data.videoUrl || data.assets?.video;  // Retrieve the video URL
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

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black">
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
      <div className="relative z-10 bg-black bg-opacity-60 p-8 rounded-lg max-w-2xl w-full">
        <div className="relative mb-8">
          {/* Menu Button */}
          <button
            onClick={toggleDropdown}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            style={{ zIndex: 30 }} // Ensure dropdown has a high z-index
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

        <h1 className="text-7xl font-bold mb-12 text-center text-[white]">MEDSUSA.io</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="model" className="block text-lg mb-2">Choose Model:</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="model" className="w-full p-2 bg-white rounded-lg text-black border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="luma">LumaAI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="prompt" className="block text-lg mb-2">Enter your prompt:</Label>
              <Textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full p-2 bg-white rounded-lg text-black border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe the video you want to generate..." rows={4} />
            </div>

            <div>
              <Label htmlFor="image-upload" className="block text-lg mb-2">Upload reference image (optional):</Label>
              <div className="flex items-center space-x-4">
                <Input id="image-upload" type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                <Button asChild variant="secondary" className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 transform hover:scale-105 text-xl">
                  <label htmlFor="image-upload" className="cursor-pointer flex items-center justify-center">
                    <span>Choose File</span>
                  </label>
                </Button>
              </div>
              {uploadedImage && <p className="text-green-600 mt-2">Image uploaded</p>}
            </div>

            <Button onClick={handleGenerate} disabled={isProcessing || !prompt} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 transform hover:scale-105 text-xl disabled:opacity-50 disabled:cursor-not-allowed">
              {isProcessing ? 'Generating...' : 'Generate Video'}
            </Button>
            {error && <p className="text-red-500">{error}</p>}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Generated Video</h2>
            <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
              {isProcessing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <RefreshCw className="w-16 h-16 animate-spin text-blue-500 mb-4" />
                  <Progress value={progress} className="w-3/4" />
                  <p className="mt-2 text-blue-500">{progress.toFixed(0)}% Complete</p>
                </div>
              ) : generatedVideo ? (
                <video controls className="w-full h-full object-cover">
                  <source src={generatedVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Your generated video will appear here
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageToVideoPage;
