import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'register.thebeaconexpo.com',
      },
    ],
  },
};

export default nextConfig;
