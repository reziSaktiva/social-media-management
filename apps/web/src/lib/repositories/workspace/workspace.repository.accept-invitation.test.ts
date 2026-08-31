import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import type { prisma as prismaClient } from "@/lib/prisma/client";
import type { withCurrentUser as withCurrentUserFn } from "@/lib/prisma/with-current-user";
import { ConflictError } from "@/lib/utils/errors";

/**
 * T-093.4 — Integration test for `WorkspaceRepository.acceptInvitation`
 * against a REAL Postgres connection with RLS actually enforced (same
 * rationale/pattern as `workspace.repository.delete-cascade.test.ts`).
 *
 * This exists because the `WorkspaceService.acceptInvite` unit tests
 * (`workspace.service.test.ts`) all use a FAKE `IWorkspaceRepository` — they
 * correctly exercise the service's own validation (email-bound check,
 * expiry, role-from-invitation), but they cannot catch bugs in the RLS
 * POLICIES themselves, which only exist in the real database. That gap was
 * real: browser-verifying this flow end-to-end (King Rezi, 2026-08-31)
 * found the accept-invite UPDATE failing with "new row violates row-level
 * security policy for table workspace_invitations" even though the new
 * `workspace_invitations_accept_by_invitee` policy's own USING/WITH CHECK
 * both independently evaluated true — root cause was Postgres additionally
 * requiring the UPDATE's resulting NEW row to satisfy at least one SELECT
 * policy too (not just the UPDATE policy's own WITH CHECK), which the
 * `workspace_invitations_public_pending_lookup` policy stopped covering the
 * instant status flipped to `accepted`. Fixed by migration
 * `20260831042017_t093_invitation_select_visibility_fix`. This test exists
 * so a future, well-intentioned RLS "simplification" that reintroduces that
 * gap fails CI instead of only failing silently in the browser.
 */
const hasDb =
  Boolean(process.env.DATABASE_URL) && process.env.SKIP_ENV_VALIDATION !== "1";

describe.skipIf(!hasDb)(
  "WorkspaceRepository.acceptInvitation (T-093.4)",
  () => {
    const suffix = randomUUID().slice(0, 8);
    const ownerId = `t093-test-owner-${suffix}`;
    const inviteeEmail = `t093-invitee-${suffix}@example.test`;

    let prisma: typeof prismaClient;
    let withCurrentUser: typeof withCurrentUserFn;
    let workspaceId: string | null = null;
    let inviteeUserId: string | null = null;

    afterAll(async () => {
      // Best-effort cleanup — `workspaces` cascade-deletes its members and
      // invitations (database-strategy.md), but the `identity_user` row this
      // test creates directly has no FK to any of that, so it needs its own
      // explicit cleanup.
      if (workspaceId && prisma) {
        await prisma.workspace.deleteMany({ where: { id: workspaceId } });
      }
      if (inviteeUserId && prisma) {
        await prisma.user.deleteMany({ where: { id: inviteeUserId } });
      }
    });

    it("accepts a pending invitation, assigns the invitation's role (not a default), and blocks token reuse", async () => {
      ({ prisma } = await import("@/lib/prisma/client"));
      ({ withCurrentUser } = await import("@/lib/prisma/with-current-user"));
      const { workspaceRepository } = await import("./workspace.repository");

      // workspaces itself has no RLS (T-017 migration's own note).
      const workspace = await prisma.workspace.create({
        data: {
          name: `T-093 Accept Invite Test ${suffix}`,
          slug: `t093-accept-invite-test-${suffix}`,
          ownerId,
        },
      });
      workspaceId = workspace.id;

      await withCurrentUser(ownerId, (tx) =>
        tx.workspaceMember.create({
          data: {
            workspaceId: workspace.id,
            userId: ownerId,
            role: "owner",
            status: "active",
            joinedAt: new Date(),
          },
        }),
      );

      // `current_user_email()` (the SECURITY DEFINER helper backing the new
      // RLS policies) resolves the acting session's email from `identity_user`
      // — a real row is required here, unlike `ownerId` above which is a bare
      // string with no FK (workspace_members.user_id has no FK to User).
      const inviteeUser = await prisma.user.create({
        data: {
          id: `t093-test-invitee-${suffix}`,
          name: "T-093 Test Invitee",
          email: inviteeEmail,
        },
      });
      inviteeUserId = inviteeUser.id;

      const invitation = await workspaceRepository.createInvitation({
        workspaceId: workspace.id as never,
        email: inviteeEmail,
        role: "admin" as never,
        invitedByUserId: ownerId as never,
        token: `t093-token-${suffix}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const member = await workspaceRepository.acceptInvitation({
        workspaceId: workspace.id as never,
        invitationId: invitation.id,
        userId: inviteeUser.id as never,
        role: "admin" as never,
      });

      // Role comes from the invitation ("admin"), not a hardcoded default.
      expect(member.role).toBe("admin");
      expect(member.status).toBe("active");
      expect(member.userId).toBe(inviteeUser.id);

      const persistedInvitation = await withCurrentUser(ownerId, (tx) =>
        tx.workspaceInvitation.findUnique({ where: { id: invitation.id } }),
      );
      expect(persistedInvitation?.status).toBe("accepted");
      expect(persistedInvitation?.acceptedAt).not.toBeNull();

      const persistedMember = await withCurrentUser(ownerId, (tx) =>
        tx.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId: workspace.id,
              userId: inviteeUser.id,
            },
          },
        }),
      );
      expect(persistedMember?.role).toBe("admin");
      expect(persistedMember?.status).toBe("active");

      // Token reuse guard (T-093.4): a second accept attempt on the SAME
      // already-accepted invitation must be rejected, not silently re-applied.
      await expect(
        workspaceRepository.acceptInvitation({
          workspaceId: workspace.id as never,
          invitationId: invitation.id,
          userId: inviteeUser.id as never,
          role: "admin" as never,
        }),
      ).rejects.toThrow(ConflictError);
    });
  },
);

describe.skipIf(hasDb)("WorkspaceRepository.acceptInvitation (T-093.4)", () => {
  it("skipped: requires a real DATABASE_URL connection (RLS policies cannot be mocked)", () => {
    expect(true).toBe(true);
  });
});
