/** Domain-specific types for workspace. */

import type {
  MemberId,
  MemberRole,
  MemberStatus,
  SocialPlatform,
  UserId,
} from "@social/shared";

/**
 * Shape consumed by UI surfaces that render a quick-glance list of connected
 * accounts — currently the sidebar "Channels" section (T-012, ADR-058) and,
 * later, the Connected Accounts settings page (T-015). Kept in the workspace
 * domain's public API so both surfaces import one contract instead of
 * redefining it.
 *
 * `scheduledCount` is a real cross-domain count from `publishing` (T-012.2),
 * supplied via `WorkspaceService`'s `ScheduledCountsPort` — defaults to 0
 * when the port isn't provided to the constructor (back-compat call-sites).
 */
export interface SidebarChannelAccount {
  id: string;
  platform: SocialPlatform;
  handle: string;
  status: string;
  reconnectRequired: boolean;
  scheduledCount: number;
}

/**
 * Workspace member row joined with user name/email — dipakai UI daftar
 * anggota (T-007.4). `userId` tidak punya relasi FK Prisma ke `User`
 * (beda bounded context, lihat catatan di IWorkspaceRepository.findUsersByIds),
 * jadi join ini dilakukan manual di WorkspaceService.listMembersWithUser,
 * bukan lewat Prisma `include`.
 */
export interface WorkspaceMemberWithUser {
  id: MemberId;
  userId: UserId;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
}

/**
 * Detail undangan siap-render untuk halaman accept-invite (T-093.1,
 * ADR-080). `isExistingUser` menentukan form mana yang ditampilkan (Buat
 * Akun Baru vs Masuk) — hasil auto-detect `WorkspaceService.getInviteToAccept`,
 * bukan pilihan user.
 */
export interface WorkspaceInviteAcceptDetails {
  workspaceName: string;
  invitedByName: string;
  role: MemberRole;
  email: string;
  isExistingUser: boolean;
}

/**
 * Discriminated union hasil validasi token accept-invite (T-093.1) — 3 dari
 * 5 state UI Claude Design (`templates/accept-invite.html`) ditentukan di
 * sini; 2 sisanya ("Email Baru"/"Email Terdaftar", dibedakan lewat
 * `details.isExistingUser`) dan "Success" (hasil aksi submit, bukan hasil
 * validasi token) ditentukan di layer UI.
 */
export type WorkspaceInviteAcceptView =
  | { state: "valid"; details: WorkspaceInviteAcceptDetails }
  | { state: "expired" }
  | { state: "invalid" };
