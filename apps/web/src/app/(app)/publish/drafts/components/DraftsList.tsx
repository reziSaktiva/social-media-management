"use client";

import type { PublishingPostRecord } from "@/domains/publishing";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";

import { useDraftEditor } from "../../../components/draft-editor/Context";
import {
  CONTENT_STATUS_BADGE_VARIANT,
  CONTENT_STATUS_LABEL,
} from "../../../components/draft-editor/status-badge";

/**
 * T-101.3: migrasi ke shadcn — Astryx `VStack`/`Card`/`EmptyState`/
 * `List`/`ListItem` diganti `Card`/`Empty`/`Item`+`ItemGroup` (registry:ui
 * `item`), presedan sama dengan `ConnectedAccountsList.tsx` (T-099.3) dan
 * `WorkspacesSettingsView.tsx` (T-099.3) — baris klik penuh lewat
 * `Item asChild` membungkus `<button>`. `Badge` dimigrasi ke shadcn di
 * T-102 cleanup (KI-041 masih terbuka — lihat `status-badge.ts`).
 */
export function DraftsList({ drafts }: { drafts: PublishingPostRecord[] }) {
  const { openEditDraft } = useDraftEditor();

  return (
    // eslint-disable-next-line no-restricted-syntax -- T-101.3: layout-only, file sudah dimigrasi shadcn
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className={drafts.length === 0 ? undefined : "px-0"}>
          {drafts.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Belum ada draft</EmptyTitle>
                <EmptyDescription>
                  Draft yang belum terjadwal akan muncul di sini.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ItemGroup className="gap-0 divide-y divide-border">
              {drafts.map((draft) => (
                <Item
                  key={draft.id}
                  asChild
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                >
                  <button type="button" onClick={() => openEditDraft(draft.id)}>
                    <ItemContent>
                      <ItemTitle>
                        {draft.caption || "(Tanpa caption)"}
                      </ItemTitle>
                      <ItemDescription>
                        Diedit {formatRelativeTime(draft.updatedAt)}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Badge
                        variant={CONTENT_STATUS_BADGE_VARIANT[draft.status]}
                      >
                        {CONTENT_STATUS_LABEL[draft.status]}
                      </Badge>
                    </ItemActions>
                  </button>
                </Item>
              ))}
            </ItemGroup>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
