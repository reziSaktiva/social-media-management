import { MemberRole, MemberStatus, asWorkspaceId } from "@social/shared";
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
};
