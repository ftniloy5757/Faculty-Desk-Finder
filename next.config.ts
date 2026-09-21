import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cse.bracu.ac.bd",
      },
    ],
  },
};

export default nextConfig;
