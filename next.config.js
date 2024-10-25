/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    LUMAAI_API_KEY: process.env.LUMAAI_API_KEY,
  },
}

module.exports = nextConfig
