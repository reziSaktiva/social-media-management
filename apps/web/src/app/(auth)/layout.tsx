import type { ReactNode } from "react";

import { Center } from "@astryxdesign/core/Center";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-body">
      <Center height="100%">
        <VStack gap={6} width="100%" maxWidth={400} padding={6}>
          <HStack gap={2} justify="center" align="center">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-sm font-semibold text-on-accent">
              SM
            </span>
            <Text type="label" weight="semibold">
              Social Media Management
            </Text>
          </HStack>
          {children}
        </VStack>
      </Center>
    </main>
  );
}
