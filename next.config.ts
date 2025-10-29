import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix lockfile warning by setting workspace root
  outputFileTracingRoot: path.join(__dirname),
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Disable strict ESLint during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript errors during production builds  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  webpack: (config, { isServer }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
        'bufferutil': false,
        'utf-8-validate': false,
      };
    }

    // Optimize webpack build
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    };

    return config;
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'x-middleware-cache',
            value: 'no-cache',
          },
        ],
      },
    ];
  },
  
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          has: [
            {
              type: 'host',
              value: 'explorer.atlas402.com',
            },
          ],
          destination: '/explorer',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },

  async redirects() {
    return [
      // Legacy redirects
      { source: '/nova-mint', destination: '/', permanent: true },
      { source: '/atlas-mint', destination: '/', permanent: true },
      // Workspace redirects (old dApp routes → new workspace routes)
      { source: '/dapp', destination: '/workspace', permanent: true },
      { source: '/dapp/service-hub', destination: '/workspace/command-console', permanent: true },
      { source: '/dapp/token-mint', destination: '/workspace/atlas-foundry', permanent: true },
      { source: '/dapp/token-indexer', destination: '/workspace/atlas-index', permanent: true },
      { source: '/dapp/integration-layer', destination: '/workspace/atlas-mesh', permanent: true },
      { source: '/dapp/agent', destination: '/workspace/atlas-operator', permanent: true },
    ];
  },
};

export default nextConfig;


