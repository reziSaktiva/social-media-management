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
