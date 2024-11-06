import React, { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { debounce } from 'lodash';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { validateAndEnhancePrompt, getOptimalQualitySettings } from '../constants/promptGuide';
import { GenerationContainer } from '@/components/ui/generation-container';
import { LoadingParticles } from '@/components/LoadingParticles';

const BlackHoleVisualization = dynamic(() => import('@/components/BlackHoleVisualization'), {
  ssr: false,
});

const MODES = [
  { value: 'image', label: 'Image Generation' }
];

const GENRES = {
  fantasy: ['High Fantasy', 'Urban Fantasy', 'Dark Fantasy', 'Fairy Tale', 'Sword & Sorcery', 'Mythological', 'Contemporary Fantasy', 'Epic Fantasy', 'Portal Fantasy'],
  scifi: ['Space Opera', 'Cyberpunk', 'Post-Apocalyptic', 'Hard Sci-Fi', 'Time Travel', 'Dystopian', 'First Contact', 'Military Sci-Fi', 'Biopunk', 'Steampunk', 'Space Western', 'Afrofuturism'],
  horror: ['Gothic', 'Cosmic Horror', 'Psychological Horror', 'Body Horror', 'Folk Horror', 'Supernatural', 'Slasher', 'Zombie', 'Found Footage', 'Haunted House', 'Monster', 'Survival Horror'],
  historical: ['Medieval', 'Renaissance', 'Victorian', 'Ancient Civilizations', 'World Wars', 'Cold War', 'Ancient Rome', 'Ancient Egypt', 'Byzantine', 'Colonial', 'Industrial Revolution', 'Age of Sail'],
  mystery: ['Film Noir', 'Detective', 'Thriller', 'Crime Drama', 'Espionage', 'Cozy Mystery', 'Hard-Boiled', 'Police Procedural', 'Heist', 'Conspiracy'],
  romance: ['Period Romance', 'Contemporary', 'Paranormal Romance', 'Romantic Comedy', 'Gothic Romance', 'Historical Romance', 'Romantic Suspense', 'Dark Romance'],
  western: ['Classic Western', 'Spaghetti Western', 'Modern Western', 'Weird West', 'Neo-Western', 'Space Western', 'Post-Apocalyptic Western'],
  adventure: ['Epic Adventure', 'Exploration', 'Lost World', 'Treasure Hunt', 'Maritime', 'Survival', 'Archaeological', 'Jungle Adventure', 'Arctic Adventure', 'Desert Adventure'],
  drama: ['Period Drama', 'Social Commentary', 'Slice of Life', 'Coming of Age', 'Family Drama', 'Political Drama', 'Medical Drama', 'Legal Drama', 'Sports Drama'],
  comedy: ['Slapstick', 'Dark Comedy', 'Satire', 'Parody', 'Absurdist', 'Romantic Comedy', 'Screwball Comedy', 'Comedy of Manners', 'Workplace Comedy']
};

const STYLES = [
  'Photorealistic',
  'Anime',
  'Digital Art', 
  'Oil Painting',
  'Watercolor',
  'Sketch',
  'Pixel Art',
  'Vector Art',
  'Comic Book',
  'Concept Art',
  '3D Render',
  'Charcoal Drawing',
  'Pencil Drawing',
  'Pastel Art',
  'Storybook Illustration',
  'Pop Art',
  'Abstract',
  'Minimalist',
  'Surrealist',
  'Art Nouveau',
  'Art Deco',
  'Impressionist',
  'Gothic',
  'Steampunk',
  'Cyberpunk',
  // Add more styles as needed
];

const MOVIES = [
  // Sci-Fi
  'Blade Runner', 'The Matrix', 'Inception', 'Alien', 'Avatar', 'Interstellar', 'Ex Machina', 'Akira', 
  'Ghost in the Shell', '2001: A Space Odyssey', 'Dune', 'Metropolis', 'District 9', 'Edge of Tomorrow',
  'Arrival', 'Children of Men', 'Moon', 'Eternal Sunshine of the Spotless Mind', 'Her', 'Wall-E',
  // Fantasy
  'Lord of the Rings', 'Pan\'s Labyrinth', 'Princess Mononoke', 'Spirited Away', 'The Dark Crystal',
  'Conan the Barbarian', 'The Neverending Story', 'Willow', 'Labyrinth', 'The Princess Bride',
  // Action/Adventure
  'Mad Max: Fury Road', 'Indiana Jones', 'Star Wars', 'Jurassic Park', 'The Fifth Element',
  'Pirates of the Caribbean', 'The Mummy', 'John Wick', 'Kill Bill', 'Die Hard',
  // Horror
  'The Thing', 'Alien', 'The Shining', 'Nosferatu', 'A Nightmare on Elm Street',
  'Hellraiser', 'The Exorcist', 'Dracula', 'The Babadook', 'Get Out',
  // Drama
  'The Godfather', 'Apocalypse Now', 'Blade Runner 2049', '1917', 'Lawrence of Arabia',
  'Barry Lyndon', 'The Grand Budapest Hotel', 'In the Mood for Love', 'Drive', 'Only God Forgives'
];

const BOOKS = [
  'Dune',
  'Neuromancer',
  'The Hobbit',
  '1984', 
  'Foundation',
  'Brave New World',
  'The Lord of the Rings',
  'Snow Crash',
  'Hyperion',
  'The Hitchhiker\'s Guide to the Galaxy',
  'Ready Player One',
  'Ender\'s Game',
  'The Name of the Wind',
  'American Gods',
  'The Way of Kings'
];

const MODELS = {
  'black-forest-labs/flux-dev': 'Flux Dev',
  'black-forest-labs/flux-pro': 'Flux Pro',
  'black-forest-labs/flux-1.1-pro': 'Flux 1.1 Pro',
  'stability-ai/stable-diffusion-xl-base-1.0': 'Stable Diffusion XL 1.0',
  'stability-ai/stable-diffusion-3.5-large': 'Stable Diffusion 3.5',
  'recraft-ai/recraft-v3': 'Recraft V3'
};

const BACKGROUND_IMAGES = [
  '/attachments/IMG_3200.JPG',
  '/attachments/IMG_3205.JPG',
  '/attachments/IMG_3207.PNG',
  '/attachments/IMG_3263.JPG',
  '/attachments/IMG_3264.JPG',
  '/attachments/IMG_3266.JPG',
  '/attachments/IMG_3267.JPG',
  '/attachments/IMG_3268.JPG',
  '/attachments/IMG_3269.JPG',
  '/attachments/IMG_3332.JPG',
  '/attachments/IMG_3454.JPG',
  '/attachments/IMG_3455.JPG',
  '/attachments/IMG_3456.JPG',
  '/attachments/IMG_3458.JPG',
  '/attachments/IMG_3459.JPG',
  '/attachments/IMG_3460.JPG',
  '/attachments/IMG_3461.JPG',
  '/attachments/IMG_3462.JPG',
  '/attachments/IMG_3471.JPG',
  '/attachments/IMG_3472.JPG',
  '/attachments/IMG_3473.JPG',
  '/attachments/IMG_3474.JPG',
  '/attachments/IMG_3475.JPG',
  '/attachments/IMG_3484.JPG',
  '/attachments/IMG_3483.JPG',
  '/attachments/IMG_3487.JPG',
  '/attachments/IMG_3982.JPG'
];

const ASPECT_RATIOS = [
  { label: 'Custom', value: 'custom' },
  { label: 'Square (1:1)', value: '1:1' },
  { label: 'Portrait (3:4)', value: '3:4' },
  { label: 'Portrait (2:3)', value: '2:3' },
  { label: 'Portrait (9:16)', value: '9:16' },
  { label: 'Landscape (4:3)', value: '4:3' },
  { label: 'Landscape (3:2)', value: '3:2' },
  { label: 'Landscape (16:9)', value: '16:9' },
  { label: 'Landscape (21:9)', value: '21:9' },
  { label: 'Instagram Story (9:16)', value: '9:16' },
  { label: 'Instagram Post (1:1)', value: '1:1' },
  { label: 'Cinema (2.39:1)', value: '2.39:1' },
  { label: 'IMAX (1.43:1)', value: '1.43:1' }
];

// Add these type definitions at the top of your file
type GenerationMode = 'image' | 'video';

interface GenerationState {
  assets: {
    image?: string;
    video?: string;
  };
}

// Helper functions
const validateInputs = (values: any) => {
  const errors: Record<string, string> = {};
  
  // Model validation
  if (!values.model) {
    errors.model = 'Model is required';
  }

  // Steps validation (between 1 and 150)
  if (values.steps < 1 || values.steps > 150) {
    errors.steps = 'Steps must be between 1 and 150';
  }

  // Width and height validation (multiples of 8, between 128 and 1024)
  if (values.width % 8 !== 0 || values.width < 128 || values.width > 1024) {
    errors.width = 'Width must be a multiple of 8 between 128 and 1024';
  }
  if (values.height % 8 !== 0 || values.height < 128 || values.height > 1024) {
    errors.height = 'Height must be a multiple of 8 between 128 and 1024';
  }

  // Guidance validation (between 1 and 20)
  if (values.guidance < 1 || values.guidance > 20) {
    errors.guidance = 'Guidance must be between 1 and 20';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Single component definition
const TextToImagePage: React.FC = () => {
  // All state definitions - removed duplicates
  const [mode, setMode] = useState<GenerationMode>('image');
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState(Object.keys(MODELS)[0]);
  const [steps, setSteps] = useState(30);
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [guidance, setGuidance] = useState(7.5);
  const [scheduler, setScheduler] = useState<string>('K_EULER_ANCESTRAL');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generation, setGeneration] = useState<GenerationState>({ assets: {} });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promptUpsampling, setPromptUpsampling] = useState(false);
  const [safetyTolerance, setSafetyTolerance] = useState(0.5);
  const [outputQuality, setOutputQuality] = useState(100);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [interval, setInterval] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showPromptGenerator, setShowPromptGenerator] = useState(false);
  const [description, setDescription] = useState<string>('');
  const [genre, setGenre] = useState<string>('');
  const [movieReference, setMovieReference] = useState<string>('');
  const [bookReference, setBookReference] = useState<string>('');
  const [style, setStyle] = useState<string>('');
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Event handlers
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File is too large. Please use an image under 10MB.');
        return;
      }

      try {
        // Create FormData and append file
        const formData = new FormData();
        formData.append('file', file);

        // Upload to your server or a service like S3
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const { url } = await uploadResponse.json();
        setUploadedImage(url); // Store the actual URL, not the base64
      } catch (err) {
        console.error('Upload error:', err);
        setError('Failed to upload image');
      }
    }
  };

  const handleGenerateImage = async (enhancedPrompt: string) => {
    console.log('Starting image generation with prompt:', enhancedPrompt);
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          model_id: model,
          steps,
          width,
          height,
          guidance,
          scheduler: model.includes('flux') ? scheduler : undefined,
        }),
      });

      console.log('Image generation response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Image generation error response:', errorData);
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      console.log('Image generation response:', data);

      if (!data.imageUrl) {
        throw new Error('No image URL in response');
      }

      setGeneratedContent(data.imageUrl);
    } catch (error) {
      console.error('Generation error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGeneratePrompt = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          genre,
          movieReference,
          bookReference,
          style,
          mode,
          referenceImage: uploadedImage
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      setPrompt(data.enhanced_prompt);
      setShowPromptGenerator(false);
    } catch (error) {
      console.error('Prompt generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate prompt');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    const url = generation?.assets?.image;
    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'generated-image.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download file');
    }
  };

  const handleGenerateContent = async () => {
    if (!prompt) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const requestBody = {
        prompt,
        model_id: model,
        steps: Math.min(Math.max(steps, 20), 150),
        width: Math.min(Math.max(width - (width % 8), 128), 1024),
        height: Math.min(Math.max(height - (height % 8), 128), 1024),
        guidance_scale: Math.min(Math.max(guidance, 1), 20),
        scheduler: model.includes('flux') ? scheduler : undefined,
        prompt_upsampling: promptUpsampling,
        safety_tolerance: Math.min(Math.max(safetyTolerance, 0), 1),
        output_quality: Math.min(Math.max(outputQuality, 1), 100)
      };

      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const data = await response.json();
      setGeneration({ assets: { image: data.imageUrl } });
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate content');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClickAway = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowSettings(false);
      setShowPromptGenerator(false);
    }
  };

  // Effects
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length);
    setBackgroundImage(BACKGROUND_IMAGES[randomIndex]);
  }, []);

  useEffect(() => {
    const optimalSettings = getOptimalQualitySettings(aspectRatio);
    setWidth(optimalSettings.width);
    setHeight(optimalSettings.height);
    setOutputQuality(optimalSettings.recommendedQuality);
  }, [aspectRatio]);

  const handleReferenceImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Reference image must be under 10MB');
        return;
      }

      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReferenceImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('Error uploading reference image:', err);
        setError('Failed to upload reference image');
      }
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Overlay */}
      <div className="fixed inset-0 z-0 bg-black/60" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-8">
          {/* Settings Modal */}
          {showSettings && (
            <div 
              className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
              onClick={handleClickAway}
            >
              <div className="bg-black border border-white p-4 sm:p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label htmlFor="model" className="block text-lg mb-2 text-white">AI Model:</label>
                    <select
                      id="model"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-700 bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(MODELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="steps" className="block text-lg mb-2 text-white">Steps:</label>
                    <input type="number" id="steps" value={steps} onChange={(e) => setSteps(Number(e.target.value))} className="w-full p-2 rounded-lg border border-gray-700 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="width" className="block text-lg mb-2 text-white">Width:</label>
                    <input type="number" id="width" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full p-2 rounded-lg border border-gray-700 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="height" className="block text-lg mb-2 text-white">Height:</label>
                    <input type="number" id="height" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full p-2 rounded-lg border border-gray-700 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="guidance" className="block text-lg mb-2 text-white">Guidance:</label>
                    <input type="number" id="guidance" value={guidance} onChange={(e) => setGuidance(Number(e.target.value))} className="w-full p-2 rounded-lg border border-gray-700 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="interval" className="block text-lg mb-2 text-white">Interval:</label>
                    <input type="number" id="interval" value={interval} onChange={(e) => setInterval(Number(e.target.value))} className="w-full p-2 rounded-lg border border-gray-700 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="aspectRatio" className="block text-lg mb-2 text-white">Aspect Ratio:</label>
                    <select 
                      id="aspectRatio" 
                      value={aspectRatio} 
                      onChange={(e) => setAspectRatio(e.target.value)} 
                      className="w-full p-2 rounded-lg border border-gray-700 bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ASPECT_RATIOS.map((ratio) => (
                        <option key={ratio.value} value={ratio.value}>
                          {ratio.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="outputFormat" className="block text-lg mb-2 text-white">Output Format:</label>
                    <select 
                      id="outputFormat" 
                      value="png" 
                      disabled 
                      className="w-full p-2 rounded-lg border border-gray-700 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="png">PNG</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="outputQuality" className="block text-lg mb-2 text-white">
                      Output Quality ({getOptimalQualitySettings(aspectRatio).recommendedQuality}% recommended):
                    </label>
                    <input 
                      type="number" 
                      id="outputQuality" 
                      value={outputQuality} 
                      onChange={(e) => setOutputQuality(Number(e.target.value))}
                      min="1"
                      max="100" 
                      className="w-full p-2 rounded-lg border border-gray-700 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label htmlFor="safetyTolerance" className="block text-lg mb-2 text-white">Safety Tolerance:</label>
                    <input type="number" id="safetyTolerance" value={safetyTolerance} onChange={(e) => setSafetyTolerance(Number(e.target.value))} className="w-full p-2 rounded-lg border border-gray-700 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="promptUpsampling" className="block text-lg mb-2 text-white">Prompt Upsampling:</label>
                    <input type="checkbox" id="promptUpsampling" checked={promptUpsampling} onChange={(e) => setPromptUpsampling(e.target.checked)} className="mr-2" />
                    <span className="text-white">Enable</span>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="block text-lg text-white">Reference Image:</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReferenceImageUpload}
                        className="hidden"
                        id="reference-image-upload"
                      />
                      <label
                        htmlFor="reference-image-upload"
                        className="cursor-pointer py-2 px-4 rounded-lg border border-white text-white hover:bg-white/10 transition-all duration-300"
                      >
                        Upload Image
                      </label>
                      {referenceImage && (
                        <button
                          onClick={() => setReferenceImage(null)}
                          className="py-2 px-4 rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10 transition-all duration-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {referenceImage && (
                      <div className="mt-2">
                        <img
                          src={referenceImage}
                          alt="Reference"
                          className="max-w-[200px] rounded-lg border border-white/20"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Prompt Generator Modal */}
          {showPromptGenerator && (
            <div 
              className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
              onClick={handleClickAway}
            >
              <div 
                className="bg-black border border-white p-4 sm:p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-semibold text-white mb-4">Prompt Generator</h2>
                
                {/* Reference Image Upload */}
                <div className="mb-6">
                  <label className="block text-lg mb-2 text-white">Reference Image:</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      className="hidden"
                      id="prompt-reference-image"
                    />
                    <label
                      htmlFor="prompt-reference-image"
                      className="cursor-pointer py-2 px-4 rounded-lg border border-white text-white hover:bg-white/10 transition-all duration-300"
                    >
                      Upload Reference
                    </label>
                    {uploadedImage && (
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="py-2 px-4 rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10 transition-all duration-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {uploadedImage && (
                    <div className="mt-2">
                      <img
                        src={uploadedImage}
                        alt="Reference"
                        className="max-w-[200px] rounded-lg border border-white/20"
                      />
                    </div>
                  )}
                </div>

                {/* Existing prompt generator content */}
                <div className="space-y-4">
                  {/* Mode Selection */}
                  <div>
                    <label className="block text-lg mb-2 text-white">Mode:</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as 'image' | 'video')}
                      className="w-full p-2 rounded-lg border border-gray-700 bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {MODES.map((modeOption) => (
                        <option key={modeOption.value} value={modeOption.value}>
                          {modeOption.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description Field */}
                  <div>
                    <label htmlFor="description" className="block text-lg mb-2 text-white">Base Description:</label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-700 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder={`Describe your ${mode === 'video' ? 'video' : 'image'}`}
                    />
                  </div>

                  {/* Genre Dropdown */}
                  <div>
                    <label className="block text-lg mb-2 text-black">Genre:</label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-700 bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Genre</option>
                      {Object.entries(GENRES).map(([genreKey, subGenres]) => (
                        <optgroup key={genreKey} label={genreKey.charAt(0).toUpperCase() + genreKey.slice(1)}>
                          {subGenres.map((subGenre) => (
                            <option key={`${genreKey}-${subGenre}`} value={`${genreKey}-${subGenre}`}>
                              {subGenre}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {/* Style Dropdown */}
                  <div>
                    <label className="block text-lg mb-2 text-white">Style:</label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-700 bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Style</option>
                      {STYLES.map((styleOption) => (
                        <option key={styleOption} value={styleOption}>{styleOption}</option>
                      ))}
                    </select>
                  </div>

                  {/* Movie Reference Dropdown */}
                  <div>
                    <label className="block text-lg mb-2 text-white">Movie Reference:</label>
                    <select
                      value={movieReference}
                      onChange={(e) => setMovieReference(e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-700 bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Movie Reference</option>
                      {MOVIES.map((movie) => (
                        <option key={movie} value={movie}>{movie}</option>
                      ))}
                    </select>
                  </div>

                  {/* Book Reference Dropdown */}
                  <div>
                    <label className="block text-lg mb-2 text-white">Book Reference:</label>
                    <select
                      value={bookReference}
                      onChange={(e) => setBookReference(e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-700 bg-black text-white white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Book Reference</option>
                      {BOOKS.map((book) => (
                        <option key={book} value={book}>{book}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={handleGeneratePrompt}
                      disabled={!description || isProcessing}
                      className="flex-1 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 text-xl text-white border border-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Generating...' : 'Generate Prompt'}
                    </button>
                    <button
                      onClick={() => setShowPromptGenerator(false)}
                      className="flex-1 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 text-xl text-white border border-white hover:bg-white/10"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main content area */}
          <div className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 sm:p-4 rounded-lg bg-black/50 text-white border border-white/20 focus:border-white/50 focus:outline-none min-h-[150px]"
              placeholder="Enter your prompt here..."
              rows={6}
              style={{ resize: 'vertical' }}
            />
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleGenerateContent}
                disabled={isProcessing || !prompt.trim()}
                className="flex-1 py-3 px-4 rounded-lg transition-all duration-300 text-white border border-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </button>
              
              <button
                onClick={() => setShowSettings(true)}
                className="flex-1 py-3 px-4 rounded-lg transition-all duration-300 text-white border border-white hover:bg-white/10 text-sm sm:text-base"
              >
                Settings
              </button>
              
              <button
                onClick={() => setShowPromptGenerator(true)}
                className="flex-1 py-3 px-4 rounded-lg transition-all duration-300 text-white border border-white hover:bg-white/10 text-sm sm:text-base"
              >
                Prompt Generator
              </button>
            </div>

            {/* Generated Content Display */}
            <div className="space-y-4">
              <div className="relative min-h-[512px] rounded-lg border border-white/20 bg-black/50 overflow-hidden">
                <GenerationContainer
                  generation={generation}
                  isLoading={isProcessing}
                  isVideo={mode === 'video'}
                />
              </div>
              
              {generation?.assets?.image ? (
                <div className="flex justify-center gap-4 text-white">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 py-2 px-4 rounded-lg text-white border border-white hover:bg-white/10 transition-all duration-300"
                  >
                    <Download size={20} />
                    Download Image
                  </button>
                </div>
              ) : null}

              {/* New Home Button */}
              <div className="flex justify-center">
                <Link 
                  href="/dashboard"
                  className="py-2 px-6 rounded-lg text-white border border-white hover:bg-white/10 transition-all duration-300"
                >
                  Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Single export
export default TextToImagePage;