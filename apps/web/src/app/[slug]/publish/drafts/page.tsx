"use client";

import { useParams, useRouter } from "next/navigation";

import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

export default function Page() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();

  return (
    <VStack gap={4}>
      <HStack justify="between" align="center">
        <VStack gap={1}>
          <Heading level={1}>Publish</Heading>
          <Text type="supporting">Draft yang belum terjadwal</Text>
        </VStack>
        <Button
          label="+ New Post"
          variant="primary"
          onClick={() => router.push(`/${params.slug}/publish/drafts/new`)}
        />
      </HStack>

      <Card padding={4}>
        <EmptyState
          title="Belum ada draft"
          description="Draft yang belum terjadwal akan muncul di sini."
        />
      </Card>
    </VStack>
  );
}
