import type {
  ConnectedAccountId,
  InvitationId,
  InvitationStatus,
  MemberId,
  MemberRole,
  MemberStatus,
  SocialPlatform,
  UserId,
  WorkspaceId,
} from "@social/shared";

export interface WorkspaceRecord {
  id: WorkspaceId;
  name: string;
  slug: string;
}

export interface ConnectedAccountRecord {
  id: ConnectedAccountId;
  workspaceId: WorkspaceId;
  platform: SocialPlatform;
  outstandAccountId: string;
  handle: string;
  status: string;
  reconnectRequired: boolean;
  connectedAt: Date;
}

export interface WorkspaceMemberRecord {
  id: MemberId;
  workspaceId: WorkspaceId;
  userId: UserId;
  role: MemberRole;
  status: MemberStatus;
}

export interface WorkspaceInvitationRecord {
  id: InvitationId;
  workspaceId: WorkspaceId;
  email: string;
  role: MemberRole;
  token: string;
  status: InvitationStatus;
  expiresAt: Date;
}

/** Repository interface — implementation (Prisma) lives in src/lib/repositories/workspace. */
export interface IWorkspaceRepository {
  createWithOwner(input: {
    name: string;
    slug: string;
    ownerId: UserId;
  }): Promise<WorkspaceRecord>;

  findAnyMembershipSlugByUserId(userId: UserId): Promise<string | null>;

  /**
   * Sama seperti `findAnyMembershipSlugByUserId` + `findBySlug` digabung
   * satu query — dipakai caller yang butuh WorkspaceRecord lengkap
   * (bukan cuma slug) supaya tidak dua round trip (code-review finding).
   */
  findDefaultWorkspaceForUser(userId: UserId): Promise<WorkspaceRecord | null>;

  findBySlug(slug: string): Promise<WorkspaceRecord | null>;

  /** Ordered by `connectedAt` ascending. */
  listConnectedAccounts(
    workspaceId: WorkspaceId,
  ): Promise<ConnectedAccountRecord[]>;

  /** Ordered by `joinedAt` ascending — dipakai UI daftar anggota (T-007.4). */
  listMembers(workspaceId: WorkspaceId): Promise<WorkspaceMemberRecord[]>;

  /**
   * Batch lookup nama/email user by id. `WorkspaceMember.userId` tidak
   * punya relasi FK Prisma ke `User` (kemungkinan disengaja, beda bounded
   * context), jadi join dilakukan manual di service layer lewat method ini
   * — bukan Prisma `include`. Dipakai `WorkspaceService.listMembersWithUser`.
   */
  findUsersByIds(
    userIds: UserId[],
  ): Promise<{ id: UserId; name: string; email: string }[]>;

  /** Lookup membership by user — dipakai RBAC untuk resolve role actor. */
  getMember(
    workspaceId: WorkspaceId,
    userId: UserId,
  ): Promise<WorkspaceMemberRecord | null>;

  /** Lookup membership by row id — dipakai untuk resolve target member. */
  findMemberById(
    workspaceId: WorkspaceId,
    memberId: MemberId,
  ): Promise<WorkspaceMemberRecord | null>;

  /** Hard delete (DB-D03) — bukan soft-delete. */
  removeMember(workspaceId: WorkspaceId, memberId: MemberId): Promise<void>;

  updateMemberRole(
    workspaceId: WorkspaceId,
    memberId: MemberId,
    role: MemberRole,
  ): Promise<void>;

  createInvitation(input: {
    workspaceId: WorkspaceId;
    email: string;
    role: MemberRole;
    invitedByUserId: UserId;
    token: string;
    expiresAt: Date;
  }): Promise<WorkspaceInvitationRecord>;

  /** Belum dipakai service manapun — disiapkan untuk acceptInvite (task lain). */
  findInvitationByToken(
    token: string,
  ): Promise<WorkspaceInvitationRecord | null>;
}
