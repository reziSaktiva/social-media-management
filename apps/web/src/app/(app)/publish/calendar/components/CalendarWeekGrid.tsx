"use client";

import { Badge } from "@astryxdesign/core/Badge";
import { Card } from "@astryxdesign/core/Card";
import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { Divider } from "@astryxdesign/core/Divider";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { HStack } from "@astryxdesign/core/HStack";
import { StackItem } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

import type { CalendarPostItem } from "@/domains/publishing";
import { getWeekRange } from "@/domains/publishing";

import {
  CONTENT_STATUS_BADGE_VARIANT,
  CONTENT_STATUS_LABEL,
} from "../../../components/draft-editor/status-badge";
import { PLATFORM_ICON } from "../../../components/platform-icons";
import {
  addDays,
  type CalendarCardEntry,
  DAY_LABELS,
  flattenCalendarItemsToEntries,
  TIME_SLOT_LABELS,
  toUtcDateKey,
} from "./calendar-grid-shared";

/** Lebar kolom label waktu/corner — sama untuk header & tiap baris slot. */
const TIME_COLUMN_WIDTH = 56;

export interface CalendarWeekGridProps {
  /** Anchor periode (`?date=`, T-033.2) — dipakai `getWeekRange` untuk 7 hari Sen-Ming. */
  date: Date;
  /** Hasil `PublishingService.listCalendarPosts` untuk rentang minggu yang sama. */
  items: CalendarPostItem[];
}

/**
 * Grid Week (T-033.3, KSP-02) — 7 kolom hari × 12 baris slot waktu (per 2
 * jam), acuan visual `templates/publish-calendar.html` (Claude Design).
 * Klik kartu post masih no-op — Popover ringkasan post baru dikerjakan di
 * T-033.8 (ADR-090/ADR-091), bukan scope task ini.
 */
export function CalendarWeekGrid({ date, items }: CalendarWeekGridProps) {
  const { from: weekStart } = getWeekRange(date);
  const days = Array.from({ length: 7 }, (_, index) =>
    addDays(weekStart, index),
  );
  const dayKeys = days.map(toUtcDateKey);
  const todayKey = toUtcDateKey(new Date());

  const cellEntries = new Map<string, CalendarCardEntry[]>();
  for (const entry of flattenCalendarItemsToEntries(items)) {
    const dayIndex = dayKeys.indexOf(entry.dateKey);
    if (dayIndex === -1) continue; // di luar rentang minggu ini — tidak seharusnya terjadi (page.tsx sudah query per-minggu)

    const slotIndex = Math.min(
      TIME_SLOT_LABELS.length - 1,
      Math.floor(entry.hour / 2),
    );
    const cellKey = `${dayIndex}-${slotIndex}`;
    const entries = cellEntries.get(cellKey) ?? [];
    entries.push(entry);
    cellEntries.set(cellKey, entries);
  }

  const hasAnyItem = items.length > 0;

  return (
    <Card padding={3}>
      <VStack gap={3}>
        <HStack gap={2}>
          <StackItem>
            <VStack width={TIME_COLUMN_WIDTH} />
          </StackItem>
          {days.map((day, index) => {
            const isToday = dayKeys[index] === todayKey;
            return (
              <StackItem size="fill" key={dayKeys[index]}>
                <VStack gap={0.5} align="center">
                  <Text
                    type="supporting"
                    size="xsm"
                    color={isToday ? "accent" : "secondary"}
                  >
                    {DAY_LABELS[index]}
                  </Text>
                  <Text
                    type="label"
                    weight={isToday ? "bold" : "normal"}
                    color={isToday ? "accent" : "primary"}
                  >
                    {day.getUTCDate()}
                  </Text>
                </VStack>
              </StackItem>
            );
          })}
        </HStack>

        <Divider variant="strong" />

        {!hasAnyItem ? (
          <EmptyState
            title="Belum ada post di minggu ini"
            description="Post berstatus Scheduled/Published/Failed dengan jadwal di minggu ini akan muncul di grid."
          />
        ) : (
          <VStack gap={0}>
            {TIME_SLOT_LABELS.map((label, slotIndex) => (
              <VStack gap={0} key={label}>
                <HStack gap={2} align="start">
                  <StackItem>
                    <VStack width={TIME_COLUMN_WIDTH}>
                      <Text type="supporting" size="xsm">
                        {label}
                      </Text>
                    </VStack>
                  </StackItem>
                  {dayKeys.map((dayKey, dayIndex) => {
                    const entries =
                      cellEntries.get(`${dayIndex}-${slotIndex}`) ?? [];
                    return (
                      <StackItem size="fill" key={dayKey}>
                        <VStack gap={1} minHeight={44}>
                          {entries.map((entry) => {
                            const PlatformGlyph =
                              PLATFORM_ICON[entry.platform].Icon;
                            return (
                              <ClickableCard
                                key={entry.key}
                                label={`${entry.accountHandle} — ${
                                  entry.caption || "(Tanpa caption)"
                                }`}
                                padding={1}
                                onClick={() => {
                                  // TODO(T-033.8): buka Popover ringkasan post (ADR-090/ADR-091) — belum diimplementasikan, di luar scope T-033.3.
                                }}
                              >
                                <VStack gap={0.5} align="start">
                                  <HStack gap={1} align="center">
                                    <PlatformGlyph
                                      size={10}
                                      color={
                                        PLATFORM_ICON[entry.platform].color
                                      }
                                    />
                                    <Text
                                      type="supporting"
                                      size="xsm"
                                      maxLines={1}
                                    >
                                      {entry.accountHandle}
                                    </Text>
                                  </HStack>
                                  <Text size="xsm" maxLines={1}>
                                    {entry.caption || "(Tanpa caption)"}
                                  </Text>
                                  <Badge
                                    variant={
                                      CONTENT_STATUS_BADGE_VARIANT[entry.status]
                                    }
                                    label={CONTENT_STATUS_LABEL[entry.status]}
                                  />
                                </VStack>
                              </ClickableCard>
                            );
                          })}
                        </VStack>
                      </StackItem>
                    );
                  })}
                </HStack>
                <Divider variant="subtle" />
              </VStack>
            ))}
          </VStack>
        )}
      </VStack>
    </Card>
  );
}
