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
import { getWeekRange } from "@/domains/publishing";

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
  MAX_VISIBLE_PER_CELL,
  toUtcDateKey,
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
}

/**
 * Grid Week (T-033.3, KSP-02) — 7 kolom hari × 24 baris jam (satu baris per
 * jam, revisi kedua T-033 — label teks cuma di baris jam genap, lihat
 * `WEEK_HOUR_LABELS`), acuan visual `templates/publish-calendar.html`
 * (Claude Design). Klik kartu post membuka Popover ringkasan (T-033.8,
 * ADR-090/ADR-091, `CalendarPostPopover`).
 */
export function CalendarWeekGrid({ date, items }: CalendarWeekGridProps) {
  const [expandedCellKeys, setExpandedCellKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

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

    const cellKey = `${dayIndex}-${entry.hour}`;
    const entries = cellEntries.get(cellKey) ?? [];
    entries.push(entry);
    cellEntries.set(cellKey, entries);
  }

  function toggleExpanded(cellKey: string) {
    setExpandedCellKeys((prev) => {
      const next = new Set(prev);
      if (next.has(cellKey)) {
        next.delete(cellKey);
      } else {
        next.add(cellKey);
      }
      return next;
    });
  }

  return (
    <Card padding={3}>
      <VStack gap={3}>
        <HStack gap={2}>
          <StackItem>
            <VStack width={TIME_COLUMN_WIDTH} />
          </StackItem>
          <StackItem size="fill">
            <Grid columns={CALENDAR_DAY_COLUMNS} gap={2}>
              {days.map((day, index) => {
                const isToday = dayKeys[index] === todayKey;
                return (
                  <VStack key={dayKeys[index]} gap={0.5} align="center">
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
                  <Grid columns={CALENDAR_DAY_COLUMNS} gap={2}>
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
                          padding={1}
                          isScrollable
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
                                          CONTENT_STATUS_DOT_VARIANT[
                                            entry.status
                                          ]
                                        }
                                        label={
                                          CONTENT_STATUS_LABEL[entry.status]
                                        }
                                        tooltip={
                                          CONTENT_STATUS_LABEL[entry.status]
                                        }
                                      />
                                      <Icon
                                        icon={
                                          CONTENT_FORMAT_ICON[
                                            entry.contentFormat
                                          ]
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
                                        label={
                                          CONTENT_STATUS_LABEL[entry.status]
                                        }
                                      />
                                    </HStack>
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
