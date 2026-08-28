"use client";

import { useMemo } from "react";
import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Selector } from "@astryxdesign/core/Selector";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

import { ContentStatus } from "@social/shared";
import type { ConnectedAccountId } from "@social/shared";
import type { ConnectedAccountRecord } from "@/domains/workspace";
import { getWeekRange } from "@/domains/publishing";
import type { CalendarViewMode } from "@/domains/publishing";

import { CONTENT_STATUS_LABEL } from "../../../components/draft-editor/status-badge";
import { useCalendarPeriodState } from "../hooks/useCalendarPeriodState";
import { addDays, addMonths } from "./calendar-grid-shared";

const ALL_STATUSES_VALUE = "all";
const ALL_ACCOUNTS_VALUE = "all";

const VIEW_OPTIONS: { value: CalendarViewMode; label: string }[] = [
  { value: "week", label: "Minggu" },
  { value: "month", label: "Bulan" },
];

const STATUS_OPTIONS = [
  { value: ALL_STATUSES_VALUE, label: "All Posts" },
  ...Object.values(ContentStatus).map((status) => ({
    value: status,
    label: CONTENT_STATUS_LABEL[status],
  })),
];

/** Format tanggal-saja ("14") — dipakai sisi awal label Week saat masih dalam bulan yang sama. */
const DAY_ONLY_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  timeZone: "UTC",
});
/** Format tanggal + bulan singkat ("20 Jul") — sisi akhir label Week, dan kedua sisi saat lintas bulan. */
const DAY_MONTH_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Label periode Week (T-033.5) — "14–20 Jul" kalau 7 hari jatuh di bulan
 * kalender yang sama, "28 Jul – 3 Ags" kalau lintas bulan (mockup
 * `templates/publish-calendar.html` hanya mencontohkan kasus non-lintas-
 * bulan, format lintas-bulan mengikuti konvensi umum kalender: kedua sisi
 * tampilkan nama bulan supaya tidak ambigu).
 */
function formatWeekPeriodLabel(date: Date): string {
  const { from, to } = getWeekRange(date);
  const sameMonth =
    from.getUTCMonth() === to.getUTCMonth() &&
    from.getUTCFullYear() === to.getUTCFullYear();

  if (sameMonth) {
    return `${DAY_ONLY_FORMATTER.format(from)}–${DAY_MONTH_FORMATTER.format(to)}`;
  }
  return `${DAY_MONTH_FORMATTER.format(from)} – ${DAY_MONTH_FORMATTER.format(to)}`;
}

function formatMonthPeriodLabel(date: Date): string {
  return MONTH_YEAR_FORMATTER.format(date);
}

export interface CalendarToolbarProps {
  /** Daftar akun terkoneksi workspace (T-033.6) — sumber opsi filter Channels, dari `WorkspaceService.listConnectedAccounts` (bukan derive dari `items` supaya opsi tidak hilang saat filter lain aktif). */
  accounts: ConnectedAccountRecord[];
}

/**
 * Toolbar Calendar (T-033.5 navigasi + T-033.6 filter) — acuan visual
 * `templates/publish-calendar.html` (Claude Design, `.cal-period-controls`
 * + `.cal-view-select` + `.cal-filter-row`). Client component murni state
 * URL lewat `useCalendarPeriodState` (T-033.2) — tidak menerima `view`/
 * `date` sebagai props supaya satu-satunya sumber kebenaran tetap URL.
 */
export function CalendarToolbar({ accounts }: CalendarToolbarProps) {
  const { view, date, statuses, connectedAccountIds, setPeriod } =
    useCalendarPeriodState();

  const periodLabel =
    view === "month"
      ? formatMonthPeriodLabel(date)
      : formatWeekPeriodLabel(date);

  const accountOptions = useMemo(
    () => [
      { value: ALL_ACCOUNTS_VALUE, label: "Semua Akun" },
      ...accounts.map((account) => ({
        value: account.id as string,
        label: account.handle,
      })),
    ],
    [accounts],
  );

  function goToday() {
    setPeriod({ date: new Date() });
  }

  function goPrev() {
    setPeriod({
      date: view === "month" ? addMonths(date, -1) : addDays(date, -7),
    });
  }

  function goNext() {
    setPeriod({
      date: view === "month" ? addMonths(date, 1) : addDays(date, 7),
    });
  }

  return (
    <VStack gap={3}>
      <HStack justify="between" align="center" wrap="wrap" gap={2}>
        <HStack gap={2} align="center">
          <Button
            label="Today"
            variant="secondary"
            size="sm"
            onClick={goToday}
          />
          <IconButton
            label={view === "month" ? "Bulan sebelumnya" : "Minggu sebelumnya"}
            tooltip="Sebelumnya"
            icon={<FaChevronLeft />}
            variant="secondary"
            size="sm"
            onClick={goPrev}
          />
          <IconButton
            label={view === "month" ? "Bulan berikutnya" : "Minggu berikutnya"}
            tooltip="Berikutnya"
            icon={<FaChevronRight />}
            variant="secondary"
            size="sm"
            onClick={goNext}
          />
          <Text type="label" weight="bold">
            {periodLabel}
          </Text>
        </HStack>

        <Selector
          label="Tampilan Calendar"
          isLabelHidden
          value={view}
          onChange={(value) => setPeriod({ view: value as CalendarViewMode })}
          options={VIEW_OPTIONS}
          width={120}
          size="sm"
        />
      </HStack>

      <HStack gap={2} wrap="wrap">
        <Selector
          label="Filter status"
          isLabelHidden
          value={statuses[0] ?? ALL_STATUSES_VALUE}
          onChange={(value) =>
            setPeriod({
              statuses:
                value === ALL_STATUSES_VALUE ? [] : [value as ContentStatus],
            })
          }
          options={STATUS_OPTIONS}
          width={180}
          size="sm"
        />
        <Selector
          label="Filter akun"
          isLabelHidden
          value={connectedAccountIds[0] ?? ALL_ACCOUNTS_VALUE}
          onChange={(value) =>
            setPeriod({
              connectedAccountIds:
                value === ALL_ACCOUNTS_VALUE
                  ? []
                  : [value as ConnectedAccountId],
            })
          }
          options={accountOptions}
          width={180}
          size="sm"
        />
      </HStack>
    </VStack>
  );
}
