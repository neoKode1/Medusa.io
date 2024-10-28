import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { RefreshCw, ChevronDown, Download } from 'lucide-react';
import Link from 'next/link';

const TextToImagePage = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [model, setModel] = useState('flux-schnell');
  const [progress, setProgress] = useState(0);
  const [uploadedImage, setUploadedImage] = useState(null);
  const videoRef = useRef(null);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleUpload = (event) => {
    const file = event.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setUploadedImage(e.target.result);
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
    setProgress(0);
    setGeneratedContent(null);

    try {
      const apiEndpoint = '/api/replicate';
      const requestBody = {
        prompt: prompt.trim(),
        model,
      };

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
        throw new Error(errorData.error || `Generation failed (${response.status}): Please try again`);
      }

      const data = await response.json();
      
      if (!data.imageUrl) {
        throw new Error('No image was generated. Please try again.');
      }

      setGeneratedContent(data.imageUrl);
      setProgress(100);

    } catch (error) {
      console.error('Generation error:', error);
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
      console.error('Download failed:', error);
      setError('Failed to download image. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/gen-g.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="p-4 sm:p-6 md:p-8 rounded-lg w-full max-w-2xl mx-4 relative z-10">
        <div className="relative mb-4 sm:mb-8">
          <button
            onClick={toggleDropdown}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-white rounded-lg transition-colors flex items-center text-sm sm:text-base border border-white"
          >
            Menu
            <ChevronDown className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          {showDropdown && (
            <ul className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-20">
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

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 sm:mb-12 text-center text-white">MEDSUSA.io</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="model" className="block text-base sm:text-lg mb-2 text-white">Choose Model:</label>
              <select 
                value={model} 
                onChange={(e) => setModel(e.target.value)} 
                className="block w-full p-2 border border-gray-300 rounded-lg text-sm sm:text-base bg-transparent text-white input-glow">
                <option value="flux-schnell" className="text-black">Flux Schnell</option>
                <option value="stablediffusion" className="text-black">Stable Diffusion</option>
              </select>
            </div>

            <div>
              <label htmlFor="prompt" className="block text-base sm:text-lg mb-2 text-white">Enter your prompt:</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-2 bg-transparent rounded-lg text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base input-glow"
                placeholder="Describe the content you want to generate..."
                rows={4}
              />
            </div>

            <div>
              <label htmlFor="image-upload" className="block text-base sm:text-lg mb-2 text-white">Upload reference image (optional):</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleUpload}
                className="w-full text-sm sm:text-base text-white input-glow" 
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt || isProcessing}
              className="w-full py-2 sm:py-3 rounded-lg transition-all duration-300 transform hover:scale-105 text-base sm:text-xl disabled:opacity-50 disabled:cursor-not-allowed text-white border border-white hover-glow"
            >
              {isProcessing ? 'Generating...' : 'Generate Content'}
            </button>
            {error && <p className="text-red-500 text-sm sm:text-base">{error}</p>}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-white">Generated Content</h2>
            <div className="relative aspect-square bg-white-800 rounded-lg overflow-hidden">
              {isProcessing ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="w-12 h-12 sm:w-16 sm:h-16 animate-spin text-blue-500" />
                </div>
              ) : generatedContent ? (
                <div className="relative w-full h-full">
                  <Image
                    src={generatedContent}
                    alt="Generated Image"
                    fill={true}
                    style={{ objectFit: "contain" }}  // Changed from "cover" to "contain"
                    className="rounded-lg"
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white text-sm sm:text-base p-4 text-center">
                  Your generated content will appear here
                </div>
              )}
            </div>
            {generatedContent && (
              <button
                onClick={handleDownload}
                className="w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-white border border-white hover-glow transition-all duration-300"
              >
                <Download className="w-5 h-5" />
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
