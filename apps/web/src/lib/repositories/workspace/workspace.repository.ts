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
import { withCurrentUser } from "@/lib/prisma/with-current-user";
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
      select: { id: true, name: true, slug: true },
    });

    if (!workspace) {
      return null;
    }

    return {
      id: asWorkspaceId(workspace.id),
      name: workspace.name,
      slug: workspace.slug,
    };
  },

  async listConnectedAccounts(workspaceId) {
    const accounts = await prisma.workspaceConnectedAccount.findMany({
      where: { workspaceId },
      orderBy: { connectedAt: "asc" },
    });

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

  async countActiveConnectedAccounts(workspaceId) {
    return prisma.workspaceConnectedAccount.count({
      where: { workspaceId, status: "active" },
    });
  },

  async listMembers(workspaceId) {
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      orderBy: { joinedAt: "asc" },
    });

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
   * T-017.1 adoption sample: `getMember` is called with the acting
   * `userId` already in scope (RBAC membership lookup), so it's a natural
   * fit for `withCurrentUser` — sets `app.current_user_id` for the
   * duration of this query so the RLS policy on `workspace_members`
   * (migration `20260813045625_t017_add_rls_policies`) has the session
   * variable available as defense-in-depth. See KI (Known Issues,
   * PROJECT_STATE.md) for the current BYPASSRLS gap that makes this
   * inert on the connection role used today — the wrapper itself is
   * still correct and ready for when that gap is resolved.
   */
  async getMember(workspaceId, userId) {
    const member = await withCurrentUser(userId, (tx) =>
      tx.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId } },
      }),
    );

    return member ? toMemberRecord(member) : null;
  },

  async findMemberById(workspaceId, memberId) {
    const member = await prisma.workspaceMember.findFirst({
      where: { id: memberId, workspaceId },
    });

    return member ? toMemberRecord(member) : null;
  },

  async removeMember(workspaceId, memberId) {
    try {
      await prisma.workspaceMember.delete({
        where: { id: memberId, workspaceId },
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        throw new NotFoundError("Anggota tidak ditemukan.");
      }
      throw error;
    }
  },

  async updateMemberRole(workspaceId, memberId, role) {
    try {
      await prisma.workspaceMember.update({
        where: { id: memberId, workspaceId },
        data: { role },
      });
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
      invitation = await prisma.workspaceInvitation.create({
        data: {
          workspaceId,
          email,
          role,
          invitedByUserId,
          token,
          expiresAt,
        },
      });
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
    await prisma.$transaction([
      prisma.workspaceChannelOrder.deleteMany({
        where: { workspaceId, userId },
      }),
      prisma.workspaceChannelOrder.createMany({
        data: orderedConnectedAccountIds.map(
          (connectedAccountId, position) => ({
            workspaceId,
            userId,
            connectedAccountId,
            position,
          }),
        ),
      }),
    ]);
  },

  async getChannelOrder(workspaceId, userId) {
    const rows = await prisma.workspaceChannelOrder.findMany({
      where: { workspaceId, userId },
      orderBy: { position: "asc" },
    });

    return rows.map((row) => asConnectedAccountId(row.connectedAccountId));
  },
};
