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
//
// `searchParams.connect` (T-013.1/T-013.2, T-015.3, ADR-105) — diset
// Route Handler `/api/integrations/outstand/callback` sebelum redirect
// balik ke halaman ini (`?connect=success|error`), dibaca di sini murni
// untuk diteruskan ke `ConnectedAccountsList` (Client Component) yang
// menampilkannya sebagai toast sekali saat mount — Server Component ini
// sendiri tidak punya business logic apa pun untuk query param ini.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    connect?: string;
    // Facebook Pages flow (T-025.4, KI-070, ADR-115 §7/§10) — diset Route
    // Handler callback saat Outstand redirect balik dengan query param
    // `session` (bukan `account_id`/`username`, flow multi-halaman).
    // Diteruskan apa adanya ke `ConnectedAccountsList` (Client Component)
    // yang otomatis membuka dialog Facebook Pages Picker saat mount kalau
    // keduanya ada.
    connectFacebookSessionToken?: string;
    connectFacebookState?: string;
  }>;
}) {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const { connect, connectFacebookSessionToken, connectFacebookState } =
    await searchParams;

  const workspaceService = new WorkspaceService(workspaceRepository);
  const accounts = await workspaceService.listConnectedAccounts(
    workspaceId,
    asUserId(session.user.id),
  );

  return (
    <ConnectedAccountsList
      accounts={accounts}
      connectResult={
        connect === "success" || connect === "error" ? connect : null
      }
      facebookPagesPicker={
        connectFacebookSessionToken && connectFacebookState
          ? {
              sessionToken: connectFacebookSessionToken,
              state: connectFacebookState,
            }
          : null
      }
    />
  );
}
