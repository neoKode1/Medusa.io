import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { validateAndEnhancePrompt, PROMPT_GUIDE } from '../../constants/promptGuide';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { description, genre, movieReference, bookReference, style, mode } = req.body;

    // First, use our local prompt enhancement logic
    const localEnhancement = validateAndEnhancePrompt(
      description,
      mode === 'video',
      {
        style,
        genre,
        movieRef: movieReference,
        bookRef: bookReference
      }
    );

    if (!localEnhancement.isValid) {
      return res.status(400).json({ error: localEnhancement.errors });
    }

    // Then, use GPT to further refine the prompt
    const systemPrompt = `${PROMPT_GUIDE}\n\nYou are a prompt enhancement specialist. Optimize the following AI ${mode} generation prompt while maintaining its core elements and staying within length limits.`;
    
    const userPrompt = `Enhanced prompt: ${localEnhancement.enhancedPrompt}\n\nTechnical choices: ${localEnhancement.breakdown?.technicalChoices.join(', ')}\nCore elements: ${localEnhancement.breakdown?.coreElements.join(', ')}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: mode === 'video' ? 150 : 300,
      temperature: 0.7,
    });

    const final_prompt = completion.choices[0].message.content;

    // Validate the final prompt length
    const maxLength = mode === 'video' ? 200 : 300;
    const finalPrompt = final_prompt.length > maxLength 
      ? final_prompt.substring(0, maxLength) 
      : final_prompt;

    res.status(200).json({ 
      enhanced_prompt: finalPrompt,
      breakdown: localEnhancement.breakdown
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