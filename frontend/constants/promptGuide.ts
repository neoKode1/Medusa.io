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

interface PromptValidationResult {
  isValid: boolean;
  enhancedPrompt?: string;
  errors?: string[];
}

export const validateAndEnhancePrompt = (
  prompt: string,
  model: string,
  style?: string,
  genre?: string,
  movieRef?: string,
  bookRef?: string
): PromptValidationResult => {
  const isLumaAI = model === 'luma-ai';
  const maxLength = isLumaAI ? 200 : 300;
  const errors: string[] = [];

  // Basic validation
  if (!prompt) {
    errors.push('Prompt cannot be empty');
    return { isValid: false, errors };
  }

  if (prompt.length > maxLength) {
    errors.push(`Prompt exceeds maximum length of ${maxLength} characters`);
    return { isValid: false, errors };
  }

  // Enhance prompt based on model
  let enhancedPrompt = prompt;

  // Add style if provided
  if (style) {
    enhancedPrompt = `${style} style: ${enhancedPrompt}`;
  }

  // Add genre-specific keywords
  if (genre) {
    enhancedPrompt = `${genre} themed, ${enhancedPrompt}`;
  }

  // Add movie reference
  if (movieRef) {
    enhancedPrompt = `${enhancedPrompt}, inspired by ${movieRef}`;
  }

  // Add book reference
  if (bookRef) {
    enhancedPrompt = `${enhancedPrompt}, in the style of ${bookRef}`;
  }

  // Model-specific enhancements
  if (isLumaAI) {
    // Add motion-related keywords for video
    if (!enhancedPrompt.toLowerCase().includes('motion') && 
        !enhancedPrompt.toLowerCase().includes('moving')) {
      enhancedPrompt = `${enhancedPrompt}, with fluid motion`;
    }
  } else {
    // Add quality keywords for images
    if (!enhancedPrompt.toLowerCase().includes('quality')) {
      enhancedPrompt = `${enhancedPrompt}, high quality, detailed`;
    }
  }

  // Final length check after enhancements
  if (enhancedPrompt.length > maxLength) {
    errors.push(`Enhanced prompt exceeds maximum length of ${maxLength} characters`);
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    enhancedPrompt
  };
};