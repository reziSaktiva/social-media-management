import { asUserId } from "@social/shared";
import { redirect } from "next/navigation";

import {
  groupHistoryItemsByDate,
  PublishingService,
} from "@/domains/publishing";
import { WorkspaceService } from "@/domains/workspace";
import { getCachedSession } from "@/lib/better-auth/session";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";
import { publishingRepository } from "@/lib/repositories/publishing";
import { workspaceRepository } from "@/lib/repositories/workspace";

import { HistoryList } from "./components/HistoryList";

/**
 * `/publish/history` (T-034.2, KSP-D10) — entry point tipis: fetch
 * `PublishingService.listHistory` (default `HISTORY_TERMINAL_STATUSES`,
 * tanpa filter — filter Status/Akun T-034.2 dilakukan client-side di
 * `HistoryList`, sama pola dengan `QueueList` T-032.3, bukan lewat
 * `?status=`/`?accounts=` seperti Calendar T-033.6 yang butuh re-fetch
 * rentang tanggal server-side) lalu kelompokkan per tanggal via
 * `groupHistoryItemsByDate` (pure function domain, dipanggil langsung dari
 * composition root — pola sama `getWeekRange`/`getMonthRange` di
 * `calendar/page.tsx`, BUKAN business logic di entry point, AGENTS.md #5).
 *
 * `WorkspaceService.listConnectedAccounts` dipanggil di sini (cross-domain
 * lewat public API module lain, AGENTS.md #7) untuk opsi filter Akun —
 * daftar akun lengkap workspace, bukan derive dari `items` yang sudah
 * terfilter, sama alasan `calendar/page.tsx`.
 */
export default async function Page() {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }
  const userId = asUserId(session.user.id);

  const publishingService = new PublishingService(publishingRepository);
  const workspaceService = new WorkspaceService(workspaceRepository);

  const [items, accounts] = await Promise.all([
    publishingService.listHistory({ workspaceId }, userId),
    workspaceService.listConnectedAccounts(workspaceId, userId),
  ]);

  const groups = groupHistoryItemsByDate(items);

  return <HistoryList groups={groups} accounts={accounts} />;
}
