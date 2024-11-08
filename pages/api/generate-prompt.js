import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates creative and detailed prompts for AI image and video generation."
        },
        {
          role: "user",
          content: `Generate a detailed prompt based on this description: ${description}`
        }
      ],
    });

    const generatedPrompt = completion.choices[0].message.content;
    res.status(200).json({ prompt: generatedPrompt });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate prompt' });
  }
}
