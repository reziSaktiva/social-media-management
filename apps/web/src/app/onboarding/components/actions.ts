"use server";

import { asUserId } from "@social/shared";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { WorkspaceService } from "@/domains/workspace";
import { auth } from "@/lib/better-auth/auth";
import { workspaceRepository } from "@/lib/repositories/workspace";
import { ConflictError, ValidationError } from "@/lib/utils/errors";
import {
  ACTIVE_WORKSPACE_ID_COOKIE,
  activeWorkspaceCookieOptions,
} from "@/lib/workspace/active-workspace-cookie";

export async function createWorkspaceAction(
  name: string,
): Promise<{ error: string } | void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const workspaceService = new WorkspaceService(workspaceRepository);

  let workspace;
  try {
    workspace = await workspaceService.createWorkspace({
      userId: asUserId(session.user.id),
      name,
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ConflictError) {
      return { error: error.message };
    }
    throw error;
  }

  (await cookies()).set(
    ACTIVE_WORKSPACE_ID_COOKIE,
    workspace.id,
    activeWorkspaceCookieOptions(),
  );
  redirect("/");
}
