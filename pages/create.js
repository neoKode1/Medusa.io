import { useState, useRef } from 'react';
import { ChevronDown, RefreshCw, Settings, X, Wand2, Home, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { SUPPORTED_MODELS, MODEL_STYLES } from '@/lib/promptGuide';
import PrometheusPrompt from '@/components/PrometheusPrompt';
import Link from 'next/link';

const Create = () => {
  const [input, setInput] = useState({
    prompt: '',
    model: 'flux-1.1', // Changed from 'stable-diffusion-3' to 'flux-1.1'
    settings: {},
    isVideo: false,
    referenceImage: null,
    referenceImageUrl: null
  });
  const [output, setOutput] = useState({
    imageUrl: null,
    isLoading: false,
    error: null
  });
  const [showPrometheus, setShowPrometheus] = useState(false);

  const models = SUPPORTED_MODELS;

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setOutput({
          ...output,
          error: "Image size should be less than 5MB"
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setInput({
          ...input,
          referenceImage: file,
          referenceImageUrl: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveReference = () => {
    setInput({
      ...input,
      referenceImage: null,
      referenceImageUrl: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    setOutput({ ...output, isLoading: true, error: null });

    try {
      const selectedModel = SUPPORTED_MODELS.find(m => m.id === input.model);
      const isVideo = selectedModel?.type === 'video';
      const endpoint = isVideo ? '/api/lumaai' : '/api/replicate';

      const formData = new FormData();
      formData.append('prompt', input.prompt);
      formData.append('model', input.model);
      if (input.referenceImage) {
        formData.append('referenceImage', input.referenceImage);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: input.referenceImage ? formData : JSON.stringify(input),
        headers: input.referenceImage ? {} : { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const data = await response.json();
      setOutput({
        imageUrl: data.imageUrl,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setOutput({
        ...output,
        isLoading: false,
        error: error.message
      });
    }
  };

  const handlePrometheusPrompt = (generatedPrompt) => {
    setInput({ ...input, prompt: generatedPrompt });
    setShowPrometheus(false);
  };


return (
  <div className="min-h-screen bg-transparent p-6 relative">
    <div 
      className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat" 
      style={{
        backgroundImage: "url('/generated-image (49).png')",
        filter: "brightness(0.3)"  // Darken the background for better contrast
      }}
    />
    
    <div className="max-w-6xl mx-auto relative z-10">
      <div className="border border-gray-700/50 rounded-lg shadow-lg p-6 backdrop-blur-sm bg-black/30">
        <h1 className="text-3xl font-bold mb-6 text-white">Create Image</h1>
        
        {/* Model Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Model
          </label>
          <select
            value={input.model}
            onChange={(e) => setInput({ ...input, model: e.target.value })}
            className="w-full p-2 border border-gray-700 rounded-lg bg-transparent text-white focus:border-blue-500 focus:ring-blue-500"
          >
            {SUPPORTED_MODELS.map(model => (
              <option key={model.id} value={model.id} className="bg-gray-900">
                {model.name} - {model.description}
              </option>
            ))}
          </select>
          
          {/* Display selected model styles */}
          {input.model && (
            <div className="mt-2 flex flex-wrap gap-2">
              {MODEL_STYLES[input.model].map((style, index) => (
                <span 
                  key={index}
                  className="text-xs text-gray-300 border border-gray-700 px-2 py-1 rounded"
                >
                  {style}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Reference Image Upload Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-300">
              Reference Image (Optional)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            {!input.referenceImageUrl ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-white px-3 py-1 rounded-lg hover:bg-blue-700/20 flex items-center gap-2 border border-blue-500"
              >
                <Upload size={16} />
                Upload Reference
              </button>
            ) : (
              <button
                onClick={handleRemoveReference}
                className="text-sm text-white px-3 py-1 rounded-lg hover:bg-red-700/20 flex items-center gap-2 border border-red-500"
              >
                <X size={16} />
                Remove
              </button>
            )}
          </div>

          {/* Reference Image Preview */}
          {input.referenceImageUrl && (
            <div className="relative w-full h-48 mt-2 rounded-lg overflow-hidden border border-gray-700">
              <Image
                src={input.referenceImageUrl}
                alt="Reference"
                fill
                className="object-contain"
              />
            </div>
          )}
        </div>

        {/* Prompt Input */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-300">
              Prompt
            </label>
            <button
              onClick={() => {
                console.log('Prometheus button clicked');
                setShowPrometheus(true);
              }}
              className="text-sm text-white px-3 py-1 rounded-lg hover:bg-purple-700/20 flex items-center gap-2 border border-purple-500"
            >
              <Wand2 size={16} />
              Prometheus
            </button>
          </div>
          <textarea
            value={input.prompt}
            onChange={(e) => setInput({ ...input, prompt: e.target.value })}
            className="w-full p-2 border border-gray-700 rounded-lg bg-transparent text-white h-32 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Describe the image you want to generate..."
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={output.isLoading || !input.prompt.trim()}
          className="w-full text-white py-3 px-4 rounded-lg hover:bg-blue-700/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-blue-500"
        >
          {output.isLoading ? (
            <>
              <RefreshCw className="animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <span>Generate</span>
          )}
        </button>

        {/* Output Display Section */}
        <div className="mt-8">
          {output.error && (
            <div className="text-red-400 mb-4 p-4 border border-red-800 rounded-lg">
              Error: {output.error}
            </div>
          )}
          
          {output.imageUrl && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Generated Output</h2>
              <div className="relative aspect-square w-full max-w-2xl mx-auto rounded-lg overflow-hidden shadow-lg border border-gray-700">
                <Image
                  src={output.imageUrl}
                  alt="Generated image"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              </div>
              
              {/* Download Button */}
              <div className="flex justify-center mt-4">
                <a
                  href={output.imageUrl}
                  download="generated-image.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={async (e) => {
                    // ... download logic remains the same ...
                  }}
                  className="text-white py-2 px-4 rounded-lg hover:bg-green-700/20 flex items-center gap-2 border border-green-500"
                >
                  <span>Download JPEG</span>
                </a>
              </div>
            </div>
          )}

          {/* Loading State */}
          {output.isLoading && (
            <div className="flex flex-col items-center justify-center p-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
              <p className="mt-4 text-gray-400">Generating your image...</p>
            </div>
          )}
        </div>
      </div>
    </div>
    {showPrometheus && (
      <PrometheusPrompt
        isOpen={showPrometheus}
        onClose={() => setShowPrometheus(false)}
        onGeneratePrompt={handlePrometheusPrompt}
        selectedModel={input.model}
      />
    )}
    
    {/* Home Button */}
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
      <Link href="/dashboard">
        <button className="text-white border-2 border-white px-6 py-3 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2">
          <Home size={24} />
          <span className="font-medium">Home</span>
        </button>
      </Link>
    </div>
  </div>
);
};

export default Create;