import { MemberRole, MemberStatus } from "@social/shared";
import type { MemberId, UserId, WorkspaceId } from "@social/shared";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/utils/errors";
import { slugify } from "../value-objects/slugify";
import type {
  ConnectedAccountRecord,
  IWorkspaceRepository,
  WorkspaceMemberRecord,
  WorkspaceRecord,
} from "../repositories/workspace.repository";
import type { SidebarChannelAccount, WorkspaceMemberWithUser } from "../types";

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

  async getDefaultWorkspaceForUser(
    userId: UserId,
  ): Promise<WorkspaceRecord | null> {
    return this.repository.findDefaultWorkspaceForUser(userId);
  }

  /** Dipakai `getWorkspaceContext()` (ADR-076) — resolve workspace by cookie id. */
  async getWorkspaceById(
    workspaceId: WorkspaceId,
  ): Promise<WorkspaceRecord | null> {
    return this.repository.findById(workspaceId);
  }

  /**
   * Lookup membership by user — satu-satunya membership-check di codebase
   * ini, dipakai `assertActorCanManageMembers` (dedup, bukan pola baru).
   */
  async getMembership(
    workspaceId: WorkspaceId,
    userId: UserId,
  ): Promise<WorkspaceMemberRecord | null> {
    return this.repository.getMember(workspaceId, userId);
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

  /**
   * Daftar anggota workspace tergabung dengan nama/email (T-007.4). Join
   * dilakukan manual (bukan Prisma `include`) karena `WorkspaceMember.userId`
   * tidak punya relasi FK ke `User` — lihat catatan di
   * `IWorkspaceRepository.findUsersByIds`. Anggota yang usernya tidak
   * ditemukan (data korup) dilewati diam-diam, bukan throw — konsisten
   * dengan gaya defensif `listSidebarChannels`.
   */
  async listMembersWithUser(
    workspaceId: WorkspaceId,
  ): Promise<WorkspaceMemberWithUser[]> {
    const members = await this.repository.listMembers(workspaceId);
    const users = await this.repository.findUsersByIds(
      members.map((member) => member.userId),
    );
    const userById = new Map(users.map((user) => [user.id, user]));

    const result: WorkspaceMemberWithUser[] = [];
    for (const member of members) {
      const user = userById.get(member.userId);
      if (!user) {
        continue;
      }
      result.push({
        id: member.id,
        userId: member.userId,
        name: user.name,
        email: user.email,
        role: member.role,
        status: member.status,
      });
    }
    return result;
  }

  /** Owner/Admin only; dipakai removeMember & updateMemberRole. */
  private async assertActorCanManageMembers(
    workspaceId: WorkspaceId,
    actorUserId: UserId,
    actionErrorMessage: string,
  ): Promise<void> {
    const actor = await this.getMembership(workspaceId, actorUserId);
    if (!actor || actor.status !== MemberStatus.Active) {
      throw new AuthorizationError("Anda bukan anggota aktif workspace ini.");
    }
    if (actor.role !== MemberRole.Owner && actor.role !== MemberRole.Admin) {
      throw new AuthorizationError(actionErrorMessage);
    }
  }

  /** Owner tidak bisa jadi target; dipakai removeMember & updateMemberRole. */
  private async getManageableTarget(
    workspaceId: WorkspaceId,
    targetMemberId: MemberId,
    ownerErrorMessage: string,
  ): Promise<WorkspaceMemberRecord> {
    const target = await this.repository.findMemberById(
      workspaceId,
      targetMemberId,
    );
    if (!target) {
      throw new NotFoundError("Anggota tidak ditemukan.");
    }
    if (target.role === MemberRole.Owner) {
      throw new AuthorizationError(ownerErrorMessage);
    }
    return target;
  }

  async removeMember(
    workspaceId: WorkspaceId,
    actorUserId: UserId,
    targetMemberId: MemberId,
  ): Promise<void> {
    await this.assertActorCanManageMembers(
      workspaceId,
      actorUserId,
      "Hanya Owner atau Admin yang bisa menghapus anggota.",
    );
    await this.getManageableTarget(
      workspaceId,
      targetMemberId,
      "Owner tidak bisa dihapus dari workspace.",
    );

    await this.repository.removeMember(workspaceId, targetMemberId);
  }

  async updateMemberRole(
    workspaceId: WorkspaceId,
    actorUserId: UserId,
    targetMemberId: MemberId,
    newRole: MemberRole,
  ): Promise<void> {
    if (newRole === MemberRole.Owner) {
      throw new ValidationError(
        "Gunakan alur Transfer Ownership untuk menjadikan anggota sebagai Owner.",
      );
    }

    await this.assertActorCanManageMembers(
      workspaceId,
      actorUserId,
      "Hanya Owner atau Admin yang bisa mengubah role anggota.",
    );
    await this.getManageableTarget(
      workspaceId,
      targetMemberId,
      "Role Owner tidak bisa diubah lewat sini.",
    );

    await this.repository.updateMemberRole(
      workspaceId,
      targetMemberId,
      newRole,
    );
  }
}
