import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/ui'],
  typescript: {
    ignoreBuildErrors: true
  },
  compiler: {
    relay: {
      src: './',
      artifactDirectory: './__generated__',
      language: 'typescript',
      eagerEsModules: false
    }
  },
  // enable react compiler will increase build time 30~40%
  reactCompiler: false,
  experimental: {
    turbopackFileSystemCacheForBuild: true
  },
  // Configure output for Vercel
  output: 'standalone',
  // Ensure public directory is included in the build
  distDir: '.next',
  // Configure static files handling
  images: {
    unoptimized: true // Disable image optimization if not needed
  },
  // Explicitly configure the output directory structure
  webpack: (config, { isServer }) => {
    // Ensure public files are properly copied to the output directory
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false
      }
    }
    return config
  }
}

export default withNextIntl(nextConfig)
