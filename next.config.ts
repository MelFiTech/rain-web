import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    // Parent ~/package-lock.json makes Turbopack treat the home dir as root,
    // which blows memory and corrupts the dev client manifest.
    root: projectRoot,
  },
  devIndicators: {
    position: "bottom-right",
  },
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
