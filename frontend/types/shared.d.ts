export interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface Session {
  user?: User;
  expires: string;
}

export interface RequestBody {
  prompt: string;
  model: string;
  promptImage?: string;
  cfg?: number;
  steps?: number;
  width?: number;
  height?: number;
  aspect_ratio?: string;
  output_format?: string;
  num_outputs?: number;
  guidance_scale?: number;
  duration?: number;
} 