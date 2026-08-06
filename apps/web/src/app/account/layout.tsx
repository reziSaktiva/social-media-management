import { asUserId } from "@social/shared";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AppShell } from "@astryxdesign/core/AppShell";

import { WorkspaceService } from "@/domains/workspace";
import { auth } from "@/lib/better-auth/auth";
import { workspaceRepository } from "@/lib/repositories/workspace";

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
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const workspaceService = new WorkspaceService(workspaceRepository);
  const slug = await workspaceService.getDefaultWorkspaceSlugForUser(
    asUserId(session.user.id),
  );
  const workspace = slug
    ? await workspaceService.getWorkspaceBySlug(slug)
    : null;

  return (
    <AppShell
      contentPadding={4}
      sideNav={
        <AccountSideNav
          workspaceSlug={workspace?.slug ?? null}
          workspaceName={workspace?.name ?? null}
        />
      }
    >
      {children}
    </AppShell>
  );
}
