import Replicate from 'replicate'
import dotenv from 'dotenv'
dotenv.config()

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  userAgent: 'https://www.npmjs.com/package/create-replicate'
})
const model = 'black-forest-labs/flux-1.1-pro:a91bed9b0301d9d10b34b89b1f4d0255f2e2499c59576bfcd13405575dacdb25'
const input = {
  prompt: 'black forest gateau cake spelling out the words "FLUX 1.1 Pro", tasty, food photography',
  aspect_ratio: '1:1',
  output_format: 'webp',
  output_quality: 80,
  safety_tolerance: 2,
  prompt_upsampling: true,
}

console.log('Using model: %s', model)
console.log('With input: %O', input)

console.log('Running...')
const output = await replicate.run(model, { input })
console.log('Done!', output)
