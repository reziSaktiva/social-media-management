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
