"use client";

import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { List, ListItem } from "@astryxdesign/core/List";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

import type { PublishingPostRecord } from "@/domains/publishing";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";

import { useDraftEditor } from "../../../components/draft-editor/Context";
import {
  CONTENT_STATUS_BADGE_VARIANT,
  CONTENT_STATUS_LABEL,
} from "../../../components/draft-editor/status-badge";

export function DraftsList({ drafts }: { drafts: PublishingPostRecord[] }) {
  const { openNewPost, openEditDraft } = useDraftEditor();

  return (
    <VStack gap={4}>
      <HStack justify="between" align="center">
        <VStack gap={1}>
          <Heading level={1}>Publish</Heading>
          <Text type="supporting">Draft yang belum terjadwal</Text>
        </VStack>
        {/* openNewPost sekarang menerima preSelectedAccountId opsional
        (T-012, ADR-058 addendum poin 9) — wrap supaya event onClick tidak
        ikut tersalur sebagai argumen pertama. */}
        <Button
          label="+ New Post"
          variant="primary"
          onClick={() => openNewPost()}
        />
      </HStack>

      <Card padding={4}>
        {drafts.length === 0 ? (
          <EmptyState
            title="Belum ada draft"
            description="Draft yang belum terjadwal akan muncul di sini."
          />
        ) : (
          <List hasDividers>
            {drafts.map((draft) => (
              <ListItem
                key={draft.id}
                label={draft.caption || "(Tanpa caption)"}
                description={`Diedit ${formatRelativeTime(draft.updatedAt)}`}
                endContent={
                  <Badge
                    label={CONTENT_STATUS_LABEL[draft.status]}
                    variant={CONTENT_STATUS_BADGE_VARIANT[draft.status]}
                  />
                }
                onClick={() => openEditDraft(draft.id)}
              />
            ))}
          </List>
        )}
      </Card>
    </VStack>
  );
}
