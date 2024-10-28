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
    deviceSizes: [
      400,  // Current mobile view
      320,  // Smaller phones
      375,  // Standard iPhone
      414,  // Larger phones
      567,  // Current height
      768,  // Tablets
    ],
  },
};

module.exports = nextConfig;
