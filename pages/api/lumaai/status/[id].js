import LumaAI from 'lumaai';

export default async function handler(req, res) {
  const { id } = req.query; // Get the generation ID from the query parameters

  if (req.method === 'GET') {
    try {
      const client = new LumaAI({
        authToken: process.env.LUMAAI_API_KEY,  // Using environment variable for API Key
      });

      // Retrieve the generation status using the ID
      const generationStatus = await client.generations.get(id);

      if (generationStatus) {
        res.status(200).json(generationStatus);
      } else {
        res.status(404).json({ message: 'Generation not found' });
      }
    } catch (error) {
      console.error('Error fetching generation status:', error);
      res.status(500).json({ message: 'Failed to fetch generation status', error });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
}
