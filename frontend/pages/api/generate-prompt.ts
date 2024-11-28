import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const PROMPT_GUIDE = `You are an expert at enhancing image generation prompts for photorealistic outputs.
Your task is to maintain the core essence of the base prompt while incorporating these key elements:

1. Photography Technical Elements:
- Camera specifications (e.g., "shot on Canon 5D Mark IV", "85mm lens", "f/1.8 aperture")
- Lighting details (e.g., "natural lighting", "golden hour", "studio lighting with soft boxes")
- Photography style (e.g., "RAW photo", "4K", "8K resolution", "HDR")

2. Composition Enhancement:
- Depth of field descriptors ("shallow depth of field", "bokeh effect")
- Perspective details ("close-up shot", "wide angle", "eye level")
- Professional photography terms ("rule of thirds", "leading lines")

3. Realism Markers:
- Add photographic metadata ("ISO 100", "1/125 second")
- Include environment details ("on location", "in studio")
- Specify real-world lighting conditions ("overcast day", "diffused window light")

4. Guidelines:
- Keep the original prompt's main subject as the core focus
- Add technical photography terms naturally within the flow
- Avoid conflicting or fantasy-based descriptors
- Use terms like "photorealistic", "hyperrealistic", "professional photography"
- Include specific brands/equipment when relevant (e.g., "Profoto lighting", "Hasselblad")
- End with quality markers ("high resolution", "sharp detail", "color accurate")`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { description = '', genre, style, movieReference, bookReference } = req.body;

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      console.error('Invalid or missing description:', description);
      return res.status(400).json({ 
        error: 'Description is required and must be a non-empty string',
        receivedValue: description 
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: PROMPT_GUIDE
        },
        { 
          role: "user", 
          content: `Enhance this image generation prompt while maintaining its core essence:

Base Description: "${description.trim()}"

Additional Context (use subtly):
${genre ? `Genre: ${genre}` : ''}
${style ? `Style: ${style}` : ''}
${movieReference ? `Movie Reference: ${movieReference}` : ''}
${bookReference ? `Book Reference: ${bookReference}` : ''}`
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    const enhancedPrompt = completion.choices[0]?.message?.content;

    if (!enhancedPrompt) {
      throw new Error('Failed to generate prompt');
    }

    // Clean up the prompt - remove any markdown or formatting
    const cleanPrompt = enhancedPrompt
      .replace(/```.*?```/g, '')  // Changed /gs to /g since /s flag requires ES2018+
      .replace(/\[.*?\]/g, '')
      .replace(/\n+/g, ' ')
      .replace(/["']/g, '') // Remove quotes
      .trim();

    console.log('Original prompt:', description);
    console.log('Generated prompt:', cleanPrompt);

    res.status(200).json({ 
      enhanced_prompt: cleanPrompt,
      original_input: {
        description: description.trim(),
        genre,
        style,
        movieReference,
        bookReference
      }
    });

  } catch (error) {
    console.error('Error in generate-prompt:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('quota')) {
        return res.status(429).json({ error: 'QUOTA_EXCEEDED' });
      }
      return res.status(500).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
}; 