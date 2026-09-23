import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { asConnectedAccountId, asUserId } from "@social/shared";
import { decodeConnectAccountState } from "@/lib/adapters/outstand/connect-state";
import { getCachedSession } from "@/lib/better-auth/session";
import { getServerEnv } from "@/lib/env";
import { ApplicationError } from "@/lib/utils/errors";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";
import { createWorkspaceServiceWithOutstandAdapter } from "@/lib/workspace/outstand-workspace-service";
import { outstandConnectNonceCookieName } from "@/lib/workspace/outstand-connect-nonce-cookie";

const CONNECTED_ACCOUNTS_PATH = "/settings/connected-accounts";

/**
 * Route Handler callback Connect/Reconnect Account (T-013.1/T-013.2,
 * T-015.3, ADR-105, redesain ADR-112 — SCOPE: single-page account saja,
 * lihat KI-070 untuk Facebook Pages, `integration-layer.md` § "Alur
 * Connect Account"). TIDAK boleh berisi business logic (AGENTS.md #5) —
 * satu-satunya keputusan di sini adalah marshalling (baca query param,
 * decode `state`, cocokkan nonce CSRF) sebelum delegasi penuh ke
 * `WorkspaceService.completeAccountConnection`; CREATE vs UPDATE
 * `ConnectedAccount`, RBAC, dan validasi kepemilikan akun semuanya ada di
 * Application Service, bukan di sini.
 *
 * **ADR-112 (2026-09-23):** Outstand TIDAK mengirim `code` untuk
 * di-exchange — setelah OAuth selesai, browser diarahkan balik dengan
 * `account_id`/`username`/`network_unique_id` LANGSUNG sebagai query
 * param (data akun sudah lengkap di URL callback ini sendiri). Handler
 * ini karena itu membaca ketiganya, bukan `code`.
 *
 * `proxy.ts` TIDAK meng-exclude path ini dari gate sesi/workspace (beda
 * dengan `/api/webhooks/outstand` yang server-to-server) — jadi begitu
 * handler ini dieksekusi, sesi user dan membership workspace aktif sudah
 * tervalidasi oleh proxy, header `x-workspace-id`/`x-workspace-role` sudah
 * di-inject. `getWorkspaceContext()` di bawah membaca context itu — BUKAN
 * `workspaceId` dari `state` (`state` hanya dipakai untuk `redirectAccountId`
 * + nonce CSRF), supaya `workspaceId` yang dipakai untuk RBAC/create/update
 * selalu berasal dari sumber yang sudah divalidasi proxy, bukan dari query
 * param publik yang bisa ditamper di browser.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const appOrigin = getServerEnv().BETTER_AUTH_URL;

  // ADR-112: query param Outstand asli untuk single-page account —
  // BUKAN `code` (lihat docstring di atas). `networkUniqueId` opsional,
  // tidak ikut menentukan lengkap/tidaknya request (lihat ADR-112 §3).
  const accountId = request.nextUrl.searchParams.get("account_id");
  const username = request.nextUrl.searchParams.get("username");
  const networkUniqueId = request.nextUrl.searchParams.get("network_unique_id");
  const state = request.nextUrl.searchParams.get("state");

  // Bug QA Najwa (T-015, 2026-09-11): setiap redirect() sukses dari Server
  // Action (`initiateConnectAccountAction`/`initiateReconnectAccountAction`)
  // ke path relatif Route Handler ini, App Router Next.js memperlakukan
  // target sebagai navigasi internal dan menyusulkan 1-2 request
  // prefetch/revalidasi ke PATHNAME YANG SAMA TANPA query string (perilaku
  // cache prefetch bawaan Next.js, bukan bug kode kita — reproducible di
  // semua platform/reconnect). Request susulan itu SAMA SEKALI tidak
  // membawa `account_id`/`username`/`state` (beda dari request OAuth asli
  // yang selalu membawa ketiganya, atau request malformed/tampered yang
  // membawa sebagian). Kalau ketiganya kosong, diamkan (no-op, redirect
  // polos tanpa `?connect=`) — JANGAN dianggap gagal, supaya tidak
  // menumpuk toast error palsu di atas toast sukses dari request asli.
  // Kalau ADA salah satu yang terisi tapi tidak lengkap ketiganya, itu
  // tetap request bermasalah sungguhan → tetap error (ADR-112 §3).
  if (!accountId && !username && !state) {
    return NextResponse.redirect(new URL(CONNECTED_ACCOUNTS_PATH, appOrigin));
  }
  if (!accountId || !username || !state) {
    return NextResponse.redirect(
      new URL(`${CONNECTED_ACCOUNTS_PATH}?connect=error`, appOrigin),
    );
  }

  let decoded: ReturnType<typeof decodeConnectAccountState>;
  try {
    decoded = decodeConnectAccountState(state);
  } catch {
    return NextResponse.redirect(
      new URL(`${CONNECTED_ACCOUNTS_PATH}?connect=error`, appOrigin),
    );
  }

  // Nama cookie di-scope per-nonce (`outstandConnectNonceCookieName`,
  // bukan satu nama tetap) — dua percobaan connect/reconnect yang tumpang
  // tindih (dua tab, double-invoke) masing-masing dapat cookie sendiri,
  // tidak saling menimpa sebelum salah satunya sempat consume oleh
  // callback-nya sendiri (lihat docstring di `outstand-connect-nonce-cookie.ts`).
  const nonceCookieName = outstandConnectNonceCookieName(decoded.nonce);

  function redirectWithStatus(status: "success" | "error"): NextResponse {
    const response = NextResponse.redirect(
      new URL(`${CONNECTED_ACCOUNTS_PATH}?connect=${status}`, appOrigin),
    );
    response.cookies.delete(nonceCookieName);
    return response;
  }

  // CSRF-check (ADR-105 poin 4) — cookie bernama `nonceCookieName` HARUS
  // ada (diset Server Action inisiasi, lihat `outstand-connect-nonce-cookie.ts`).
  // Cookie hilang berarti callback ini TIDAK berasal dari inisiasi yang
  // baru saja dilakukan sesi browser ini — tolak, jangan diam-diam lanjut.
  if (!request.cookies.has(nonceCookieName)) {
    return redirectWithStatus("error");
  }

  const session = await getCachedSession();
  if (!session) {
    // Nonce sudah tervalidasi (percobaan ini genuinely valid) — tetap
    // bersihkan cookie-nya sebelum redirect ke /login, sama seperti
    // redirectWithStatus, supaya cookie yang sudah dikonsumsi tidak
    // bertahan sampai TTL 10 menit habis sendiri.
    const response = NextResponse.redirect(new URL("/login", appOrigin));
    response.cookies.delete(nonceCookieName);
    return response;
  }

  const { workspaceId } = await getWorkspaceContext();
  const workspaceService = createWorkspaceServiceWithOutstandAdapter();

  try {
    await workspaceService.completeAccountConnection({
      workspaceId,
      actorId: asUserId(session.user.id),
      accountId,
      username,
      networkUniqueId: networkUniqueId ?? undefined,
      state,
      redirectAccountId: decoded.redirectAccountId
        ? asConnectedAccountId(decoded.redirectAccountId)
        : undefined,
    });
  } catch (error) {
    if (error instanceof ApplicationError) {
      return redirectWithStatus("error");
    }
    // Kegagalan tak terduga (bukan ApplicationError) — tetap dilempar apa
    // adanya (bukan diam-diam disamarkan jadi redirect error), tapi nonce
    // yang sudah tervalidasi ini tetap dibersihkan lebih dulu supaya tidak
    // bertahan sampai TTL habis sendiri (pola sama redirectWithStatus).
    (await cookies()).delete(nonceCookieName);
    throw error;
  }

  return redirectWithStatus("success");
}
