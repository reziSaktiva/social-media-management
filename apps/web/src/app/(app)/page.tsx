import { getDashboardSummaryAction } from "./dashboard-actions";
import { DashboardHome } from "./components/DashboardHome";

import type { SnapshotPeriod } from "@/domains/analytics";

const DEFAULT_PERIOD: SnapshotPeriod = "weekly";

export default async function Page() {
  const summary = await getDashboardSummaryAction(DEFAULT_PERIOD);

  return (
    <DashboardHome initialPeriod={DEFAULT_PERIOD} initialSummary={summary} />
  );
}
