import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AppShell } from "@astryxdesign/core/AppShell";

import type { SidebarChannelAccount } from "@/domains/workspace";
import { WorkspaceService } from "@/domains/workspace";
import { auth } from "@/lib/better-auth/auth";
import { workspaceRepository } from "@/lib/repositories/workspace";

import { DraftEditorProvider } from "./_draft-editor/context";
import { DraftEditorMount } from "./_draft-editor/mount";
import { WorkspaceSideNav } from "./workspace-side-nav";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const workspaceService = new WorkspaceService(workspaceRepository);
  const workspace = await workspaceService.getWorkspaceBySlug(slug);
  if (!workspace) {
    redirect("/onboarding");
  }

  // Data untuk sidebar section "Channels" (T-012, ADR-058). Mapping ke
  // `SidebarChannelAccount` tetap sederhana di sini — layout.tsx adalah entry
  // point, business logic (mis. status→label) hidup di domain workspace.
  // `scheduledCount` di-stub 0 sampai T-012.2 (butuh domain publishing v0.2,
  // belum ada) selesai.
  const connectedAccounts = await workspaceService.listConnectedAccounts(
    workspace.id,
  );
  const channels: SidebarChannelAccount[] = connectedAccounts.map(
    (account) => ({
      id: account.id,
      platform: account.platform,
      handle: account.handle,
      status: account.status,
      reconnectRequired: account.reconnectRequired,
      scheduledCount: 0,
    }),
  );

  // Provider + modal duduk di level workspace (bukan lagi di `publish/`)
  // supaya CTA "+ New Post" di sidebar bisa membuka Draft Editor dari section
  // manapun — ADR-053, T-011.2.
  return (
    <DraftEditorProvider slug={slug}>
      <AppShell
        contentPadding={4}
        sideNav={
          <WorkspaceSideNav
            slug={slug}
            workspaceName={workspace.name}
            userName={session.user.name}
            userEmail={session.user.email}
            channels={channels}
          />
        }
      >
        {children}
      </AppShell>
      <DraftEditorMount slug={slug} />
    </DraftEditorProvider>
  );
}
