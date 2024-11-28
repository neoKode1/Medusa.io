import type { ModelFeatures } from '../types';

// Define the model features interface
interface ModelConfig {
  name: string;
  id: string;
  endpoint?: string;
  description: string;
  features: {
    maxResolution?: string;
    steps?: number;
    aspectRatios: string[];
    generation_time?: string;
    isVideo?: boolean;
    requiresImage?: boolean;
    durations?: string[];
  }
}

// Define all available models
export const MODELS: Record<string, ModelConfig> = {
  fluxProUltra: {
    name: "FLUX 1.1 Pro Ultra",
    id: "black-forest-labs/flux-1.1-pro-ultra",
    endpoint: "predictions",
    description: "Fastest FLUX Pro with superior image quality",
    features: {
      maxResolution: "2048x2048",
      steps: 25,
      aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:2", "21:9"],
      generation_time: "~10s"
    }
  },
  fluxPro: {
    name: "FLUX Pro",
    id: "black-forest-labs/flux-pro",
    description: "State-of-the-art image generation with top quality and detail",
    features: {
      maxResolution: "2048x2048",
      steps: 25,
      aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:2", "21:9"]
    }
  },
  klingVideo: {
    name: "Kling Video",
    id: "fal-ai/kling-video/v1.5/pro/image-to-video",
    description: "Image to video generation",
    features: {
      aspectRatios: ["16:9", "9:16", "1:1"],
      durations: ["5", "10"],
      isVideo: true,
      requiresImage: true
    }
  }
};

// Add type definitions
export interface VideoGenerationInput {
  prompt: string;
  reference_image: string;
  duration: "5" | "10";
  aspect_ratio: string;
}

export interface VideoGenerationResponse {
  video_url?: string;
  error?: string;
}

// Helper functions
export function isVideoModel(model: string): boolean {
  const isVideo = MODELS[model]?.features.isVideo ?? false;
  console.log('🎥 Checking if video model:', { model, isVideo });
  return isVideo;
}

export function requiresReferenceImage(model: string): boolean {
  const requires = MODELS[model]?.features.requiresImage ?? false;
  console.log('🖼️ Checking if reference image required:', { model, requires });
  return requires;
}

export function getSupportedAspectRatios(model: string): string[] {
  return MODELS[model]?.features.aspectRatios ?? ["1:1"];
}

export function getModelDurations(model: string): string[] {
  return MODELS[model]?.features.durations ?? [];
}

// Add helper function with logging
export function getModelConfig(modelId: string): ModelConfig | undefined {
  console.log('🔍 Getting model config:', {
    modelId,
    exists: !!MODELS[modelId],
    features: MODELS[modelId]?.features
  });
  return MODELS[modelId];
} 