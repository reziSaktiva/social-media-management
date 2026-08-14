import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import type { prisma as prismaClient } from "@/lib/prisma/client";
import type { withCurrentUser as withCurrentUserFn } from "@/lib/prisma/with-current-user";

/**
 * T-008.2 — Integration test for `deleteWorkspace` cascade (ADR-050,
 * `database-strategy.md`). Ridwan (code review) found that the first
 * cascade-fix migration (`20260813085308_..._delete`) missed 4 FKs that
 * still had `ON DELETE RESTRICT`: `publishing_post_targets` /
 * `publishing_queue_slots` / `engagement_inbox_items`.`connected_account_id`,
 * and `engagement_replies.inbox_item_id` (no cascade path from `workspaces`
 * at all). Migration `20260813092018_t008_cascade_connected_account_and_engagement_reply`
 * fixes all 4. A real Postgres connection is required — FK cascade behavior
 * can't be meaningfully mocked (same rationale as
 * `src/lib/prisma/with-current-user.test.ts`), so this suite is skipped
 * automatically when `DATABASE_URL` isn't a real connection (fresh checkout,
 * or CI's dummy `DATABASE_URL` per CI-D06 — see that file's doc comment for
 * the full explanation of the `SKIP_ENV_VALIDATION` check below).
 */
const hasDb =
  Boolean(process.env.DATABASE_URL) && process.env.SKIP_ENV_VALIDATION !== "1";

describe.skipIf(!hasDb)("deleteWorkspace cascade (T-008.2)", () => {
  const suffix = randomUUID().slice(0, 8);
  const ownerId = `t008-test-owner-${suffix}`;

  let prisma: typeof prismaClient;
  let withCurrentUser: typeof withCurrentUserFn;
  let workspaceId: string | null = null;

  afterAll(async () => {
    // Best-effort cleanup in case an assertion fails before deleteWorkspace
    // runs — if deleteWorkspace already succeeded, this is a no-op (row is
    // already gone).
    if (workspaceId && prisma) {
      await prisma.workspace.deleteMany({ where: { id: workspaceId } });
    }
  });

  it("deletes a workspace that has engagement replies and a queue slot without an FK violation", async () => {
    ({ prisma } = await import("@/lib/prisma/client"));
    ({ withCurrentUser } = await import("@/lib/prisma/with-current-user"));
    const { workspaceRepository } = await import("./workspace.repository");

    // workspaces itself has no RLS (see T-017 migration's own note).
    const workspace = await prisma.workspace.create({
      data: {
        name: `T-008 Cascade Test ${suffix}`,
        slug: `t008-cascade-test-${suffix}`,
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

    const connectedAccount = await withCurrentUser(ownerId, (tx) =>
      tx.workspaceConnectedAccount.create({
        data: {
          workspaceId: workspace.id,
          platform: "instagram",
          outstandAccountId: `t008-cascade-${suffix}`,
          handle: "@t008-cascade-test",
        },
      }),
    );

    // publishing_queue_slots — direct RESTRICT gap Ridwan found (#1/#2).
    await withCurrentUser(ownerId, (tx) =>
      tx.publishingQueueSlot.create({
        data: {
          workspaceId: workspace.id,
          connectedAccountId: connectedAccount.id,
          scheduledAt: new Date(),
          order: 0,
        },
      }),
    );

    // engagement_inbox_items + engagement_replies — the most serious gap
    // Ridwan found: `engagement_replies.inbox_item_id` had NO cascade path
    // from `workspaces` at all prior to the fix migration.
    const inboxItem = await withCurrentUser(ownerId, (tx) =>
      tx.engagementInboxItem.create({
        data: {
          workspaceId: workspace.id,
          connectedAccountId: connectedAccount.id,
          platform: "instagram",
          externalId: `t008-cascade-comment-${suffix}`,
          authorHandle: "@commenter",
          content: "Test comment for T-008 cascade coverage",
          receivedAt: new Date(),
        },
      }),
    );

    await withCurrentUser(ownerId, (tx) =>
      tx.engagementReply.create({
        data: {
          inboxItemId: inboxItem.id,
          userId: ownerId,
          content: "Test reply for T-008 cascade coverage",
        },
      }),
    );

    // The actual assertion: this must NOT throw a P2003 FK violation.
    await expect(
      workspaceRepository.deleteWorkspace(
        workspace.id as never,
        ownerId as never,
      ),
    ).resolves.toBeUndefined();

    // And every dependent row is actually gone, not left orphaned.
    const [remainingSlot, remainingInboxItem, remainingReply] =
      await Promise.all([
        prisma.publishingQueueSlot.findFirst({
          where: { connectedAccountId: connectedAccount.id },
        }),
        prisma.engagementInboxItem.findUnique({
          where: { id: inboxItem.id },
        }),
        prisma.engagementReply.findFirst({
          where: { inboxItemId: inboxItem.id },
        }),
      ]);

    expect(remainingSlot).toBeNull();
    expect(remainingInboxItem).toBeNull();
    expect(remainingReply).toBeNull();

    workspaceId = null; // already deleted — skip afterAll cleanup
  });
});

describe.skipIf(hasDb)("deleteWorkspace cascade (T-008.2)", () => {
  it("skipped: requires a real DATABASE_URL connection (FK cascade cannot be mocked)", () => {
    expect(true).toBe(true);
  });
});
