import { LumaAI } from 'lumaai';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const client = new LumaAI({
      authToken: process.env.LUMAAI_API_KEY,
    });

    const generation = await client.generations.get(id);

    res.status(200).json(generation);
  } catch (error) {
    console.error('Error fetching generation status:', error);
    res.status(500).json({ message: 'Failed to get generation status', error: error.message });
  }
}