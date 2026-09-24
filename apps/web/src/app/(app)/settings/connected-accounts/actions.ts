"use server";

import {
  asConnectedAccountId,
  asUserId,
  SocialPlatform,
  type FacebookPendingPage,
} from "@social/shared";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { WorkspaceService } from "@/domains/workspace";
import { decodeConnectAccountState } from "@/lib/adapters/outstand/connect-state";
import { getCachedSession } from "@/lib/better-auth/session";
import { workspaceRepository } from "@/lib/repositories/workspace";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";
import { createWorkspaceServiceWithOutstandAdapter } from "@/lib/workspace/outstand-workspace-service";
import {
  outstandConnectNonceCookieName,
  outstandConnectNonceCookieOptions,
} from "@/lib/workspace/outstand-connect-nonce-cookie";
import { toActionError } from "@/lib/utils/errors";

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
      outstandConnectNonceCookieName(decoded.nonce),
      "1",
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
 * Facebook (T-025.4, KI-070) butuh perlakuan navigasi BEDA dari platform
 * single-page lain — lihat catatan Bug #2 di docstring
 * `initiateConnectAccountAction`/`initiateReconnectAccountAction` di
 * bawah. `true` berarti caller HARUS melakukan hard navigation sendiri
 * (`window.location.href = redirectUrl`) alih-alih mengandalkan
 * `redirect()` server-side.
 */
function requiresClientHardNavigation(platform: SocialPlatform): boolean {
  return platform === SocialPlatform.Facebook;
}

/**
 * Connect Account baru (T-013.1/T-013.2, ADR-105) — entry point tipis,
 * hanya resolve context + memanggil `WorkspaceService.initiateConnectAccount`
 * (AGENTS.md #5). RBAC sepenuhnya di Application Service. Sukses berarti
 * `redirect()` ke `redirectUrl` OAuth (Fake: loopback ke callback route
 * kita sendiri, ADR-105) — signature `Promise<{ error?: string }>` konsisten
 * dengan `disconnectAccountAction`; kegagalan RBAC/validasi mengembalikan
 * `{ error }` TANPA redirect, sama seperti `switchWorkspaceAction`.
 *
 * **Pengecualian Facebook (Bug #2, investigasi King Rezi + Elon Backend
 * Engineer, 2026-09-24, T-025.4/KI-070):** untuk `platform === Facebook`,
 * fungsi ini SENGAJA TIDAK memanggil `redirect()` di server — dikembalikan
 * `{ redirectUrl }` mentah, caller (`ConnectPlatformMenu`) yang wajib
 * melakukan `window.location.href = redirectUrl` (hard navigation penuh).
 *
 * Kenapa: `redirectUrl` Facebook SELALU loopback ke domain KITA SENDIRI
 * (`/api/integrations/outstand/callback?session=...`, ADR-115/§7 — beda
 * dari platform single-page lain yang `redirectUrl`-nya domain EKSTERNAL
 * `outstand.so`). Next.js App Router: "In a Server Action, redirect
 * performs a client-side navigation when JavaScript is available"
 * (dokumentasi resmi) — untuk target domain eksternal ini otomatis jadi
 * hard nav (aman), TAPI untuk target SAME-ORIGIN yang BUKAN page (Route
 * Handler `/api/...`), client runtime App Router (dikonfirmasi reproduksi
 * berulang di Next.js 16.2.10/Turbopack dev) memperlakukan seluruh rantai
 * (Server Action → Route Handler kita sendiri → balik ke halaman ini)
 * seolah satu transisi App Router yang sama — padahal Route Handler di
 * tengah me-redirect pakai `NextResponse.redirect()` MENTAH (bukan
 * redirect()-nya Server Action), mismatch protokol ini menghasilkan 2 bug
 * nyata yang direproduksi di browser: (1) method HTTP request susulan ke
 * Route Handler itu TIDAK SELALU dikonversi ke GET sesuai semantik 303
 * (405 non-deterministic — lihat docstring `POST` di
 * `api/integrations/outstand/callback/route.ts`), (2) SETELAH sampai
 * kembali di halaman ini, dialog Facebook Pages Picker macet Loading
 * SELAMANYA karena internal action-dispatch queue App Router tidak pernah
 * benar-benar "selesai" mentransisikan — Server Action BERIKUTNYA
 * (`listFacebookPendingPagesAction` dari dalam dialog) TIDAK PERNAH
 * ter-resolve (dikonfirmasi lewat instrumentasi `console.log` manual di
 * `useEffect` dialog: fungsi terpanggil, network request tidak pernah
 * dikirim sama sekali, promise menggantung tanpa timeout).
 *
 * Memaksa hard navigation dari CLIENT (bukan `redirect()` server) memutus
 * rantai App Router soft-nav sepenuhnya — sama seperti yang SUDAH terjadi
 * otomatis untuk redirect ke domain eksternal (`outstand.so`), jadi
 * perilaku Real adapter TIDAK berubah sama sekali (di produksi,
 * `redirectUrl` Facebook tetap URL `outstand.so` — `window.location.href`
 * ke situ persis sama efeknya dengan `redirect()` server yang sudah
 * otomatis hard-nav untuk kasus itu). Platform lain (Instagram/X/dst)
 * TIDAK disentuh sama sekali oleh perubahan ini — tetap lewat `redirect()`
 * server seperti semula, tidak ada perubahan test/behavior untuk mereka.
 * Bukan keputusan arsitektur/ADR baru (tidak mengubah kontrak
 * `WorkspaceService`/`OutstandAdapter`, murni siapa yang memicu navigasi
 * browser) — didokumentasikan di sini + laporan ke King Rezi, bukan
 * `DECISIONS.md`.
 */
export async function initiateConnectAccountAction(
  platform: SocialPlatform,
): Promise<{ error?: string; redirectUrl?: string }> {
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

  if (requiresClientHardNavigation(platform)) {
    return { redirectUrl };
  }

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
 *
 * Pengecualian Facebook (Bug #2) sama persis dengan
 * `initiateConnectAccountAction` di atas — lihat docstring-nya untuk
 * detail lengkap. Berlaku juga di sini karena "Reconnect" akun Facebook
 * Page yang sudah ada memanggil `connectAccount()` yang sama, dengan
 * `redirectUrl` loopback yang sama persis.
 */
export async function initiateReconnectAccountAction(
  connectedAccountId: string,
  platform: SocialPlatform,
): Promise<{ error?: string; redirectUrl?: string }> {
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

  if (requiresClientHardNavigation(platform)) {
    return { redirectUrl };
  }

  redirect(redirectUrl);
}

/**
 * Facebook Pages — list pending Pages (T-025.4, ADR-115) — dipanggil dialog
 * Page-selection saat mount (state Loading → Default), setelah Route
 * Handler callback redirect ke Connected Accounts dengan
 * `connectFacebookSessionToken`/`connectFacebookState` (ADR-115 §7).
 * `state` di-decode LAGI di sini untuk mencocokkan nonce CSRF (reuse
 * `decodeConnectAccountState`) — cookie HANYA dibaca, TIDAK dihapus (flow
 * belum selesai, dihapus di `confirmFacebookPagesConnectionAction`).
 */
export async function listFacebookPendingPagesAction(
  sessionToken: string,
  state: string,
): Promise<{ pages?: FacebookPendingPage[]; error?: string }> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  let decoded: ReturnType<typeof decodeConnectAccountState>;
  try {
    decoded = decodeConnectAccountState(state);
  } catch {
    return { error: "Sesi koneksi Facebook tidak valid." };
  }

  const nonceCookieName = outstandConnectNonceCookieName(decoded.nonce);
  if (!(await cookies()).has(nonceCookieName)) {
    return { error: "Sesi koneksi Facebook tidak valid atau kedaluwarsa." };
  }

  const workspaceService = createWorkspaceServiceWithOutstandAdapter();
  try {
    const pages = await workspaceService.listFacebookPendingPages({
      workspaceId,
      actorId: asUserId(session.user.id),
      sessionToken,
    });
    return { pages };
  } catch (error) {
    return toActionError(error);
  }
}

/**
 * Facebook Pages — confirm selected Pages (T-025.4, ADR-115) — dipanggil
 * saat user submit dialog Page-selection (tombol "Hubungkan N Page
 * Terpilih"). `state` di-decode LAGI + cookie CSRF dicocokkan LAGI
 * (defense-in-depth sama seperti `completeAccountConnection` —
 * parameter round-trip lewat browser/dialog bisa ditamper antara list dan
 * confirm) — **cookie nonce DIHAPUS DI SINI** (baik sukses maupun gagal,
 * titik akhir flow, sama seperti `redirectWithStatus` di Route Handler).
 */
export async function confirmFacebookPagesConnectionAction(
  sessionToken: string,
  state: string,
  selectedPageIds: string[],
): Promise<{ connectedCount?: number; error?: string }> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  let decoded: ReturnType<typeof decodeConnectAccountState>;
  try {
    decoded = decodeConnectAccountState(state);
  } catch {
    return { error: "Sesi koneksi Facebook tidak valid." };
  }

  const cookieStore = await cookies();
  const nonceCookieName = outstandConnectNonceCookieName(decoded.nonce);
  const hasNonce = cookieStore.has(nonceCookieName);
  cookieStore.delete(nonceCookieName);

  if (!hasNonce) {
    return { error: "Sesi koneksi Facebook tidak valid atau kedaluwarsa." };
  }

  const workspaceService = createWorkspaceServiceWithOutstandAdapter();
  try {
    const created = await workspaceService.confirmFacebookPagesConnection({
      workspaceId,
      actorId: asUserId(session.user.id),
      sessionToken,
      selectedPageIds,
    });
    revalidatePath("/settings/connected-accounts");
    return { connectedCount: created.length };
  } catch (error) {
    return toActionError(error);
  }
}
