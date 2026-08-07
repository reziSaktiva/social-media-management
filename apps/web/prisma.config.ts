import { readFileSync } from "node:fs";
import { join } from "node:path";
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

/**
 * KI-016: `migrations.initShadowDb` expects the SQL script *content* as a
 * string, not a file path — the CLI passes this value through verbatim to
 * the schema engine (confirmed by reading prisma@7.8.0's compiled CLI: no
 * fs read happens on this field). Loading the file here keeps the SQL
 * itself reviewable in its own file (prisma/shadow-init.sql) while still
 * satisfying the config API's actual contract.
 */
const shadowDbInitScript = readFileSync(
  join(import.meta.dirname, "prisma/shadow-init.sql"),
  "utf-8",
);

export default defineConfig({
  schema: "prisma/schema.prisma",
  experimental: {
    externalTables: true,
  },
  migrations: {
    path: "prisma/migrations",
    initShadowDb: shadowDbInitScript,
  },
  tables: {
    external: ["storage.buckets"],
  },
  datasource: {
    url: migrateUrl,
  },
});
