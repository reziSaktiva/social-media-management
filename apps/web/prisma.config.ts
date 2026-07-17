import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prefer Next.js local secrets; fall back to .env for tooling.
loadEnv({ path: ".env.local" });
loadEnv();

/**
 * Prisma CLI config (Prisma 7+).
 * Migrate/introspect use DIRECT_URL (session/direct) — DO-D04.
 * Runtime queries use DATABASE_URL via @prisma/adapter-pg in src/lib/prisma/client.ts.
 *
 * Placeholder URL allows `prisma generate` without secrets (CI / fresh install).
 * Real migrate/deploy must set DIRECT_URL in .env.local or the environment.
 */
const migrateUrl =
  process.env.DIRECT_URL ||
  "postgresql://prisma:prisma@127.0.0.1:5432/prisma?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrateUrl,
  },
});
