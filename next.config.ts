import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide Next.js "1 Issue" / DevTools badge in the corner during local dev.
  devIndicators: false,
  images: {
    qualities: [75, 85, 90],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
