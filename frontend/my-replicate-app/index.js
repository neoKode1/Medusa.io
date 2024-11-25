import Replicate from 'replicate'
import dotenv from 'dotenv'
dotenv.config()

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  userAgent: 'https://www.npmjs.com/package/create-replicate'
})
const model = 'black-forest-labs/flux-1.1-pro-ultra:c7c40e895b25a19e3aa77552a45a81283cc7da2adcc9c0ce0d3ebc9d0b8a3f68'
const input = {
  raw: false,
  prompt: 'a majestic snow-capped mountain peak bathed in a warm glow of the setting sun',
  aspect_ratio: '3:2',
  output_format: 'jpg',
  safety_tolerance: 2,
}

console.log('Using model: %s', model)
console.log('With input: %O', input)

console.log('Running...')
const output = await replicate.run(model, { input })
console.log('Done!', output)
