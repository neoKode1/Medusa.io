import React, { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { debounce } from 'lodash';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { validateAndEnhancePrompt } from '../constants/promptGuide';

const BlackHoleVisualization = dynamic(() => import('@/components/BlackHoleVisualization'), {
  ssr: false,
});

const MODES = [
  { value: 'image', label: 'Image Generation' },
  { value: 'video', label: 'Video Generation' }
];

const GENRES = {
  fantasy: ['High Fantasy', 'Urban Fantasy', 'Dark Fantasy', 'Fairy Tale', 'Sword & Sorcery', 'Mythological'],
  scifi: ['Space Opera', 'Cyberpunk', 'Post-Apocalyptic', 'Hard Sci-Fi', 'Time Travel', 'Dystopian', 'First Contact'],
  horror: ['Gothic', 'Cosmic Horror', 'Psychological Horror', 'Body Horror', 'Folk Horror', 'Supernatural'],
  historical: ['Medieval', 'Renaissance', 'Victorian', 'Ancient Civilizations', 'World Wars'],
  mystery: ['Film Noir', 'Detective', 'Thriller', 'Crime Drama', 'Espionage'],
  romance: ['Period Romance', 'Contemporary', 'Paranormal Romance', 'Romantic Comedy'],
  western: ['Classic Western', 'Spaghetti Western', 'Modern Western', 'Weird West'],
  adventure: ['Epic Adventure', 'Exploration', 'Lost World', 'Treasure Hunt', 'Maritime'],
  drama: ['Period Drama', 'Social Commentary', 'Slice of Life', 'Coming of Age'],
  comedy: ['Slapstick', 'Dark Comedy', 'Satire', 'Parody', 'Absurdist']
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
  'Blade Runner',
  'The Matrix',
  'Lord of the Rings',
  'Star Wars',
  'Inception',
  'Alien',
  'The Godfather',
  'Jurassic Park',
  'Avatar',
  'Interstellar',
  'Mad Max: Fury Road',
  'The Fifth Element',
  'Ex Machina',
  'Akira',
  'Ghost in the Shell'
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
  'stability-ai/sdxl': 'Stable Diffusion XL',
  'stability-ai/stable-diffusion-xl-base-1.0': 'Stable Diffusion XL 1.0',
  'stability-ai/stable-diffusion-3.5-large': 'Stable Diffusion 3.5',
  'recraft-ai/recraft-v3': 'Recraft V3',
  'luma-ai': 'Luma AI (Video)'
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

const TextToImagePage: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<string>('black-forest-labs/flux-dev');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [steps, setSteps] = useState<number>(25);
  const [width, setWidth] = useState<number>(512);
  const [height, setHeight] = useState<number>(512);
  const [guidance, setGuidance] = useState<number>(3);
  const [interval, setInterval] = useState<number>(2);
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [outputFormat, setOutputFormat] = useState<string>('png');
  const [outputQuality, setOutputQuality] = useState<number>(80);
  const [safetyTolerance, setSafetyTolerance] = useState<number>(2);
  const [promptUpsampling, setPromptUpsampling] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [genre, setGenre] = useState<string>('');
  const [movieReference, setMovieReference] = useState<string>('');
  const [bookReference, setBookReference] = useState<string>('');
  const [style, setStyle] = useState<string>('');
  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [showPromptGenerator, setShowPromptGenerator] = useState<boolean>(false);
  const [scheduler, setScheduler] = useState<string>('K_EULER_ANCESTRAL');
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length);
    setBackgroundImage(BACKGROUND_IMAGES[randomIndex]);
  }, []);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File is too large. Please use an image under 10MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setUploadedImage(e.target.result as string);
        }
      };
      reader.onerror = () => {
        setError('Failed to read file');
      };
      reader.readAsDataURL(file);
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

  const handleGenerateVideo = async (enhancedPrompt: string) => {
    console.log('Starting video generation with prompt:', enhancedPrompt);
    try {
      if (uploadedImage) {
        const base64Size = uploadedImage.length * 0.75;
        console.log('Uploaded image size (base64):', base64Size);
        if (base64Size > 10 * 1024 * 1024) {
          throw new Error('Image file is too large. Please use an image under 10MB.');
        }
      }

      const response = await fetch('/api/lumaai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          keyframes: uploadedImage ? {
            frame0: {
              type: "image",
              url: uploadedImage
            }
          } : undefined,
        }),
      });

      console.log('Video generation response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Video generation error response:', errorData);
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Video generated successfully:', data.videoUrl);
      setGeneratedVideo(data.videoUrl);
      setGeneratedContent(data.videoUrl); // Set both video and content
    } catch (error) {
      console.error('Video generation error:', error);
      throw error; // Re-throw to be handled by handleGenerateContent
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
          mode
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
    if (!generatedContent) return;

    try {
      const response = await fetch(generatedContent);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-${mode === 'video' ? 'video.mp4' : 'image.png'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download file');
    }
  };

  const handleGenerateContent = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      let response;
      if (mode === 'video') {
        response = await fetch('/api/lumaai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
      } else {
        response = await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            model_id: model,
            steps: Number(steps),
            width: Number(width),
            height: Number(height),
            guidance: Number(guidance),
            scheduler: model.includes('flux') ? scheduler : undefined,
            output_format: 'png',
            output_quality: 100,
            reference_image: referenceImage
          }),
        });
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      if (mode === 'video') {
        setGeneratedVideo(data.videoUrl);
        setGeneratedContent(null);
      } else {
        setGeneratedContent(data.imageUrl);
        setGeneratedVideo(null);
      }
    } catch (error) {
      console.error('Generation error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
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

  const handleReferenceImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Reference image is too large. Please use an image under 10MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setReferenceImage(e.target.result as string);
        }
      };
      reader.onerror = () => {
        setError('Failed to read reference image');
      };
      reader.readAsDataURL(file);
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
      <div className="relative z-10 p-4 sm:p-8 max-w-7xl mx-auto">
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
                    className="w-full p-2 rounded-lg border border-gray-700 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <select id="aspectRatio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full p-2 rounded-lg border border-gray-700 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="custom">Custom</option>
                    <option value="1:1">1:1</option>
                    <option value="16:9">16:9</option>
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
                  <label htmlFor="outputQuality" className="block text-lg mb-2 text-white">Output Quality:</label>
                  <input type="number" id="outputQuality" value={outputQuality} onChange={(e) => setOutputQuality(Number(e.target.value))} className="w-full p-2 rounded-lg border border-gray-700 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
            <div className="bg-black border border-white p-4 sm:p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold text-white mb-4">Prompt Generator</h2>
              <div className="space-y-4">
                {/* Mode Selection */}
                <div>
                  <label className="block text-lg mb-2 text-white">Mode:</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as 'image' | 'video')}
                    className="w-full p-2 rounded-lg border border-gray-700 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-lg mb-2 text-white">Genre:</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full p-2 rounded-lg border border-gray-700 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full p-2 rounded-lg border border-gray-700 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full p-2 rounded-lg border border-gray-700 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full p-2 rounded-lg border border-gray-700 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full p-3 sm:p-4 rounded-lg bg-black/50 text-white border border-white/20 focus:border-white/50 focus:outline-none min-h-[100px]"
            placeholder="Enter your prompt here..."
          />
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGenerateContent}
              disabled={!prompt || isProcessing}
              className="flex-1 py-3 px-4 rounded-lg transition-all duration-300 text-white border border-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isProcessing ? 'Generating...' : 'Generate'}
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
          {(generatedContent || generatedVideo || isProcessing) && (
            <div className="mt-8 p-4 rounded-lg bg-black/50 border border-white/20">
              {isProcessing ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="w-8 h-8 animate-spin text-white" />
                </div>
              ) : (
                <div className="space-y-4">
                  {mode === 'video' && generatedVideo ? (
                    <video
                      controls
                      className="w-full max-w-2xl mx-auto rounded-lg"
                      src={generatedVideo}
                    />
                  ) : generatedContent ? (
                    <img
                      src={generatedContent}
                      alt="Generated content"
                      className="w-full max-w-2xl mx-auto rounded-lg"
                    />
                  ) : null}
                  
                  {(generatedContent || generatedVideo) && (
                    <div className="flex justify-center">
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 py-2 px-4 rounded-lg text-white border border-white hover:bg-white/10 transition-all duration-300"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-500">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextToImagePage;