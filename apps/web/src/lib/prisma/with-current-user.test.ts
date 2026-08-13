import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { prisma as prismaClient } from "@/lib/prisma/client";
import type { withCurrentUser as withCurrentUserFn } from "./with-current-user";

/**
 * T-017.3 — Integration test for RLS policies applied in migration
 * `20260813045625_t017_add_rls_policies`.
 *
 * These tests need a real Postgres connection (RLS cannot be meaningfully
 * mocked — see the task's own instruction not to mock Postgres RLS).
 * Skipped automatically when `DATABASE_URL` is not configured for the
 * current environment (e.g. a fresh checkout without `.env.local`), OR when
 * `SKIP_ENV_VALIDATION=1` — CI's convention (`.github/workflows/ci.yml`,
 * CI-D06) for "no real backing services": it sets a dummy `DATABASE_URL`
 * (`postgresql://ci:ci@localhost:5432/ci`) purely so `prisma generate`/
 * `validate` don't fail-fast on a missing env var, not a real Postgres to
 * connect to. Without this second check, CI's dummy URL looks identical to
 * a real one and this suite tries to connect, failing with ECONNREFUSED.
 *
 * IMPORTANT: `@/lib/prisma/client` eagerly constructs a `PrismaClient` at
 * module load time and throws if `DATABASE_URL` is missing (by design —
 * DO-D04 fail-fast). That means it must NOT be statically imported at the
 * top of this file, or `bun run test` breaks for every test file whenever
 * `DATABASE_URL` isn't set (e.g. CI without DB secrets) — hence the dynamic
 * `import()` below, only reached when `hasDb` is true.
 */
const hasDb =
  Boolean(process.env.DATABASE_URL) && process.env.SKIP_ENV_VALIDATION !== "1";

describe.skipIf(!hasDb)(
  "RLS policies — workspace_members isolation (T-017.3)",
  () => {
    const suffix = randomUUID().slice(0, 8);
    const userA = `t017-test-user-a-${suffix}`;
    const userB = `t017-test-user-b-${suffix}`;

    let workspaceAId: string;
    let workspaceBId: string;
    let memberAId: string;
    let memberBId: string;
    let prisma: typeof prismaClient;
    let withCurrentUser: typeof withCurrentUserFn;

    beforeAll(async () => {
      ({ prisma } = await import("@/lib/prisma/client"));
      ({ withCurrentUser } = await import("./with-current-user"));

      // Workspace rows themselves have no RLS (see the migration's own
      // "intentionally WITHOUT" note), so plain `prisma` is fine here.
      const workspaceA = await prisma.workspace.create({
        data: {
          name: `T-017 Test Workspace A ${suffix}`,
          slug: `t017-test-a-${suffix}`,
          ownerId: userA,
        },
      });
      const workspaceB = await prisma.workspace.create({
        data: {
          name: `T-017 Test Workspace B ${suffix}`,
          slug: `t017-test-b-${suffix}`,
          ownerId: userB,
        },
      });
      workspaceAId = workspaceA.id;
      workspaceBId = workspaceB.id;

      // workspace_members DOES have RLS — the owner's first membership row
      // must be created with `app.current_user_id` set to their own id
      // (matches WorkspaceRepository.createWithOwner's KI-026 fix), or the
      // implicit `RETURNING` on this INSERT fails the SELECT policy.
      const memberA = await withCurrentUser(userA, (tx) =>
        tx.workspaceMember.create({
          data: {
            workspaceId: workspaceAId,
            userId: userA,
            role: "owner",
            status: "active",
            joinedAt: new Date(),
          },
        }),
      );
      const memberB = await withCurrentUser(userB, (tx) =>
        tx.workspaceMember.create({
          data: {
            workspaceId: workspaceBId,
            userId: userB,
            role: "owner",
            status: "active",
            joinedAt: new Date(),
          },
        }),
      );
      memberAId = memberA.id;
      memberBId = memberB.id;
    });

    afterAll(async () => {
      // WorkspaceMember has onDelete: Cascade on workspaceId → deleting the
      // two test workspaces is enough to clean up everything created above.
      await prisma.workspace.deleteMany({
        where: { id: { in: [workspaceAId, workspaceBId] } },
      });
    });

    /**
     * KI-026 RESOLVED (2026-08-13) — `DATABASE_URL` now connects as
     * `app_runtime`, a Postgres role without `BYPASSRLS`, so RLS policies
     * from migration `20260813045625_t017_add_rls_policies` (plus the
     * KI-026 follow-up fixes: recursion fix, split INSERT policy, and
     * self-visibility SELECT clause — see those migrations' comments) are
     * now genuinely enforced, not just correctly designed on paper.
     *
     * This assertion was inverted from its original `[KNOWN GAP]` form
     * (which asserted `userB`'s row leaked into `userA`'s query under the
     * old BYPASSRLS `postgres` role) per that test's own documented
     * instruction once the gap closed.
     */
    it("cross-workspace row is NOT visible — RLS isolation is enforced", async () => {
      const rows = await withCurrentUser(userA, (tx) =>
        tx.workspaceMember.findMany({
          where: { id: { in: [memberAId, memberBId] } },
          orderBy: { id: "asc" },
        }),
      );

      const visibleIds = rows.map((row) => row.id).sort();
      expect(visibleIds).toEqual([memberAId]);
    });

    /**
     * KI-026 RESOLVED — same root cause/fix as above. Inverted from its
     * original `[KNOWN GAP]` form (which asserted both rows were visible
     * with no `SET LOCAL app.current_user_id` at all, under BYPASSRLS).
     */
    it("no rows are visible without SET LOCAL app.current_user_id — default-deny is enforced", async () => {
      const rows = await prisma.workspaceMember.findMany({
        where: { id: { in: [memberAId, memberBId] } },
        orderBy: { id: "asc" },
      });

      const visibleIds = rows.map((row) => row.id).sort();
      expect(visibleIds).toEqual([]);
    });
  },
);

describe.skipIf(hasDb)(
  "RLS policies — workspace_members isolation (T-017.3)",
  () => {
    it("skipped: requires a real DATABASE_URL connection (RLS cannot be mocked)", () => {
      expect(true).toBe(true);
    });
  },
);
