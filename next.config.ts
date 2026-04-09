import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow any device on local network to access dev server.
  // Next.js doesn't support CIDR ranges, so list hosts explicitly.
  allowedDevOrigins: [
    "192.168.1.169",
    "*.local",
  ],
};

export default nextConfig;
