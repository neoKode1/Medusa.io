import { useState } from 'react';
import Image from 'next/image';
import { RefreshCw, ChevronDown, Upload } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ImageToVideoPage = () => {
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [model, setModel] = useState('gen3a_turbo');
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const response = await fetch('/api/lumaai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          image: uploadedImage,
          model,
          duration: 10,
          ratio: "16:9"
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      let completed = false;

      while (!completed) {
        const statusResponse = await fetch(`/api/lumaai/status/${data.id}`);
        if (!statusResponse.ok) {
          throw new Error(`HTTP error! status: ${statusResponse.status}`);
        }
        const statusData = await statusResponse.json();

        if (statusData.state === "completed") {
          completed = true;
          setGeneratedVideo(statusData.assets.video);
          setProgress(100);
        } else if (statusData.state === "failed") {
          throw new Error(`Generation failed: ${statusData.failure_reason}`);
        } else {
          setProgress(statusData.progress * 100);
          await new Promise(r => setTimeout(r, 3000)); // Wait for 3 seconds
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while generating the video.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-no-repeat bg-cover"
      style={{
        backgroundImage: "url('/Medusa.svg.svg')",
        backgroundSize: '2000px',
        backgroundPosition: 'center',
      }}
    >
      <div className="bg-white bg-opacity-20 p-8 rounded-lg max-w-2xl w-full">
        <div className="relative mb-8">
          <button
            onClick={toggleDropdown}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            Menu
            <ChevronDown className="ml-2" />
          </button>
          {showDropdown && (
            <ul className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10">
              <li>
                <Link href="/" className="block px-4 py-2 hover:bg-gray-200">Home</Link>
              </li>
              <li>
                <Link href="/ImageToVideoPage" className="block px-4 py-2 hover:bg-gray-200">Image to Video</Link>
              </li>
              <li>
                <Link href="/TextToImagePage" className="block px-4 py-2 hover:bg-gray-200">Text to Image</Link>
              </li>
              <li>
                <Link href="/generate-prompt" className="block px-4 py-2 hover:bg-gray-200">
                  Generate Prompt
                </Link>
              </li>
            </ul>
          )}
        </div>

        <h1 className="text-7xl font-bold mb-12 text-center text-[#64748b]">MEDSUSA.io</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="model" className="block text-lg mb-2">Choose Model:</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="model" className="w-full p-2 bg-white rounded-lg text-black border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gen3a_turbo">Gen-3 Alpha Turbo (Faster)</SelectItem>
                  <SelectItem value="gen3a_alpha">Gen-3 Alpha (Higher Fidelity)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="prompt" className="block text-lg mb-2">Enter your prompt:</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-2 bg-white rounded-lg text-black border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the video you want to generate..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="image-upload" className="block text-lg mb-2">Upload reference image (optional):</Label>
              <div className="flex items-center space-x-4">
                <Input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleUpload} 
                  className="hidden" 
                />
                <Button asChild variant="secondary" className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 transform hover:scale-105 text-xl">
                  <label htmlFor="image-upload" className="cursor-pointer flex items-center justify-center">
                    <Upload className="w-5 h-5 mr-2" />
                    <span>Choose File</span>
                  </label>
                </Button>
              </div>
              {uploadedImage && <p className="text-green-600 mt-2">Image uploaded</p>}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isProcessing || !prompt}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 transform hover:scale-105 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
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