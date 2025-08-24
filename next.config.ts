import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standard Next.js config for Tailwind v4
  experimental: {
    // Optimize for better performance in production
    optimizePackageImports: [
      "@radix-ui/react-icons",
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "lucide-react"
    ],
  },
  // Enable image optimization for better performance
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // Compress responses for better performance
  compress: true,
  // Webpack optimizations
  webpack: (config) => {
    // Enable better tree shaking for production
    config.optimization = {
      ...config.optimization,
      sideEffects: false,
    };
    return config;
  },
};

export default nextConfig;
