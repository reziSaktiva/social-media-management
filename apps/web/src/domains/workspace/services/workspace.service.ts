import type { UserId, WorkspaceId } from "@social/shared";
import { ConflictError, ValidationError } from "@/lib/utils/errors";
import { slugify } from "../value-objects/slugify";
import type {
  ConnectedAccountRecord,
  IWorkspaceRepository,
  WorkspaceRecord,
} from "../repositories/workspace.repository";
import type { SidebarChannelAccount } from "../types";

const MAX_NAME_LENGTH = 100;
const MAX_SLUG_ATTEMPTS = 6;

export class WorkspaceService {
  constructor(private readonly repository: IWorkspaceRepository) {}

  async createWorkspace(input: {
    userId: UserId;
    name: string;
  }): Promise<WorkspaceRecord> {
    const name = input.name.trim();

    if (!name) {
      throw new ValidationError("Nama workspace wajib diisi.");
    }
    if (name.length > MAX_NAME_LENGTH) {
      throw new ValidationError(
        `Nama workspace maksimal ${MAX_NAME_LENGTH} karakter.`,
      );
    }

    const baseSlug = slugify(name);
    if (!baseSlug) {
      throw new ValidationError("Nama workspace tidak valid.");
    }

    for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
      const candidateSlug =
        attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;

      try {
        return await this.repository.createWithOwner({
          name,
          slug: candidateSlug,
          ownerId: input.userId,
        });
      } catch (error) {
        const isLastAttempt = attempt === MAX_SLUG_ATTEMPTS - 1;
        if (error instanceof ConflictError && !isLastAttempt) {
          continue;
        }
        throw error;
      }
    }

    throw new ConflictError(
      "Gagal membuat slug workspace yang unik. Coba nama lain.",
    );
  }

  async getDefaultWorkspaceSlugForUser(userId: UserId): Promise<string | null> {
    return this.repository.findAnyMembershipSlugByUserId(userId);
  }

  async getWorkspaceBySlug(slug: string): Promise<WorkspaceRecord | null> {
    return this.repository.findBySlug(slug);
  }

  async listConnectedAccounts(
    workspaceId: WorkspaceId,
  ): Promise<ConnectedAccountRecord[]> {
    return this.repository.listConnectedAccounts(workspaceId);
  }

  /**
   * Returns connected accounts shaped for sidebar rendering.
   * `scheduledCount` is stubbed at 0 until T-012.2 (publishing domain v0.2).
   */
  async listSidebarChannels(
    workspaceId: WorkspaceId,
  ): Promise<SidebarChannelAccount[]> {
    const accounts = await this.repository.listConnectedAccounts(workspaceId);
    return accounts.map((account) => ({
      id: account.id,
      platform: account.platform,
      handle: account.handle,
      status: account.status,
      reconnectRequired: account.reconnectRequired,
      scheduledCount: 0,
    }));
  }
}
