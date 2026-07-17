import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(appDir, "../..");

const nextConfig: NextConfig = {
  turbopack: {
    // Pin workspace root so parent lockfiles outside the repo are ignored.
    root: monorepoRoot,
  },
};

export default nextConfig;
