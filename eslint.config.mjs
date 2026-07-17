import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";

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
    "design/**",
    ".agents/**",
  ]),
]);

export default eslintConfig;
