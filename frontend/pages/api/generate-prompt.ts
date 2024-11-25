import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const PROMPT_GUIDE = `You are an expert at enhancing image generation prompts for Flux AI.
Your task is to maintain the core essence of the base prompt while subtly incorporating:

1. Technical Quality:
- Resolution markers (4K, ultra-detailed, high-resolution)
- Lighting descriptors (dramatic, ambient, volumetric)
- Quality enhancers (masterful, photorealistic, intricate detail)

2. Context Integration:
- Use genre to inform mood and atmosphere
- Draw inspiration from movie/book references without directly copying
- Apply artistic style as a subtle enhancement layer

3. Guidelines:
- Keep the original prompt's main subject and action as the core focus
- Add technical and quality terms naturally within the flow
- Maintain coherence and avoid conflicting descriptors
- Ensure the final prompt remains clear and focused`;

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
      .replace(/```.*?```/gs, '')
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