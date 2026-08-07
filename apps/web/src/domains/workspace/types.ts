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
 * `scheduledCount` is a stub — always 0 until T-012.2 (scheduled-posts count
 * across the Publishing domain) is implemented; this needs domain publishing
 * v0.2, which does not exist yet (see PROJECT_STATE.md / v01-foundation.md
 * T-012.2).
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
