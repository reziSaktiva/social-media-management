import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AppShell } from "@astryxdesign/core/AppShell";

import { WorkspaceService } from "@/domains/workspace";
import { auth } from "@/lib/better-auth/auth";
import { workspaceRepository } from "@/lib/repositories/workspace";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";

import { DraftEditorProvider } from "./components/draft-editor/Context";
import { DraftEditorMount } from "./components/draft-editor/Mount";
import { WorkspaceSideNav } from "./components/WorkspaceSideNav";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const { workspaceId } = await getWorkspaceContext();

  const workspaceService = new WorkspaceService(workspaceRepository);
  // Defensif: proxy.ts (ADR-076) seharusnya sudah menjamin workspace context
  // valid sebelum request mencapai sini, tapi tetap di-gate di sini kalau
  // diakses tanpa melalui proxy (mis. route belum ke-cover matcher).
  const workspace = await workspaceService.getWorkspaceById(workspaceId);
  if (!workspace) {
    redirect("/onboarding");
  }

  // Sidebar "Channels" — service mengembalikan SidebarChannelAccount[] siap-render
  // (T-012, ADR-058). Kebijakan scheduledCount: 0 ada di WorkspaceService sampai T-012.2.
  const channels = await workspaceService.listSidebarChannels(workspaceId);

  // Provider + modal duduk di level workspace (bukan lagi di `publish/`)
  // supaya CTA "+ New Post" di sidebar bisa membuka Draft Editor dari section
  // manapun — ADR-053, T-011.2.
  return (
    <DraftEditorProvider workspaceId={workspaceId}>
      <AppShell
        contentPadding={4}
        sideNav={
          <WorkspaceSideNav
            workspaceName={workspace.name}
            userName={session.user.name}
            userEmail={session.user.email}
            channels={channels}
          />
        }
      >
        {children}
      </AppShell>
      <DraftEditorMount />
    </DraftEditorProvider>
  );
}
