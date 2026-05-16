/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/wee',
  assetPrefix: '/wee',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

export default nextConfig
