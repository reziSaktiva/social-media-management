import path from "node:path";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginTailwindcss from "eslint-plugin-tailwindcss";

// ADR-095 follow-up (review Ridwan, 2026-08-28): 2 custom rule lokal untuk
// menutup known-limitation `no-restricted-imports`/`tailwindcss/no-arbitrary-value`
// bawaan (dynamic import dan arbitrary-value yang disimpan di variabel
// terpisah tidak terjangkau rule standar). Tidak butuh dependency baru —
// didefinisikan inline sebagai plugin lokal flat-config.
// Satu sumber untuk kedua rule (custom local/no-dynamic-restricted-import
// dan no-restricted-imports bawaan) — menghindari 2 daftar module/path
// terpisah yang bisa desync kalau salah satu diupdate tanpa yang lain.
const RESTRICTED_IMPORT_SPECS = [
  {
    type: "exact",
    value: "@prisma/client",
    message:
      "Domain layer tidak boleh import Prisma langsung (AGENTS.md rule 6). Definisikan interface repository di domain, implementasi Prisma di lib/repositories/.",
  },
  {
    type: "exact",
    value: "@supabase/supabase-js",
    message:
      "Domain layer tidak boleh import Supabase client langsung (AGENTS.md rule 6/9).",
  },
  {
    type: "pattern",
    glob: "**/lib/repositories/**",
    regex: /\/lib\/repositories\//,
    message:
      "Domain layer tidak boleh import implementasi repository Prisma langsung — pakai interface repository yang didefinisikan di domain sendiri.",
  },
  {
    type: "pattern",
    glob: "**/lib/adapters/**",
    regex: /\/lib\/adapters\//,
    message:
      "Domain layer tidak boleh import implementasi adapter (Outstand/Storage) langsung — pakai interface/port yang didefinisikan di domain sendiri.",
  },
  {
    type: "pattern",
    glob: "**/lib/prisma/**",
    regex: /\/lib\/prisma\//,
    message:
      "Domain layer tidak boleh import Prisma client singleton langsung — pakai interface repository yang didefinisikan di domain sendiri.",
  },
  {
    type: "pattern",
    glob: "**/lib/supabase/**",
    regex: /\/lib\/supabase\//,
    message:
      "Domain layer tidak boleh import Supabase client singleton langsung (AGENTS.md rule 6/9).",
  },
  {
    type: "pattern",
    glob: "**/generated/**",
    regex: /\/generated\//,
    message:
      "Jangan import Prisma generated client langsung dari domain layer.",
  },
];

function isRestrictedImportSource(source) {
  return RESTRICTED_IMPORT_SPECS.some((spec) =>
    spec.type === "exact" ? source === spec.value : spec.regex.test(source),
  );
}

// Cocok dengan satu class-token Tailwind arbitrary-value, mis. `p-[13px]`,
// `shadow-[0_0_0_var(--x)]` — prefix identifier diikuti `-[...]`.
const ARBITRARY_VALUE_PATTERN = /[a-zA-Z][\w-]*-\[[^\]\s"'`]+\]/;

function findArbitraryValue(text) {
  if (typeof text !== "string") return null;
  const match = text.match(ARBITRARY_VALUE_PATTERN);
  return match ? match[0] : null;
}

const localRules = {
  rules: {
    "no-dynamic-restricted-import": {
      meta: {
        type: "problem",
        docs: {
          description:
            "ADR-095: larang dynamic import() ke Prisma/Supabase/implementasi infra dari domain layer — menutup celah no-restricted-imports yang hanya menjangkau static import.",
        },
        schema: [],
        messages: {
          restricted:
            "Domain layer tidak boleh dynamic import '{{source}}' (AGENTS.md rule 6, ADR-095) — sama seperti static import, ini dilarang. Pakai interface yang didefinisikan di domain sendiri.",
        },
      },
      create(context) {
        return {
          ImportExpression(node) {
            if (
              node.source?.type === "Literal" &&
              typeof node.source.value === "string" &&
              isRestrictedImportSource(node.source.value)
            ) {
              context.report({
                node,
                messageId: "restricted",
                data: { source: node.source.value },
              });
            }
          },
        };
      },
    },
    "no-arbitrary-value-in-variable": {
      meta: {
        type: "problem",
        docs: {
          description:
            "ADR-095: larang Tailwind arbitrary-value yang disimpan di variabel terpisah — menutup celah tailwindcss/no-arbitrary-value yang hanya menganalisis literal langsung di atribut className.",
        },
        schema: [],
        messages: {
          restricted:
            "Arbitrary-value Tailwind ('{{match}}') ditemukan di variabel, bukan langsung di className — tailwindcss/no-arbitrary-value tidak menjangkau pola ini. Kalau token-backed (CSS var) dan sudah direview, tambahkan eslint-disable-next-line local/no-arbitrary-value-in-variable dengan alasan.",
        },
      },
      create(context) {
        function check(node, text) {
          const match = findArbitraryValue(text);
          if (match) {
            context.report({ node, messageId: "restricted", data: { match } });
          }
        }
        function checkExpression(node) {
          if (!node) return;
          if (node.type === "Literal" && typeof node.value === "string") {
            check(node, node.value);
          } else if (node.type === "TemplateLiteral") {
            for (const quasi of node.quasis) {
              check(node, quasi.value.raw);
            }
          }
        }
        return {
          VariableDeclarator(node) {
            checkExpression(node.init);
          },
          AssignmentExpression(node) {
            checkExpression(node.right);
          },
        };
      },
    },
  },
};

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
    plugins: { local: localRules },
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
      "tailwindcss/no-arbitrary-value": "error",
      // Menutup celah di atas: custom rule lokal yang menganalisis
      // deklarasi/assignment variabel, bukan hanya atribut className.
      "local/no-arbitrary-value-in-variable": "error",
    },
  },
  {
    // ADR-095: menegakkan AGENTS.md rule 6 — domain logic tidak boleh
    // import Prisma/Supabase/implementasi repository-adapter langsung.
    // Diverifikasi 0 pelanggaran existing sebelum diaktifkan sebagai error.
    // `local/no-dynamic-restricted-import` menutup celah dynamic import
    // yang tidak terjangkau `no-restricted-imports` (temuan review Ridwan,
    // 2026-08-28). Re-export pass-through tidak langsung via file
    // perantara tetap tidak terjangkau — masih known limitation, karena
    // butuh analisis lintas-file yang tidak dilakukan lint per-file.
    files: ["apps/web/src/domains/**/*.{ts,tsx}"],
    plugins: { local: localRules },
    rules: {
      "local/no-dynamic-restricted-import": "error",
      "no-restricted-imports": [
        "error",
        {
          paths: RESTRICTED_IMPORT_SPECS.filter(
            (spec) => spec.type === "exact",
          ).map((spec) => ({ name: spec.value, message: spec.message })),
          patterns: RESTRICTED_IMPORT_SPECS.filter(
            (spec) => spec.type === "pattern",
          ).map((spec) => ({ group: [spec.glob], message: spec.message })),
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
