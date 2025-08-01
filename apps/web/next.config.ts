import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
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
  experimental: {
    // enable react compiler will increase build time 30~40%
    reactCompiler: false,
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: []
    }
  },
  // Ensure the output directory is set correctly
  distDir: '.next',
  // Configure output for Vercel
  output: 'standalone',
  // Ensure public directory is included in the build
  images: {
    unoptimized: true // Disable image optimization if not needed
  }
};

export default withNextIntl(nextConfig);
