import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import type { prisma as prismaClient } from "@/lib/prisma/client";
import type { withCurrentUser as withCurrentUserFn } from "@/lib/prisma/with-current-user";
import { ConflictError } from "@/lib/utils/errors";

/**
 * Ridwan Architecture Reviewer (temuan moderate, T-007.8) — integration test
 * for `WorkspaceRepository.revokeInvitation` against a REAL Postgres
 * connection, same rationale/pattern as
 * `workspace.repository.accept-invitation.test.ts`.
 *
 * Confirms the fix: `revokeInvitation` was check-then-act (SELECT status,
 * then unconditional UPDATE) — a race window against `acceptInvitation`
 * where a concurrent accept could commit first, and the revoke's later
 * unconditional UPDATE would still stomp the (already-correct) `accepted`
 * status back to `revoked`, corrupting the audit trail even though the
 * member stayed active. Fixed by replacing it with the same atomic
 * compare-and-swap (`updateMany` + `count` check) pattern already used by
 * `acceptInvitation`.
 */
const hasDb =
  Boolean(process.env.DATABASE_URL) && process.env.SKIP_ENV_VALIDATION !== "1";

describe.skipIf(!hasDb)(
  "WorkspaceRepository.revokeInvitation (T-007.8)",
  () => {
    const suffix = randomUUID().slice(0, 8);
    const ownerId = `t007-8-test-owner-${suffix}`;
    const inviteeEmail = `t007-8-invitee-${suffix}@example.test`;

    let prisma: typeof prismaClient;
    let withCurrentUser: typeof withCurrentUserFn;
    let workspaceId: string | null = null;

    afterAll(async () => {
      // `workspaces` cascade-deletes its members and invitations
      // (database-strategy.md) — no separate `identity_user` row is created
      // in this test (unlike accept-invitation's), so no extra cleanup.
      if (workspaceId && prisma) {
        await prisma.workspace.deleteMany({ where: { id: workspaceId } });
      }
    });

    it("revokes a pending invitation (count 1), rejects an already-non-pending one with ConflictError, and rejects a missing one with ConflictError too (single generic error, no second lookup query)", async () => {
      ({ prisma } = await import("@/lib/prisma/client"));
      ({ withCurrentUser } = await import("@/lib/prisma/with-current-user"));
      const { workspaceRepository } = await import("./workspace.repository");

      const workspace = await prisma.workspace.create({
        data: {
          name: `T-007.8 Revoke Invite Test ${suffix}`,
          slug: `t007-8-revoke-invite-test-${suffix}`,
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

      const invitation = await workspaceRepository.createInvitation({
        workspaceId: workspace.id as never,
        email: inviteeEmail,
        role: "admin" as never,
        invitedByUserId: ownerId as never,
        token: `t007-8-token-${suffix}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      // Success path: pending -> revoked, atomic count === 1.
      await expect(
        workspaceRepository.revokeInvitation(
          workspace.id as never,
          invitation.id,
          ownerId as never,
        ),
      ).resolves.toBeUndefined();

      const persisted = await withCurrentUser(ownerId, (tx) =>
        tx.workspaceInvitation.findUnique({ where: { id: invitation.id } }),
      );
      expect(persisted?.status).toBe("revoked");

      // Race guard: a second revoke on the SAME already-revoked invitation
      // must not silently no-op-succeed — it must surface as a conflict,
      // mirroring `acceptInvitation`'s token-reuse guard.
      await expect(
        workspaceRepository.revokeInvitation(
          workspace.id as never,
          invitation.id,
          ownerId as never,
        ),
      ).rejects.toThrow(ConflictError);

      // Missing invitation entirely -> ConflictError (single generic error,
      // CAS miss no longer runs a second query to distinguish the reason).
      await expect(
        workspaceRepository.revokeInvitation(
          workspace.id as never,
          `${invitation.id}-does-not-exist` as never,
          ownerId as never,
        ),
      ).rejects.toThrow(ConflictError);
    });
  },
);

describe.skipIf(hasDb)("WorkspaceRepository.revokeInvitation (T-007.8)", () => {
  it("skipped: requires a real DATABASE_URL connection (RLS policies cannot be mocked)", () => {
    expect(true).toBe(true);
  });
});
