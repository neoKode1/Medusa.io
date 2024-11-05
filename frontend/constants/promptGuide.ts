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
"Stylish Harley Quinn with, fly in the sky high, skydiving glide, many clouds around, autumn, asymmetrical bob haircut, wearing only open pilot suit, passionate feelings, plump lips, bottomless eyes, the universe in the eyes, ideal slim figure, perfect slender body, small hips, edge of a fairy sky castle filled with sunlight, fairies flying, multi-colored stars and lights, lot of dust particles in the air, super detail, ultra quality, style raw, hdr, cinematic."

## Luma AI Dream Machine Guidelines

### Video Prompts
Examples:

1. Surreal Scenes:
"A city floating in clouds, crystal buildings with rivers of light flowing beneath, ethereal sunset reflections, smooth camera glide through"

2. Dynamic Movement:
"High-speed chase through futuristic cityscape, flying vehicles weaving between neon-lit skyscrapers, fluid camera tracking"

3. Nature & Wildlife:
"Majestic wild horses galloping across plains at sunrise, tracking camera movement, golden sky backdrop"

## Technical Guidelines

### Stable Diffusion Tips:
- Start with main subject description
- Include specific details (hair, eyes, clothing)
- Add decorative elements and textures
- End with style/quality keywords
- Specify model and ratio when needed
- Balance detail level with clarity

### Luma AI Tips:
- Include camera movement type
- Keep prompts "Goldilocks" length (not too long/short)
- Consider enhance feature usage
- Use reference images when possible
- Specify motion intensity (1-4 scale)
- Focus on single subject for complex motion

### Scene Elements:
- Lighting and atmosphere
- Weather conditions
- Time of day
- Color palette
- Texture and materials
- Environmental effects
- Motion dynamics (for video)

### Best Practices:
1. Keep prompts clear and specific
2. Match detail level to complexity
3. Use appropriate technical specifications
4. Consider platform strengths
5. Test and refine iteratively
6. Include reference materials when possible

### Model-Specific Optimization:
- SD3: Focus on detail and style keywords
- Luma: Emphasize motion and camera movement
- Consider enhance feature strategically
- Match complexity to subject matter
- Use appropriate aspect ratios
- Include technical specifications when needed`;

interface PromptBreakdown {
  technicalChoices: string[];
  coreElements: string[];
}

interface PromptValidationResult {
  isValid: boolean;
  enhancedPrompt?: string;
  errors?: string[];
  breakdown?: PromptBreakdown;
}

// Core interfaces
interface TemplateElement {
  category: string;
  required: boolean;
  options: string[];
  modifiers?: string[];
}

interface PromptTemplate {
  name: string;
  baseStructure: TemplateElement[];
  styleModifiers: string[];
  technicalElements: string[];
  mood: string[];
  composition: string[];
}

interface StyleCategory {
  name: string;
  elements: string[];
  modifiers: string[];
  technicalRequirements: string[];
}

// Template definitions
const characterTemplates: Record<string, PromptTemplate> = {
  animeStyle: {
    name: 'Anime Character',
    baseStructure: [
      {
        category: 'character',
        required: true,
        options: ['male', 'female', 'androgynous'],
        modifiers: ['young', 'mature', 'elderly']
      },
      {
        category: 'pose',
        required: true,
        options: ['action', 'standing', 'sitting', 'dynamic']
      }
    ],
    styleModifiers: ['cel shaded', 'detailed linework', 'vibrant colors'],
    technicalElements: ['high detail', 'sharp lines', 'dynamic lighting'],
    mood: ['energetic', 'calm', 'intense', 'peaceful'],
    composition: ['close-up', 'full body', 'dynamic angle']
  },
  // Add other templates...
};

// Style categories
const styleCategories: Record<string, StyleCategory> = {
  anime: {
    name: 'Anime/Manga',
    elements: [
      'cel shading',
      'dynamic poses',
      'expressive eyes',
      'detailed hair',
      'action lines'
    ],
    modifiers: [
      'shounen style',
      'shoujo style',
      'seinen style',
      'mecha style'
    ],
    technicalRequirements: [
      'clean linework',
      'vibrant colors',
      'sharp details'
    ]
  },
  // Add other categories...
};

// Add this after the existing interfaces
interface AspectRatioQuality {
  width: number;
  height: number;
  recommendedQuality: number;
}

// Add optimal quality settings for each aspect ratio
export const ASPECT_RATIO_QUALITIES: Record<string, AspectRatioQuality> = {
  '1:1': { width: 1024, height: 1024, recommendedQuality: 100 },
  '3:4': { width: 896, height: 1152, recommendedQuality: 95 },
  '2:3': { width: 832, height: 1216, recommendedQuality: 95 },
  '9:16': { width: 768, height: 1344, recommendedQuality: 90 },
  '4:3': { width: 1152, height: 896, recommendedQuality: 95 },
  '3:2': { width: 1216, height: 832, recommendedQuality: 95 },
  '16:9': { width: 1440, height: 810, recommendedQuality: 90 },
  '21:9': { width: 1440, height: 640, recommendedQuality: 85 },
  '2.39:1': { width: 1440, height: 640, recommendedQuality: 85 },
  '1.43:1': { width: 1280, height: 896, recommendedQuality: 90 },
  'custom': { width: 1024, height: 1024, recommendedQuality: 90 }
};

// Add this helper function
export const getOptimalQualitySettings = (aspectRatio: string): AspectRatioQuality => {
  return ASPECT_RATIO_QUALITIES[aspectRatio] || ASPECT_RATIO_QUALITIES['custom'];
};

// Enhanced prompt validation and generation
export const validateAndEnhancePrompt = (
  prompt: string,
  model: string,
  style?: string,
  genre?: string,
  movieRef?: string,
  bookRef?: string,
  template?: string
): PromptValidationResult => {
  const isLumaAI = model === 'luma-ai';
  const maxLength = isLumaAI ? 200 : 300;
  const errors: string[] = [];

  // Basic validation
  if (!prompt) {
    errors.push('Prompt cannot be empty');
    return { isValid: false, errors };
  }

  // Template application if specified
  let enhancedPrompt = prompt;
  if (template && characterTemplates[template]) {
    const selectedTemplate = characterTemplates[template];
    enhancedPrompt = applyTemplate(prompt, selectedTemplate);
  }

  // Style enhancement
  if (style && styleCategories[style]) {
    enhancedPrompt = enhanceWithStyle(enhancedPrompt, styleCategories[style]);
  }

  // Existing enhancements
  if (genre) {
    enhancedPrompt = `${genre} themed, ${enhancedPrompt}`;
  }

  if (movieRef) {
    enhancedPrompt = `${enhancedPrompt}, inspired by ${movieRef}`;
  }

  if (bookRef) {
    enhancedPrompt = `${enhancedPrompt}, in the style of ${bookRef}`;
  }

  // Model-specific enhancements
  if (isLumaAI) {
    enhancedPrompt = enhanceForVideo(enhancedPrompt);
  } else {
    enhancedPrompt = enhanceForImage(enhancedPrompt);
  }

  // Length validation
  if (enhancedPrompt.length > maxLength) {
    errors.push(`Enhanced prompt exceeds maximum length of ${maxLength} characters`);
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    enhancedPrompt,
    breakdown: analyzePrompt(enhancedPrompt)
  };
};

// Helper functions
function applyTemplate(prompt: string, template: PromptTemplate): string {
  let enhanced = prompt;
  template.styleModifiers.forEach(modifier => {
    if (!enhanced.toLowerCase().includes(modifier.toLowerCase())) {
      enhanced += `, ${modifier}`;
    }
  });
  return enhanced;
}

function enhanceWithStyle(prompt: string, style: StyleCategory): string {
  let enhanced = prompt;
  // Add key style elements if not present
  style.elements.forEach(element => {
    if (!enhanced.toLowerCase().includes(element.toLowerCase())) {
      enhanced += `, ${element}`;
    }
  });
  return enhanced;
}

function enhanceForVideo(prompt: string): string {
  if (!prompt.toLowerCase().includes('motion')) {
    prompt += ', with fluid motion and dynamic camera movement';
  }
  return prompt;
}

function enhanceForImage(prompt: string): string {
  if (!prompt.toLowerCase().includes('quality')) {
    prompt += ', high quality, detailed rendering';
  }
  return prompt;
}

function analyzePrompt(prompt: string): PromptBreakdown {
  return {
    technicalChoices: extractTechnicalElements(prompt),
    coreElements: extractCoreElements(prompt)
  };
}

function extractTechnicalElements(prompt: string): string[] {
  // Implementation for extracting technical elements
  return prompt.split(',')
    .filter(element => element.toLowerCase().includes('quality') || 
                      element.toLowerCase().includes('detailed') ||
                      element.toLowerCase().includes('style'));
}

function extractCoreElements(prompt: string): string[] {
  // Implementation for extracting core elements
  return prompt.split(',')
    .filter(element => !element.toLowerCase().includes('quality') && 
                      !element.toLowerCase().includes('detailed') &&
                      !element.toLowerCase().includes('style'));
}

// Export constants and types
export const TEMPLATES = Object.keys(characterTemplates);
export const STYLES = Object.keys(styleCategories);
export type { PromptTemplate, StyleCategory, TemplateElement };