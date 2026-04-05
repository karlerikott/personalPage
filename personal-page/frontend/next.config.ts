import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://personalpage-production-b21f.up.railway.app/api/:path*",
      },
    ];
  },
};

export default nextConfig;
