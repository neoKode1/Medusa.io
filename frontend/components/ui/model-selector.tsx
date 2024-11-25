import React, { useState } from 'react';
import { RefreshCw, Image, Wand2, Layers } from 'lucide-react';
import { MODELS } from '@/constants/models';

interface ModelSelectorProps {
  onModelSelect: (modelName: string) => void;
  currentModel: string;
}

// Group models by category
const MODEL_CATEGORIES = {
  'Text to Image': ['FLUX 1.1 Pro Ultra', 'FLUX 1.1 Pro', 'FLUX 1 Pro', 'FLUX 1 Dev'],
  'Structural Conditioning': ['FLUX Canny Pro', 'FLUX Depth Pro'],
  'Image Variation': ['FLUX Redux Pro Ultra', 'FLUX Redux Pro'],
  'Other': ['Stable Diffusion XL', 'OpenJourney']
};

export const ModelSelector: React.FC<ModelSelectorProps> = ({ onModelSelect, currentModel }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Text to Image':
        return <Image size={16} />;
      case 'Structural Conditioning':
        return <Layers size={16} />;
      case 'Image Variation':
        return <Wand2 size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-runway-gray rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors"
      >
        <span>{currentModel}</span>
        <RefreshCw 
          size={16} 
          className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      {isOpen && (
        <div className="absolute w-80 mt-2 bg-runway-gray rounded-lg border border-white/10 shadow-xl z-50 max-h-96 overflow-y-auto">
          {Object.entries(MODEL_CATEGORIES).map(([category, models]) => (
            <div key={category}>
              <div className="px-4 py-2 bg-black/20 flex items-center gap-2">
                {getCategoryIcon(category)}
                <span className="text-sm text-white/70">{category}</span>
              </div>
              {models.map((modelName) => (
                <button
                  key={modelName}
                  onClick={() => {
                    onModelSelect(modelName);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center gap-2
                    ${modelName === currentModel ? 'text-blue-400 bg-white/5' : 'text-white'}
                  `}
                >
                  <span>{modelName}</span>
                  {modelName.includes('Ultra') && (
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full ml-auto">
                      Ultra
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 