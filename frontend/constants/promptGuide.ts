export const PROMPT_GUIDE = `
Guide for creating high-quality image generation prompts:

1. Structure:
- Subject/Main focus
- Action/Pose
- Environment/Setting
- Lighting
- Mood/Atmosphere
- Technical details
- Style/Artistic direction

2. Quality enhancers:
- Lighting: cinematic lighting, ambient lighting, backlight, dramatic lighting
- Detail: highly detailed, grainy, realistic, depth of field, 8k uhd
- Style: digital art, concept art, trending on artstation
- Camera: ultra wide-angle, bokeh, close-up, panoramic
- Render: unreal engine, octane render, vray, raytracing

3. Best practices:
- Be specific and descriptive
- Use positive statements
- Layer details from general to specific
- Include technical quality terms
- Reference artistic styles
`;

interface PromptLayer {
  subject?: string[];
  action?: string[];
  environment?: string[];
  lighting?: string[];
  mood?: string[];
  technical?: string[];
  style?: string[];
}

interface PromptBreakdown {
  layers: PromptLayer;
  combined: string;
}

interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  breakdown?: PromptBreakdown;
}

export function validateAndEnhancePrompt(
  description: string,
  mode: string,
  style?: string,
  genre?: string,
  movieReference?: string,
  bookReference?: string
): ValidationResult {
  const errors: string[] = [];
  
  // Basic validation
  if (!description?.trim()) {
    errors.push('Description is required');
  }

  if (!mode) {
    errors.push('Generation mode is required');
  }

  if (description?.length > 500) {
    errors.push('Description is too long (max 500 characters)');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors
    };
  }

  // Break down into layers
  const layers: PromptLayer = {
    subject: [],
    action: [],
    environment: [],
    lighting: [],
    mood: [],
    technical: [],
    style: []
  };
  // Add base description
  layers?.subject?.push(description);

  // Add style
  if (style) {
    layers?.style?.push(style);
    // Add quality enhancers based on style
    switch (style.toLowerCase()) {
      case 'photorealistic':
        layers?.technical?.push('highly detailed', '8k uhd', 'photorealistic', 'dslr');
        break;
      case 'anime':
        layers?.style?.push('anime style', 'trending on pixiv');
        break;
      case 'digital art':
        layers?.technical?.push('digital painting', 'trending on artstation', 'concept art');
        break;
      // Add more style-specific enhancements
    }
  }

  // Add genre-specific elements
  if (genre) {
    layers?.mood?.push(genre);
    // Add genre-specific lighting and mood
    switch (genre.toLowerCase()) {
      case 'horror':
        layers?.lighting?.push('dark lighting', 'dramatic shadows');
        layers?.mood?.push('ominous', 'foreboding');
        break;
      case 'fantasy':
        layers?.lighting?.push('magical lighting', 'ethereal glow');
        layers?.mood?.push('mystical', 'enchanting');
        break;
      // Add more genre-specific enhancements
    }
  }

  // Add references
  if (movieReference) {
    layers?.style?.push(`inspired by ${movieReference}`);
  }
  if (bookReference) {
    layers?.style?.push(`inspired by ${bookReference}`);
  }
  // Add technical quality enhancers
  layers?.technical?.push(
    'highly detailed',
    'professional', 
    'sharp focus',
    'high resolution'
  );

  // Combine all layers
  const combined = Object.entries(layers)
    .filter(([_, values]) => values.length > 0)
    .map(([_, values]) => values.join(', '))
    .join(' BREAK ');

  return {
    isValid: true,
    breakdown: {
      layers,
      combined
    }
  };
}

interface QualitySettings {
  width: number;
  height: number;
  recommendedQuality: number;
}

export const getOptimalQualitySettings = (aspectRatio: string): QualitySettings => {
  switch (aspectRatio) {
    case '1:1':
      return {
        width: 1024,
        height: 1024,
        recommendedQuality: 100
      };
    case '16:9':
      return {
        width: 1920,
        height: 1080,
        recommendedQuality: 90
      };
    case '4:3':
      return {
        width: 1600,
        height: 1200,
        recommendedQuality: 95
      };
    case '3:2':
      return {
        width: 1800,
        height: 1200,
        recommendedQuality: 95
      };
    default:
      return {
        width: 1024,
        height: 1024,
        recommendedQuality: 100
      };
  }
};

export const layers = {
  subject: {
    weight: 1,
    description: 'Main subject of the image'
  },
  style: {
    weight: 0.8,
    description: 'Visual style and artistic direction'
  },
  technical: {
    weight: 0.6,
    description: 'Technical quality parameters'
  },
  mood: {
    weight: 0.7,
    description: 'Emotional and atmospheric qualities'
  }
};