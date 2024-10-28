// This should contain only the API endpoint logic
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { description } = req.body;
    
    // Call your Python backend API
    const response = await fetch('http://localhost:8000/api/generate-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate prompt');
    }

    const data = await response.json();
    res.status(200).json({ prompt: data.prompt });
  } catch (error) {
    console.error('Error generating prompt:', error);
    res.status(500).json({ message: 'Error generating prompt' });
  }
}
