import { useState } from 'react';
import { Upload, ChevronDown } from 'lucide-react';  // Ensure Upload and ChevronDown icons are imported
import Link from 'next/link'; // Import Link for navigation

const ImageToVideoPage = () => {
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);  // State for menu dropdown

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

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
  
    try {
      const response = await fetch('/api/lumaai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          image: uploadedImage || null,  // Send null if no image is uploaded
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
  
        // Log the full response data for debugging purposes
        console.log('LumaAI API response:', data);
  
        // If the state is 'queued', poll for the status until it's done
        if (data.state === 'queued') {
          pollForCompletion(data.id);  // Start polling if the generation is queued
        } else if (data.assets && data.assets.video) {
          setGeneratedVideo(data.assets.video);  // Set the video when it's generated
        } else {
          throw new Error('Video not generated. Please check the response from the API.');
        }
  
        setIsProcessing(false);
      } else {
        throw new Error(`Failed to generate video. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error:', error.message || error);
      setError('An error occurred while generating the video. Please try again.');
      setIsProcessing(false);
    }
  };
  
  // Polling function to check the status of the video generation
  const pollForCompletion = async (id) => {
    try {
      const interval = setInterval(async () => {
        const response = await fetch(`/api/lumaai/status/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log('Polling response:', data);
  
          if (data.state === 'completed' && data.assets && data.assets.video) {
            clearInterval(interval);  // Stop polling once video is generated
            setGeneratedVideo(data.assets.video);  // Set the generated video
            setIsProcessing(false);
          } else if (data.state === 'failed') {
            clearInterval(interval);
            throw new Error('Video generation failed. Please try again.');
          }
        } else {
          throw new Error(`Failed to check generation status. Status: ${response.status}`);
        }
      }, 5000);  // Poll every 5 seconds
    } catch (error) {
      console.error('Polling Error:', error.message || error);
      setError('An error occurred while checking video generation status.');
      setIsProcessing(false);
    }
  };
  
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-no-repeat bg-cover"
      style={{
        backgroundImage: "url('/Medusa.svg.svg')",  // Path to your background image
        backgroundSize: 'contain',                  // Adjust size (cover/contain/auto)
        backgroundPosition: 'center',
      }}
    >
      <div className="bg-white bg-opacity-80 p-8 rounded-lg max-w-2xl w-full">
        
        {/* Dropdown Menu for Navigation */}
        <div className="relative mb-8">
          <button
            onClick={toggleDropdown}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            Menu
            <ChevronDown className="ml-2" />
          </button>
          {isDropdownOpen && (
            <ul className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10">
              <li>
                <Link href="/" className="block px-4 py-2 hover:bg-gray-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/ImageToVideoPage" className="block px-4 py-2 hover:bg-gray-200">
                  Image to Video
                </Link>
              </li>
              <li>
                <Link href="/TextToImagePage" className="block px-4 py-2 hover:bg-gray-200">
                  Text to Image
                </Link>
              </li>
              <li>
                <Link href="/generate-prompt" className="block px-4 py-2 hover:bg-gray-200">
                  Generate Prompt
                </Link>
              </li>
            </ul>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-8 text-center">Image to Video Generator</h1>

        {/* Prompt Input */}
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-lg mb-2">Enter your prompt:</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Describe the video you want to generate..."
            rows={4}
          />
        </div>

        {/* File Upload (Optional) */}
        <div className="mb-4">
          <label htmlFor="image-upload" className="block text-lg mb-2">Upload reference image (optional):</label>
          <div className="flex items-center space-x-4">
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
            <label htmlFor="image-upload" className="cursor-pointer px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center space-x-2">
              <Upload className="w-5 h-5" />  {/* Icon for uploading image */}
              <span>Choose File</span>
            </label>
            {uploadedImage && (
              <div className="mt-4">
                <img
                  src={uploadedImage}
                  alt="Uploaded preview"
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <span className="text-green-400">Image uploaded</span>
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isProcessing || !prompt}  // Disable only if prompt is empty or processing
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isProcessing ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.75V6m0 6V9m3-3.25h1.25M15 21h1.25m-8-6.75H6.25M12 18.25v-1.25m0-3.75V9m0-3v-1.25" />
            </svg>
          ) : 'Generate Video'}
        </button>

        {/* Error Message */}
        {error && <p className="text-red-500 mt-4">{error}</p>}

        {/* Generated Video */}
        {generatedVideo && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Generated Video</h2>
            <video controls className="w-full h-64 object-cover rounded-lg">
              <source src={generatedVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageToVideoPage;
