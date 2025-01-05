export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export interface TrainingResponse {
  model_id: string;
  files: {
    lora: string;
    config: string;
  };
  status: 'completed' | 'failed' | 'processing';
  id: string;
}

export interface GenerationResponse {
  url: string;
  id: string;
}

export interface VideoResponse {
  id: string;
  status: string;
  url?: string;
}

export interface PromptResponse {
  enhanced_prompt: string;
  original_input: {
    subject: string;
    style?: string;
    mood?: string;
    movieRef?: string;
    bookRef?: string;
    genreRef?: string;
  };
}

export function createApiResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data
  };
}

export function handleApiError(error: Error & { body?: unknown }): ApiResponse {
  console.error('API Error:', error);
  
  return {
    success: false,
    error: {
      message: error.message || 'An unexpected error occurred',
      details: error.body || error.stack
    }
  };
} 