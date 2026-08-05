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
}

/** Repository interface — implementation (Prisma) lives in src/lib/repositories/workspace. */
export interface IWorkspaceRepository {
  createWithOwner(input: {
    name: string;
    slug: string;
    ownerId: UserId;
  }): Promise<WorkspaceRecord>;

  findAnyMembershipSlugByUserId(userId: UserId): Promise<string | null>;

  findBySlug(slug: string): Promise<WorkspaceRecord | null>;

  /** Ordered by `connectedAt` ascending. */
  listConnectedAccounts(
    workspaceId: WorkspaceId,
  ): Promise<ConnectedAccountRecord[]>;
}
