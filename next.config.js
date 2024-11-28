/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicate.delivery",
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "pbxt.replicate.delivery",
        pathname: '/**',
      },
    ],
    domains: ['localhost'],
    unoptimized: false,
    formats: ['image/webp', 'image/jpeg', 'image/png'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
    allowFutureImage: true
  },
  async redirects() {
    return [
      {
        source: '/ImageToVideoPage',
        destination: '/image-to-video',
        permanent: true,
      },
    ]
  },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.txt$/,
      use: 'raw-loader'
    })
    config.devtool = 'source-map';
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    config.resolve.fallback = {
      ...config.resolve.fallback,
      punycode: false,
    };
    return config
  },
  transpilePackages: ['lucide-react']
}

module.exports = nextConfig 