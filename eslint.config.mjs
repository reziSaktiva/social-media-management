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
      // ADR-095: `off` secara default di preset recommended — diaktifkan
      // untuk menegakkan larangan arbitrary-value spacing/style di
      // design-tokens.md § Spacing. Rule ini all-or-nothing (tidak bisa
      // di-scope hanya ke prefix spacing), jadi 5 pemakaian token-backed
      // yang legit (transition/shadow, bukan magic number) di 2 file
      // (`ChannelsSection.tsx`, `ConnectedAccountsList.tsx`) diberi
      // `eslint-disable-next-line` + alasan inline per lokasi.
      // Known limitation (temuan review Ridwan, 2026-08-28): rule ini
      // hanya menganalisis string literal langsung di atribut
      // `className`/`class` (termasuk di dalam `cn(...)`) — arbitrary-value
      // yang ditaruh di `const` terpisah lalu diinterpolasi (mis.
      // `TRANSITION_FAST` di `ChannelsSection.tsx`, 2 instans arbitrary
      // value di dalamnya) TIDAK terjangkau sama sekali, jadi bukan celah
      // yang butuh disable comment — tapi juga bukan celah yang tertutup
      // rule ini kalau ada magic-number baru ditaruh dengan pola yang sama.
      // Belum ada solusi otomatis untuk ini di sesi ini (butuh custom
      // rule) — kewaspadaan pola ini didelegasikan ke code review manual.
      "tailwindcss/no-arbitrary-value": "error",
    },
  },
  {
    // ADR-095: menegakkan AGENTS.md rule 6 — domain logic tidak boleh
    // import Prisma/Supabase/implementasi repository-adapter langsung.
    // Diverifikasi 0 pelanggaran existing sebelum diaktifkan sebagai error.
    // Known limitation (temuan review Ridwan, 2026-08-28): `no-restricted-imports`
    // tidak menganalisis dynamic import (`await import("@prisma/client")`)
    // atau re-export pass-through tidak langsung — celah ini bawaan rule
    // core ESLint, bukan salah konfigurasi, dan belum ada mitigasi
    // otomatis di sesi ini.
    files: ["apps/web/src/domains/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@prisma/client",
              message:
                "Domain layer tidak boleh import Prisma langsung (AGENTS.md rule 6). Definisikan interface repository di domain, implementasi Prisma di lib/repositories/.",
            },
            {
              name: "@supabase/supabase-js",
              message:
                "Domain layer tidak boleh import Supabase client langsung (AGENTS.md rule 6/9).",
            },
          ],
          patterns: [
            {
              group: ["**/lib/repositories/**"],
              message:
                "Domain layer tidak boleh import implementasi repository Prisma langsung — pakai interface repository yang didefinisikan di domain sendiri.",
            },
            {
              group: ["**/lib/adapters/**"],
              message:
                "Domain layer tidak boleh import implementasi adapter (Outstand/Storage) langsung — pakai interface/port yang didefinisikan di domain sendiri.",
            },
            {
              group: ["**/lib/prisma/**"],
              message:
                "Domain layer tidak boleh import Prisma client singleton langsung — pakai interface repository yang didefinisikan di domain sendiri.",
            },
            {
              group: ["**/lib/supabase/**"],
              message:
                "Domain layer tidak boleh import Supabase client singleton langsung (AGENTS.md rule 6/9).",
            },
            {
              group: ["**/generated/**"],
              message:
                "Jangan import Prisma generated client langsung dari domain layer.",
            },
          ],
        },
      ],
    },
  },
  {
    // ADR-095: menegakkan apps/web/.claude/CLAUDE.md — "No <div>, komponen
    // yang menangani seluruh layout/spacing". Diverifikasi 0 pelanggaran
    // existing sebelum diaktifkan sebagai error.
    files: ["apps/web/src/app/**/*.tsx", "apps/web/src/components/**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXOpeningElement[name.name='div']",
          message:
            "Jangan pakai <div> mentah — pakai komponen layout Astryx (VStack/HStack/Stack/Grid/Box). Lihat apps/web/.claude/CLAUDE.md.",
        },
      ],
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
