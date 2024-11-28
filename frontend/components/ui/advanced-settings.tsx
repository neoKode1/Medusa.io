import React from 'react';

interface AdvancedSettingsProps {
  model: string;
  modelOptions: any;
  onOptionsChange: (options: any) => void;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  model,
  modelOptions,
  onOptionsChange
}) => {
  const isFluxModel = model.includes('FLUX');
  const isStructuralModel = model.includes('Canny') || model.includes('Depth');
  const isVariationModel = model.includes('Redux');

  return (
    <div className="space-y-6">
      {/* Common FLUX Settings */}
      {isFluxModel && (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/70 block mb-2">Quality Preset</label>
            <select
              value={modelOptions.quality || 'standard'}
              onChange={(e) => onOptionsChange({ ...modelOptions, quality: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 text-white rounded-lg border border-white/10"
            >
              <option value="standard">Standard</option>
              <option value="ultra">Ultra</option>
              <option value="raw">Raw</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-white/70 block mb-2">
              Safety Tolerance: {modelOptions.safety_tolerance || 2}
            </label>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={modelOptions.safety_tolerance || 2}
              onChange={(e) => onOptionsChange({ ...modelOptions, safety_tolerance: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-white/70 block mb-2">Output Format</label>
            <select
              value={modelOptions.output_format || 'jpg'}
              onChange={(e) => onOptionsChange({ ...modelOptions, output_format: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 text-white rounded-lg border border-white/10"
            >
              <option value="jpg">JPG</option>
              <option value="png">PNG</option>
            </select>
          </div>
        </div>
      )}

      {/* Structural Model Settings */}
      {isStructuralModel && (
        <div className="space-y-4">
          {model.includes('Canny') && (
            <div>
              <label className="text-sm text-white/70 block mb-2">
                Detection Resolution: {modelOptions.detect_resolution || 512}px
              </label>
              <input
                type="range"
                min={256}
                max={1024}
                step={64}
                value={modelOptions.detect_resolution || 512}
                onChange={(e) => onOptionsChange({ ...modelOptions, detect_resolution: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>
          )}

          {model.includes('Depth') && (
            <div>
              <label className="text-sm text-white/70 block mb-2">
                Depth Map Strength: {modelOptions.depth_map_strength?.toFixed(2) || 0.5}
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={modelOptions.depth_map_strength || 0.5}
                onChange={(e) => onOptionsChange({ ...modelOptions, depth_map_strength: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>
          )}
        </div>
      )}

      {/* Variation Model Settings */}
      {isVariationModel && (
        <div>
          <label className="text-sm text-white/70 block mb-2">
            Variation Strength: {modelOptions.variation_strength?.toFixed(2) || 0.75}
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={modelOptions.variation_strength || 0.75}
            onChange={(e) => onOptionsChange({ ...modelOptions, variation_strength: Number(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </div>
      )}

      {/* Non-FLUX Model Settings */}
      {!isFluxModel && (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/70 block mb-2">
              Guidance Scale: {modelOptions.guidance_scale || 7.5}
            </label>
            <input
              type="range"
              min={1}
              max={20}
              step={0.5}
              value={modelOptions.guidance_scale || 7.5}
              onChange={(e) => onOptionsChange({ ...modelOptions, guidance_scale: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-white/70 block mb-2">
              Inference Steps: {modelOptions.num_inference_steps || 50}
            </label>
            <input
              type="range"
              min={20}
              max={100}
              step={1}
              value={modelOptions.num_inference_steps || 50}
              onChange={(e) => onOptionsChange({ ...modelOptions, num_inference_steps: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};