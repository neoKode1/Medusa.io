/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    LUMAAI_API_KEY: process.env.LUMAAI_API_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'luma-api.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '**',
      },
    ],
    // Optional: Configure image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Optional: Configure redirects or rewrites if needed
  async redirects() {
    return [];
  },
  // Optional: Configure API routes
  async rewrites() {
    return [];
  }
};

module.exports = nextConfig;
