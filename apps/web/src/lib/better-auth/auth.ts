import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins/bearer";

import { secureCookiesEnabled } from "@/lib/env";
import { prisma } from "@/lib/prisma/client";

/**
 * Better Auth instance (auth-strategy.md, ADR-030).
 * Identity tables: identity_* via Prisma @@map (DO-D05, DB-D04).
 * Email verification / password-reset email: stubbed until AS-D04 provider is chosen.
 */

const secure = secureCookiesEnabled();

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Better Auth Dash (official hosted admin/monitoring dashboard) — off unless configured.
const betterAuthApiKey = process.env.BETTER_AUTH_API_KEY;

// ADR-043 — mobile (Expo custom scheme, dst.) didaftarkan eksplisit di sini
// begitu keputusan mobile app benar-benar dimulai; kosong untuk sekarang
// (`baseURL` sudah trusted otomatis oleh Better Auth untuk web).
const trustedOrigins = process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  ...(trustedOrigins && trustedOrigins.length > 0 ? { trustedOrigins } : {}),

  // ADR-043 §7 — /api/v1 memperluas attack surface yang sebelumnya lebih
  // tersembunyi di balik Server Actions; sign-in/sign-up diperketat dari
  // default umum Better Auth (3 req/10s) ke jendela yang lebih jelas.
  rateLimit: {
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
    },
  },

  emailAndPassword: {
    enabled: true,
    // AS-D04 — enable when transactional email provider is configured
    requireEmailVerification: false,
    // AS-D04 — stubbed until a transactional email provider is chosen; logs the
    // reset link server-side so the flow stays testable end-to-end locally.
    sendResetPassword: async ({ user, url }) => {
      console.log(`[auth] password reset link for ${user.email}: ${url}`);
    },
  },

  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : undefined,

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh if < 1 day remaining
  },

  // apiUrl/kvUrl keys are omitted entirely (not passed as `undefined`) when
  // unset — @better-auth/infra's option merge lets an explicit `undefined`
  // key override its own built-in defaults, which breaks the JWKS self-check.
  //
  // bearer() (ADR-043 §4) converts an `Authorization: Bearer <token>` header
  // into a session — same session table as web cookie auth, no second auth
  // system. Always on: mobile client doesn't exist yet, but the endpoint
  // schema (`/api/v1`) needs it wired now (T-019) so web's Server Actions
  // never need a breaking retrofit later.
  plugins: [
    bearer(),
    ...(betterAuthApiKey
      ? [
          dash({
            apiKey: betterAuthApiKey,
            ...(process.env.BETTER_AUTH_API_URL
              ? { apiUrl: process.env.BETTER_AUTH_API_URL }
              : {}),
            ...(process.env.BETTER_AUTH_KV_URL
              ? { kvUrl: process.env.BETTER_AUTH_KV_URL }
              : {}),
          }),
        ]
      : []),
  ],

  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: secure,
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
