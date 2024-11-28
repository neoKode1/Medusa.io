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
} 