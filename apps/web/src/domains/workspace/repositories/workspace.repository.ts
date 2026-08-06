import type {
  ConnectedAccountId,
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
}
