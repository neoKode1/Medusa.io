import { useState } from 'react';
import Image from 'next/image';  // Import Image component
import { RefreshCw, ChevronDown } from 'lucide-react';  // Import icons
import Link from 'next/link';

const TextToImagePage = () => {
  const [prompt, setPrompt] = useState('');  // State for the prompt input
  const [generatedImage, setGeneratedImage] = useState(null);  // State for generated image
  const [isProcessing, setIsProcessing] = useState(false);  // State for loading status
  const [error, setError] = useState(null);  // State for errors
  const [showDropdown, setShowDropdown] = useState(false);  // State for dropdown menu

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleGenerate = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/stablediffusion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: prompt }),  // Send prompt to API
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedImage(data[0]);  // Set generated image
        setPrompt('');  // Reset the prompt input after generating image
        setIsProcessing(false);
      } else {
        console.error('Error:', response.statusText);
        setError('Failed to generate image. Please try again.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred while generating the image.');
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-no-repeat bg-cover"
      style={{
        backgroundImage: "url('/Medusa.svg.svg')",  // Path to your background image
        backgroundSize: '2000px',                  // Adjust size (cover/contain/auto)
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
            <label htmlFor="prompt" className="block text-lg mb-2">Enter your prompt:</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-2 bg-white-800 rounded-lg text-black border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the image you want to generate..."
              rows={4}
            />
            <button
              onClick={handleGenerate}
              disabled={!prompt || isProcessing}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 transform hover:scale-105 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Generating...' : 'Generate Image'}
            </button>
            {error && <p className="text-red-500">{error}</p>}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Generated Image</h2>
            <div className="relative aspect-square bg-white-800 rounded-lg overflow-hidden">
              {isProcessing ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="w-16 h-16 animate-spin text-blue-500" />
                </div>
              ) : generatedImage ? (
                <Image
                  src={generatedImage}
                  alt="Generated"
                  layout="fill"
                  objectFit="cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Your generated image will appear here
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
