/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/ImageToVideoPage',
        destination: '/image-to-video',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig 