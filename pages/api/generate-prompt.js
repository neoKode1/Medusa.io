// This should contain only the API endpoint logic
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { description, genre, reference, style } = req.body;
    
    console.log('Sending request to backend:', {
      description,
      genre,
      reference,
      style,
    });

    // Call your Python backend API
    const response = await fetch('http://localhost:8000/api/generate-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        prompt: description,
        genre,
        reference,
        style,
        mode: 'image' 
      }),
    });

    const data = await response.json();
    console.log('Response from backend:', data);

    // Check for quota error specifically
    if (data.error && data.error.includes('insufficient_quota')) {
      return res.status(402).json({
        message: 'OpenAI API quota exceeded. Please add credits to your account.',
        error: 'QUOTA_EXCEEDED',
        enhanced_prompt: description // Return original prompt as fallback
      });
    }

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to generate prompt');
    }

    // Send back the response
    res.status(200).json({
      enhanced_prompt: data.enhanced_prompt || description,
      original_prompt: data.original_prompt || description,
      influences: {
        genre,
        reference,
        style
      }
    });
  } catch (error) {
    console.error('Error generating prompt:', error);
    res.status(500).json({ 
      message: error.message || 'Error generating prompt',
      error: error.message,
      enhanced_prompt: req.body.description // Fallback to original prompt
    });
  }
}
