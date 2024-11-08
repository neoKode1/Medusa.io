export const PROMPT_GUIDE = `# AI Generation Prompt Guide

## Stable Diffusion 3 Guidelines

### Image Prompts
Examples:

1. Fantasy Portrait:
"glowing girl with small elegant horns, messy yellow hair, living amber eyes, intricate organic ornaments on skin and face, realistic"

2. Fashion Photography:
"high-fashion photograph featuring a young european woman posing on top of a large broken animatronic swan in an abandoned theme park. Full-body shot, centered frame. Model has shoulder-length dark brown shaggy hair, middle part, pale skin, neutral expression. Wearing tight white t-shirt with round neckline, black mini skirt, black leather heels. Soft, even lighting, contemporary mood."

3. Technical Abstract:
"A futuristic depiction of a neural network architecture in metallic bright pastel colors against a black background."

4. Character Design:
"Stylish Harley Quinn with, fly in the sky high, skydiving glide, many clouds around, autumn, asymmetrical bob haircut, wearing only open pilot suit, passionate feelings, plump lips, bottomless eyes, the universe in the eyes, ideal slim figure, perfect slender body, small hips, edge of a fairy sky castle filled with sunlight, fairies flying, multi-colored stars and lights, lot of dust particles in the air, super detail, ultra quality, style raw, hdr, cinematic."`;

// Constants
export const ASPECT_RATIO_QUALITIES = {
  '1:1': { width: 1024, height: 1024, recommendedQuality: 100 },
  '3:4': { width: 896, height: 1152, recommendedQuality: 95 },
  '2:3': { width: 832, height: 1216, recommendedQuality: 95 },
  '9:16': { width: 768, height: 1344, recommendedQuality: 90 },
  '4:3': { width: 1152, height: 896, recommendedQuality: 95 },
  '3:2': { width: 1216, height: 832, recommendedQuality: 95 },
  '16:9': { width: 1440, height: 810, recommendedQuality: 90 },
  'custom': { width: 1024, height: 1024, recommendedQuality: 90 }
};

// Helper Functions
export const getOptimalQualitySettings = (aspectRatio) => {
  return ASPECT_RATIO_QUALITIES[aspectRatio] || ASPECT_RATIO_QUALITIES['custom'];
};

export const validateAndEnhancePrompt = (prompt, model, settings = {}) => {
  if (!prompt) {
    return { 
      isValid: false, 
      errors: ['Prompt cannot be empty'] 
    };
  }

  let enhancedPrompt = prompt;

  // Add quality keywords if not present
  if (!prompt.toLowerCase().includes('quality')) {
    enhancedPrompt += ', high quality, detailed rendering';
  }

  // Add model-specific enhancements
  switch (model) {
    case 'flux-pro-ultra':
      enhancedPrompt += ', professional photography, sharp focus, masterpiece quality';
      break;
    case 'flux-dev':
      enhancedPrompt += ', experimental style, innovative composition';
      break;
    case 'recraft-v3':
      enhancedPrompt += ', artistic rendering, refined details';
      break;
    case 'stable-diffusion-3':
      enhancedPrompt += ', masterpiece, best quality, highly detailed';
      break;
    default:
      break;
  }

  // Add settings-specific enhancements
  if (settings.style) {
    enhancedPrompt += `, ${settings.style} style`;
  }

  return {
    isValid: true,
    enhancedPrompt,
    breakdown: {
      technicalChoices: extractTechnicalElements(enhancedPrompt),
      coreElements: extractCoreElements(enhancedPrompt)
    }
  };
};

function extractTechnicalElements(prompt) {
  return prompt.split(',')
    .map(element => element.trim())
    .filter(element => 
      element.toLowerCase().includes('quality') || 
      element.toLowerCase().includes('detailed') ||
      element.toLowerCase().includes('style')
    );
}

function extractCoreElements(prompt) {
  return prompt.split(',')
    .map(element => element.trim())
    .filter(element => 
      !element.toLowerCase().includes('quality') && 
      !element.toLowerCase().includes('detailed') &&
      !element.toLowerCase().includes('style')
    );
}

// Export additional constants if needed
export const SUPPORTED_MODELS = [
  {
    id: 'flux-1.1',
    name: 'Flux 1.1',
    description: 'Latest stable model for images',
    type: 'image'
  },
  {
    id: 'gen3a_turbo',
    name: 'LumaAI Gen3',
    description: 'Video generation model',
    type: 'video'
  }
  // ... other models
];

export const MODEL_STYLES = {
  'flux-1.1': [
    'Photorealistic',
    'High Detail',
    'Professional Quality'
  ],
  'gen3a_turbo': [
    '3D Video Generation',
    'Cinematic Quality',
    'Motion Graphics'
  ]
  // ... other model styles
};

// Add model-specific prompt enhancers
export const MODEL_ENHANCERS = {
  'flux-pro-ultra': 'professional photography, sharp focus, masterpiece quality',
  'flux-dev': 'experimental style, innovative composition',
  'recraft-v3': 'artistic rendering, refined details',
  'stable-diffusion-3': 'masterpiece, best quality, highly detailed'
};