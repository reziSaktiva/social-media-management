import { secureCookiesEnabled } from "@/lib/env";

/**
 * Nama cookie yang menyimpan `WorkspaceId` workspace aktif user (ADR-076) —
 * pengganti dynamic segment `[slug]`. Diset oleh `proxy.ts` (dan alur
 * onboarding) setelah workspace context berhasil di-resolve, dibaca kembali
 * oleh `proxy.ts` di setiap request untuk inject header context
 * (`workspace-context-headers.ts`) ke Server Component/Server Action.
 *
 * Nama literal ini WAJIB persis sama di seluruh pemakaian (proxy.ts,
 * auth-architecture.md) — jangan diubah tanpa ADR baru.
 */
export const ACTIVE_WORKSPACE_ID_COOKIE = "active-workspace-id";

/** 30 hari — selaras dengan pola `LAST_WORKSPACE_SLUG_COOKIE` sebelumnya. */
export const ACTIVE_WORKSPACE_ID_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * Attributes cookie standar untuk `ACTIVE_WORKSPACE_ID_COOKIE` — mirror
 * `defaultCookieAttributes` Better Auth (`httpOnly: true, sameSite: "lax",
 * secure: secureCookiesEnabled()`) supaya konsumen (proxy.ts, onboarding
 * actions) tidak duplikasi attributes.
 */
export function activeWorkspaceCookieOptions(): {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookiesEnabled(),
    path: "/",
    maxAge: ACTIVE_WORKSPACE_ID_COOKIE_MAX_AGE,
  };
}
