import axios from 'axios'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { text } = req.body
    try {
      const response = await axios.post('https://api.replicate.com/v1/predictions', {
        version: 'stable-diffusion',
        input: { prompt: text }
      }, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      res.status(200).json({ image: response.data.output })
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate image' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
