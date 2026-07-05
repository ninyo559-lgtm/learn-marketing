import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project folder (multiple lockfiles were
  // detected on the machine, and the folder path contains Hebrew characters
  // that break Turbopack when the root is inferred incorrectly).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
