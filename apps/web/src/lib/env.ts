/**
 * Server env validation (EM-D05).
 * Fail-fast for required server vars; client may only read NEXT_PUBLIC_*.
 */

const REQUIRED_SERVER_VARS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_JWT_SECRET",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "OUTSTAND_API_KEY",
  "OUTSTAND_WEBHOOK_SECRET",
  "JOB_SECRET",
] as const;

export type ServerEnv = {
  DATABASE_URL: string;
  DIRECT_URL: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_JWT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  OUTSTAND_API_KEY: string;
  OUTSTAND_WEBHOOK_SECRET: string;
  JOB_SECRET: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
};

function missingRequired(): string[] {
  return REQUIRED_SERVER_VARS.filter((key) => {
    const value = process.env[key];
    return value === undefined || value.trim() === "";
  });
}

/** Throws if required server env vars are missing (EM-D05). */
export function assertServerEnv(): void {
  if (process.env.SKIP_ENV_VALIDATION === "1") {
    return;
  }

  const missing = missingRequired();
  if (missing.length > 0) {
    throw new Error(
      `Missing required server environment variables: ${missing.join(", ")}. ` +
        `Copy apps/web/.env.example → apps/web/.env.local and fill values (EM-D04).`,
    );
  }
}

export function getServerEnv(): ServerEnv {
  assertServerEnv();

  return {
    DATABASE_URL: process.env.DATABASE_URL ?? "",
    DIRECT_URL: process.env.DIRECT_URL ?? "",
    SUPABASE_URL: process.env.SUPABASE_URL ?? "",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET ?? "",
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? "",
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    OUTSTAND_API_KEY: process.env.OUTSTAND_API_KEY ?? "",
    OUTSTAND_WEBHOOK_SECRET: process.env.OUTSTAND_WEBHOOK_SECRET ?? "",
    JOB_SECRET: process.env.JOB_SECRET ?? "",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

/** True for HTTPS staging/production; false for local HTTP (auth-strategy cookie Secure). */
export function secureCookiesEnabled(): boolean {
  return process.env.NODE_ENV === "production";
}
