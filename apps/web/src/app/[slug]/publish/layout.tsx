import { VStack } from "@astryxdesign/core/VStack";

import { DraftEditorModal } from "./_draft-editor/modal";
import { DraftEditorProvider } from "./_draft-editor/context";
import { PublishTabbar } from "./publish-tabbar";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <DraftEditorProvider>
      <VStack gap={4}>
        <PublishTabbar slug={slug} />
        {children}
      </VStack>
      <DraftEditorModal slug={slug} />
    </DraftEditorProvider>
  );
}
