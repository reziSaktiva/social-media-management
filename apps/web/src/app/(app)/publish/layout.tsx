import { VStack } from "@astryxdesign/core/VStack";

import { PublishPageHeader } from "./components/PublishPageHeader";
import { PublishTabbar } from "./components/PublishTabbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <VStack gap={4}>
      <PublishPageHeader />
      <PublishTabbar />
      {children}
    </VStack>
  );
}
