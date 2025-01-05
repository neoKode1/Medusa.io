declare module '@/constants/models' {
  import { Model, ModelName, VideoMode, LoraWeight, ModelFeatures } from '../constants/models';
  export { Model, ModelName, VideoMode, LoraWeight, ModelFeatures };
  export const MODELS: Record<ModelName, Model>;
  export const isVideoModel: (model: ModelName) => boolean;
}

declare module '@/types/api' {
  export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    error?: string;
  }

  export interface ImageResponse {
    url: string;
    width: number;
    height: number;
    content_type: string;
    id: string;
  }

  export interface VideoResponse {
    url: string;
    id: string;
  }

  export interface TrainingResponse {
    model_id: string;
    files?: {
      lora?: string;
      config?: string;
    };
    status: string;
    id: string;
  }

  export const handleApiError: (error: any) => ApiResponse;
  export const createApiResponse: <T>(data: T) => ApiResponse<T>;
} 