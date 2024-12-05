export type VideoModelName = 
  // Text to Video Models
  | 'Minimax'
  | 'Haiper V2'
  | 'Kling Pro'
  | 'CogVideo-X'
  | 'Hunyuan'
  | 'LTX'
  | 'Fast SVD'
  | 'T2V Turbo'
  | 'Luma Dream'
  | 'Mochi V1'
  | 'AnimateDiff Turbo'
  // Image to Video Models
  | 'Minimax I2V'
  | 'Haiper I2V'
  | 'CogVideo-X I2V'
  | 'LTX I2V'
  | 'Stable Video'
  | 'Kling I2V Pro'
  | 'Luma I2V'
  | 'Live Portrait'
  | 'SadTalker';

export interface ModelConfig {
  description: string;
  features: string[];
  speed: 'Fast' | 'Medium' | 'Slow';
  quality: 'Standard' | 'High' | 'Ultra';
} 