import React from 'react';

interface ModelFeatures {
  aspectRatios?: string[];
  durations?: string[];
  maxSteps?: number;
  maxGuidance?: number;
  generation_time?: string;
  isVideo?: boolean;
  requiresImage?: boolean;
}

interface ModelCardProps<T extends string> {
  name: T;
  isSelected: boolean;
  onSelect: (model: T) => void;
  features: string[] | ModelFeatures;
  description: string;
  speed: 'Fast' | 'Medium' | 'Slow';
  quality: 'Standard' | 'High' | 'Ultra';
}

export const ModelCard = <T extends string>({
  name,
  isSelected,
  onSelect,
  features,
  description,
  speed,
  quality
}: ModelCardProps<T>) => {
  const speedColor = {
    Fast: 'text-green-400',
    Medium: 'text-yellow-400',
    Slow: 'text-red-400'
  }[speed];

  // Convert features object to array if needed
  const featureList = Array.isArray(features) 
    ? features 
    : [
        ...(features.aspectRatios ? [`Supports: ${features.aspectRatios.join(', ')}`] : []),
        ...(features.durations ? [`Duration: ${features.durations.join(', ')}s`] : []),
        ...(features.maxSteps ? [`Max Steps: ${features.maxSteps}`] : []),
        ...(features.maxGuidance ? [`Max Guidance: ${features.maxGuidance}`] : []),
        ...(features.generation_time ? [`Generation Time: ${features.generation_time}`] : []),
        ...(features.isVideo ? ['Video Generation'] : []),
        ...(features.requiresImage ? ['Requires Reference Image'] : [])
      ];

  return (
    <button
      onClick={() => onSelect(name)}
      className={`w-full p-3 rounded-lg transition-all duration-200 text-left border
        ${isSelected 
          ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-black' 
          : 'hover:ring-2 hover:ring-white hover:ring-offset-2 hover:ring-offset-black'}
      `}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg">{name}</h3>
          <div className="text-sm font-medium">{quality}</div>
        </div>

        <p className="text-sm text-gray-400 mb-4">{description}</p>

        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm ${speedColor}`}>{speed} Generation</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {featureList.map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white/10 rounded-full text-xs"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
};

export default ModelCard; 