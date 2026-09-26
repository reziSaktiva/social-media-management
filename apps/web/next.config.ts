import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(appDir, "../..");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.ngrok-free.app"],
  turbopack: {
    // Pin workspace root so parent lockfiles outside the repo are ignored.
    root: monorepoRoot,
  },
  experimental: {
    serverActions: {
      // Sinkron dengan MAX_MEDIA_FILE_SIZE_BYTES (domains/media/validation.ts).
      // Next.js default 1MB memotong upload media sebelum validasi aplikasi
      // sempat jalan (KI-075).
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
