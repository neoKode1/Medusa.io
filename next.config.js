/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['fal.media'],
  },
  experimental: {
    esmExternals: 'loose'
  },
  env: {
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
  }
}

module.exports = nextConfig 