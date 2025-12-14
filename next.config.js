/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Disable ESLint and TypeScript errors during production builds
  // Linting should be done during development, not in production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

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
