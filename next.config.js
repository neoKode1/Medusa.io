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
  // Update images configuration to use remotePatterns
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'replicate.com',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

module.exports = nextConfig