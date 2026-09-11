"use server";

import {
  asConnectedAccountId,
  asUserId,
  type SocialPlatform,
} from "@social/shared";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { WorkspaceService } from "@/domains/workspace";
import { getOutstandAdapter } from "@/lib/adapters/outstand";
import { decodeConnectAccountState } from "@/lib/adapters/outstand/connect-state";
import { getCachedSession } from "@/lib/better-auth/session";
import { workspaceRepository } from "@/lib/repositories/workspace";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";
import {
  OUTSTAND_CONNECT_NONCE_COOKIE,
  outstandConnectNonceCookieOptions,
} from "@/lib/workspace/outstand-connect-nonce-cookie";
import { toActionError } from "@/lib/utils/errors";

function createWorkspaceServiceWithOutstandAdapter(): WorkspaceService {
  return new WorkspaceService(
    workspaceRepository,
    undefined,
    undefined,
    getOutstandAdapter(),
  );
}

/**
 * Simpan nonce CSRF (dari `state` yang dibentuk `connectAccount`) sebagai
 * cookie httpOnly SEBELUM redirect browser ke `redirectUrl` (ADR-105 poin
 * 4) — dibaca+dicocokkan kembali Route Handler callback. `redirectUrl`
 * adalah path relatif Fake (`/api/integrations/outstand/callback?...`),
 * jadi di-parse dengan base dummy murni untuk membaca `searchParams`, BUKAN
 * dipakai sebagai origin request sungguhan. Kalau `state` tidak dalam
 * format yang dikenal (mis. real adapter T-025 nanti memakai skema
 * berbeda) — skip diam-diam, bukan fatal; CSRF-nonce lokal ini murni
 * pelengkap Fake loopback (lihat catatan di `connect-state.ts`).
 */
async function persistConnectNonceCookie(redirectUrl: string): Promise<void> {
  const state = new URL(
    redirectUrl,
    "http://outstand-connect.invalid",
  ).searchParams.get("state");
  if (!state) return;

  try {
    const decoded = decodeConnectAccountState(state);
    (await cookies()).set(
      OUTSTAND_CONNECT_NONCE_COOKIE,
      decoded.nonce,
      outstandConnectNonceCookieOptions(),
    );
  } catch {
    // Format state tidak dikenal — lihat docstring di atas.
  }
}

/**
 * Disconnect akun terhubung (T-014.2, ADR-048/ADR-049) — entry point tipis,
 * hanya resolve workspace context + session lalu memanggil
 * `WorkspaceService.disconnectAccount` (AGENTS.md #5). RBAC (Owner/Admin)
 * dan seluruh business logic sepenuhnya di Application Service, TIDAK di
 * sini. Dialog konfirmasi Tier 2 (KSP-08-F07) yang memanggil action ini
 * adalah scope T-014.3 (belum dikerjakan) — action ini sendiri tidak
 * mengasumsikan sudah dikonfirmasi, hanya mengeksekusi apa yang diminta
 * caller.
 */
export async function disconnectAccountAction(
  connectedAccountId: string,
): Promise<{ error?: string }> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const workspaceService = new WorkspaceService(workspaceRepository);

  try {
    await workspaceService.disconnectAccount(
      workspaceId,
      asUserId(session.user.id),
      asConnectedAccountId(connectedAccountId),
    );
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/settings/connected-accounts");
  return {};
}

/**
 * Connect Account baru (T-013.1/T-013.2, ADR-105) — entry point tipis,
 * hanya resolve context + memanggil `WorkspaceService.initiateConnectAccount`
 * (AGENTS.md #5). RBAC sepenuhnya di Application Service. Sukses berarti
 * `redirect()` ke `redirectUrl` OAuth (Fake: loopback ke callback route
 * kita sendiri, ADR-105) — signature `Promise<{ error?: string }>` konsisten
 * dengan `disconnectAccountAction`; kegagalan RBAC/validasi mengembalikan
 * `{ error }` TANPA redirect, sama seperti `switchWorkspaceAction`.
 */
export async function initiateConnectAccountAction(
  platform: SocialPlatform,
): Promise<{ error?: string }> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  let redirectUrl: string;
  try {
    const result =
      await createWorkspaceServiceWithOutstandAdapter().initiateConnectAccount({
        workspaceId,
        actorId: asUserId(session.user.id),
        platform,
      });
    redirectUrl = result.redirectUrl;
  } catch (error) {
    return toActionError(error);
  }

  await persistConnectNonceCookie(redirectUrl);
  redirect(redirectUrl);
}

/**
 * Reconnect akun existing (T-015.3, ADR-105) — sama pola dengan
 * `initiateConnectAccountAction`, `redirectAccountId` diisi supaya
 * `WorkspaceService` tahu ini UPDATE (bukan CREATE) saat callback nanti.
 * `platform` diteruskan dari `ConnectedAccountRecord` yang sudah dimiliki
 * caller (`ConnectedAccountsList`) — dicocokkan ulang ke akun di
 * `WorkspaceService.initiateConnectAccount` (defense-in-depth, lihat
 * docstring method itu).
 */
export async function initiateReconnectAccountAction(
  connectedAccountId: string,
  platform: SocialPlatform,
): Promise<{ error?: string }> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  let redirectUrl: string;
  try {
    const result =
      await createWorkspaceServiceWithOutstandAdapter().initiateConnectAccount({
        workspaceId,
        actorId: asUserId(session.user.id),
        platform,
        redirectAccountId: asConnectedAccountId(connectedAccountId),
      });
    redirectUrl = result.redirectUrl;
  } catch (error) {
    return toActionError(error);
  }

  await persistConnectNonceCookie(redirectUrl);
  redirect(redirectUrl);
}
