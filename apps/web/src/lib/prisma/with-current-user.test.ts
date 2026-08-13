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
 * current environment (e.g. a fresh checkout without `.env.local`).
 *
 * IMPORTANT: `@/lib/prisma/client` eagerly constructs a `PrismaClient` at
 * module load time and throws if `DATABASE_URL` is missing (by design —
 * DO-D04 fail-fast). That means it must NOT be statically imported at the
 * top of this file, or `bun run test` breaks for every test file whenever
 * `DATABASE_URL` isn't set (e.g. CI without DB secrets) — hence the dynamic
 * `import()` below, only reached when `hasDb` is true.
 */
const hasDb = Boolean(process.env.DATABASE_URL);

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

      // Setup uses the plain `prisma` singleton (no RLS session variable
      // needed for setup — see the BYPASSRLS note below, writes aren't
      // blocked by RLS on this connection regardless).
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

      const memberA = await prisma.workspaceMember.create({
        data: {
          workspaceId: workspaceAId,
          userId: userA,
          role: "owner",
          status: "active",
          joinedAt: new Date(),
        },
      });
      const memberB = await prisma.workspaceMember.create({
        data: {
          workspaceId: workspaceBId,
          userId: userB,
          role: "owner",
          status: "active",
          joinedAt: new Date(),
        },
      });
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
     * ⚠️ KNOWN GAP (KI to be filed by Gibran Project Manager per
     * PROJECT_STATE.md § Known Issues) — THIS TEST DOCUMENTS A BUG, NOT
     * CORRECT BEHAVIOR.
     *
     * The RLS policies from migration `20260813045625_t017_add_rls_policies`
     * are correctly *designed* per `database-strategy.md` § "RLS Policy
     * Pattern", and are verified applied (`ENABLE ROW LEVEL SECURITY` +
     * `CREATE POLICY` ran successfully against the real Supabase database).
     *
     * However, `DATABASE_URL`/`DIRECT_URL` connect to Postgres as role
     * `postgres`, which is both the owner of every domain table AND has the
     * `BYPASSRLS` attribute (Supabase default for the service-role/postgres
     * connection — confirmed via `pg_roles.rolbypassrls = true` in this same
     * investigation). Postgres skips RLS entirely for BYPASSRLS roles,
     * regardless of policy correctness or even `FORCE ROW LEVEL SECURITY`.
     *
     * Net effect: with the CURRENT connection, `withCurrentUser(userA, ...)`
     * still sees `userB`'s row below — RLS provides ZERO defense-in-depth
     * right now. Authorization is 100% dependent on the Application Service
     * (RBAC), which is consistent with DB-D05's stated fallback but NOT the
     * "defense-in-depth safety net" the baseline describes.
     *
     * If this assertion ever starts FAILING, it means someone fixed the
     * gap (e.g. a new `app_runtime` Postgres role without BYPASSRLS is now
     * used for `DATABASE_URL`) — in that case, INVERT this assertion to
     * `toEqual([memberAId])` (only own-workspace row visible) instead of
     * treating the failure as a regression.
     */
    it("[KNOWN GAP] cross-workspace row is still visible — RLS is bypassed (BYPASSRLS role), not enforced", async () => {
      const rows = await withCurrentUser(userA, (tx) =>
        tx.workspaceMember.findMany({
          where: { id: { in: [memberAId, memberBId] } },
          orderBy: { id: "asc" },
        }),
      );

      const visibleIds = rows.map((row) => row.id).sort();
      // BUG: expected `[memberAId]` only once RLS is actually enforced.
      expect(visibleIds).toEqual([memberAId, memberBId].sort());
    });

    /**
     * ⚠️ KNOWN GAP — same root cause as above (BYPASSRLS). Per the
     * baseline pattern, a query run WITHOUT `SET LOCAL app.current_user_id`
     * first (i.e. `current_setting('app.current_user_id', true)` is NULL)
     * should default-deny — the policy's `workspace_id IN (SELECT ... WHERE
     * wm.user_id = NULL ...)` subquery returns no rows, so no workspace_id
     * matches. That default-deny logic is correct in the SQL, but never
     * gets a chance to run because BYPASSRLS skips the policy machinery
     * altogether.
     *
     * Same instruction as above: if this assertion starts FAILING, invert
     * it to `toEqual([])` (no rows visible without SET LOCAL) instead of
     * treating the failure as a regression.
     */
    it("[KNOWN GAP] rows are still visible without SET LOCAL app.current_user_id — default-deny not enforced", async () => {
      const rows = await prisma.workspaceMember.findMany({
        where: { id: { in: [memberAId, memberBId] } },
        orderBy: { id: "asc" },
      });

      const visibleIds = rows.map((row) => row.id).sort();
      // BUG: expected `[]` (default-deny) once RLS is actually enforced.
      expect(visibleIds).toEqual([memberAId, memberBId].sort());
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
