import { VStack } from "@astryxdesign/core/VStack";

import { PublishTabbar } from "./components/PublishTabbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <VStack gap={4}>
      <PublishTabbar />
      {children}
    </VStack>
  );
}
