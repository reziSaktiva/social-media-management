import { asUserId } from "@social/shared";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

import { WorkspaceService } from "@/domains/workspace";
import { auth } from "@/lib/better-auth/auth";
import { workspaceRepository } from "@/lib/repositories/workspace";

import { CreateWorkspaceForm } from "./create-workspace-form";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const workspaceService = new WorkspaceService(workspaceRepository);
  const slug = await workspaceService.getDefaultWorkspaceSlugForUser(
    asUserId(session.user.id),
  );

  if (slug) {
    redirect(`/${slug}/home`);
  }

  return (
    <Card padding={8} width="100%">
      <VStack gap={4}>
        <VStack gap={1}>
          <Heading level={1}>Buat Workspace Pertama Anda</Heading>
          <Text type="supporting">
            Workspace adalah tempat tim Anda mengelola konten media sosial.
          </Text>
        </VStack>

        <CreateWorkspaceForm />
      </VStack>
    </Card>
  );
}
