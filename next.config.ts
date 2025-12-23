import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack if experiencing panics
  // Remove this if the issue is resolved
  // experimental: {
  //   turbo: false,
  // },
};

export default nextConfig;
