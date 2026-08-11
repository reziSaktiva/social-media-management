import { WorkspaceService } from "@/domains/workspace";
import { workspaceRepository } from "@/lib/repositories/workspace";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";

import { ConnectedAccountsList } from "./components/ConnectedAccountsList";

// ADR-076 (T-039.1-3): workspace context sekarang datang dari
// getWorkspaceContext() (header yang di-inject proxy.ts), bukan
// resolve ulang dari `slug` — session gate sudah dilakukan sekali di
// (app)/layout.tsx, jadi tidak perlu diulang di sini (pola sama seperti
// (app)/publish/drafts/page.tsx).
export default async function Page() {
  const { workspaceId } = await getWorkspaceContext();

  const workspaceService = new WorkspaceService(workspaceRepository);
  const accounts = await workspaceService.listConnectedAccounts(workspaceId);

  return <ConnectedAccountsList accounts={accounts} />;
}
