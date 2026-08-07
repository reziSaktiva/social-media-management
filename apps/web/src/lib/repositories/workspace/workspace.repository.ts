import {
  asConnectedAccountId,
  asInvitationId,
  asMemberId,
  asUserId,
  asWorkspaceId,
  MemberRole,
  MemberStatus,
  type SocialPlatform,
} from "@social/shared";
import type { IWorkspaceRepository } from "@/domains/workspace";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma/client";
import { ConflictError } from "@/lib/utils/errors";

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

  async findAnyMembershipSlugByUserId(userId) {
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId, status: MemberStatus.Active },
      orderBy: { joinedAt: "asc" },
      include: { workspace: { select: { slug: true } } },
    });

    return membership?.workspace.slug ?? null;
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

  async findBySlug(slug) {
    const workspace = await prisma.workspace.findUnique({
      where: { slug },
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

  async getMember(workspaceId, userId) {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });

    if (!member) {
      return null;
    }

    return {
      id: asMemberId(member.id),
      workspaceId: asWorkspaceId(member.workspaceId),
      userId: asUserId(member.userId),
      role: member.role as MemberRole,
      status: member.status as MemberStatus,
    };
  },

  async findMemberById(workspaceId, memberId) {
    const member = await prisma.workspaceMember.findFirst({
      where: { id: memberId, workspaceId },
    });

    if (!member) {
      return null;
    }

    return {
      id: asMemberId(member.id),
      workspaceId: asWorkspaceId(member.workspaceId),
      userId: asUserId(member.userId),
      role: member.role as MemberRole,
      status: member.status as MemberStatus,
    };
  },

  async removeMember(workspaceId, memberId) {
    await prisma.workspaceMember.delete({
      where: { id: memberId, workspaceId },
    });
  },

  async updateMemberRole(workspaceId, memberId, role) {
    await prisma.workspaceMember.update({
      where: { id: memberId, workspaceId },
      data: { role },
    });
  },

  async createInvitation({
    workspaceId,
    email,
    role,
    invitedByUserId,
    token,
    expiresAt,
  }) {
    const invitation = await prisma.workspaceInvitation.create({
      data: {
        workspaceId,
        email,
        role,
        invitedByUserId,
        token,
        expiresAt,
      },
    });

    return {
      id: asInvitationId(invitation.id),
      workspaceId: asWorkspaceId(invitation.workspaceId),
      email: invitation.email,
      role: invitation.role as MemberRole,
      token: invitation.token,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
    };
  },

  async findInvitationByToken(token) {
    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return null;
    }

    return {
      id: asInvitationId(invitation.id),
      workspaceId: asWorkspaceId(invitation.workspaceId),
      email: invitation.email,
      role: invitation.role as MemberRole,
      token: invitation.token,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
    };
  },
};
