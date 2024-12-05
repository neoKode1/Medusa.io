import React, { useState, useCallback } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import { 
  RefreshCw as RotateCw,
  UploadIcon as UploadCloud,
  HomeIcon,
  Video as Film,
  Image as ImageIcon
} from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import ModelSelector from '@/components/ModelSelector';
import Link from 'next/link';

// Define a specific type for video models
type VideoModelName = 
  // Text to Video Models
  | 'Minimax'
  | 'Haiper V2'
  | 'Kling Pro'
  | 'CogVideo-X'
  | 'Hunyuan'
  | 'LTX'
  | 'Fast SVD'
  | 'T2V Turbo'
  | 'Luma Dream'
  | 'Mochi V1'
  | 'AnimateDiff Turbo'
  // Image to Video Models
  | 'Minimax I2V'
  | 'Haiper I2V'
  | 'CogVideo-X I2V'
  | 'LTX I2V'
  | 'Stable Video'
  | 'Kling I2V Pro'
  | 'Luma I2V'
  | 'Live Portrait'
  | 'SadTalker';

interface VideoService {
  id: string;
  name: string;
  description: string;
}

const VIDEO_SERVICES: VideoService[] = [
  {
    id: 'text-to-video',
    name: 'Text to Video',
    description: 'Generate videos from text descriptions'
  },
  {
    id: 'image-to-video',
    name: 'Image to Video',
    description: 'Transform still images into dynamic videos'
  }
];

const VIDEO_MODEL_CATEGORIES = {
  'Text to Video': [
    'Minimax',
    'Haiper V2',
    'Kling Pro',
    'CogVideo-X',
    'Hunyuan',
    'LTX',
    'Fast SVD',
    'T2V Turbo',
    'Luma Dream',
    'Mochi V1',
    'AnimateDiff Turbo'
  ],
  'Image to Video': [
    'Minimax I2V',
    'Haiper I2V',
    'CogVideo-X I2V',
    'LTX I2V',
    'Stable Video',
    'Kling I2V Pro',
    'Luma I2V',
    'Live Portrait',
    'SadTalker'
  ]
} as const;

interface ModelConfig {
  description: string;
  features: string[];
  speed: 'Fast' | 'Medium' | 'Slow';
  quality: 'Standard' | 'High' | 'Ultra';
}

// Define model configurations
const MODELS: Record<VideoModelName, ModelConfig> = {
  // Text to Video Models
  'Minimax': {
    description: 'Fast and efficient video generation',
    features: ['4K Resolution', 'Up to 30 seconds', 'Style control'],
    speed: 'Fast',
    quality: 'High'
  },
  'Haiper V2': {
    description: 'High quality video generation with advanced controls',
    features: ['4K Resolution', 'Up to 60 seconds', 'Advanced style control'],
    speed: 'Medium',
    quality: 'Ultra'
  },
  'Kling Pro': {
    description: 'Professional grade video generation',
    features: ['8K Resolution', 'Up to 60 seconds', 'Professional controls'],
    speed: 'Medium',
    quality: 'Ultra'
  },
  'CogVideo-X': {
    description: 'Advanced cognitive video generation',
    features: ['4K Resolution', 'Advanced cognition', 'Style preservation'],
    speed: 'Medium',
    quality: 'High'
  },
  'Hunyuan': {
    description: 'Specialized in natural motion',
    features: ['Natural motion', 'Realistic animation', 'Style control'],
    speed: 'Medium',
    quality: 'High'
  },
  'LTX': {
    description: 'Fast and lightweight video generation',
    features: ['Quick generation', 'Efficient processing', 'Basic controls'],
    speed: 'Fast',
    quality: 'Standard'
  },
  'Fast SVD': {
    description: 'Rapid video generation with good quality',
    features: ['Quick results', 'Good quality', 'Basic controls'],
    speed: 'Fast',
    quality: 'Standard'
  },
  'T2V Turbo': {
    description: 'Ultra-fast video generation',
    features: ['Fastest generation', 'Real-time processing', 'Basic controls'],
    speed: 'Fast',
    quality: 'Standard'
  },
  'Luma Dream': {
    description: 'Creative and artistic video generation',
    features: ['Artistic style', 'Creative control', 'High quality'],
    speed: 'Medium',
    quality: 'High'
  },
  'Mochi V1': {
    description: 'Specialized in anime-style videos',
    features: ['Anime style', 'Character animation', 'Style control'],
    speed: 'Medium',
    quality: 'High'
  },
  'AnimateDiff Turbo': {
    description: 'Fast animation generation',
    features: ['Quick animation', 'Style preservation', 'Motion control'],
    speed: 'Fast',
    quality: 'High'
  },

  // Image to Video Models
  'Minimax I2V': {
    description: 'Image animation with precise control',
    features: ['Image animation', 'Motion control', 'Style preservation'],
    speed: 'Medium',
    quality: 'High'
  },
  'Haiper I2V': {
    description: 'High quality image animation',
    features: ['4K Resolution', 'Advanced motion', 'Style control'],
    speed: 'Medium',
    quality: 'Ultra'
  },
  'CogVideo-X I2V': {
    description: 'Cognitive image animation',
    features: ['Smart animation', 'Motion preservation', 'Style control'],
    speed: 'Medium',
    quality: 'High'
  },
  'LTX I2V': {
    description: 'Fast image animation',
    features: ['Quick processing', 'Basic motion', 'Style preservation'],
    speed: 'Fast',
    quality: 'Standard'
  },
  'Stable Video': {
    description: 'Stable and consistent animation',
    features: ['Stable motion', 'Consistent style', 'Quality results'],
    speed: 'Medium',
    quality: 'High'
  },
  'Kling I2V Pro': {
    description: 'Professional image animation',
    features: ['8K Resolution', 'Professional controls', 'Advanced motion'],
    speed: 'Medium',
    quality: 'Ultra'
  },
  'Luma I2V': {
    description: 'Creative image animation',
    features: ['Artistic animation', 'Creative control', 'Style preservation'],
    speed: 'Medium',
    quality: 'High'
  },
  'Live Portrait': {
    description: 'Specialized in portrait animation',
    features: ['Portrait animation', 'Facial motion', 'Natural movement'],
    speed: 'Medium',
    quality: 'High'
  },
  'SadTalker': {
    description: 'Advanced talking head animation',
    features: ['Talking head', 'Lip sync', 'Facial expression'],
    speed: 'Medium',
    quality: 'High'
  }
};

const MedusaVideoPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Initialize with a default model
  const [mode, setMode] = useState<'text-to-video' | 'image-to-video'>('text-to-video');
  const [selectedModel, setSelectedModel] = useState<VideoModelName>('Minimax');
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  const handleModeChange = (newMode: 'text-to-video' | 'image-to-video') => {
    setMode(newMode);
    
    // Safely check if the current model is compatible with the new mode
    if (!selectedModel) {
      // If no model is selected, set a default one based on mode
      setSelectedModel(newMode === 'text-to-video' ? 'Minimax' : 'Minimax I2V');
      return;
    }

    const isI2VModel = selectedModel?.includes('I2V') || 
                      selectedModel === 'Live Portrait' || 
                      selectedModel === 'SadTalker' || 
                      selectedModel === 'Stable Video';

    if (newMode === 'image-to-video' && !isI2VModel) {
      // Switch to corresponding I2V model or default
      if (selectedModel === 'Minimax') {
        setSelectedModel('Minimax I2V');
      } else if (selectedModel === 'Haiper V2') {
        setSelectedModel('Haiper I2V');
      } else {
        setSelectedModel('Minimax I2V'); // Default I2V model
      }
    } else if (newMode === 'text-to-video' && isI2VModel) {
      // Switch to corresponding T2V model or default
      if (selectedModel === 'Minimax I2V') {
        setSelectedModel('Minimax');
      } else if (selectedModel === 'Haiper I2V') {
        setSelectedModel('Haiper V2');
      } else {
        setSelectedModel('Minimax'); // Default T2V model
      }
    }
    
    setGeneratedVideo(null);
  };

  const handleModelSelect = (model: VideoModelName) => {
    if (!model) return; // Guard against undefined model

    const isI2VModel = model.includes('I2V') || 
                      model === 'Live Portrait' || 
                      model === 'SadTalker' || 
                      model === 'Stable Video';
                       
    // Ensure mode matches the selected model
    if (isI2VModel && mode !== 'image-to-video') {
      setMode('image-to-video');
    } else if (!isI2VModel && mode !== 'text-to-video') {
      setMode('text-to-video');
    }
    
    setSelectedModel(model);
    setGeneratedVideo(null);
  };

  const handleImageSelect = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setReferenceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleUploadedImageSelect = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleGeneration = async () => {
    if (!prompt || prompt.trim().length === 0) {
      console.log('Generation aborted: Empty prompt');
      return;
    }
    
    setIsGenerating(true);
    setGeneratedVideo(null);
    console.log('Starting video generation:', {
      mode,
      model: selectedModel,
      promptLength: prompt.length,
      hasUploadedImage: !!uploadedImage
    });

    try {
      const requestBody = {
        prompt,
        model: selectedModel,
        mode,
        image_url: uploadedImage
      };
      
      console.log('Sending request with configuration:', {
        ...requestBody,
        image_url: uploadedImage ? 'Image data present' : 'No image data',
        timestamp: new Date().toISOString()
      });
      
      const startTime = performance.now();
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const endTime = performance.now();

      console.log('API Response received:', {
        status: response.status,
        statusText: response.statusText,
        responseTime: `${(endTime - startTime).toFixed(2)}ms`
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Generation failed:', {
          status: response.status,
          error: errorData.error,
          timestamp: new Date().toISOString()
        });
        throw new Error(errorData.error || 'Failed to generate video');
      }

      const data = await response.json();
      console.log('Generation successful:', {
        hasVideoUrl: !!data.data?.video?.url,
        processingTime: `${(endTime - startTime).toFixed(2)}ms`,
        model: selectedModel,
        mode,
        timestamp: new Date().toISOString()
      });

      if (data.success && data.data?.video?.url) {
        setGeneratedVideo(data.data.video.url);
        console.log('Video URL set successfully');
      } else {
        console.error('Missing video URL in response:', data);
        throw new Error('No video URL in response');
      }
    } catch (error) {
      console.error('Video generation error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        model: selectedModel,
        mode,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsGenerating(false);
      console.log('Generation process completed');
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative animate-spin rounded-full h-16 w-16 border-2 border-white border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Side Panel for Models */}
      <div className="w-80 border-r border-white/5 h-screen sticky top-0 overflow-hidden hover:overflow-y-auto transition-all">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <HomeIcon size={24} className="text-white/80" />
            </Link>
          </div>

          <h2 className="text-xl font-medium text-white/80 mb-6">Mode Selection</h2>
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => handleModeChange('text-to-video')}
              className={`px-4 py-2 rounded-lg ${
                mode === 'text-to-video'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Film className="w-4 h-4 inline mr-2" />
              Text to Video
            </button>
            <button
              onClick={() => handleModeChange('image-to-video')}
              className={`px-4 py-2 rounded-lg ${
                mode === 'image-to-video'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <ImageIcon className="w-4 h-4 inline mr-2" />
              Image to Video
            </button>
          </div>

          {/* Model Selection */}
          <ModelSelector
            mode={mode}
            selectedModel={selectedModel}
            onModelSelect={handleModelSelect}
            VIDEO_MODEL_CATEGORIES={{
              'Text to Video': ["Minimax", "Haiper V2", "Kling Pro", "CogVideo-X", "Hunyuan", "LTX", "Fast SVD", "T2V Turbo", "Luma Dream", "Mochi V1", "AnimateDiff Turbo"],
              'Image to Video': [
                "Minimax I2V",
                "Haiper I2V",
                "CogVideo-X I2V",
                "LTX I2V",
                "Stable Video",
                "Kling I2V Pro",
                "Luma I2V",
                "Live Portrait",
                "SadTalker"
              ]
            }}
            isGenerating={isGenerating}
            MODELS={MODELS}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Top Bar */}
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <HomeIcon size={24} className="text-white/80" />
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">What video do you want to create?</h1>
            <p className="text-white/60">Generate stunning videos with AI</p>
          </div>

          <div className="border border-white/10 rounded-xl p-8">
            {mode === 'image-to-video' && (
              <div className="mb-6">
                <ImageUpload
                  onImageSelect={handleUploadedImageSelect}
                  currentImage={uploadedImage}
                  label="Upload Source Image"
                  className="border border-white/10 rounded-xl p-8 hover:border-white/20 transition-colors text-center"
                />
              </div>
            )}

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === 'text-to-video' 
                ? 'Describe the video you want to create...'
                : 'Describe how you want to animate this image...'}
              className="w-full h-40 bg-transparent text-white/90 rounded-lg p-4 resize-none 
                       focus:outline-none focus:ring-1 focus:ring-blue-500/50 mb-4 
                       border border-white/10 placeholder-white/30 text-lg"
            />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 border border-white/10 text-white/80 rounded-lg hover:bg-white/5 transition-all flex items-center gap-2">
                  <UploadCloud size={18} />
                  <span>Reference</span>
                </button>
                <select className="px-4 py-2 bg-black border border-white/10 text-white/80 rounded-lg hover:bg-black/50 transition-all appearance-none cursor-pointer">
                  <option value="1:1">Square (1:1)</option>
                  <option value="2:3">Portrait (2:3)</option>
                  <option value="3:2">Landscape (3:2)</option>
                  <option value="4:3">Standard (4:3)</option>
                  <option value="3:4">Portrait (3:4)</option>
                  <option value="16:9">Widescreen (16:9)</option>
                  <option value="9:16">Mobile (9:16)</option>
                  <option value="21:9">Ultrawide (21:9)</option>
                  <option value="4:5">Instagram Portrait (4:5)</option>
                  <option value="5:4">Instagram Landscape (5:4)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleGeneration}
                disabled={isGenerating || (mode === 'image-to-video' && !uploadedImage)}
                className={`px-6 py-3 rounded-lg transition-all duration-200 
                         flex items-center gap-2
                         ${isGenerating || (mode === 'image-to-video' && !uploadedImage)
                           ? 'border border-white/10 text-white/50 cursor-not-allowed' 
                           : 'bg-blue-500 hover:bg-blue-600'} 
                         text-white font-medium`}
              >
                {isGenerating ? (
                  <>
                    <RotateCw className="animate-spin" size={18} />
                    <span>Processing...</span>
                  </>
                ) : (
                  'Generate Video'
                )}
              </button>
            </div>
          </div>
        </div>

        {generatedVideo && (
          <div className="mt-8 border border-white/10 rounded-xl p-6">
            <video 
              src={generatedVideo}
              controls
              className="w-full rounded-lg mb-4"
            />
            <div className="flex justify-center">
              <a
                href={generatedVideo}
                download="generated-video.mp4"
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg 
                          transition-all duration-200 flex items-center gap-2"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download Video
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedusaVideoPage;

function setReferenceImage(arg0: string) {
  throw new Error('Function not implemented.');
}
