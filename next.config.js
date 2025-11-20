/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.quran.foundation',
      },
      {
        protocol: 'https',
        hostname: 'apis-prelive.quran.foundation',
      },
    ],
  },
}

module.exports = nextConfig
