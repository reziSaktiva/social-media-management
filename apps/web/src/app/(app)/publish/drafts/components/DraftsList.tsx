"use client";

import { Badge } from "@astryxdesign/core/Badge";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { List, ListItem } from "@astryxdesign/core/List";
import { VStack } from "@astryxdesign/core/VStack";

import type { PublishingPostRecord } from "@/domains/publishing";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";

import { useDraftEditor } from "../../../components/draft-editor/Context";
import {
  CONTENT_STATUS_BADGE_VARIANT,
  CONTENT_STATUS_LABEL,
} from "../../../components/draft-editor/status-badge";

export function DraftsList({ drafts }: { drafts: PublishingPostRecord[] }) {
  const { openEditDraft } = useDraftEditor();

  return (
    <VStack gap={4}>
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
