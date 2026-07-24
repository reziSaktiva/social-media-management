import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

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

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

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
  plugins: betterAuthApiKey
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
    : undefined,

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
