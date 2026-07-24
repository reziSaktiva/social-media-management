import { asUserId } from "@social/shared";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { WorkspaceService } from "@/domains/workspace";
import { auth } from "@/lib/better-auth/auth";
import { workspaceRepository } from "@/lib/repositories/workspace";

export default async function RootPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const workspaceService = new WorkspaceService(workspaceRepository);
  const slug = await workspaceService.getDefaultWorkspaceSlugForUser(
    asUserId(session.user.id),
  );

  redirect(slug ? `/${slug}/home` : "/onboarding");
}
