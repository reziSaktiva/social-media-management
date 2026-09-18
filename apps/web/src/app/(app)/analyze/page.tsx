// Route `/analyze` (T-043.2, KSP-07 Analyze → Dashboard) — Server Component
// tipis: panggil Server Action `getPostPerformanceAction` dengan period
// default ("weekly", sama seperti Dashboard Home T-042.3) lalu delegasikan
// rendering + interaktivitas (selector rentang waktu, sort) ke
// `AnalyzeDashboard` (Client Component).
import { AnalyzeDashboard } from "./components/AnalyzeDashboard";
import { getPostPerformanceAction } from "./analyze-actions";

import type { SnapshotPeriod } from "@/domains/analytics";

const INITIAL_PERIOD: SnapshotPeriod = "weekly";

export default async function Page() {
  const rows = await getPostPerformanceAction(INITIAL_PERIOD);

  return <AnalyzeDashboard initialPeriod={INITIAL_PERIOD} initialRows={rows} />;
}
