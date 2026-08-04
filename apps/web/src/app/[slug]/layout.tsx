import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AppShell } from "@astryxdesign/core/AppShell";

import { WorkspaceService } from "@/domains/workspace";
import { auth } from "@/lib/better-auth/auth";
import { workspaceRepository } from "@/lib/repositories/workspace";

import { DraftEditorProvider } from "./_draft-editor/context";
import { DraftEditorModal } from "./_draft-editor/modal";
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

  // Provider + modal duduk di level workspace (bukan lagi di `publish/`)
  // supaya CTA "+ New Post" di sidebar bisa membuka Draft Editor dari section
  // manapun — ADR-053, T-011.2.
  return (
    <DraftEditorProvider>
      <AppShell
        contentPadding={4}
        sideNav={
          <WorkspaceSideNav
            slug={slug}
            workspaceName={workspace.name}
            userName={session.user.name}
            userEmail={session.user.email}
          />
        }
      >
        {children}
      </AppShell>
      <DraftEditorModal slug={slug} />
    </DraftEditorProvider>
  );
}
