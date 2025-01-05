import type { LoraWeight } from '@/constants/models';

export interface ModelFeatures {
  maxResolution?: string;
  rawMode?: boolean;
  ultraDetail?: boolean;
  aspectRatios?: string[];
  portraitMode?: boolean;
  isVideo?: boolean;
  duration?: string[];
}

export interface Generation {
  assets: {
    image?: string;
    video?: string;
  };
  metadata?: {
    model: string;
    prompt: string;
    aspectRatio?: string;
    duration?: string;
  };
  imageUrl?: string;
}

export interface ModelOptions {
  width?: number;
  height?: number;
  quality?: number;
  reference_image?: string;
  loras?: LoraWeight[];
  [key: string]: any;
}

export interface GenerationState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  imageUrl?: string;
  id?: string;
  processingTime?: number;
} 