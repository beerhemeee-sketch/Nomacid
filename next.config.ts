import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    },
    devtoolSegmentExplorer: false
  }
};

export default nextConfig;
