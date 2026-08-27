"use client";

import { useState } from "react";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { Divider } from "@astryxdesign/core/Divider";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { HStack } from "@astryxdesign/core/HStack";
import { StackItem } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

import type { CalendarPostItem } from "@/domains/publishing";
import { getMonthRange } from "@/domains/publishing";

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
  MS_PER_DAY,
  toUtcDateKey,
} from "./calendar-grid-shared";

/** Maks kartu tampil langsung per sel sebelum "+N More" (mockup: 3 + "+1 More"). */
const MAX_VISIBLE_PER_CELL = 3;

interface MonthGridDay {
  date: Date;
  dateKey: string;
  /** `false` = padding hari dari bulan sebelum/sesudah (`is-muted` mockup) — tanpa post (Prabowo hanya fetch bulan aktif). */
  isCurrentMonth: boolean;
}

/** Susun sel grid Month: cukup minggu (kelipatan 7) untuk menutupi 1 bulan penuh, termasuk padding awal/akhir. Minggu mulai Senin. */
function buildMonthGridDays(anchor: Date): MonthGridDay[] {
  const { from: monthStart, to: monthEnd } = getMonthRange(anchor);
  const leadingPadding = (monthStart.getUTCDay() + 6) % 7; // Senin=0 ... Minggu=6
  const gridStart = addDays(monthStart, -leadingPadding);

  const daysInMonth =
    Math.round((monthEnd.getTime() - monthStart.getTime()) / MS_PER_DAY) + 1;
  const totalCells = Math.ceil((leadingPadding + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const cellDate = addDays(gridStart, index);
    return {
      date: cellDate,
      dateKey: toUtcDateKey(cellDate),
      isCurrentMonth:
        cellDate.getUTCFullYear() === anchor.getUTCFullYear() &&
        cellDate.getUTCMonth() === anchor.getUTCMonth(),
    };
  });
}

function chunkIntoWeeks(days: MonthGridDay[]): MonthGridDay[][] {
  const weeks: MonthGridDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export interface CalendarMonthGridProps {
  /** Anchor periode (`?date=`, T-033.2) — dipakai `getMonthRange` untuk hari-hari 1 bulan. */
  date: Date;
  /** Hasil `PublishingService.listCalendarPosts` untuk rentang bulan yang sama. */
  items: CalendarPostItem[];
}

/**
 * Grid Month (T-033.4, KSP-02) — 7 kolom hari × beberapa baris minggu,
 * acuan visual `templates/publish-calendar.html` (Claude Design). Sel
 * padding bulan sebelum/sesudah ditandai muted, tanpa post (Prabowo hanya
 * fetch bulan aktif). Maks 3 kartu tampil per sel, sisanya di balik
 * "+N More" yang expand/collapse di tempat (state lokal) — bukan modal
 * (di luar scope T-033.4). Klik kartu post masih no-op — Popover
 * (T-033.8, ADR-090/ADR-091) di luar scope task ini.
 */
export function CalendarMonthGrid({ date, items }: CalendarMonthGridProps) {
  const [expandedDateKeys, setExpandedDateKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const gridDays = buildMonthGridDays(date);
  const weeks = chunkIntoWeeks(gridDays);
  const todayKey = toUtcDateKey(new Date());
  const hasAnyItem = items.length > 0;

  const entriesByDate = new Map<string, CalendarCardEntry[]>();
  for (const entry of flattenCalendarItemsToEntries(items)) {
    const entries = entriesByDate.get(entry.dateKey) ?? [];
    entries.push(entry);
    entriesByDate.set(entry.dateKey, entries);
  }

  function toggleExpanded(dateKey: string) {
    setExpandedDateKeys((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  }

  return (
    <Card padding={3}>
      <VStack gap={2}>
        <HStack gap={2}>
          {DAY_LABELS.map((label) => (
            <StackItem size="fill" key={label}>
              <VStack align="center">
                <Text type="supporting" size="xsm">
                  {label}
                </Text>
              </VStack>
            </StackItem>
          ))}
        </HStack>

        <Divider variant="strong" />

        {!hasAnyItem ? (
          <EmptyState
            title="Belum ada post di bulan ini"
            description="Post berstatus Scheduled/Published/Failed dengan jadwal di bulan ini akan muncul di grid."
          />
        ) : (
          <VStack gap={0}>
            {weeks.map((week, weekIndex) => (
              <VStack gap={0} key={week[0]?.dateKey ?? weekIndex}>
                <HStack gap={2} align="start">
                  {week.map((day) => {
                    const entries = entriesByDate.get(day.dateKey) ?? [];
                    const isExpanded = expandedDateKeys.has(day.dateKey);
                    const visibleEntries = isExpanded
                      ? entries
                      : entries.slice(0, MAX_VISIBLE_PER_CELL);
                    const hiddenCount = entries.length - visibleEntries.length;
                    const isToday = day.dateKey === todayKey;

                    return (
                      <StackItem size="fill" key={day.dateKey}>
                        <VStack gap={1} minHeight={96} padding={1}>
                          <Text
                            type="supporting"
                            size="xsm"
                            color={
                              !day.isCurrentMonth
                                ? "disabled"
                                : isToday
                                  ? "accent"
                                  : "secondary"
                            }
                            weight={isToday ? "bold" : "normal"}
                          >
                            {day.date.getUTCDate()}
                          </Text>

                          {day.isCurrentMonth &&
                            visibleEntries.map((entry) => {
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
                                    // TODO(T-033.8): buka Popover ringkasan post (ADR-090/ADR-091) — belum diimplementasikan, di luar scope T-033.4.
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
                                      <Text size="xsm" maxLines={1}>
                                        {entry.caption || "(Tanpa caption)"}
                                      </Text>
                                    </HStack>
                                    <Badge
                                      variant={
                                        CONTENT_STATUS_BADGE_VARIANT[
                                          entry.status
                                        ]
                                      }
                                      label={CONTENT_STATUS_LABEL[entry.status]}
                                    />
                                  </VStack>
                                </ClickableCard>
                              );
                            })}

                          {day.isCurrentMonth &&
                            entries.length > MAX_VISIBLE_PER_CELL && (
                              <Button
                                label={
                                  isExpanded
                                    ? "Tampilkan lebih sedikit"
                                    : `+${hiddenCount} More`
                                }
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpanded(day.dateKey)}
                              />
                            )}
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
