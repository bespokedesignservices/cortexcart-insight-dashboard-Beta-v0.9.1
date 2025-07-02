import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // This new line allows remote SVGs
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
