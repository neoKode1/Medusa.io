import { useState } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const GeneratePromptPage = () => {
  const [description, setDescription] = useState('');
  const [generatedPrompts, setGeneratedPrompts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleGenerate = async () => {
    if (!description.trim()) return;

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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedPrompts(prevPrompts => [...prevPrompts, data.prompt]);
      setDescription('');
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to generate prompt. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-no-repeat bg-cover"
      style={{
        backgroundImage: "url('/Medusa.svg.svg')",
        backgroundSize: '2000px',
        backgroundPosition: 'center',
      }}>
      <div className="bg-white bg-opacity-20 p-8 rounded-lg max-w-2xl w-full">
        {/* Dropdown Menu */}
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
                <Link href="/generate-prompt" className="block px-4 py-2 hover:bg-gray-200">Generate Prompt</Link>
              </li>
            </ul>
          )}
        </div>

        <h1 className="text-4xl font-bold mb-8 text-center text-[#64748b]">
          Unlock limitless potential with an AI generated prompt
        </h1>

        <div className="space-y-6">
          <label htmlFor="description" className="block text-lg mb-2">
            Describe what you want:
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 bg-white-800 rounded-lg text-black border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the image or video you want to generate..."
            rows={4}
          />
          <button
            onClick={handleGenerate}
            disabled={!description.trim() || isProcessing}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 transform hover:scale-105 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <RefreshCw className="animate-spin inline-block mr-2 w-5 h-5" />
            ) : (
              'Generate Prompt'
            )}
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </div>

        {/* Display Generated Prompts */}
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Generated Prompts</h2>
          {generatedPrompts.length > 0 ? (
            <ul className="space-y-2">
              {generatedPrompts.map((prompt, index) => (
                <li key={index} className="p-4 bg-gray-100 rounded-lg shadow-md">
                  <p>{prompt}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Your generated prompts will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneratePromptPage;
