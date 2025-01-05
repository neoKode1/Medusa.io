import { NextApiRequest, NextApiResponse } from 'next';

const LUMA_API_TOKEN = process.env.LUMA_API_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Use a different publicly accessible image URL for testing
    const imageUrl = "https://images.unsplash.com/photo-1682687982501-1e58ab814714";

    // First, verify the image is accessible
    try {
      const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
      if (!imageResponse.ok) {
        throw new Error('Image URL is not accessible');
      }
    } catch (error) {
      console.error('Error checking image URL:', error);
      return res.status(400).json({
        error: 'Image URL is not accessible'
      });
    }

    // Prepare the request body exactly as per Luma API documentation
    const requestBody = {
      generation_type: "video",
      prompt: "Generate video from this image",
      aspect_ratio: "16:9",
      loop: true,
      keyframes: {
        frame0: {
          type: "image",
          url: imageUrl
        }
      },
      model: "ray-1-6"
    };

    console.log('Sending request to Luma API:', JSON.stringify(requestBody, null, 2));
    console.log('Using Luma API token:', LUMA_API_TOKEN ? 'Token is present' : 'Token is missing');

    const response = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LUMA_API_TOKEN?.trim()}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log('Luma API response status:', response.status);
    console.log('Luma API response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Luma API response:', data);

    if (!response.ok) {
      console.error('Error details:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      throw new Error(data.error || data.failure_reason || `Failed to generate video: ${response.statusText}`);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Error in test'
    });
  }
} 