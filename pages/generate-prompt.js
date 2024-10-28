import { useState } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const GeneratePrompt = () => {
  const [description, setDescription] = useState('');
  const [generatedPrompts, setGeneratedPrompts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleGenerate = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedPrompts([...generatedPrompts, data.prompt]);
        setDescription('');
        setIsProcessing(false);
      } else {
        console.error('Error:', response.statusText);
        setError('Failed to generate prompt. Please try again.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred while generating the prompt.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/medusa-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Update overlay to be more transparent */}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 z-10"></div>

      {/* Update main content container to be more transparent */}
      <div className="relative z-20 bg-white/20 backdrop-blur-sm p-8 rounded-lg max-w-2xl w-full">
        {/* Update text colors for better visibility */}
        <div className="relative mb-8">
          <button
            onClick={toggleDropdown}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            Menu
            <ChevronDown className="ml-2" />
          </button>
          {showDropdown && (
            <ul className="absolute left-0 mt-2 w-48 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg z-10">
              <li>
                <Link href="/" className="block px-4 py-2 hover:bg-gray-200/50">Home</Link>
              </li>
              <li>
                <Link href="/ImageToVideoPage" className="block px-4 py-2 hover:bg-gray-200/50">Image to Video</Link>
              </li>
              <li>
                <Link href="/TextToImagePage" className="block px-4 py-2 hover:bg-gray-200/50">Text to Image</Link>
              </li>
              <li>
                <Link href="/generate-prompt" className="block px-4 py-2 hover:bg-gray-200/50">Generate Prompt</Link>
              </li>
            </ul>
          )}
        </div>

        <h1 className="text-4xl font-bold mb-8 text-center text-white">Unlock limitless potential with an AI generated prompt</h1>

        <div className="space-y-6">
          <label htmlFor="description" className="block text-lg mb-2 text-white">Describe what you want:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-white/50"
            placeholder="Describe the image or video you want to generate..."
            rows={4}
          />
          <button
            onClick={handleGenerate}
            disabled={!description || isProcessing}
            className="w-full py-3 bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-600/80 hover:to-purple-700/80 rounded-lg transition-all duration-300 transform hover:scale-105 text-xl disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            {isProcessing ? (
              <RefreshCw className="animate-spin inline-block mr-2 w-5 h-5" />
            ) : (
              'Generate Prompt'
            )}
          </button>
          {error && <p className="text-red-300">{error}</p>}
        </div>

        {/* Update Generated Prompts section */}
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold mb-4 text-white">Generated Prompts</h2>
          {generatedPrompts.length > 0 ? (
            <ul className="space-y-2">
              {generatedPrompts.map((prompt, index) => (
                <li key={index} className="p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow-md text-white">
                  <p>{prompt}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white/70">Your generated prompts will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneratePrompt;
