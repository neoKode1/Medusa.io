import React from 'react';
import { Upload } from 'lucide-react';

interface ModelFeaturesProps {
  model: string;
  onImageUpload?: (file: File) => void;
}

export const ModelFeatures: React.FC<ModelFeaturesProps> = ({ model, onImageUpload }) => {
  const isStructuralModel = model.includes('Canny') || model.includes('Depth');
  const isVariationModel = model.includes('Redux');

  if (!isStructuralModel && !isVariationModel) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) onImageUpload(file);
  };

  return (
    <div className="mt-4">
      <label className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
        <Upload size={20} />
        {isStructuralModel ? 'Upload Reference Image' : 'Upload Image for Variation'}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );
}; 