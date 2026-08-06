import { asUserId } from "@social/shared";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppShell } from "@astryxdesign/core/AppShell";

import { WorkspaceService } from "@/domains/workspace";
import { getCachedSession } from "@/lib/better-auth/session";
import { workspaceRepository } from "@/lib/repositories/workspace";
import { LAST_WORKSPACE_SLUG_COOKIE } from "@/lib/workspace/last-workspace-cookie";

import { AccountSideNav } from "./components/AccountSideNav";

// account layout shell (T-016.1) — top-level route, TANPA WorkspaceSideNav
// primary (route ini tidak punya konteks workspace). AppShell dipakai di
// sini sebagai frame terluar (bukan menumpuk AppShell — tidak ada shell lain
// di atas route ini) dengan AccountSideNav sebagai satu-satunya nav.
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const workspaceService = new WorkspaceService(workspaceRepository);

  // Preferensikan workspace yang terakhir dikunjungi (cookie diset proxy.ts)
  // di atas "membership tertua" — code-review finding: link "Kembali ke
  // Workspace" sebelumnya selalu jatuh ke workspace tertua user, bukan yang
  // sedang dilihat sebelum masuk ke /account.
  const lastWorkspaceSlug = (await cookies()).get(
    LAST_WORKSPACE_SLUG_COOKIE,
  )?.value;
  const workspace = lastWorkspaceSlug
    ? await workspaceService.getWorkspaceBySlug(lastWorkspaceSlug)
    : null;
  const defaultWorkspace =
    workspace ??
    (await workspaceService.getDefaultWorkspaceForUser(
      asUserId(session.user.id),
    ));

  return (
    <AppShell
      contentPadding={4}
      sideNav={
        <AccountSideNav
          workspaceSlug={defaultWorkspace?.slug ?? null}
          workspaceName={defaultWorkspace?.name ?? null}
        />
      }
    >
      {children}
    </AppShell>
  );
}
