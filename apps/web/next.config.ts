import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@voltess/contracts', '@voltess/energy-calc'],
};

export default nextConfig;
