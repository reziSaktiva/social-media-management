import path from "node:path";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginTailwindcss from "eslint-plugin-tailwindcss";

/** Flat ESLint config for the monorepo (apps/web + packages/shared). */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  {
    settings: {
      next: {
        rootDir: "apps/web/",
      },
    },
  },
  {
    // KI-012 follow-up: menangkap Tailwind arbitrary-value yang punya
    // padanan utility canonical (mis. `start-[calc(var(--spacing-4)*-1)]`
    // seharusnya `-start-4`), supaya tidak lolos manual review lagi.
    files: ["apps/web/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}"],
    extends: [eslintPluginTailwindcss.configs.recommended],
    settings: {
      tailwindcss: {
        // Path absolut: plugin me-resolve cssConfigPath relatif ke direktori
        // tiap file yang di-lint (bukan cwd), jadi path relatif tidak stabil
        // lintas kedalaman folder — harus absolut.
        cssConfigPath: path.resolve(
          import.meta.dirname,
          "apps/web/src/app/globals.css",
        ),
      },
    },
    rules: {
      // Astryx tailwind bridge pakai custom utilities (mis. bg-surface,
      // text-primary) yang bukan bagian dari Tailwind core — matikan rule
      // yang menganggapnya "unknown class" sampai ada cara whitelist token
      // Astryx secara resmi ke plugin ini.
      "tailwindcss/no-custom-classname": "off",
    },
  },
  globalIgnores([
    "**/node_modules/**",
    "**/.next/**",
    "**/out/**",
    "**/dist/**",
    "**/coverage/**",
    "apps/web/next-env.d.ts",
    "apps/web/src/generated/**",
    "product-discovery/**",
    "project-manager/**",
    // Skill vendor/custom (ADR-064) — bukan kode project, jangan di-lint.
    ".claude/**",
  ]),
]);

export default eslintConfig;
