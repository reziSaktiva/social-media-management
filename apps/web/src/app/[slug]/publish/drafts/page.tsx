import { redirect } from "next/navigation";

import { PublishingService } from "@/domains/publishing";
import { WorkspaceService } from "@/domains/workspace";
import { publishingRepository } from "@/lib/repositories/publishing";
import { workspaceRepository } from "@/lib/repositories/workspace";

import { DraftsList } from "./components/DraftsList";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const workspaceService = new WorkspaceService(workspaceRepository);
  const workspace = await workspaceService.getWorkspaceBySlug(slug);
  if (!workspace) {
    redirect("/onboarding");
  }

  const publishingService = new PublishingService(publishingRepository);
  const drafts = await publishingService.listDrafts(workspace.id);

  return <DraftsList drafts={drafts} />;
}
