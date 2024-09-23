/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    LUMAAI_API_KEY: process.env.LUMAAI_API_KEY,
  },
  // Add this to ensure .tsx files are properly resolved
  webpack: (config) => {
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', ...config.resolve.extensions];
    return config;
  },
}

module.exports = nextConfig
