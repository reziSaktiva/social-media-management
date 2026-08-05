"use client";

import * as stylex from "@stylexjs/stylex";
import { durationVars, easeVars } from "@astryxdesign/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DragEvent } from "react";

import { Avatar } from "@astryxdesign/core/Avatar";
import { Badge } from "@astryxdesign/core/Badge";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { IconButton } from "@astryxdesign/core/IconButton";
import { SideNavSection } from "@astryxdesign/core/SideNav";
import { StackItem } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

import type { SocialPlatform } from "@social/shared";

import {
  getConnectionStatusLabel,
  resolveConnectionDisplayStatus,
  type SidebarChannelAccount,
} from "@/domains/workspace";

import { useDraftEditor } from "../_draft-editor/context";

import { PLATFORM_ICON } from "./platform-icons";

export type { SidebarChannelAccount };

/**
 * Grip glyph for the drag handle. Astryx `Icon`'s semantic icon set has no
 * drag-handle entry (`astryx docs` / `astryx component Icon --dense`
 * verified: close, chevronDown/Left/Right, check, success, error, warning,
 * info, calendar, clock, externalLink, menu, moreHorizontal, search,
 * arrowUp/Down, arrowsUpDown, funnel, eyeSlash, viewColumns, copy,
 * checkDouble, wrench, stop, microphone) — `Icon` explicitly also accepts a
 * raw SVG component via its `icon` prop, which is the supported extension
 * point used here instead of a semantic name.
 */
function GripIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}

const styles = stylex.create({
  list: {
    // Scroll independen dari SideNavSection "Menu" di atasnya — max-height
    // token-based (spacing-12 = 48px x 5 baris), bukan raw px.
    maxHeight: "calc(var(--spacing-12) * 5)",
    overflowY: "auto",
  },
  row: {
    position: "relative",
    // ADR-058 addendum poin 10: drag-handle shift-on-hover — seluruh isi
    // baris bergeser via margin-inline-start bertransisi (override eksplisit
    // dari "no-shift" yang berlaku untuk swap count<->"+" di poin 4-5 asli).
    marginInlineStart: 0,
    transitionProperty: "margin-inline-start",
    transitionDuration: durationVars["--duration-fast"],
    transitionTimingFunction: easeVars["--ease-standard"],
  },
  rowShifted: {
    marginInlineStart: "var(--spacing-4)",
  },
  rowClickable: {
    cursor: "pointer",
  },
  rowDefaultCursor: {
    cursor: "default",
  },
  rowDragging: {
    opacity: 0.5,
  },
  rowIdle: {
    opacity: 1,
  },
  dragHandle: {
    position: "absolute",
    insetInlineStart: "calc(var(--spacing-4) * -1)",
    insetBlock: 0,
    display: "flex",
    alignItems: "center",
    opacity: 0,
    transitionProperty: "opacity",
    transitionDuration: durationVars["--duration-fast"],
    transitionTimingFunction: easeVars["--ease-standard"],
    cursor: "grab",
  },
  dragHandleVisible: {
    opacity: 1,
  },
  avatarSlot: {
    position: "relative",
    flexShrink: 0,
  },
  platformBadge: {
    position: "absolute",
    insetInlineEnd: "calc(var(--spacing-1) * -1)",
    insetBlockEnd: "calc(var(--spacing-1) * -1)",
    width: "var(--spacing-4)",
    height: "var(--spacing-4)",
    borderRadius: "var(--radius-full)",
    backgroundColor: "var(--color-background-surface)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 0 var(--border-width) var(--color-border)",
  },
  rightSlot: {
    position: "relative",
    width: "var(--spacing-4)",
    height: "var(--spacing-4)",
    flexShrink: 0,
  },
  // Swap count <-> tombol "+": fixed slot, opacity/visibility toggle
  // (bukan display none<->flex) — ini TIDAK berubah dari ADR-058 asli
  // (no-shift), berbeda dari drag-handle di atas yang sengaja shift-on-hover.
  slotLayer: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transitionProperty: "opacity, visibility",
    transitionDuration: durationVars["--duration-fast"],
    transitionTimingFunction: easeVars["--ease-standard"],
  },
  slotShown: {
    opacity: 1,
    visibility: "visible",
  },
  slotHidden: {
    opacity: 0,
    visibility: "hidden",
    pointerEvents: "none",
  },
  addButton: {
    // ADR-058 addendum poin 9: slot count/tombol 16x16px, lebih kecil dari
    // size token IconButton terkecil Astryx (--size-element-sm, 28px) —
    // override eksplisit ukuran via xstyle karena tidak ada varian lebih
    // kecil di komponen (dicek via `astryx component IconButton --dense`).
    width: "var(--spacing-4)",
    height: "var(--spacing-4)",
    minWidth: "var(--spacing-4)",
    minHeight: "var(--spacing-4)",
    padding: 0,
  },
});

function PlatformBadge({ platform }: { platform: SocialPlatform }) {
  const entry = PLATFORM_ICON[platform];
  const PlatformGlyph = entry.Icon;
  return (
    <HStack xstyle={styles.platformBadge} aria-hidden>
      {/* Warna brand asli (bukan token) — pengecualian disengaja, lihat
          komentar di platform-icons.tsx (ADR-058 poin 6 & 10). */}
      <PlatformGlyph size={9} color={entry.color} />
    </HStack>
  );
}

function ChannelRow({
  account,
  slug,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  account: SidebarChannelAccount;
  slug: string;
  isDragging: boolean;
  onDragStart: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: DragEvent<HTMLDivElement>) => void;
}) {
  const router = useRouter();
  const { openNewPost } = useDraftEditor();
  const [isHovered, setIsHovered] = useState(false);

  const displayStatus = resolveConnectionDisplayStatus(account);
  const needsAttention = displayStatus !== "active";

  function handleRowClick() {
    if (needsAttention) {
      router.push(`/${slug}/settings/connected-accounts`);
    }
  }

  return (
    <HStack
      gap={2}
      align="center"
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={needsAttention ? handleRowClick : undefined}
      xstyle={[
        styles.row,
        isHovered ? styles.rowShifted : null,
        needsAttention ? styles.rowClickable : styles.rowDefaultCursor,
        isDragging ? styles.rowDragging : styles.rowIdle,
      ]}
      data-testid="channel-row"
    >
      <HStack
        xstyle={[
          styles.dragHandle,
          isHovered ? styles.dragHandleVisible : null,
        ]}
      >
        <Icon icon={GripIcon} size="xsm" color="secondary" label="" />
      </HStack>

      <HStack xstyle={styles.avatarSlot}>
        <Avatar
          name={account.handle}
          size="sm"
          status={<PlatformBadge platform={account.platform} />}
        />
      </HStack>

      <StackItem size="fill" crossAlignSelf="start">
        <VStack gap={0.5} hAlign="start">
          <Text type="label" maxLines={1}>
            {account.handle}
          </Text>
          <Badge
            variant={displayStatus === "active" ? "neutral" : "warning"}
            label={getConnectionStatusLabel(account)}
          />
        </VStack>
      </StackItem>

      <HStack xstyle={styles.rightSlot}>
        <HStack
          xstyle={[
            styles.slotLayer,
            isHovered ? styles.slotHidden : styles.slotShown,
          ]}
        >
          <Text type="supporting" size="2xs" hasTabularNumbers>
            {account.scheduledCount}
          </Text>
        </HStack>
        <HStack
          xstyle={[
            styles.slotLayer,
            isHovered ? styles.slotShown : styles.slotHidden,
          ]}
        >
          <IconButton
            label={`Buat post baru untuk ${account.handle}`}
            tooltip="New post"
            variant="ghost"
            size="sm"
            xstyle={styles.addButton}
            icon={
              <Text type="inherit" size="2xs" as="span">
                +
              </Text>
            }
            onClick={(e) => {
              e.stopPropagation();
              openNewPost(account.id);
            }}
          />
        </HStack>
      </HStack>
    </HStack>
  );
}

/**
 * Merge a fresh `channels` payload from the server into the existing
 * client-side order — keep the reorder (T-012.1, intentionally not
 * persisted yet) for accounts that still exist, refresh their fields
 * (status/scheduledCount), drop removed accounts, and append new ones.
 */
function mergeChannels(
  prev: SidebarChannelAccount[],
  next: SidebarChannelAccount[],
): SidebarChannelAccount[] {
  const nextIds = new Set(next.map((c) => c.id));
  const kept = prev
    .filter((p) => nextIds.has(p.id))
    .map((p) => next.find((c) => c.id === p.id) ?? p);
  const prevIds = new Set(prev.map((p) => p.id));
  const added = next.filter((c) => !prevIds.has(c.id));
  return [...kept, ...added];
}

export function ChannelsSection({
  slug,
  channels,
}: {
  slug: string;
  channels: SidebarChannelAccount[];
}) {
  const [orderedChannels, setOrderedChannels] = useState(channels);
  const [channelsSnapshot, setChannelsSnapshot] = useState(channels);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Sinkronisasi ringan kalau daftar akun dari server berubah (akun baru
  // terhubung / diputus) — dihitung selama render ("adjusting state when a
  // prop changes", bukan di useEffect, supaya tidak memicu render tambahan).
  if (channels !== channelsSnapshot) {
    setChannelsSnapshot(channels);
    setOrderedChannels((prev) => mergeChannels(prev, channels));
  }

  function handleDragStart(id: string) {
    return (e: DragEvent<HTMLDivElement>) => {
      setDraggedId(id);
      e.dataTransfer.effectAllowed = "move";
    };
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleDrop(targetId: string) {
    return (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!draggedId || draggedId === targetId) {
        return;
      }
      setOrderedChannels((prev) => {
        const next = [...prev];
        const fromIndex = next.findIndex((c) => c.id === draggedId);
        const toIndex = next.findIndex((c) => c.id === targetId);
        if (fromIndex === -1 || toIndex === -1) {
          return prev;
        }
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });
    };
  }

  function handleDragEnd() {
    setDraggedId(null);
  }

  if (orderedChannels.length === 0) {
    return null;
  }

  return (
    <SideNavSection title="Channels">
      <VStack gap={1} isScrollable xstyle={styles.list}>
        {orderedChannels.map((account) => (
          <ChannelRow
            key={account.id}
            account={account}
            slug={slug}
            isDragging={draggedId === account.id}
            onDragStart={handleDragStart(account.id)}
            onDragOver={handleDragOver}
            onDrop={handleDrop(account.id)}
            onDragEnd={handleDragEnd}
          />
        ))}
      </VStack>
    </SideNavSection>
  );
}
