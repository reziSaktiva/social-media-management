import { NextResponse, type NextRequest } from "next/server";
import { asConnectedAccountId, asUserId } from "@social/shared";
import { WorkspaceService } from "@/domains/workspace";
import { getOutstandAdapter } from "@/lib/adapters/outstand";
import { decodeConnectAccountState } from "@/lib/adapters/outstand/connect-state";
import { getCachedSession } from "@/lib/better-auth/session";
import { getServerEnv } from "@/lib/env";
import { workspaceRepository } from "@/lib/repositories/workspace";
import { ApplicationError } from "@/lib/utils/errors";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";
import { OUTSTAND_CONNECT_NONCE_COOKIE } from "@/lib/workspace/outstand-connect-nonce-cookie";

const CONNECTED_ACCOUNTS_PATH = "/settings/connected-accounts";

/**
 * Route Handler callback Connect/Reconnect Account (T-013.1/T-013.2,
 * T-015.3, ADR-105, `integration-layer.md` § "Alur Connect Account").
 * TIDAK boleh berisi business logic (AGENTS.md #5) — satu-satunya
 * keputusan di sini adalah marshalling (baca query param, decode `state`,
 * cocokkan nonce CSRF) sebelum delegasi penuh ke
 * `WorkspaceService.completeAccountConnection`; CREATE vs UPDATE
 * `ConnectedAccount`, RBAC, dan validasi kepemilikan akun semuanya ada di
 * Application Service, bukan di sini.
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

  function redirectWithStatus(status: "success" | "error"): NextResponse {
    const response = NextResponse.redirect(
      new URL(`${CONNECTED_ACCOUNTS_PATH}?connect=${status}`, appOrigin),
    );
    response.cookies.delete(OUTSTAND_CONNECT_NONCE_COOKIE);
    return response;
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  // Bug QA Najwa (T-015, 2026-09-11): setiap redirect() sukses dari Server
  // Action (`initiateConnectAccountAction`/`initiateReconnectAccountAction`)
  // ke path relatif Route Handler ini, App Router Next.js memperlakukan
  // target sebagai navigasi internal dan menyusulkan 1-2 request
  // prefetch/revalidasi ke PATHNAME YANG SAMA TANPA query string (perilaku
  // cache prefetch bawaan Next.js, bukan bug kode kita — reproducible di
  // semua platform/reconnect). Request susulan itu SAMA SEKALI tidak
  // membawa `code` MAUPUN `state` (beda dari request OAuth asli yang selalu
  // membawa keduanya, atau request malformed/tampered yang membawa salah
  // satu). Kalau keduanya kosong, diamkan (no-op, redirect polos tanpa
  // `?connect=`) — JANGAN dianggap gagal, supaya tidak menumpuk toast error
  // palsu di atas toast sukses dari request asli. Kalau HANYA salah satu
  // yang kosong, itu tetap request bermasalah sungguhan → tetap error.
  if (!code && !state) {
    const response = NextResponse.redirect(
      new URL(CONNECTED_ACCOUNTS_PATH, appOrigin),
    );
    return response;
  }
  if (!code || !state) {
    return redirectWithStatus("error");
  }

  let decoded: ReturnType<typeof decodeConnectAccountState>;
  try {
    decoded = decodeConnectAccountState(state);
  } catch {
    return redirectWithStatus("error");
  }

  // CSRF-check (ADR-105 poin 4) — `nonce` yang dibawa `state` HARUS cocok
  // dengan cookie yang diset Server Action inisiasi (lihat
  // `outstand-connect-nonce-cookie.ts`). Cookie hilang/tidak cocok berarti
  // callback ini TIDAK berasal dari inisiasi yang baru saja dilakukan sesi
  // browser ini — tolak, jangan diam-diam lanjut.
  const nonceCookie = request.cookies.get(OUTSTAND_CONNECT_NONCE_COOKIE)?.value;
  if (!nonceCookie || nonceCookie !== decoded.nonce) {
    return redirectWithStatus("error");
  }

  const session = await getCachedSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", appOrigin));
  }

  const { workspaceId } = await getWorkspaceContext();
  const workspaceService = new WorkspaceService(
    workspaceRepository,
    undefined,
    undefined,
    getOutstandAdapter(),
  );

  try {
    await workspaceService.completeAccountConnection({
      workspaceId,
      actorId: asUserId(session.user.id),
      code,
      state,
      redirectAccountId: decoded.redirectAccountId
        ? asConnectedAccountId(decoded.redirectAccountId)
        : undefined,
    });
  } catch (error) {
    if (error instanceof ApplicationError) {
      return redirectWithStatus("error");
    }
    throw error;
  }

  return redirectWithStatus("success");
}
