"use client";

import { type ReactNode, useState } from "react";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { HStack } from "@astryxdesign/core/HStack";
import { Popover } from "@astryxdesign/core/Popover";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

import { ContentStatus } from "@social/shared";

import {
  CONTENT_STATUS_BADGE_VARIANT,
  CONTENT_STATUS_LABEL,
} from "../../../components/draft-editor/status-badge";
import { useDraftEditor } from "../../../components/draft-editor/Context";
import { PLATFORM_ICON } from "../../../components/platform-icons";
import type { CalendarCardEntry } from "./calendar-grid-shared";

const POPOVER_WIDTH = 296;

function formatMetricCount(value: number): string {
  return value.toLocaleString("id-ID");
}

function formatEngagementRate(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <VStack gap={0} width={64}>
      <Text type="label" weight="bold">
        {value}
      </Text>
      <Text type="supporting" size="xsm" color="secondary">
        {label}
      </Text>
    </VStack>
  );
}

export interface CalendarPostPopoverProps {
  /** Kartu per-target hasil `flattenCalendarItemsToEntries` — satu Popover per kartu. */
  entry: CalendarCardEntry;
  /** Trigger — harus mengandung `<button>`/`[role="button"]` (verifikasi `astryx component Popover --dense`); `ClickableCard` sudah memenuhi ini lewat elemen tersembunyinya. */
  children: ReactNode;
}

/**
 * Popover ringkasan post saat klik item Calendar (T-033.8, KSP-02-F08,
 * ADR-090/ADR-091 — Astryx `Popover`, BUKAN HoverCard, lihat ADR-091).
 * Acuan visual `components/popover.html` + wiring `openPostPopover` di
 * `templates/app-prototype/AppPrototype.dc.html` (Claude Design). State
 * `isOpen` lokal per kartu (bukan diangkat ke grid) — Popover uncontrolled
 * per instance sudah cukup karena `hasLightDismiss`/`hasEscapeDismiss`
 * bawaan (default `true`) menutup otomatis saat klik di luar/Escape;
 * tidak butuh koordinasi "hanya satu popover terbuka" karena klik kartu
 * lain otomatis menutup yang sedang terbuka lewat outside-click itu juga.
 *
 * Tidak ada thumbnail media asli — domain model (`PublishingPost`) belum
 * punya field media (lihat `CalendarItemRecord`), jadi placeholder di sini
 * permanen, bukan state loading.
 */
export function CalendarPostPopover({
  entry,
  children,
}: CalendarPostPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { openEditDraft } = useDraftEditor();
  const platformLabel = PLATFORM_ICON[entry.platform].label;
  const isPublished = entry.status === ContentStatus.Published;

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="below"
      alignment="start"
      width={POPOVER_WIDTH}
      label={`Ringkasan post ${entry.accountHandle}`}
      content={
        <VStack gap={2} width={POPOVER_WIDTH - 24}>
          <VStack gap={0}>
            <Text type="label" weight="bold">
              {entry.accountHandle}
            </Text>
            <Text type="supporting" size="xsm" color="secondary">
              {platformLabel}
            </Text>
          </VStack>

          <HStack gap={2} align="center">
            <Avatar name={entry.accountHandle} size="sm" tooltip={false} />
            <Badge
              variant={CONTENT_STATUS_BADGE_VARIANT[entry.status]}
              label={CONTENT_STATUS_LABEL[entry.status]}
            />
          </HStack>

          <Text size="sm">{entry.caption || "(Tanpa caption)"}</Text>

          <Card padding={2} variant="muted">
            <Text type="supporting" size="xsm" color="secondary">
              Media belum tersedia untuk preview
            </Text>
          </Card>

          {isPublished && (
            <VStack gap={1}>
              <Divider variant="subtle" />
              <HStack gap={2} wrap="wrap">
                <MetricTile
                  label="Views"
                  value={
                    entry.metrics
                      ? formatMetricCount(entry.metrics.impressions)
                      : "–"
                  }
                />
                <MetricTile
                  label="Reach"
                  value={
                    entry.metrics ? formatMetricCount(entry.metrics.reach) : "–"
                  }
                />
                <MetricTile
                  label="Replies"
                  value={
                    entry.metrics
                      ? formatMetricCount(entry.metrics.comments)
                      : "–"
                  }
                />
                <MetricTile
                  label="Eng. Rate"
                  value={
                    entry.metrics
                      ? formatEngagementRate(entry.metrics.engagementRate)
                      : "–"
                  }
                />
              </HStack>
              {entry.platformPostUrl && (
                <a
                  href={entry.platformPostUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Text type="supporting" size="xsm" color="accent">
                    Go to post →
                  </Text>
                </a>
              )}
            </VStack>
          )}

          <Button
            label="Buka Draft Editor"
            variant="primary"
            width="100%"
            onClick={() => {
              setIsOpen(false);
              openEditDraft(entry.postId);
            }}
          />
        </VStack>
      }
    >
      {children}
    </Popover>
  );
}
