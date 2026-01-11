import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      // Use regex to capture the full path including trailing slash
      {
        source: '/api/:path(.*)',
        destination: 'http://127.0.0.1:8000/api/:path',
      },
      {
        source: '/auth/:path(.*)',
        destination: 'http://127.0.0.1:8000/auth/:path',
      },
      {
        source: '/media/:path(.*)',
        destination: 'http://127.0.0.1:8000/media/:path',
      },
    ];
  },
};

export default nextConfig;
