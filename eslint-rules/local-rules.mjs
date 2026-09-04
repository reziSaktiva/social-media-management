// ADR-095 follow-up (review Ridwan, 2026-08-28): 2 custom rule lokal untuk
// menutup known-limitation `no-restricted-imports`/`tailwindcss/no-arbitrary-value`
// bawaan (dynamic import dan arbitrary-value yang disimpan di variabel
// terpisah tidak terjangkau rule standar). Tidak butuh dependency baru.
//
// Diekstrak ke module terpisah (bukan inline di eslint.config.mjs) supaya
// bisa diuji lewat ESLint RuleTester — lihat local-rules.test.ts.

// Satu sumber untuk kedua rule (custom local/no-dynamic-restricted-import
// dan no-restricted-imports bawaan) — menghindari 2 daftar module/path
// terpisah yang bisa desync kalau salah satu diupdate tanpa yang lain.
// Pattern spec cukup simpan `segment` (satu path fragment) — glob
// (`**/${segment}/**`) dan substring check (`/${segment}/`) diturunkan
// dari situ, supaya tidak ada 2 representasi (glob string + regex) untuk
// fakta yang sama yang bisa desync satu sama lain.
export const RESTRICTED_IMPORT_SPECS = [
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
    segment: "lib/repositories",
    message:
      "Domain layer tidak boleh import implementasi repository Prisma langsung — pakai interface repository yang didefinisikan di domain sendiri.",
  },
  {
    type: "pattern",
    segment: "lib/adapters",
    message:
      "Domain layer tidak boleh import implementasi adapter (Outstand/Storage) langsung — pakai interface/port yang didefinisikan di domain sendiri.",
  },
  {
    type: "pattern",
    segment: "lib/prisma",
    message:
      "Domain layer tidak boleh import Prisma client singleton langsung — pakai interface repository yang didefinisikan di domain sendiri.",
  },
  {
    type: "pattern",
    segment: "lib/supabase",
    message:
      "Domain layer tidak boleh import Supabase client singleton langsung (AGENTS.md rule 6/9).",
  },
  {
    type: "pattern",
    segment: "generated",
    message:
      "Jangan import Prisma generated client langsung dari domain layer.",
  },
];

// Satu pass untuk membangun paths/patterns no-restricted-imports —
// menggantikan 2 filter().map() terpisah yang menyisir array yang sama.
export const RESTRICTED_IMPORTS_CONFIG = RESTRICTED_IMPORT_SPECS.reduce(
  (acc, spec) => {
    if (spec.type === "exact") {
      acc.paths.push({ name: spec.value, message: spec.message });
    } else {
      acc.patterns.push({
        group: [`**/${spec.segment}/**`],
        message: spec.message,
      });
    }
    return acc;
  },
  { paths: [], patterns: [] },
);

export function isRestrictedImportSource(source) {
  return RESTRICTED_IMPORT_SPECS.some((spec) =>
    spec.type === "exact"
      ? source === spec.value
      : source.includes(`/${spec.segment}/`),
  );
}

// Cocok dengan satu class-token Tailwind arbitrary-value, mis. `p-[13px]`,
// `shadow-[0_0_0_var(--x)]` — prefix identifier diikuti `-[...]`. Flag `g`
// supaya `matchAll` menangkap SEMUA token dalam satu string, bukan cuma
// yang pertama.
export const ARBITRARY_VALUE_PATTERN = /[a-zA-Z][\w-]*-\[[^\]\s"'`]+\]/g;
// Cocok dengan pembuka arbitrary-value yang belum ditutup di akhir string
// (mis. quasis template literal `` `duration-[${x}]` `` -> quasi pertama
// berakhir "duration-[") — menangkap kasus token yang terpotong oleh
// interpolasi, yang tidak pernah utuh di satu quasi manapun.
export const ARBITRARY_VALUE_OPEN_PATTERN = /[a-zA-Z][\w-]*-\[[^\]]*$/;

export function findArbitraryValues(text) {
  if (typeof text !== "string") return [];
  return [...text.matchAll(ARBITRARY_VALUE_PATTERN)].map((m) => m[0]);
}

export const localRules = {
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
        function report(node, match) {
          context.report({ node, messageId: "restricted", data: { match } });
        }
        function check(node, text) {
          for (const match of findArbitraryValues(text)) {
            report(node, match);
          }
        }
        function checkExpression(node) {
          if (!node) return;
          if (node.type === "Literal" && typeof node.value === "string") {
            check(node, node.value);
          } else if (node.type === "TemplateLiteral") {
            const { quasis } = node;
            quasis.forEach((quasi, index) => {
              check(node, quasi.value.raw);
              // Quasi bukan yang terakhir (selalu diikuti ekspresi) dan
              // berakhir dengan pembuka arbitrary-value yang belum
              // ditutup — nilainya dipecah oleh interpolasi, tidak akan
              // pernah match ARBITRARY_VALUE_PATTERN di quasi manapun.
              const isLast = index === quasis.length - 1;
              const openMatch = quasi.value.raw.match(
                ARBITRARY_VALUE_OPEN_PATTERN,
              );
              if (!isLast && openMatch) {
                report(node, `${openMatch[0]}…]`);
              }
            });
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
