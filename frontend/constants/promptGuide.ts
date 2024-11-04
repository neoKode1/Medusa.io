export const PROMPT_GUIDE = `# AI Prompt Enhancement Specialist Directive (Length-Optimized)

## Core Length Guidelines

### Video Prompts (Luma Dream Machine)
- Optimal length: 100-150 characters
- Maximum length: 200 characters
- Focus on motion and temporal elements

### Image Prompts (All Other Models)
- Optimal length: 150-200 characters
- Maximum length: 300 characters`;  // Add your full prompt guide here

interface PromptStructure {
  core: string[];
  technical: string[];
  enhancement: string[];
}

interface PromptBreakdown {
  coreElements: string[];
  technicalChoices: string[];
  enhancementDetails: string[];
  tokenCount?: number;
  sentenceCount?: number;
  notes?: string[];
}

interface PromptValidationResult {
  isValid: boolean;
  enhancedPrompt?: string;
  breakdown?: PromptBreakdown;
  errors?: string[];
}

const IMAGE_TEMPLATES = {
  subjects: {
    character: [
      "portrait", "full body", "close-up", "action pose", "dynamic stance"
    ],
    landscape: [
      "panoramic view", "aerial perspective", "establishing shot", "wide angle", "detailed environment"
    ],
    object: [
      "centered focus", "floating", "dramatic angle", "intricate detail", "macro shot"
    ]
  },
  styles: {
    realistic: [
      "photorealistic", "hyperrealistic", "ultra detailed", "8k uhd", "octane render"
    ],
    artistic: [
      "digital painting", "concept art", "illustration", "key visual", "matte painting"
    ],
    stylized: [
      "anime style", "cartoon", "cel shaded", "studio ghibli", "disney style"
    ]
  },
  lighting: {
    natural: [
      "golden hour", "morning light", "sunset", "moonlight", "ambient occlusion"
    ],
    studio: [
      "rim lighting", "dramatic lighting", "studio lighting", "volumetric lighting", "cinematic lighting"
    ],
    atmospheric: [
      "god rays", "ethereal glow", "bioluminescent", "neon lights", "magical illumination"
    ]
  },
  quality: {
    technical: [
      "highly detailed", "masterful technique", "professional quality", "award winning", "trending on artstation"
    ],
    composition: [
      "rule of thirds", "dynamic composition", "perfect framing", "dramatic angle", "symmetrical composition"
    ],
    enhancement: [
      "post processing", "color grading", "depth of field", "bokeh effect", "ray tracing"
    ]
  },
  atmosphere: {
    mood: [
      "ethereal", "dramatic", "mysterious", "peaceful", "epic"
    ],
    weather: [
      "foggy", "misty", "rainy", "stormy", "clear sky"
    ],
    time: [
      "dawn", "dusk", "night time", "midday", "twilight"
    ]
  }
};

const VIDEO_TEMPLATES = {
  cameraShots: [
    "A sweeping aerial shot",
    "A dynamic tracking shot",
    "An intimate close-up",
    "A cinematic dolly shot",
    "A fluid steadicam shot"
  ],
  transitions: [
    "glides through",
    "follows",
    "reveals",
    "captures",
    "moves across"
  ],
  atmosphericElements: [
    "golden hour sunlight",
    "dramatic shadows",
    "ethereal mist",
    "ambient light",
    "moody atmosphere"
  ]
};

export function validateAndEnhancePrompt(
  prompt: string,
  model: string,
  style?: string,
  genre?: string,
  movieRef?: string,
  bookRef?: string
): PromptValidationResult {
  const isLumaAI = model === 'luma-ai';
  const errors: string[] = [];

  if (!prompt) {
    return { isValid: false, errors: ['Prompt cannot be empty'] };
  }

  return isLumaAI 
    ? enhanceVideoPrompt(prompt, genre, movieRef, bookRef)
    : enhanceImagePrompt(prompt, style, genre, movieRef, bookRef);
}

function enhanceVideoPrompt(
  prompt: string,
  genre?: string,
  movieRef?: string,
  bookRef?: string
): PromptValidationResult {
  const sentences = prompt.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length > 4) {
    return { 
      isValid: false, 
      errors: ['Video prompts must not exceed 4 sentences'] 
    };
  }

  let enhancedSentences = [];
  
  // Add camera movement if missing
  if (!sentences[0]?.toLowerCase().includes('shot')) {
    const cameraShot = VIDEO_TEMPLATES.cameraShots[
      Math.floor(Math.random() * VIDEO_TEMPLATES.cameraShots.length)
    ];
    enhancedSentences.push(`${cameraShot} ${sentences[0]}`);
  } else {
    enhancedSentences.push(sentences[0]);
  }

  // Add remaining sentences
  enhancedSentences.push(...sentences.slice(1));

  // Add atmosphere if missing
  if (!prompt.toLowerCase().includes('atmosphere')) {
    const atmosphere = VIDEO_TEMPLATES.atmosphericElements[
      Math.floor(Math.random() * VIDEO_TEMPLATES.atmosphericElements.length)
    ];
    enhancedSentences.push(`${atmosphere} creates a ${genre || 'compelling'} atmosphere`);
  }

  return {
    isValid: true,
    enhancedPrompt: enhancedSentences.join('. ') + '.',
    breakdown: {
      coreElements: enhancedSentences,
      technicalChoices: ['Camera movement', 'Scene progression'],
      enhancementDetails: ['Atmospheric elements'],
      sentenceCount: enhancedSentences.length
    }
  };
}

function enhanceImagePrompt(
  prompt: string,
  style?: string,
  genre?: string,
  movieRef?: string,
  bookRef?: string
): PromptValidationResult {
  const subjectType = determineSubjectType(prompt);
  const core = buildCoreLayer(prompt, subjectType);
  const technical = buildTechnicalLayer(style, genre, subjectType);
  const enhancement = buildEnhancementLayer(movieRef, bookRef, subjectType);

  const enhancedPrompt = [
    core.join(', '),
    'BREAK',
    technical.join(', '),
    'BREAK',
    enhancement.join(', ')
  ].join(' ');

  return {
    isValid: true,
    enhancedPrompt,
    breakdown: {
      coreElements: core,
      technicalChoices: technical,
      enhancementDetails: enhancement,
      notes: generatePromptNotes(subjectType, style)
    }
  };
}

function determineSubjectType(prompt: string): 'character' | 'landscape' | 'object' {
  const prompt_lower = prompt.toLowerCase();
  if (prompt_lower.includes('person') || prompt_lower.includes('character')) {
    return 'character';
  } else if (prompt_lower.includes('landscape') || prompt_lower.includes('scene')) {
    return 'landscape';
  }
  return 'object';
}

function buildCoreLayer(prompt: string, subjectType: string): string[] {
  const words = prompt.split(/[\s,]+/).filter(Boolean).slice(0, 3);
  return [
    ...words,
    IMAGE_TEMPLATES.subjects[subjectType][
      Math.floor(Math.random() * IMAGE_TEMPLATES.subjects[subjectType].length)
    ]
  ];
}

function buildTechnicalLayer(
  style?: string,
  genre?: string,
  subjectType?: string
): string[] {
  return [
    style || 'highly detailed',
    IMAGE_TEMPLATES.quality.technical[
      Math.floor(Math.random() * IMAGE_TEMPLATES.quality.technical.length)
    ],
    genre ? `${genre} themed` : null
  ].filter(Boolean);
}

function buildEnhancementLayer(
  movieRef?: string,
  bookRef?: string,
  subjectType?: string
): string[] {
  return [
    IMAGE_TEMPLATES.lighting.studio[
      Math.floor(Math.random() * IMAGE_TEMPLATES.lighting.studio.length)
    ],
    IMAGE_TEMPLATES.atmosphere.mood[
      Math.floor(Math.random() * IMAGE_TEMPLATES.atmosphere.mood.length)
    ],
    movieRef ? `inspired by ${movieRef}` : null,
    bookRef ? `in the style of ${bookRef}` : null
  ].filter(Boolean);
}

function generatePromptNotes(subjectType: string, style?: string): string[] {
  return [
    `Optimized for ${subjectType} composition`,
    `Enhanced with ${style || 'default'} style elements`,
    'Added quality markers and lighting',
    'Optimized keyword arrangement'
  ];
}