import { asUserId } from "@social/shared";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WorkspaceService } from "@/domains/workspace";
import { auth } from "@/lib/better-auth/auth";
import { workspaceRepository } from "@/lib/repositories/workspace";

import { CreateWorkspaceForm } from "./components/CreateWorkspaceForm";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const workspaceService = new WorkspaceService(workspaceRepository);
  const workspace = await workspaceService.getDefaultWorkspaceForUser(
    asUserId(session.user.id),
  );

  if (workspace) {
    redirect("/onboarding/resume");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Workspace Pertama Anda</CardTitle>
        <CardDescription>
          Workspace adalah tempat tim Anda mengelola konten media sosial.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CreateWorkspaceForm />
      </CardContent>
    </Card>
  );
}
