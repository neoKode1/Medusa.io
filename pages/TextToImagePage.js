import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { RefreshCw, ChevronDown } from 'lucide-react';
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
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setGeneratedContent(null);

    try {
      const apiEndpoint = '/api/replicate';
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt, // Uses the raw prompt from user input
          model,
          ...(uploadedImage && { promptImage: uploadedImage }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Generation failed. Status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedContent(data.imageUrl);
      setProgress(100);

    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5; // Adjust playback speed if needed
    }
  }, []);

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

      <div className="bg-white bg-opacity-20 p-8 rounded-lg max-w-2xl w-full relative z-10">
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

        <h1 className="text-7xl font-bold mb-12 text-center text-[white]">MEDSUSA.io</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <label htmlFor="model" className="block text-lg mb-2">Choose Model:</label>
            <select 
              value={model} 
              onChange={(e) => setModel(e.target.value)} 
              className="block w-full p-2 border border-gray-300 rounded-lg">
              <option value="flux-schnell">Flux Schnell</option>
              <option value="stablediffusion">Stable Diffusion</option>
            </select>

            <label htmlFor="prompt" className="block text-lg mb-2">Enter your prompt:</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-2 bg-white-800 rounded-lg text-black border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the content you want to generate..."
              rows={4}
            />

            <label htmlFor="image-upload" className="block text-lg mb-2">Upload reference image (optional):</label>
            <input type="file" accept="image/*" onChange={handleUpload} />

            <button
              onClick={handleGenerate}
              disabled={!prompt || isProcessing}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 transform hover:scale-105 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Generating...' : 'Generate Content'}
            </button>
            {error && <p className="text-red-500">{error}</p>}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Generated Content</h2>
            <div className="relative aspect-square bg-white-800 rounded-lg overflow-hidden">
              {isProcessing ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="w-16 h-16 animate-spin text-blue-500" />
                </div>
              ) : generatedContent ? (
                <Image
                  src={generatedContent}
                  alt="Generated Image"
                  fill={true}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Your generated content will appear here
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToImagePage;
