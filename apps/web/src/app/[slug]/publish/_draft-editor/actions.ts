"use server";

import { asPostId, asUserId } from "@social/shared";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PublishingService } from "@/domains/publishing";
import { WorkspaceService } from "@/domains/workspace";
import { auth } from "@/lib/better-auth/auth";
import { publishingRepository } from "@/lib/repositories/publishing";
import { workspaceRepository } from "@/lib/repositories/workspace";

async function resolveWorkspaceAndSession(slug: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const workspaceService = new WorkspaceService(workspaceRepository);
  const workspace = await workspaceService.getWorkspaceBySlug(slug);
  if (!workspace) {
    redirect("/onboarding");
  }

  return { session, workspace };
}

export async function saveDraftAction(
  slug: string,
  caption: string,
): Promise<{ postId: string }> {
  const { session, workspace } = await resolveWorkspaceAndSession(slug);

  const publishingService = new PublishingService(publishingRepository);
  const post = await publishingService.saveDraft({
    workspaceId: workspace.id,
    authorId: asUserId(session.user.id),
    caption,
  });

  return { postId: post.id };
}

export async function updateDraftAction(
  slug: string,
  postId: string,
  caption: string,
): Promise<{ postId: string }> {
  const { workspace } = await resolveWorkspaceAndSession(slug);

  const publishingService = new PublishingService(publishingRepository);
  const post = await publishingService.updateDraft({
    workspaceId: workspace.id,
    postId: asPostId(postId),
    caption,
  });

  return { postId: post.id };
}

export async function getDraftAction(
  slug: string,
  postId: string,
): Promise<{ postId: string; caption: string; status: string }> {
  const { workspace } = await resolveWorkspaceAndSession(slug);

  const publishingService = new PublishingService(publishingRepository);
  const post = await publishingService.getDraftById(
    workspace.id,
    asPostId(postId),
  );

  return { postId: post.id, caption: post.caption, status: post.status };
}
