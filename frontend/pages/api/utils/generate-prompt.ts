import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, PromptResponse, handleApiError, createApiResponse } from '../../../types/api';

const X_API_KEY = process.env.X_API_KEY;
const X_API_URL = 'https://api.x.ai/v1/chat/completions';

if (!X_API_KEY) {
  throw new Error('Missing X.AI API key');
}

interface Message {
  role: 'system' | 'user';
  content: string;
}

interface XAIRequest {
  messages: Message[];
  model: string;
  stream: boolean;
  temperature: number;
}

interface XAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PromptResponse>>
) {
  try {
    const { subject, style, mood, movieRef, bookRef, genreRef } = req.body;

    const messages: Message[] = [
      {
        role: 'system',
        content: `You are an expert prompt engineer specializing in image and video generation. 
        You understand how to create detailed prompts that incorporate visual styles from movies, 
        thematic elements from books, and genre conventions to create compelling and cohesive results.`
      },
      {
        role: 'user',
        content: `Create a detailed generation prompt with these elements:
        - Main subject: "${subject}"
        ${style ? `- Visual style: "${style}"` : ''}
        ${mood ? `- Mood/atmosphere: "${mood}"` : ''}
        ${movieRef ? `- Visual inspiration from movie: "${movieRef}"` : ''}
        ${bookRef ? `- Thematic elements from book: "${bookRef}"` : ''}
        ${genreRef ? `- Genre conventions: "${genreRef}"` : ''}
        
        Please create a detailed, well-structured prompt that combines these elements cohesively.`
      }
    ];

    const response = await fetch(X_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${X_API_KEY}`
      },
      body: JSON.stringify({
        messages,
        model: 'grok-beta',
        stream: false,
        temperature: 0.7
      } as XAIRequest)
    });

    if (!response.ok) {
      throw new Error(`X.AI API error: ${response.statusText}`);
    }

    const data = await response.json() as XAIResponse;
    const enhancedPrompt = data.choices[0]?.message?.content || '';

    return res.status(200).json(createApiResponse({
      enhanced_prompt: enhancedPrompt,
      original_input: {
        subject,
        style,
        mood,
        movieRef,
        bookRef,
        genreRef
      }
    }));
  } catch (error) {
    console.error('Error generating prompt:', error);
    return res.status(500).json(handleApiError(error));
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
}; 