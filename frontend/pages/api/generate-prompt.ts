import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { description, genre, movieReference, bookReference, style, mode } = req.body;

    // Construct the prompt
    let systemPrompt = `You are a creative prompt engineer. Generate a detailed, creative prompt for ${mode === 'video' ? 'video' : 'image'} generation.`;
    
    let userPrompt = `Base description: ${description}\n`;
    if (genre) userPrompt += `Genre: ${genre}\n`;
    if (style) userPrompt += `Style: ${style}\n`;
    if (movieReference) userPrompt += `Similar to the movie: ${movieReference}\n`;
    if (bookReference) userPrompt += `Inspired by the book: ${bookReference}\n`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",  // or "gpt-3.5-turbo" if you prefer
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const enhanced_prompt = completion.choices[0].message.content;

    res.status(200).json({ enhanced_prompt });
  } catch (error) {
    console.error('Error in generate-prompt:', error);
    
    if (error instanceof Error) {
      // Check if it's a quota exceeded error
      if (error.message.includes('quota')) {
        return res.status(429).json({ error: 'QUOTA_EXCEEDED' });
      }
      return res.status(500).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
} 