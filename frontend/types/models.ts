import { VideoMode } from '../constants/models';

export interface ModelFeatures {
  maxResolution?: string;
  steps?: number;
  aspectRatios: string[];
  isVideo: boolean;
  requiresImage: boolean;
  durations?: string[];
  supportsLora?: boolean;
  mode?: VideoMode;
  motionBuckets?: string[];
} 