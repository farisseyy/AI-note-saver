import type { NextConfig } from "next";

const nextConfig: any = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb'
    }
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
