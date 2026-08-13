import { asUserId } from "@social/shared";
import { redirect } from "next/navigation";

import { WorkspaceService } from "@/domains/workspace";
import { getCachedSession } from "@/lib/better-auth/session";
import { workspaceRepository } from "@/lib/repositories/workspace";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";

import { ConnectedAccountsList } from "./components/ConnectedAccountsList";

// ADR-076 (T-039.1-3): workspace context sekarang datang dari
// getWorkspaceContext() (header yang di-inject proxy.ts) — session gate
// sudah dilakukan sekali di (app)/layout.tsx, jadi tidak perlu redirect
// ulang di sini secara defensif, tapi `getCachedSession()` (React.cache,
// tidak ada round-trip tambahan) tetap dipanggil untuk resolve `userId`
// yang dibutuhkan `withCurrentUser` (RLS, KI-026 follow-up).
export default async function Page() {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const workspaceService = new WorkspaceService(workspaceRepository);
  const accounts = await workspaceService.listConnectedAccounts(
    workspaceId,
    asUserId(session.user.id),
  );

  return <ConnectedAccountsList accounts={accounts} />;
}
