import React from 'react';

const MODEL_CATEGORIES = {
  'Text to Image': [
    'FLUX 1.1 Pro Ultra',
    'FLUX 1.1 Pro', 
    'FLUX 1 Pro',
    'FLUX 1 Dev',
    'FLUX Realism',      // Added @fal-ai/flux-realism
    'FLUX LoRA Fill',    // Added @fal-ai/flux-lora-fill
    'FLUX Inpainting',   // Added @fal-ai/flux-lora/inpainting
    'FLUX Pro Redux'     // Added @fal-ai/flux-pro/v1.1-ultra/redux
  ],
  'Structural Conditioning': [
    'FLUX Canny Pro',
    'FLUX Depth Pro'
  ],
  'Image Variation': [
    'FLUX Redux Pro Ultra',
    'FLUX Redux Pro'
  ],
  'Other': [
    'Stable Diffusion XL',
    'Kling Video'
  ]
};

interface ModelSelectorProps {
  currentModel: string;
  onModelSelect: (model: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  currentModel,
  onModelSelect
}) => {
  return (
    <select
      value={currentModel}
      onChange={(e) => onModelSelect(e.target.value)}
      className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-white/20 transition-colors"
    >
      {Object.entries(MODEL_CATEGORIES).map(([category, models]) => (
        <optgroup key={category} label={category}>
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}; 