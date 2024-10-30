import logger from '../../utils/logger';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { description, genre, reference, style } = req.body;
    logger.info('Sending request to backend:', { description, genre, reference, style });

    // Check if backend is available
    try {
      const response = await fetch(`${BACKEND_URL}/api/generate-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          genre,
          reference,
          style
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error('Backend error:', error);
        return res.status(response.status).json({ 
          error: 'Backend service error',
          details: error
        });
      }

      const data = await response.json();
      logger.info('Generated prompt:', data);
      return res.status(200).json(data);

    } catch (error) {
      if (error.cause?.code === 'ECONNREFUSED') {
        logger.error('Backend service not available:', error);
        return res.status(503).json({ 
          error: 'Backend service unavailable',
          message: 'Please ensure the Python backend is running on port 8000'
        });
      }
      throw error; // Re-throw other errors
    }

  } catch (error) {
    logger.error('Error generating prompt:', { 
      error: error.message,
      stack: error.stack,
      userId: req.user?.id 
    });
    return res.status(500).json({ 
      error: 'Failed to generate prompt',
      message: error.message
    });
  }
}
