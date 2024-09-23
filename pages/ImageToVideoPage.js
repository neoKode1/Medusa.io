import React, { useState } from 'react';  // Ensure React and useState are imported correctly
import { Upload, RefreshCw } from 'lucide-react';  // Any third-party libraries you're using
import LumaAI from 'lumaai';  // Ensure LumaAI is imported

// Initialize the LumaAI client
const client = new LumaAI({
  authToken: process.env.NEXT_PUBLIC_LUMAAI_API_KEY,  // Fetch API key from environment variables
});

// Define the ImageToVideoPage component
const ImageToVideoPage = () => {
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);
  
    // Log the API key to ensure it's correctly fetched
    console.log('API Key:', process.env.NEXT_PUBLIC_LUMAAI_API_KEY);
  
    try {
      // Step 1: Call the LumaAI API to generate the video
      const generation = await client.generations.create({
        aspect_ratio: '16:9',
        prompt: prompt,
      });
  
      if (generation && generation.id) {
        const { id: taskId } = generation;
  
        // Step 2: Polling to check the status of the video generation
        let interval = setInterval(async () => {
          try {
            const statusResponse = await client.generations.get(taskId);  
            const { state, assets, progressPercent, failure_reason } = statusResponse;
  
            // Log full status response to understand the structure
            console.log('Status Response:', statusResponse);
  
            setProgress(progressPercent || 0);  // Update progress
  
            if (state === 'completed') {
              clearInterval(interval);
  
              // Check if assets are available
              if (assets && assets.video) {
                setGeneratedVideo(assets.video);  // Set the video URL
                setIsProcessing(false);
              } else {
                setError('Video generation completed but no assets were found.');
                setIsProcessing(false);
              }
  
            } else if (state === 'failed') {
              clearInterval(interval);
              console.error('Video generation failed:', failure_reason);  // Log failure reason
              setError(`Video generation failed: ${failure_reason || 'Unknown reason'}`);
              setIsProcessing(false);
  
            } else if (state === 'dreaming' || state === 'queued' || state === 'processing') {
              // Continue polling if the task is still in progress
              console.log(`Video generation is in progress... [${state}]`);
            }
          } catch (statusError) {
            console.error("Error checking status: ", statusError);
            clearInterval(interval);
            setError('An error occurred while checking the generation status.');
            setIsProcessing(false);
          }
        }, 5000); // Poll every 5 seconds
  
      } else {
        console.error('Invalid API response:', generation);
        setError('Failed to start video generation. Please check your input and try again.');
        setIsProcessing(false);
      }
  
    } catch (error) {
      if (error instanceof LumaAI.APIError) {
        console.error(`API Error: ${error.status} - ${error.name}`);
        console.error('Detailed API Error:', error);  // Log full error
        setError(`API Error: ${error.status} - ${error.message}`);
      } else {
        console.error('Unexpected error:', error);
        setError('An unexpected error occurred while generating the video.');
      }
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-7xl font-bold mb-12 text-center text-[#64748b]">
          MEDSUSA.io
        </h1>
        
        {/* Add video section below the title */}
        <div className="flex justify-center mb-12">
          <video
            src="/medusa-video.mp4"  // Replace with actual video path
            className="w-384px h-384px object-cover rounded-lg"
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

// Default export must be a valid React component
export default ImageToVideoPage;
