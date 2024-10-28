/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    LUMAAI_API_KEY: process.env.LUMAAI_API_KEY,
  },
  images: {
    remotePatterns: [
      {
        // Add your remote pattern configuration here
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
