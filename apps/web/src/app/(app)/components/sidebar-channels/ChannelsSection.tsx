"use client";

import Link from "next/link";
import { useState } from "react";
import type { DragEvent } from "react";

import { FaPlus } from "react-icons/fa6";
import { RxDragHandleDots2 } from "react-icons/rx";

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
import { cn } from "@/lib/cn";

import { useDraftEditor } from "../draft-editor/Context";

import { PLATFORM_ICON } from "../platform-icons";
import { reorderChannelsAction } from "./actions";

export type { SidebarChannelAccount };

// Custom styling here is Tailwind utilities backed by Astryx design tokens
// (per apps/web/.claude/CLAUDE.md: "component props first; else Tailwind
// utilities backed by tokens"). Numeric spacing utilities (w-4, ms-4, max-h-60,
// ...) are already token-backed because the Tailwind bridge sets
// `--spacing: var(--spacing-1)`, so `4` === `--spacing-4` (16px) etc. Values
// with no Tailwind-native utility (duration, easing, border/shadow color) use
// arbitrary values that reference the token CSS var directly — never a raw
// hex/px — which keeps them token-backed per project convention.
const TRANSITION_FAST =
  "duration-[var(--duration-fast)] ease-[var(--ease-standard)]";

// Scroll independen dari SideNavSection "Menu" di atasnya — max-height
// token-based (spacing-12 = 48px x 5 baris = 240px = spacing unit x60).
const LIST_CLASSNAME = "max-h-60 overflow-y-auto";

function PlatformBadge({ platform }: { platform: SocialPlatform }) {
  const entry = PLATFORM_ICON[platform];
  if (!entry) {
    return null;
  }
  const PlatformGlyph = entry.Icon;
  return (
    <HStack
      hAlign="center"
      vAlign="center"
      className="absolute -inset-e-1 -bottom-1 size-4 rounded-full bg-surface shadow-[0_0_0_var(--border-width)_var(--color-border)]"
      aria-hidden
    >
      {/* Warna brand asli (bukan token) — pengecualian disengaja, lihat
          komentar di platform-icons.tsx (ADR-058 poin 6 & 10). */}
      <PlatformGlyph size={9} color={entry.color} />
    </HStack>
  );
}

function ChannelRow({
  account,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  account: SidebarChannelAccount;
  isDragging: boolean;
  onDragStart: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: DragEvent<HTMLDivElement>) => void;
}) {
  const { openNewPost } = useDraftEditor();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  // Reveal action affordances on either hover or keyboard focus-within.
  const isRevealed = isHovered || isFocused;

  const displayStatus = resolveConnectionDisplayStatus(account);
  const needsAttention = displayStatus !== "active";

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
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        // Only clear when focus truly leaves the row, not when it moves
        // between children (e.g. from row to IconButton within same row).
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsFocused(false);
        }
      }}
      className={cn(
        // ADR-058 addendum poin 10: drag-handle shift-on-hover — seluruh isi
        // baris bergeser via margin-inline-start bertransisi (override
        // eksplisit dari "no-shift" yang berlaku untuk swap count<->"+" di
        // poin 4-5 asli).
        "relative my-1 transition-[margin-inline-start]",
        TRANSITION_FAST,
        isRevealed ? "ms-4" : "ms-0",
        isDragging ? "opacity-50" : "opacity-100",
      )}
      data-testid="channel-row"
    >
      <HStack
        align="center"
        className={cn(
          "inset-y-0 -inset-s-4 cursor-grab transition-opacity",
          TRANSITION_FAST,
          isRevealed ? "opacity-100" : "opacity-0",
        )}
      >
        <Icon icon={RxDragHandleDots2} size="xsm" color="secondary" label="" />
      </HStack>

      <HStack className="relative shrink-0">
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
          {needsAttention ? (
            <Link href="/settings/connected-accounts" className="no-underline">
              <Badge
                variant="warning"
                label={getConnectionStatusLabel(account)}
              />
            </Link>
          ) : (
            <Badge
              variant="neutral"
              label={getConnectionStatusLabel(account)}
            />
          )}
        </VStack>
      </StackItem>

      <HStack className="relative size-4 shrink-0">
        {/* Swap count <-> tombol "+": fixed slot, opacity/visibility toggle
            (bukan display none<->flex) — ini TIDAK berubah dari ADR-058 asli
            (no-shift), berbeda dari drag-handle di atas yang sengaja
            shift-on-hover. */}
        <HStack
          hAlign="center"
          align="center"
          className={cn(
            "absolute inset-0 transition-[opacity,visibility]",
            TRANSITION_FAST,
            isRevealed
              ? "pointer-events-none invisible opacity-0"
              : "visible opacity-100",
          )}
        >
          <Text type="supporting" size="2xs" hasTabularNumbers>
            {account.scheduledCount}
          </Text>
        </HStack>
        <HStack
          hAlign="center"
          align="center"
          className={cn(
            "absolute inset-0 transition-[opacity,visibility]",
            TRANSITION_FAST,
            isRevealed
              ? "visible opacity-100"
              : "pointer-events-none invisible opacity-0",
          )}
        >
          <IconButton
            label={`Buat post baru untuk ${account.handle}`}
            tooltip="New post"
            variant="ghost"
            size="sm"
            // ADR-058 addendum poin 9: slot count/tombol 16x16px, lebih kecil
            // dari size token IconButton terkecil Astryx (--size-element-sm,
            // 28px) — override eksplisit ukuran karena tidak ada varian
            // lebih kecil di komponen (dicek via
            // `astryx component IconButton --dense`).
            className="size-4 min-h-4 min-w-4 p-0"
            icon={<FaPlus size={10} />}
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

export function ChannelsSection({
  channels,
}: {
  channels: SidebarChannelAccount[];
}) {
  const [orderedChannels, setOrderedChannels] = useState(channels);
  const [channelsSnapshot, setChannelsSnapshot] = useState(channels);
  // Render-only — drives `isDragging` opacity. NOT safe to read inside drop
  // logic: this closure can be stale if native `drop` fires before React
  // re-renders from `setDraggedId` in handleDragStart. handleDrop reads the
  // source id from `e.dataTransfer` instead (immune to that race) — keep any
  // new drop-time logic doing the same, not reaching for this state.
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Sinkronisasi ringan kalau `channels` dari server berubah (akun baru
  // terhubung/diputus, atau reload) — dihitung selama render ("adjusting
  // state when a prop changes", bukan useEffect). T-012.1: server
  // (`listSidebarChannels`) sekarang selalu mengembalikan urutan final yang
  // benar (posisi tersimpan per user), jadi cukup replace langsung — skip
  // hanya saat drag aktif supaya baris tidak "menyentak" dari bawah kursor.
  if (channels !== channelsSnapshot) {
    setChannelsSnapshot(channels);
    if (!draggedId) {
      setOrderedChannels(channels);
    }
  }

  function handleDragStart(id: string) {
    return (e: DragEvent<HTMLDivElement>) => {
      setDraggedId(id);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
    };
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleDrop(targetId: string) {
    return (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const sourceId = e.dataTransfer.getData("text/plain");
      if (!sourceId || sourceId === targetId) {
        return;
      }
      setOrderedChannels((prev) => {
        const next = [...prev];
        const fromIndex = next.findIndex((c) => c.id === sourceId);
        const toIndex = next.findIndex((c) => c.id === targetId);
        if (fromIndex === -1 || toIndex === -1) {
          return prev;
        }
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);

        // Persist (T-012.1) — optimistic, fire-and-forget. Revert ke urutan
        // sebelumnya kalau gagal (baik reject maupun `{ error }`) supaya
        // state lokal tidak diam-diam drift dari DB. Sengaja tidak
        // `router.refresh()` di jalur sukses (hindari flicker) — reload
        // berikutnya akan membaca urutan tersimpan.
        reorderChannelsAction(next.map((c) => c.id))
          .then((result) => {
            if (result.error) {
              setOrderedChannels(prev);
            }
          })
          .catch(() => {
            setOrderedChannels(prev);
          });

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
      <VStack gap={2} isScrollable className={LIST_CLASSNAME}>
        {orderedChannels.map((account) => (
          <ChannelRow
            key={account.id}
            account={account}
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
