import type { NextConfig } from "next";

/**
 * Next.js configuration.
 * Note: We avoid static export because the app performs client-side fetches to a dynamic API server.
 */
const nextConfig: NextConfig = {
  // Keep default server output for dev/preview environments
};

export default nextConfig;
