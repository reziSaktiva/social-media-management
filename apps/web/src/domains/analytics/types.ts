/** Domain-specific types for analytics. */

/**
 * Periode agregasi `WorkspaceSnapshot` (domain-model.md BC-06). Hanya
 * dipakai di dalam domain analytics — belum ada BC lain yang
 * mengonsumsinya, jadi tetap di sini (bukan `packages/shared`) sampai ada
 * kebutuhan cross-domain nyata.
 */
export type SnapshotPeriod = "weekly" | "monthly";
