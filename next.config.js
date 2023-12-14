/** @type {import('next').NextConfig} */
console.log('>>> Run at', process.env.NODE_ENV)
const nextConfig = {
  distDir: 'build',
  basePath: (process.env.NODE_ENV == 'production') ? '/_NEXT_GEN_APP' : undefined,
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  publicRuntimeConfig: {
    BACKEND_URL: process.env.BACKEND_URL,
  },
}

module.exports = nextConfig
