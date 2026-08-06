import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { WorkspaceService } from "@/domains/workspace";
import { auth } from "@/lib/better-auth/auth";
import { workspaceRepository } from "@/lib/repositories/workspace";

import { ConnectedAccountsList } from "./components/ConnectedAccountsList";

export default async function Page({
  params,
}: {
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

  const accounts = await workspaceService.listConnectedAccounts(workspace.id);

  return <ConnectedAccountsList accounts={accounts} />;
}
