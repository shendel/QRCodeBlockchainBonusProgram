/** @type {import('next').NextConfig} */
console.log('>>> Run at', process.env.NODE_ENV)
console.log('>>> Is CLAIMER', process.env.CLAIMER)
console.log('>>> Is MINTER', process.env.MINTER)

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
    NODE_ENV: process.env.NODE_ENV,
    BACKEND_URL: process.env.BACKEND_URL,
    CLAIMER_URL: process.env.CLAIMER_URL,
    CLAIMER: process.env.CLAIMER,
    MINTER: process.env.MINTER,
    TELEGRAM_APP_LINK: process.env.TELEGRAM_APP_LINK,
    NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID,
  },
}

module.exports = nextConfig
