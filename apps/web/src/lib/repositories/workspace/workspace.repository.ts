import {
  asConnectedAccountId,
  asInvitationId,
  asMemberId,
  asUserId,
  asWorkspaceId,
  type InvitationStatus,
  MemberRole,
  MemberStatus,
  type SocialPlatform,
} from "@social/shared";
import type {
  IWorkspaceRepository,
  WorkspaceInvitationRecord,
  WorkspaceMemberRecord,
} from "@/domains/workspace";
import {
  Prisma,
  type WorkspaceInvitation,
  type WorkspaceMember,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma/client";
import {
  setCurrentUserId,
  withCurrentUser,
} from "@/lib/prisma/with-current-user";
import { ConflictError, NotFoundError } from "@/lib/utils/errors";

/**
 * With the pg driver adapter (Prisma 7 / @prisma/adapter-pg), P2002's
 * `meta.target` field name array isn't populated — only `meta.modelName`
 * is reliable. `slug` is the only unique constraint on Workspace besides
 * the generated UUID primary key, so a P2002 on this model is the slug
 * collision.
 */
function isSlugConflict(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    error.meta?.modelName === "Workspace"
  );
}

function isRecordNotFound(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

function isInvitationEmailConflict(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    error.meta?.modelName === "WorkspaceInvitation"
  );
}

function toMemberRecord(member: WorkspaceMember): WorkspaceMemberRecord {
  return {
    id: asMemberId(member.id),
    workspaceId: asWorkspaceId(member.workspaceId),
    userId: asUserId(member.userId),
    role: member.role as MemberRole,
    status: member.status as MemberStatus,
  };
}

function toInvitationRecord(
  invitation: WorkspaceInvitation,
): WorkspaceInvitationRecord {
  return {
    id: asInvitationId(invitation.id),
    workspaceId: asWorkspaceId(invitation.workspaceId),
    email: invitation.email,
    role: invitation.role as MemberRole,
    token: invitation.token,
    status: invitation.status as InvitationStatus,
    expiresAt: invitation.expiresAt,
  };
}

export const workspaceRepository: IWorkspaceRepository = {
  async createWithOwner({ name, slug, ownerId }) {
    try {
      return await prisma.$transaction(async (tx) => {
        // RLS (KI-026): the owner's membership row is created before any
        // membership exists, so `app.current_user_id` must be set to the
        // new owner's own id — the SELECT policy on workspace_members
        // allows a row to be returned when it matches the session's own
        // user_id directly (no self-referencing subquery), which is what
        // lets Prisma's implicit `RETURNING` on the insert below succeed.
        // Uses `setCurrentUserId` (not `withCurrentUser`) because this
        // already has its own outer transaction — `withCurrentUser` opens
        // a second, separate one, which would break the atomicity of
        // creating the workspace + owner membership together.
        await setCurrentUserId(tx, ownerId);

        const workspace = await tx.workspace.create({
          data: { name, slug, ownerId },
        });

        await tx.workspaceMember.create({
          data: {
            workspaceId: workspace.id,
            userId: ownerId,
            role: MemberRole.Owner,
            status: MemberStatus.Active,
            joinedAt: new Date(),
          },
        });

        return {
          id: asWorkspaceId(workspace.id),
          name: workspace.name,
          slug: workspace.slug,
        };
      });
    } catch (error) {
      if (isSlugConflict(error)) {
        throw new ConflictError(`Slug "${slug}" sudah digunakan.`);
      }
      throw error;
    }
  },

  async findDefaultWorkspaceForUser(userId) {
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId, status: MemberStatus.Active },
      orderBy: { joinedAt: "asc" },
      include: { workspace: { select: { id: true, name: true, slug: true } } },
    });

    if (!membership) {
      return null;
    }

    return {
      id: asWorkspaceId(membership.workspace.id),
      name: membership.workspace.name,
      slug: membership.workspace.slug,
    };
  },

  async findById(workspaceId) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        slug: true,
        pendingOwnerTransferTo: true,
      },
    });

    if (!workspace) {
      return null;
    }

    return {
      id: asWorkspaceId(workspace.id),
      name: workspace.name,
      slug: workspace.slug,
      pendingOwnerTransferTo: workspace.pendingOwnerTransferTo
        ? asUserId(workspace.pendingOwnerTransferTo)
        : null,
    };
  },

  async listConnectedAccounts(workspaceId, userId) {
    const accounts = await withCurrentUser(userId, (tx) =>
      tx.workspaceConnectedAccount.findMany({
        where: { workspaceId },
        orderBy: { connectedAt: "asc" },
      }),
    );

    return accounts.map((account) => ({
      id: asConnectedAccountId(account.id),
      workspaceId: asWorkspaceId(account.workspaceId),
      platform: account.platform as SocialPlatform,
      outstandAccountId: account.outstandAccountId,
      handle: account.handle,
      status: account.status,
      reconnectRequired: account.reconnectRequired,
      connectedAt: account.connectedAt,
    }));
  },

  async countActiveConnectedAccounts(workspaceId, userId) {
    return withCurrentUser(userId, (tx) =>
      tx.workspaceConnectedAccount.count({
        where: { workspaceId, status: "active" },
      }),
    );
  },

  async listMembers(workspaceId, actingUserId) {
    const members = await withCurrentUser(actingUserId, (tx) =>
      tx.workspaceMember.findMany({
        where: { workspaceId },
        orderBy: { joinedAt: "asc" },
      }),
    );

    return members.map(toMemberRecord);
  },

  async findUsersByIds(userIds) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    return users.map((user) => ({
      id: asUserId(user.id),
      name: user.name,
      email: user.email,
    }));
  },

  /**
   * `getMember` is called with the acting `userId` already in scope (RBAC
   * membership lookup), so it's a natural fit for `withCurrentUser` — sets
   * `app.current_user_id` for the duration of this query so the RLS
   * policy on `workspace_members` (migration
   * `20260813045625_t017_add_rls_policies`, KI-026 follow-up fixes) can
   * actually enforce workspace isolation. `DATABASE_URL` now connects as
   * the non-BYPASSRLS `app_runtime` role (KI-026, resolved). Every other
   * method in this file has since adopted the same pattern (code review,
   * PR #71) — `findInvitationByToken` is the one deliberate exception, see
   * its doc comment in `domains/workspace/repositories/workspace.repository.ts`.
   */
  async getMember(workspaceId, userId) {
    const member = await withCurrentUser(userId, (tx) =>
      tx.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId } },
      }),
    );

    return member ? toMemberRecord(member) : null;
  },

  async findMemberById(workspaceId, memberId, actingUserId) {
    const member = await withCurrentUser(actingUserId, (tx) =>
      tx.workspaceMember.findFirst({
        where: { id: memberId, workspaceId },
      }),
    );

    return member ? toMemberRecord(member) : null;
  },

  async removeMember(workspaceId, memberId, actingUserId) {
    try {
      await withCurrentUser(actingUserId, (tx) =>
        tx.workspaceMember.delete({
          where: { id: memberId, workspaceId },
        }),
      );
    } catch (error) {
      if (isRecordNotFound(error)) {
        throw new NotFoundError("Anggota tidak ditemukan.");
      }
      throw error;
    }
  },

  async updateMemberRole(workspaceId, memberId, role, actingUserId) {
    try {
      await withCurrentUser(actingUserId, (tx) =>
        tx.workspaceMember.update({
          where: { id: memberId, workspaceId },
          data: { role },
        }),
      );
    } catch (error) {
      if (isRecordNotFound(error)) {
        throw new NotFoundError("Anggota tidak ditemukan.");
      }
      throw error;
    }
  },

  async createInvitation({
    workspaceId,
    email,
    role,
    invitedByUserId,
    token,
    expiresAt,
  }) {
    let invitation;
    try {
      invitation = await withCurrentUser(invitedByUserId, (tx) =>
        tx.workspaceInvitation.create({
          data: {
            workspaceId,
            email,
            role,
            invitedByUserId,
            token,
            expiresAt,
          },
        }),
      );
    } catch (error) {
      if (isInvitationEmailConflict(error)) {
        throw new ConflictError(
          `Undangan untuk "${email}" di workspace ini sudah ada.`,
        );
      }
      throw error;
    }

    return toInvitationRecord(invitation);
  },

  async findInvitationByToken(token) {
    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
    });

    return invitation ? toInvitationRecord(invitation) : null;
  },

  async saveChannelOrder({ workspaceId, userId, orderedConnectedAccountIds }) {
    // `tx` di dalam `withCurrentUser` sudah berupa interactive transaction
    // client (Prisma.TransactionClient) — tidak mengekspos `$transaction`
    // untuk nested batch, jadi deleteMany+createMany dijalankan sequential
    // di sini (tetap atomik karena keduanya ada di dalam transaksi yang
    // sama, bukan dua transaksi independen seperti sebelumnya).
    await withCurrentUser(userId, async (tx) => {
      await tx.workspaceChannelOrder.deleteMany({
        where: { workspaceId, userId },
      });
      await tx.workspaceChannelOrder.createMany({
        data: orderedConnectedAccountIds.map(
          (connectedAccountId, position) => ({
            workspaceId,
            userId,
            connectedAccountId,
            position,
          }),
        ),
      });
    });
  },

  async getChannelOrder(workspaceId, userId) {
    const rows = await withCurrentUser(userId, (tx) =>
      tx.workspaceChannelOrder.findMany({
        where: { workspaceId, userId },
        orderBy: { position: "asc" },
      }),
    );

    return rows.map((row) => asConnectedAccountId(row.connectedAccountId));
  },

  /**
   * `prisma.workspace.delete` — `workspaces` bukan tabel RLS-protected
   * (lihat catatan "Tables intentionally WITHOUT workspace-isolation RLS"
   * di migration `20260813045625_t017_add_rls_policies`), tapi tetap
   * dibungkus `withCurrentUser` supaya `app.current_user_id` ikut ter-set
   * untuk cascade delete ke tabel anak yang RLS-protected (mis.
   * `workspace_members`, `notifications`) dalam transaksi yang sama.
   */
  async deleteWorkspace(workspaceId, actingUserId) {
    try {
      await withCurrentUser(actingUserId, (tx) =>
        tx.workspace.delete({ where: { id: workspaceId } }),
      );
    } catch (error) {
      if (isRecordNotFound(error)) {
        throw new NotFoundError("Workspace tidak ditemukan.");
      }
      throw error;
    }
  },

  async setPendingOwnerTransfer(workspaceId, targetUserId, actingUserId) {
    try {
      await withCurrentUser(actingUserId, (tx) =>
        tx.workspace.update({
          where: { id: workspaceId },
          data: { pendingOwnerTransferTo: targetUserId },
        }),
      );
    } catch (error) {
      if (isRecordNotFound(error)) {
        throw new NotFoundError("Workspace tidak ditemukan.");
      }
      throw error;
    }
  },

  async clearPendingOwnerTransfer(workspaceId, actingUserId) {
    try {
      await withCurrentUser(actingUserId, (tx) =>
        tx.workspace.update({
          where: { id: workspaceId },
          data: { pendingOwnerTransferTo: null },
        }),
      );
    } catch (error) {
      if (isRecordNotFound(error)) {
        throw new NotFoundError("Workspace tidak ditemukan.");
      }
      throw error;
    }
  },

  async acceptOwnershipTransfer({
    workspaceId,
    currentOwnerMemberId,
    targetMemberId,
    newOwnerUserId,
  }) {
    try {
      await withCurrentUser(newOwnerUserId, async (tx) => {
        await tx.workspaceMember.update({
          where: { id: currentOwnerMemberId, workspaceId },
          data: { role: MemberRole.Admin },
        });
        await tx.workspaceMember.update({
          where: { id: targetMemberId, workspaceId },
          data: { role: MemberRole.Owner },
        });
        await tx.workspace.update({
          where: { id: workspaceId },
          data: {
            ownerId: newOwnerUserId,
            pendingOwnerTransferTo: null,
          },
        });
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        throw new NotFoundError("Workspace atau anggota tidak ditemukan.");
      }
      throw error;
    }
  },

  async renameWorkspace(workspaceId, name, actingUserId) {
    try {
      const workspace = await withCurrentUser(actingUserId, (tx) =>
        tx.workspace.update({
          where: { id: workspaceId },
          data: { name },
          select: {
            id: true,
            name: true,
            slug: true,
            pendingOwnerTransferTo: true,
          },
        }),
      );

      return {
        id: asWorkspaceId(workspace.id),
        name: workspace.name,
        slug: workspace.slug,
        pendingOwnerTransferTo: workspace.pendingOwnerTransferTo
          ? asUserId(workspace.pendingOwnerTransferTo)
          : null,
      };
    } catch (error) {
      if (isRecordNotFound(error)) {
        throw new NotFoundError("Workspace tidak ditemukan.");
      }
      throw error;
    }
  },
};
