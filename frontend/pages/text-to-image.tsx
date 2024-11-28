import React, { useState, useCallback } from 'react';
import { RefreshCw, Download, Upload } from 'lucide-react';
import { GenerationContainer } from '@/components/ui/generation-container';
import { GalleryContainer } from '@/components/ui/gallery-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModelSelector } from '@/components/ui/model-selector';
import { AdvancedSettings } from '@/components/ui/advanced-settings';
import { MODELS } from '@/constants/models';

const ASPECT_RATIOS = {
  '1:1': 'Square',
  '16:9': 'Landscape',
  '4:3': 'Standard',
  '3:2': 'Portrait'
};

const getOptimalQualitySettings = (ratio: string) => {
  const settings = {
    '1:1': { width: 1024, height: 1024, recommendedQuality: 100 },
    '16:9': { width: 1920, height: 1080, recommendedQuality: 100 },
    '4:3': { width: 1600, height: 1200, recommendedQuality: 100 },
    '3:2': { width: 1500, height: 1000, recommendedQuality: 100 }
  } as const;
  return settings[ratio as keyof typeof settings] || settings['1:1'];
};

interface GalleryImage {
  url: string;
  prompt: string;
  timestamp: number;
}

interface GenerationState {
  assets: {
    image?: string;
  };
}

interface ModelOptions {
  width?: number;
  height?: number;
  quality?: number;
  reference_image?: string;
}

// Add interface for API response
interface GenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  details?: string;
}

const TextToImagePage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('FLUX 1.1 Pro Ultra');
  const [generation, setGeneration] = useState<GenerationState>({ assets: {} });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [modelOptions, setModelOptions] = useState<ModelOptions>({});
  const [showGallery, setShowGallery] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  const handleAspectRatioChange = (ratio: string) => {
    setAspectRatio(ratio);
    const qualitySettings = getOptimalQualitySettings(ratio);
    setModelOptions(prev => ({
      ...prev,
      width: qualitySettings.width,
      height: qualitySettings.height,
      quality: qualitySettings.recommendedQuality
    }));
  };

  const handleGenerate = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      console.log('🚀 Starting generation with:', { 
        prompt, 
        model, 
        modelOptions,
        hasReferenceImage: !!modelOptions.reference_image 
      });

      // First, enhance the prompt
      const enhanceResponse = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description: prompt,
          genre: 'modern',
          style: 'photorealistic'
        })
      });

      if (!enhanceResponse.ok) {
        const error = await enhanceResponse.json();
        throw new Error(`Prompt enhancement failed: ${error.error || error.details || 'Unknown error'}`);
      }

      const { enhanced_prompt } = await enhanceResponse.json();
      console.log('✨ Enhanced prompt:', enhanced_prompt);

      const response = await fetch('/api/fal-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: enhanced_prompt,
          model,
          image_url: modelOptions.reference_image,
          options: {
            aspect_ratio: aspectRatio,
            ...modelOptions
          }
        })
      });

      const result = await response.json();
      console.log('📦 Generation response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate image');
      }

      // Extract image URL from the response
      let generatedImageUrl;
      if (result.data?.images?.[0]?.url) {
        generatedImageUrl = result.data.images[0].url;
      } else if (result.data?.images?.[0] && typeof result.data.images[0] === 'string') {
        generatedImageUrl = result.data.images[0];
      } else if (result.imageUrl) {
        generatedImageUrl = result.imageUrl;
      } else {
        console.error('Invalid response format:', result);
        throw new Error('No valid image URL in response');
      }

      // Validate URL format
      try {
        new URL(generatedImageUrl);
      } catch {
        console.error('Invalid URL format:', generatedImageUrl);
        throw new Error('Invalid image URL format');
      }

      setGeneration({ 
        assets: { 
          image: generatedImageUrl 
        } 
      });
      
      setGalleryImages(prev => [{
        url: generatedImageUrl,
        prompt: enhanced_prompt,
        timestamp: Date.now()
      }, ...prev]);

    } catch (err) {
      console.error('❌ Generation error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Convert the image to base64
      const base64String = reader.result as string;
      // Remove the data URL prefix to get just the base64 content
      const base64Content = base64String.split(',')[1];
      setUploadedImage(base64String); // Keep the full data URL for display
      setModelOptions(prev => ({
        ...prev,
        reference_image: base64Content // Store just the base64 content
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    if (!generation?.assets?.image) return;
    
    try {
      const response = await fetch(generation.assets.image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generation-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const clearReferenceImage = () => {
    setUploadedImage(null);
    setModelOptions(prev => {
      const { reference_image, ...rest } = prev;
      return rest;
    });
  };

  return (
    <div className="min-h-screen bg-runway-black p-6">
      {/* Header Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-black/30 backdrop-blur-sm flex items-center justify-between px-6 z-10">
        <div className="w-48">
          <ModelSelector 
            currentModel={model} 
            onModelSelect={(modelName) => setModel(modelName)} 
          />
        </div>
        
        <div className="flex items-center gap-4">
          <label 
            htmlFor="image-upload"
            className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-white rounded-lg hover:bg-blue-500/10 transition-colors cursor-pointer"
          >
            <Upload size={20} />
            Reference Image
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              className="hidden"
            />
          </label>
          
          <select
            value={aspectRatio}
            onChange={(e) => handleAspectRatioChange(e.target.value)}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            {Object.entries(ASPECT_RATIOS).map(([ratio, label]) => (
              <option key={ratio} value={ratio}>
                {label} ({ratio})
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Advanced Settings
          </button>
          <button
            onClick={() => setShowGallery(!showGallery)}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Gallery ({galleryImages.length})
          </button>
        </div>
      </div>

      {/* Add reference image preview if uploaded */}
      {uploadedImage && (
        <div className="fixed top-20 right-6 z-20 bg-black/30 p-4 rounded-lg">
          <div className="relative">
            <img 
              src={uploadedImage} 
              alt="Reference"
              className="w-32 h-32 object-cover rounded-lg"
            />
            <button
              onClick={clearReferenceImage}
              className="absolute -top-2 -right-2 bg-black/50 rounded-full p-1 hover:bg-black/70"
            >
              ✕
            </button>
            <p className="text-white/70 text-sm mt-2 text-center">Reference Image</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen max-w-4xl mx-auto pt-20">
        {/* Model Features (if applicable) */}
        {/* {(model.includes('Fill') || model.includes('Canny') || 
          model.includes('Depth') || model.includes('Redux')) && (
          <div className="w-full max-w-2xl mb-6">
            <ModelFeatures model={model} onImageUpload={handleImageUpload} />
          </div>
        )} */}

        {/* Prompt Input */}
        <div className="w-full max-w-2xl mb-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 bg-black/30 text-white rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="Enter your prompt here..."
          />
        </div>

        {/* Generated Image Display */}
        <div className="w-full max-w-2xl mb-6">
          <div className="relative aspect-square rounded-lg bg-black/30 overflow-hidden">
            <GenerationContainer
              generation={generation}
              isLoading={isProcessing}
              isVideo={false}
            />
            {generation?.assets?.image && (
              <button
                onClick={handleDownload}
                className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <Download size={20} />
                Download
              </button>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="w-full max-w-2xl">
          <button
            onClick={handleGenerate}
            disabled={!prompt || isProcessing}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="animate-spin" size={20} />
                Generating...
              </span>
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </div>

      {/* Modals */}
      {showGallery && (
        <div className="fixed inset-0 bg-black/80 z-50 p-8">
          <div className="h-full overflow-auto">
            <GalleryContainer images={galleryImages} />
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-runway-gray p-8 rounded-lg w-[480px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white text-xl font-semibold">Advanced Settings</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <AdvancedSettings
              model={model}
              modelOptions={modelOptions}
              onOptionsChange={setModelOptions}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TextToImagePage;