import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const response = await fetch(`https://api.dev.runwayml.com/v1/tasks/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'X-Runway-Version': '2024-09-13',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to get RunwayML task status. Status: ${response.status}. ${errorData.error || ''}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching task status:', error);
    res.status(500).json({ message: 'Failed to get task status', error: error.message });
  }
}