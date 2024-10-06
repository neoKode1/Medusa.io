import { useState } from 'react';  // Remove React import
import Image from 'next/image';  // Import Image component for uploaded image preview
import { Upload, RefreshCw } from 'lucide-react';
import LumaAI from 'lumaai';
import Link from 'next/link';

// Initialize the LumaAI client
const client = new LumaAI({
  authToken: process.env.NEXT_PUBLIC_LUMAAI_API_KEY,
});

const ImageToVideoPage = () => {
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const generation = await client.generations.create({
        aspect_ratio: '16:9',
        prompt: prompt,
        image: uploadedImage,  // Add the uploaded image to the API call
      });

      if (generation && generation.id) {
        const { id: taskId } = generation;
        await pollGenerationStatus(taskId);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      handleError(error);
    }
  };

  const pollGenerationStatus = async (taskId) => {
    const interval = setInterval(async () => {
      try {
        const statusResponse = await client.generations.get(taskId);
        const { state, assets, progressPercent, failure_reason } = statusResponse;

        setProgress(progressPercent || 0);

        if (state === 'completed') {
          clearInterval(interval);
          if (assets && assets.video) {
            setGeneratedVideo(assets.video);
            setIsProcessing(false);
          } else {
            throw new Error('Video generation completed but no assets were found.');
          }
        } else if (state === 'failed') {
          throw new Error(failure_reason || 'Video generation failed');
        } else {
          console.log(`Video generation is in progress... [${state}]`);
        }
      } catch (error) {
        clearInterval(interval);
        handleError(error);
      }
    }, 5000);
  };

  const handleError = (error) => {
    console.error('Error:', error);
    setError(error.message || 'An unexpected error occurred');
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-7xl font-bold mb-12 text-center text-[#64748b]">
          MEDSUSA.io
        </h1>

        {/* Dropdown Menu for Navigation */}
        <div className="relative mb-8 flex justify-center">
          <button
            onClick={toggleDropdown}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Menu
          </button>
          {isDropdownOpen && (
            <ul className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10">
              <li><Link href="/" className="block px-4 py-2 hover:bg-gray-200">Home</Link></li>
              <li><Link href="/ImageToVideoPage" className="block px-4 py-2 hover:bg-gray-200">Image to Video</Link></li>
              <li><Link href="/TextToImagePage" className="block px-4 py-2 hover:bg-gray-200">Text to Image</Link></li>
              <li><Link href="/AnotherPage" className="block px-4 py-2 hover:bg-gray-200">Another Page</Link></li>
            </ul>
          )}
        </div>

        {/* Video section */}
        <div className="flex justify-center mb-12">
          <video
            src="/medusa-video.mp4"
            className="w-96 h-96 object-cover rounded-lg"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <label htmlFor="prompt" className="block text-lg mb-2">Enter your prompt:</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-2 bg-white-800 rounded-lg text-black border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the video you want to generate..."
              rows={4}
            />
            <label htmlFor="image-upload" className="block text-lg mb-2">Upload reference image:</label>
            <div className="flex items-center space-x-4">
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
              <label htmlFor="image-upload" className="cursor-pointer px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Choose File</span>
              </label>
              {uploadedImage && <span className="text-green-400">Image uploaded</span>}
            </div>
            {uploadedImage && (
              <div className="mt-4">
                <Image src={uploadedImage} alt="Uploaded" width={200} height={200} objectFit="cover" />
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={!prompt || !uploadedImage || isProcessing}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 transform hover:scale-105 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Generating...' : 'Generate Video'}
            </button>
            {isProcessing && <p>Progress: {progress}%</p>}
            {error && <p className="text-red-500">{error}</p>}
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Generated Video</h2>
            <div className="relative aspect-video bg-white-800 rounded-lg overflow-hidden">
              {isProcessing ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="w-16 h-16 animate-spin text-blue-500" />
                </div>
              ) : generatedVideo ? (
                <video controls className="w-full h-full">
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