import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma/client";

/**
 * Prisma transaction client type as seen inside `prisma.$transaction(async (tx) => ...)`.
 * Repositories that adopt `withCurrentUser` receive this instead of the
 * top-level `prisma` singleton for the duration of the callback.
 */
export type PrismaTransactionClient = Prisma.TransactionClient;

/**
 * Server-side RLS session variable wrapper (T-017.1, DO-D06 / database-strategy.md
 * "RLS dan Better Auth").
 *
 * Better Auth does not use Supabase Auth, so `auth.uid()` is unavailable to
 * RLS policies for server-side (service-role) queries. The agreed pattern is:
 *
 * 1. Better Auth session → `userId`.
 * 2. `SET LOCAL app.current_user_id = '<userId>'` inside a transaction.
 * 3. Subsequent queries run in that same transaction/connection so RLS
 *    policies (`current_setting('app.current_user_id', true)`) see it.
 * 4. Authorization stays in the Application Service (RBAC) — RLS here is
 *    defense-in-depth, not the primary authorization mechanism.
 *
 * `userId` is Better Auth's `identity_user.id`, a `cuid()` string — NOT a
 * UUID (see correction note in database-strategy.md § "RLS dan Better Auth"
 * and database-orm.md § DO-D06, 2026-08-13). `SET LOCAL` therefore takes the
 * raw string; RLS policies must compare `app.current_user_id` as text, not
 * cast it to `::uuid`.
 *
 * Implementation notes:
 * - Uses Prisma's tagged-template `$executeRaw` so `userId` is passed as a
 *   bound parameter — never string-concatenated into SQL (SQL injection
 *   safety, per this task's requirement).
 * - `SET LOCAL` only has effect for the remainder of the current
 *   transaction, which is exactly the lifetime of `prisma.$transaction`'s
 *   callback — after the callback resolves/rejects the transaction commits
 *   or rolls back and the setting is discarded automatically.
 * - Adoption is intentionally partial for T-017 (`workspaceRepository`,
 *   see `getMember`/`listMembers` below, is the first adopter). Migrating
 *   every repository method in the codebase to run through this wrapper is
 *   a separate, larger task — see "Catatan Implementasi" on T-017 in
 *   `tasks/v01-foundation.md`.
 */
export async function withCurrentUser<T>(
  userId: string,
  callback: (tx: PrismaTransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`;
    return callback(tx);
  });
}
