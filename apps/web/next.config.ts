import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(appDir, "../..");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["4e22-103-119-55-133.ngrok-free.app"],
  turbopack: {
    // Pin workspace root so parent lockfiles outside the repo are ignored.
    root: monorepoRoot,
  },
};

export default nextConfig;
