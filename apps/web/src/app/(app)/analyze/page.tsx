// Route `/analyze` (T-043.2 + T-046.2 + T-047.1, KSP-07 Analyze →
// Dashboard) — Server Component tipis: panggil Server Action
// `getPostPerformanceAction`, `getAccountOverviewAction`, DAN
// `getAnalyzeSummaryAction` (T-047.1 — summary row 3 stat card) dengan
// period default ("weekly", sama seperti Dashboard Home T-042.3) lalu
// delegasikan rendering + interaktivitas (selector rentang waktu, sort) ke
// `AnalyzeDashboard` (Client Component). Ketiga action dipanggil paralel
// (`Promise.all`) — sama-sama scoped `workspaceId` + `period` yang sama,
// tidak saling depend.
import { AnalyzeDashboard } from "./components/AnalyzeDashboard";
import {
  getAccountOverviewAction,
  getAnalyzeSummaryAction,
  getPostPerformanceAction,
} from "./analyze-actions";

import type { SnapshotPeriod } from "@/domains/analytics";

const INITIAL_PERIOD: SnapshotPeriod = "weekly";

export default async function Page() {
  const [postPerformanceRows, accountOverviewRows, summary] = await Promise.all(
    [
      getPostPerformanceAction(INITIAL_PERIOD),
      getAccountOverviewAction(INITIAL_PERIOD),
      getAnalyzeSummaryAction(INITIAL_PERIOD),
    ],
  );

  return (
    <AnalyzeDashboard
      initialPeriod={INITIAL_PERIOD}
      initialRows={postPerformanceRows}
      initialAccountOverviewRows={accountOverviewRows}
      initialSummary={summary}
    />
  );
}
