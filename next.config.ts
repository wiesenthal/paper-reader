import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Add support for PDF.js and other binary files
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    // Return the modified config
    return config;
  },
};

export default nextConfig;