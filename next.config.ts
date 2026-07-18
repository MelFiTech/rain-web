import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.outray.app",
    "outray.app",
    "**.*",
    "*.*",
    "*.*.*",
    "*.*.*.*",
    "*.*.*.*.*",
  ],
  experimental: {
    // Dev HMR WebSocket often fails through tunnels; the debug channel then
    // blocks hydration and leaves a blank page (Next.js 16.2 + React 19.2).
    reactDebugChannel: false,
  },
};

export default nextConfig;
