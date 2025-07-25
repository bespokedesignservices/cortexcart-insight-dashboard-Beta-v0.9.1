// next.config.ts
import { config } from 'dotenv';
import type { NextConfig } from 'next';

// Manually load the .env.local file
config({ path: '@/.env.local' });

// You can keep this line for debugging to confirm it's now working
console.log('DB_USER from next.config:', process.env.DB_USER);

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cortexcart.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;