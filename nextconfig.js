/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Remove any API routes or server-side features
  experimental: {
    appDir: true
  }
}

module.exports = nextConfig