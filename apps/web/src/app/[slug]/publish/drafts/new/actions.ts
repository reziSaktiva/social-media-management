"use server";

import { asUserId } from "@social/shared";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PublishingService } from "@/domains/publishing";
import { WorkspaceService } from "@/domains/workspace";
import { auth } from "@/lib/better-auth/auth";
import { publishingRepository } from "@/lib/repositories/publishing";
import { workspaceRepository } from "@/lib/repositories/workspace";

export async function saveDraftAction(
  slug: string,
  caption: string,
): Promise<{ postId: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const workspaceService = new WorkspaceService(workspaceRepository);
  const workspace = await workspaceService.getWorkspaceBySlug(slug);
  if (!workspace) {
    redirect("/onboarding");
  }

  const publishingService = new PublishingService(publishingRepository);
  const post = await publishingService.saveDraft({
    workspaceId: workspace.id,
    authorId: asUserId(session.user.id),
    caption,
  });

  return { postId: post.id };
}
