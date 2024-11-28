import type { ModelFeatures } from '../types';

// Define the model features interface
interface ModelConfig extends ModelFeatures {
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
const MODELS: Record<string, ModelConfig> = {
  fluxProUltra: {
    name: "FLUX 1.1 Pro Ultra",
    id: "fal-ai/flux-pro/v1.1-ultra",
    description: "Fastest FLUX Pro with superior image quality",
    features: {
      maxResolution: "2048x2048",
      steps: 25,
      aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:2", "21:9"],
      generation_time: "~10s"
    }
  },
  flux11Pro: {
    name: "FLUX 1.1 Pro",
    id: "fal-ai/flux-pro/v1.1",
    description: "High-quality image generation",
    features: {
      aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:2"]
    }
  },
  flux1Pro: {
    name: "FLUX 1 Pro",
    id: "fal-ai/flux-pro/v1",
    description: "Professional image generation",
    features: {
      aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:2"]
    }
  },
  flux1Dev: {
    name: "FLUX 1 Dev",
    id: "fal-ai/flux/dev",
    description: "Development version of FLUX",
    features: {
      aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:2"]
    }
  },
  fluxRealism: {
    name: "FLUX Realism",
    id: "fal-ai/flux-realism",
    description: "Optimized for realistic image generation",
    features: {
      aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:2"]
    }
  },
  fluxLoraFill: {
    name: "FLUX LoRA Fill",
    id: "fal-ai/flux-lora-fill",
    description: "LoRA-based image filling",
    features: {
      aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:2"],
      requiresImage: true
    }
  },
  fluxInpainting: {
    name: "FLUX Inpainting",
    id: "fal-ai/flux-inpainting",
    description: "Image inpainting capabilities",
    features: {
      aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:2"],
      requiresImage: true
    }
  },
  fluxProRedux: {
    name: "FLUX Pro Redux",
    id: "fal-ai/flux-pro/redux",
    description: "Enhanced image generation with Redux",
    features: {
      aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:2"]
    }
  },
  fluxCannyPro: {
    name: "FLUX Canny Pro",
    id: "fal-ai/flux-canny-pro",
    description: "Edge-based image generation",
    features: {
      aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:2"],
      requiresImage: true
    }
  },
  fluxDepthPro: {
    name: "FLUX Depth Pro",
    id: "fal-ai/flux-depth-pro",
    description: "Depth-aware image generation",
    features: {
      aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:2"],
      requiresImage: true
    }
  },
  fluxReduxProUltra: {
    name: "FLUX Redux Pro Ultra",
    id: "fal-ai/flux-pro/redux-ultra",
    description: "Ultimate Redux-based image generation",
    features: {
      aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:2"]
    }
  },
  fluxReduxPro: {
    name: "FLUX Redux Pro",
    id: "fal-ai/flux-pro/redux",
    description: "Professional Redux-based generation",
    features: {
      aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:2"]
    }
  },
  sdxl: {
    name: "Stable Diffusion XL",
    id: "fal-ai/stable-diffusion-xl",
    description: "Stable Diffusion XL model",
    features: {
      aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:2"]
    }
  },
  klingVideo: {
    name: "Kling Video",
    id: "fal-ai/kling-video",
    description: "Image to video generation",
    features: {
      aspectRatios: ["16:9", "9:16", "1:1"],
      durations: ["5", "10"],
      isVideo: true,
      requiresImage: true
    }
  },
  lumaDreamMachine: {
    name: "Luma Dream Machine",
    id: "fal-ai/luma-dream-machine",
    description: "Advanced dream-like image generation",
    features: {
      aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:2"]
    }
  }
};

export default MODELS;

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
  return MODELS[model]?.features.isVideo ?? false;
}

export function requiresReferenceImage(model: string): boolean {
  return MODELS[model]?.features.requiresImage ?? false;
}

export function getSupportedAspectRatios(model: string): string[] {
  return MODELS[model]?.features.aspectRatios ?? ["1:1"];
}

export function getModelDurations(model: string): string[] {
  return MODELS[model]?.features.durations ?? [];
} 