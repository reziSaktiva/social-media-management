"use client";

import { useMemo } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { Divider } from "@astryxdesign/core/Divider";
import { Grid } from "@astryxdesign/core/Grid";
import { HStack } from "@astryxdesign/core/HStack";
import { StackItem } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

import type { ConnectedAccountId } from "@social/shared";
import type { CalendarPostItem } from "@/domains/publishing";
import { getWeekRange } from "@/domains/publishing";

import { PLATFORM_ICON } from "../../../components/platform-icons";
import { CalendarEntryFooter } from "./CalendarEntryFooter";
import { CalendarPostPopover } from "./CalendarPostPopover";
import {
  addDays,
  CALENDAR_DAY_COLUMNS,
  type CalendarCardEntry,
  columnDividerClassName,
  DAY_LABELS,
  flattenCalendarItemsToEntries,
  MAX_VISIBLE_PER_CELL,
  toUtcDateKey,
  useExpandableKeys,
  WEEK_HOUR_LABELS,
} from "./calendar-grid-shared";

/** Lebar kolom label waktu/corner — sama untuk header & tiap baris jam. */
const TIME_COLUMN_WIDTH = 56;

/** Tinggi minimum sel Week, termasuk padding. */
const WEEK_CELL_MIN_HEIGHT = 100;

/** Sisi ikon platform — render langsung tanpa Card muted di sekelilingnya (revisi ketiga T-033, Week poin 2; beda dari Month yang tetap pakai container). */
const WEEK_PLATFORM_ICON_SIZE = 16;

export interface CalendarWeekGridProps {
  /** Anchor periode (`?date=`, T-033.2) — dipakai `getWeekRange` untuk 7 hari Sen-Ming. */
  date: Date;
  /** Hasil `PublishingService.listCalendarPosts` untuk rentang minggu yang sama. */
  items: CalendarPostItem[];
  /** Filter Channels aktif (T-033.6) — array kosong = tanpa filter. */
  connectedAccountIds?: ConnectedAccountId[];
}

/**
 * Grid Week (T-033.3, KSP-02) — 7 kolom hari × 24 baris jam (satu baris per
 * jam, revisi kedua T-033 — label teks cuma di baris jam genap, lihat
 * `WEEK_HOUR_LABELS`), acuan visual `templates/publish-calendar.html`
 * (Claude Design). Klik kartu post membuka Popover ringkasan (T-033.8,
 * ADR-090/ADR-091, `CalendarPostPopover`).
 */
export function CalendarWeekGrid({
  date,
  items,
  connectedAccountIds = [],
}: CalendarWeekGridProps) {
  const { expandedKeys: expandedCellKeys, toggle: toggleExpanded } =
    useExpandableKeys();

  const days = useMemo(() => {
    const { from: weekStart } = getWeekRange(date);
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  }, [date]);
  const dayKeys = useMemo(() => days.map(toUtcDateKey), [days]);
  const todayKey = toUtcDateKey(new Date());

  const connectedAccountIdsKey = connectedAccountIds.join(",");
  const cellEntries = useMemo(() => {
    const map = new Map<string, CalendarCardEntry[]>();
    for (const entry of flattenCalendarItemsToEntries(
      items,
      connectedAccountIds,
    )) {
      const dayIndex = dayKeys.indexOf(entry.dateKey);
      if (dayIndex === -1) continue; // di luar rentang minggu ini — tidak seharusnya terjadi (page.tsx sudah query per-minggu)

      const cellKey = `${dayIndex}-${entry.hour}`;
      const entries = map.get(cellKey) ?? [];
      entries.push(entry);
      map.set(cellKey, entries);
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, connectedAccountIdsKey, dayKeys]);

  return (
    <Card padding={3}>
      <VStack gap={3}>
        <HStack gap={2}>
          <StackItem>
            <VStack width={TIME_COLUMN_WIDTH} />
          </StackItem>
          <StackItem size="fill">
            <Grid columns={CALENDAR_DAY_COLUMNS} gap={0}>
              {days.map((day, index) => {
                const isToday = dayKeys[index] === todayKey;
                return (
                  <VStack
                    key={dayKeys[index]}
                    gap={0.5}
                    align="center"
                    className={columnDividerClassName(index)}
                  >
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
                );
              })}
            </Grid>
          </StackItem>
        </HStack>

        <Divider variant="strong" />

        <VStack gap={0}>
          {WEEK_HOUR_LABELS.map((label, hour) => (
            <VStack gap={0} key={hour}>
              <HStack gap={2} align="stretch">
                <StackItem>
                  <VStack width={TIME_COLUMN_WIDTH}>
                    <Text type="supporting" size="xsm">
                      {label}
                    </Text>
                  </VStack>
                </StackItem>
                <StackItem size="fill">
                  <Grid columns={CALENDAR_DAY_COLUMNS} gap={0}>
                    {dayKeys.map((dayKey, dayIndex) => {
                      const cellKey = `${dayIndex}-${hour}`;
                      const entries = cellEntries.get(cellKey) ?? [];
                      const isExpanded = expandedCellKeys.has(cellKey);
                      const visibleEntries = isExpanded
                        ? entries
                        : entries.slice(0, MAX_VISIBLE_PER_CELL);
                      const hiddenCount =
                        entries.length - visibleEntries.length;

                      return (
                        // `isScrollable` (bukan untuk scroll sungguhan — sel selalu tumbuh
                        // vertikal via `minHeight`) dipakai supaya sel ini jadi scroll
                        // container (`overflow: auto`), yang per spec CSS Grid membuat
                        // "automatic minimum size"-nya sendiri jadi 0 — mencegah 1 kartu
                        // dengan konten lebar "mencuri" lebar kolom dari kartu lain di
                        // baris yang sama (root cause "grid tidak sejajar", revisi ketiga
                        // T-033 Bagian A). Sama seperti `CalendarMonthGrid.tsx`.
                        <VStack
                          key={dayKey}
                          gap={1.5}
                          minHeight={WEEK_CELL_MIN_HEIGHT}
                          padding={1.5}
                          isScrollable
                          className={columnDividerClassName(dayIndex)}
                        >
                          {visibleEntries.map((entry) => {
                            const PlatformGlyph =
                              PLATFORM_ICON[entry.platform].Icon;
                            return (
                              <CalendarPostPopover
                                key={entry.key}
                                entry={entry}
                              >
                                <ClickableCard
                                  label={`${entry.accountHandle} — ${
                                    entry.caption || "(Tanpa caption)"
                                  }`}
                                  padding={1.5}
                                  width="100%"
                                >
                                  <VStack gap={1}>
                                    {/* Header: ikon platform (tanpa Card muted, poin 2) + nama akun
                                        (menyusut/truncate lewat StackItem "fill") — satu baris. */}
                                    <HStack gap={1} align="center">
                                      <PlatformGlyph
                                        size={WEEK_PLATFORM_ICON_SIZE}
                                        color={
                                          PLATFORM_ICON[entry.platform].color
                                        }
                                      />
                                      <StackItem size="fill">
                                        <Text size="sm" maxLines={1}>
                                          {entry.accountHandle}
                                        </Text>
                                      </StackItem>
                                    </HStack>

                                    {/* Caption — baris terpisah, full width (bukan lagi di samping avatar). */}
                                    <Text size="sm" maxLines={2}>
                                      {entry.caption || "(Tanpa caption)"}
                                    </Text>

                                    <CalendarEntryFooter entry={entry} />
                                  </VStack>
                                </ClickableCard>
                              </CalendarPostPopover>
                            );
                          })}

                          {entries.length > MAX_VISIBLE_PER_CELL && (
                            <Button
                              label={
                                isExpanded
                                  ? "Tampilkan lebih sedikit"
                                  : `+${hiddenCount} More`
                              }
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(cellKey)}
                            />
                          )}
                        </VStack>
                      );
                    })}
                  </Grid>
                </StackItem>
              </HStack>
              <Divider variant="strong" />
            </VStack>
          ))}
        </VStack>
      </VStack>
    </Card>
  );
}
