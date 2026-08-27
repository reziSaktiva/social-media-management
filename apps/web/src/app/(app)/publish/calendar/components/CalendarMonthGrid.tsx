"use client";

import { useState } from "react";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { Divider } from "@astryxdesign/core/Divider";
import { Grid } from "@astryxdesign/core/Grid";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { StackItem } from "@astryxdesign/core/Stack";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

import type { CalendarPostItem } from "@/domains/publishing";
import { getMonthRange } from "@/domains/publishing";

import {
  CONTENT_STATUS_BADGE_VARIANT,
  CONTENT_STATUS_LABEL,
} from "../../../components/draft-editor/status-badge";
import { PLATFORM_ICON } from "../../../components/platform-icons";
import { CalendarPostPopover } from "./CalendarPostPopover";
import {
  addDays,
  CALENDAR_DAY_COLUMNS,
  type CalendarCardEntry,
  CONTENT_FORMAT_ICON,
  CONTENT_FORMAT_LABEL,
  CONTENT_STATUS_DOT_VARIANT,
  DAY_LABELS,
  flattenCalendarItemsToEntries,
  formatCalendarHour,
  MAX_VISIBLE_PER_CELL,
  MS_PER_DAY,
  toUtcDateKey,
} from "./calendar-grid-shared";

/** Tinggi minimum sel Month, termasuk padding — lebar kolom sekarang responsive (`Grid columns={CALENDAR_DAY_COLUMNS}`), tinggi tetap fixed. */
const MONTH_CELL_MIN_HEIGHT = 200;

/** Sisi kotak avatar platform (Card berisi `PlatformGlyph` di tengah, poin 5 — bukan lagi box kosong terpisah dari icon). Dinaikkan di revisi kelima T-033 (poin 1) — ukuran sebelumnya (14) hasil pengecilan agresif revisi ketiga jadi terlalu kecil untuk dibaca. */
const MONTH_THUMBNAIL_SIZE = 20;

/** Sisi ikon platform di dalam `MONTH_THUMBNAIL_SIZE` — dinaikkan bersamaan (revisi kelima T-033, poin 1). */
const MONTH_PLATFORM_ICON_SIZE = 13;

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
 * (di luar scope T-033.4). Klik kartu post membuka Popover ringkasan
 * (T-033.8, ADR-090/ADR-091, `CalendarPostPopover`).
 */
export function CalendarMonthGrid({ date, items }: CalendarMonthGridProps) {
  const [expandedDateKeys, setExpandedDateKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const gridDays = buildMonthGridDays(date);
  const weeks = chunkIntoWeeks(gridDays);
  const todayKey = toUtcDateKey(new Date());

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
        <Grid columns={CALENDAR_DAY_COLUMNS} gap={2}>
          {DAY_LABELS.map((label) => (
            <VStack key={label} align="center">
              <Text type="supporting" size="xsm">
                {label}
              </Text>
            </VStack>
          ))}
        </Grid>

        <Divider variant="strong" />

        <VStack gap={0}>
          {weeks.map((week, weekIndex) => (
            <VStack gap={0} key={week[0]?.dateKey ?? weekIndex}>
              <Grid columns={CALENDAR_DAY_COLUMNS} gap={2}>
                {week.map((day) => {
                  const entries = entriesByDate.get(day.dateKey) ?? [];
                  const isExpanded = expandedDateKeys.has(day.dateKey);
                  const visibleEntries = isExpanded
                    ? entries
                    : entries.slice(0, MAX_VISIBLE_PER_CELL);
                  const hiddenCount = entries.length - visibleEntries.length;
                  const isToday = day.dateKey === todayKey;

                  return (
                    // `isScrollable` (bukan untuk scroll sungguhan — sel selalu tumbuh
                    // vertikal via `minHeight`) dipakai supaya sel ini jadi scroll
                    // container (`overflow: auto`), yang per spec CSS Grid membuat
                    // "automatic minimum size"-nya sendiri jadi 0 — mencegah 1 kartu
                    // dengan konten lebar "mencuri" lebar kolom dari kartu lain di
                    // baris yang sama (root cause "grid tidak sejajar", revisi ketiga
                    // T-033 Bagian A). Tanpa ini, `<Grid columns={7}>` (`repeat(7,
                    // 1fr)` = `repeat(7, minmax(auto, 1fr))`) membiarkan 1 sel padat
                    // menentukan lebar kolomnya sendiri, bukan 1/7 rata seperti header.
                    <VStack
                      key={day.dateKey}
                      gap={1.5}
                      minHeight={MONTH_CELL_MIN_HEIGHT}
                      padding={1}
                      isScrollable
                    >
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
                            <CalendarPostPopover key={entry.key} entry={entry}>
                              <ClickableCard
                                label={`${entry.accountHandle} — ${
                                  entry.caption || "(Tanpa caption)"
                                }`}
                                padding={1.5}
                                width="100%"
                              >
                                <VStack gap={1}>
                                  {/* Header: avatar+nama (kiri, menyusut/truncate lewat StackItem
                                      "fill") sejajar dengan jam (kanan) — satu baris, bukan avatar
                                      disandingkan seluruh blok teks seperti sebelum revisi ketiga. */}
                                  <HStack gap={1} align="center">
                                    <Card
                                      variant="muted"
                                      padding={0}
                                      width={MONTH_THUMBNAIL_SIZE}
                                      height={MONTH_THUMBNAIL_SIZE}
                                    >
                                      <VStack
                                        align="center"
                                        justify="center"
                                        height="100%"
                                      >
                                        <PlatformGlyph
                                          size={MONTH_PLATFORM_ICON_SIZE}
                                          color={
                                            PLATFORM_ICON[entry.platform].color
                                          }
                                        />
                                      </VStack>
                                    </Card>
                                    <StackItem size="fill">
                                      <Text size="sm" maxLines={1}>
                                        {entry.accountHandle}
                                      </Text>
                                    </StackItem>
                                    <Text
                                      type="supporting"
                                      size="xsm"
                                      color="secondary"
                                    >
                                      {formatCalendarHour(entry.hour)}
                                    </Text>
                                  </HStack>

                                  {/* Footer, revisi keempat T-033 poin 2-3: ≤768px `Badge` teks
                                      overflow di card sempit (Badge "Scheduled" 77px vs ruang
                                      card ~22-39px di 375px, Badge tidak punya prop
                                      size/truncation) — diganti StatusDot+Icon compact di bawah
                                      768px (breakpoint sama dengan AppShell mobile nav,
                                      `md: 768` di `AppShell.tsx`), 2 Badge tetap seperti semula
                                      di >768px (tidak berubah). CSS murni (Tailwind `md:`), bukan
                                      JS resize-hook — `useMediaQuery` Astryx eksplisit "always
                                      returns false on first render" (SSR), berisiko hydration
                                      mismatch/layout shift untuk switch yang harus benar di
                                      first paint. Detail lengkap tetap ada lewat tap kartu →
                                      `CalendarPostPopover` (tidak berubah). */}
                                  <HStack
                                    gap={1.5}
                                    align="center"
                                    className="flex md:hidden"
                                  >
                                    <StatusDot
                                      variant={
                                        CONTENT_STATUS_DOT_VARIANT[entry.status]
                                      }
                                      label={CONTENT_STATUS_LABEL[entry.status]}
                                      tooltip={
                                        CONTENT_STATUS_LABEL[entry.status]
                                      }
                                    />
                                    <Icon
                                      icon={
                                        CONTENT_FORMAT_ICON[entry.contentFormat]
                                      }
                                      size="xsm"
                                      color="secondary"
                                      label={
                                        CONTENT_FORMAT_LABEL[
                                          entry.contentFormat
                                        ]
                                      }
                                    />
                                  </HStack>
                                  <HStack
                                    gap={1}
                                    align="center"
                                    wrap="wrap"
                                    className="hidden md:flex"
                                  >
                                    <Badge
                                      variant="neutral"
                                      label={
                                        CONTENT_FORMAT_LABEL[
                                          entry.contentFormat
                                        ]
                                      }
                                    />
                                    <Badge
                                      variant={
                                        CONTENT_STATUS_BADGE_VARIANT[
                                          entry.status
                                        ]
                                      }
                                      label={CONTENT_STATUS_LABEL[entry.status]}
                                    />
                                  </HStack>
                                </VStack>
                              </ClickableCard>
                            </CalendarPostPopover>
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
                  );
                })}
              </Grid>
              <Divider variant="strong" />
            </VStack>
          ))}
        </VStack>
      </VStack>
    </Card>
  );
}
