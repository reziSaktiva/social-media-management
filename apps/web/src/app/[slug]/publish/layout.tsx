import { VStack } from "@astryxdesign/core/VStack";

import { PublishTabbar } from "./components/PublishTabbar";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <VStack gap={4}>
      <PublishTabbar slug={slug} />
      {children}
    </VStack>
  );
}
