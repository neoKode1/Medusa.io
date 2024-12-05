import React from 'react';
import { VideoModelName } from '@/types/video';

interface ModelSelectorProps {
  mode: 'text-to-video' | 'image-to-video';
  selectedModel: VideoModelName;
  onModelSelect: (model: VideoModelName) => void;
  VIDEO_MODEL_CATEGORIES: Record<string, string[]>;
  isGenerating: boolean;
  MODELS: Record<VideoModelName, {
    description: string;
    features: string[];
    speed: 'Fast' | 'Medium' | 'Slow';
    quality: 'Standard' | 'High' | 'Ultra';
  }>;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  mode,
  selectedModel,
  onModelSelect,
  VIDEO_MODEL_CATEGORIES,
  isGenerating,
  MODELS
}) => {
  // Helper function to check if a model is compatible with current mode
  const isModelCompatible = (modelName: string): boolean => {
    const isI2VModel = modelName.includes('I2V') || 
                      modelName === 'Live Portrait' || 
                      modelName === 'SadTalker' || 
                      modelName === 'Stable Video';
    
    return mode === 'image-to-video' ? isI2VModel : !isI2VModel;
  };

  return (
    <div className="grid grid-cols-1 gap-4 mb-6">
      <h3 className="text-lg font-medium text-white/80 mb-2">Available Models</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(VIDEO_MODEL_CATEGORIES).map(([category, models]) => (
          <div key={category} className="space-y-4">
            <h4 className="text-white/70 text-sm font-medium">{category}</h4>
            {models.map((modelName) => {
              const isCompatible = isModelCompatible(modelName);
              return (
                <button
                  key={modelName}
                  onClick={() => isCompatible && onModelSelect(modelName as VideoModelName)}
                  className={`w-full p-4 rounded-lg border transition-all ${
                    selectedModel === modelName
                      ? 'border-blue-500 bg-blue-500/10'
                      : isCompatible
                      ? 'border-white/10 hover:border-white/20'
                      : 'border-white/5 opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!isCompatible || (isGenerating && selectedModel !== modelName)}
                  title={!isCompatible ? `This model is not available in ${mode} mode` : ''}
                >
                  <div className="text-left">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium">{modelName}</h4>
                      {!isCompatible && (
                        <span className="text-xs text-white/40 px-2 py-1 bg-white/5 rounded">
                          {mode === 'text-to-video' ? 'I2V Only' : 'T2V Only'}
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 text-sm mt-1">
                      {MODELS[modelName as VideoModelName]?.description || 'Advanced video generation model'}
                    </p>
                    {isCompatible && (
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          MODELS[modelName as VideoModelName]?.speed === 'Fast' 
                            ? 'bg-green-500/20 text-green-300'
                            : MODELS[modelName as VideoModelName]?.speed === 'Medium'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {MODELS[modelName as VideoModelName]?.speed}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          MODELS[modelName as VideoModelName]?.quality === 'Ultra'
                            ? 'bg-purple-500/20 text-purple-300'
                            : MODELS[modelName as VideoModelName]?.quality === 'High'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-gray-500/20 text-gray-300'
                        }`}>
                          {MODELS[modelName as VideoModelName]?.quality}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector; 