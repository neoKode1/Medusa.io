import React, { useState } from 'react';
import { 
  RefreshCw as RotateCw,
  UploadIcon as Upload,
  HomeIcon} from 'lucide-react';
import { MODELS, ModelName } from '@/constants/models';
import Link from 'next/link';
import ModelCard from '@/components/ui/ModelCard';

const MODEL_CATEGORIES = {
  'Text to Image': [
    'FLUX 1.1 Pro Ultra',
    'FLUX 1.1 Pro',
    'FLUX 1 Pro',
    'FLUX 1 Dev',
    'FLUX Realism',
  ],
  'Specialized': [
    'FLUX LoRA Fill',
    'FLUX Inpainting',
    'FLUX Pro Redux'
  ]
} as const;

const MedusaPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<ModelName>('FLUX 1.1 Pro Ultra');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsProcessing(true);
    setGeneratedImage(null);
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model }),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const data = await response.json();
      if (data.success && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row">
      {/* Side Panel for Models */}
      <div className="w-full lg:w-80 border-b lg:border-r border-white/5 
                      h-auto lg:h-screen static lg:sticky top-0 
                      overflow-hidden hover:overflow-y-auto transition-all">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <HomeIcon size={24} className="text-white/80" />
            </Link>
          </div>

          <h2 className="text-xl font-medium text-white/80 mb-6">Available Models</h2>
          
          {Object.entries(MODEL_CATEGORIES).map(([category, models]) => (
            <div key={category} className="mb-8">
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">{category}</h3>
              <div className="space-y-2">
                {models.map((modelName) => (
                  <ModelCard
                    key={modelName}
                    name={modelName as ModelName}
                    isSelected={model === modelName}
                    onSelect={() => setModel(modelName as ModelName)}
                    features={MODELS[modelName as ModelName].features}
                    description={MODELS[modelName as ModelName].description}
                    speed={MODELS[modelName as ModelName].speed}
                    quality={MODELS[modelName as ModelName].quality}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-6">
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
            <h1 className="text-4xl font-bold text-white mb-4">What image do you want to create?</h1>
            <p className="text-white/60">Generate stunning images with AI</p>
          </div>

          <div className="border border-white/10 rounded-xl p-8">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create..."
              className="w-full h-40 bg-transparent text-white/90 rounded-lg p-4 resize-none 
                       focus:outline-none focus:ring-1 focus:ring-blue-500/50 mb-4 
                       border border-white/10 placeholder-white/30 text-lg"
            />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 border border-white/10 text-white/80 rounded-lg hover:bg-white/5 transition-all flex items-center gap-2">
                  <Upload size={18} />
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
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isProcessing}
                className={`px-6 py-3 rounded-lg transition-all duration-200 
                         flex items-center gap-2
                         ${isProcessing || !prompt.trim() 
                           ? 'border border-white/10 text-white/50 cursor-not-allowed' 
                           : 'bg-blue-500 hover:bg-blue-600'} 
                         text-white font-medium`}
              >
                {isProcessing ? (
                  <>
                    <RotateCw className="animate-spin" size={18} />
                    <span>Processing...</span>
                  </>
                ) : (
                  'Generate Image'
                )}
              </button>
            </div>
          </div>

          {generatedImage && (
            <div className="mt-8 border border-white/10 rounded-xl p-6">
              <img 
                src={generatedImage} 
                alt={prompt}
                className="w-full rounded-lg mb-4"
              />
              <div className="flex justify-center">
                <a
                  href={generatedImage}
                  download="generated-image.png"
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
                  Download Image
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedusaPage;