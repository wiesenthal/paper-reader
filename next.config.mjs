/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Support for PDF.js and other libraries
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    return config;
  },
};

export default nextConfig;