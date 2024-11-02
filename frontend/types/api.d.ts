export interface ApiResponse {
  imageUrl?: string;
  videoUrl?: string;
  error?: string;
  requestId?: string;
}

export interface GeneratePromptResponse {
  enhanced_prompt: string;
  suggestions: string[];
} 