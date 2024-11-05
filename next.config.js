/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "pbxt.replicate.delivery",
      },
    ],
    domains: ['replicate.delivery', 'pbxt.replicate.delivery'],
    unoptimized: true,
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
}

module.exports = nextConfig 