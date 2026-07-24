import type { UserId, WorkspaceId } from "@social/shared";

export interface WorkspaceRecord {
  id: WorkspaceId;
  name: string;
  slug: string;
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
}
