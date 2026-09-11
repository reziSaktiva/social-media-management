import { secureCookiesEnabled } from "@/lib/env";

/**
 * Nama cookie CSRF nonce untuk loopback OAuth Connect/Reconnect Account
 * (T-013.1/T-013.2, T-015.3, ADR-105). Diset oleh Server Action inisiasi
 * (`initiateConnectAccountAction`/`initiateReconnectAccountAction`) sesaat
 * sebelum `redirect(redirectUrl)`, dibaca+dihapus kembali oleh Route Handler
 * callback (`/api/integrations/outstand/callback`) untuk mencocokkan
 * `nonce` yang dibawa lewat `state` — mencegah callback dipicu dari `state`
 * yang bukan hasil inisiasi milik sesi browser ini sendiri (ADR-105 poin 4:
 * "CSRF-check nyata (nonce dicocokkan sisi cookie/session) adalah
 * tanggung jawab Route Handler, bukan adapter").
 */
export const OUTSTAND_CONNECT_NONCE_COOKIE = "outstand-connect-nonce";

/** 10 menit — cukup untuk satu round-trip OAuth (Fake instan; real adapter T-025 nanti tetap dalam orde detik/menit), sengaja pendek karena cookie ini murni untuk SATU percobaan connect/reconnect. */
const OUTSTAND_CONNECT_NONCE_COOKIE_MAX_AGE = 60 * 10;

export function outstandConnectNonceCookieOptions(): {
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
    maxAge: OUTSTAND_CONNECT_NONCE_COOKIE_MAX_AGE,
  };
}
