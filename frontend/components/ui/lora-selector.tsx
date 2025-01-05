import React, { useState } from 'react';
import type { LoraWeight } from '@/constants/models';

interface LoraSelectorProps {
  onLoraChange: (loras: LoraWeight[]) => void;
}

export const LoraSelector: React.FC<LoraSelectorProps> = ({ onLoraChange }) => {
  const [loras, setLoras] = useState<LoraWeight[]>([]);

  const handleAddLora = () => {
    const newLora: LoraWeight = {
      path: '',
      scale: 1.0
    };
    const updatedLoras = [...loras, newLora];
    setLoras(updatedLoras);
    onLoraChange(updatedLoras);
  };

  const handleRemoveLora = (index: number) => {
    const updatedLoras = loras.filter((_, i) => i !== index);
    setLoras(updatedLoras);
    onLoraChange(updatedLoras);
  };

  const handleLoraChange = (index: number, field: keyof LoraWeight, value: string | number) => {
    const updatedLoras = loras.map((lora, i) => {
      if (i === index) {
        return { ...lora, [field]: value };
      }
      return lora;
    });
    setLoras(updatedLoras);
    onLoraChange(updatedLoras);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-white text-lg font-medium">LoRA Models</h3>
        <button
          onClick={handleAddLora}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Add LoRA
        </button>
      </div>

      {loras.map((lora, index) => (
        <div key={index} className="flex gap-4 items-center bg-black/20 p-4 rounded-lg">
          <div className="flex-grow">
            <input
              type="text"
              value={lora.path}
              onChange={(e) => handleLoraChange(index, 'path', e.target.value)}
              placeholder="LoRA path (e.g., stabilityai/sd-vae-ft-mse)"
              className="w-full px-3 py-2 bg-black/30 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div className="w-24">
            <input
              type="number"
              value={lora.scale}
              onChange={(e) => handleLoraChange(index, 'scale', parseFloat(e.target.value))}
              step="0.1"
              min="0"
              max="2"
              className="w-full px-3 py-2 bg-black/30 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <button
            onClick={() => handleRemoveLora(index)}
            className="p-2 text-red-500 hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>
      ))}

      {loras.length === 0 && (
        <p className="text-white/50 text-sm">No LoRA models added. Click &quot;Add LoRA&quot; to start.</p>
      )}
    </div>
  );
}; 