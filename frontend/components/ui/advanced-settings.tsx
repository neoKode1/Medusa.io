import React from 'react';
import { Slider } from './slider';
import { Label } from './label';
import { MODELS, ModelName } from '@/constants/models';

interface ModelSettings {
  steps?: number;
  guidance_scale?: number;
  seed?: number;
  [key: string]: number | undefined;
}

interface AdvancedSettingsProps {
  selectedModel: ModelName;
  onSettingsChange: (settings: ModelSettings) => void;
}

export function AdvancedSettings({ selectedModel, onSettingsChange }: AdvancedSettingsProps) {
  const modelConfig = MODELS[selectedModel];

  const handleStepsChange = (value: number[]) => {
    onSettingsChange({ steps: value[0] });
  };

  if (!modelConfig?.features.steps) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Steps ({modelConfig.features.steps})</Label>
        <Slider
          value={[modelConfig.features.steps]}
          max={50}
          min={10}
          step={1}
          onValueChange={handleStepsChange}
        />
      </div>
    </div>
  );
}