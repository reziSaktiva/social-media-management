"use client";

// Analyze — Post Performance table (T-043.2, KSP-07 Analyze → Dashboard).
//
// Pola sama seperti `DashboardHome.tsx` (T-042.3–T-042.5): Client Component
// menerima initial data dari Server Component induk (`page.tsx`), mengelola
// state `period` sendiri (`useState` + `useTransition`) dan re-fetch lewat
// Server Action `getPostPerformanceAction` saat selector rentang waktu
// diganti — guard `latestRequestedPeriod` mencegah response out-of-order
// menimpa state yang lebih baru.
//
// Pola tabel dikunci lewat design-prep T-043 (Claude Design,
// `templates/analyze-dashboard.html`, komentar inline "SYNCED (T-043 design
// prep, 2026-09-18)", dikonfirmasi King Rezi via `AskUserQuestion`
// sebelumnya): shadcn `Table` + `TableHeader` (BUKAN `Item`/`ItemGroup`,
// konsisten dengan pola Members `MembersTable.tsx` yang JUGA pakai header —
// beda dari Drafts/Workspaces/Connected Accounts yang tanpa header), 4
// kolom (Post, Akun, Reach, Eng. Rate), TANPA wrapper `Card` terpisah
// (border+rounded manual di atas `Table`, pola final KI-055 yang sama
// dipakai `MembersTable.tsx`), baris TIDAK diklik-penuh (navigasi metrik
// per-post adalah T-043.3, task terpisah).
//
// Sorting (T-043.2): data sudah di-fetch semua sekaligus per `period` lewat
// `getPostPerformanceAction` — klik header cuma re-sort array yang sudah
// ada di state React lokal, TIDAK memanggil Server Action baru per klik
// (shadcn `Table` sendiri tidak punya sorting bawaan, dikonfirmasi via MCP
// `get_item_examples_from_registries` — `data-table-demo` resmi pakai
// TanStack Table untuk sorting client-side dengan pola tombol
// `variant="ghost"` + ikon panah per `TableHead`, direplikasi di sini tanpa
// dependency TanStack karena datanya sudah flat/kecil). Default sort Reach
// descending — sama dengan urutan default `AnalyticsService.getPostPerformance`
// (T-043.1).
//
// T-043.4 (tandai metrik yang belum tersedia dari platform, bukan nol):
// `PostPerformanceRow.reach`/`.engagementRate` sekarang `number | null`
// (`analytics.service.ts` sisi Prabowo) — `null` berarti post+akun tsb
// belum punya `AnalyticsPostMetric` yang ter-ingest, dan baris itu TETAP
// disertakan (tidak lagi di-skip). Kolom Reach/Eng. Rate merender teks
// "Belum ada data" (`text-muted-foreground`) saat `null`, bukan "0". Sort
// numerik pada kedua kolom itu null-safe: baris `null` selalu ditaruh di
// akhir hasil sort — baik ascending maupun descending — pola sama seperti
// default comparator `AnalyticsService.getPostPerformance`.

import { useMemo, useRef, useState, useTransition } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  ArrowUpDownIcon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

import { PLATFORM_ICON } from "../../components/platform-icons";
import { getPostPerformanceAction } from "../analyze-actions";

import type { SnapshotPeriod } from "@/domains/analytics";
import type { PostPerformanceRow } from "@/domains/publishing";

const PERIOD_OPTIONS: Array<{ value: SnapshotPeriod; label: string }> = [
  { value: "weekly", label: "Mingguan" },
  { value: "monthly", label: "Bulanan" },
];

type SortColumn = "caption" | "accountHandle" | "reach" | "engagementRate";
type SortDirection = "asc" | "desc";

interface SortState {
  column: SortColumn;
  direction: SortDirection;
}

// Numerik (Reach, Eng. Rate) default descending saat kolom baru diklik —
// selaras urutan default service (Reach descending). Teks (Post, Akun)
// default ascending (A-Z) — lebih natural untuk kolom non-numerik.
const DEFAULT_DIRECTION_BY_COLUMN: Record<SortColumn, SortDirection> = {
  caption: "asc",
  accountHandle: "asc",
  reach: "desc",
  engagementRate: "desc",
};

function sortRows(
  rows: PostPerformanceRow[],
  sort: SortState,
): PostPerformanceRow[] {
  const sorted = [...rows];
  sorted.sort((a, b) => {
    if (sort.column === "reach" || sort.column === "engagementRate") {
      // Null-safe (T-043.4): baris tanpa metrik (`null`) selalu ditaruh di
      // akhir, terlepas dari arah sort — pola sama seperti default
      // comparator `AnalyticsService.getPostPerformance`.
      const aValue = a[sort.column];
      const bValue = b[sort.column];
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      const comparison = aValue - bValue;
      return sort.direction === "asc" ? comparison : -comparison;
    }
    const comparison = a[sort.column].localeCompare(b[sort.column]);
    return sort.direction === "asc" ? comparison : -comparison;
  });
  return sorted;
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/** Tombol sort kecil + ikon panah per `TableHead` (T-043.2, mockup `.th-sort`/`.sort-icon`). */
function SortableTableHead({
  column,
  label,
  align,
  sort,
  onSort,
}: {
  column: SortColumn;
  label: string;
  align?: "right";
  sort: SortState;
  onSort: (column: SortColumn) => void;
}) {
  const isActive = sort.column === column;
  const ariaSort = isActive
    ? sort.direction === "asc"
      ? "ascending"
      : "descending"
    : "none";

  return (
    <TableHead
      aria-sort={ariaSort}
      className={align === "right" ? "text-right" : undefined}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onSort(column)}
        className={cn(
          "h-8 px-2",
          align === "right" ? "-mr-2 ml-auto flex" : undefined,
        )}
      >
        {label}
        <HugeiconsIcon
          icon={
            isActive
              ? sort.direction === "asc"
                ? ArrowUp01Icon
                : ArrowDown01Icon
              : ArrowUpDownIcon
          }
          size={14}
          className={isActive ? "text-foreground" : "text-muted-foreground"}
        />
      </Button>
    </TableHead>
  );
}

export function AnalyzeDashboard({
  initialPeriod,
  initialRows,
}: {
  initialPeriod: SnapshotPeriod;
  initialRows: PostPerformanceRow[];
}) {
  const [period, setPeriod] = useState<SnapshotPeriod>(initialPeriod);
  const [rows, setRows] = useState<PostPerformanceRow[]>(initialRows);
  const [sort, setSort] = useState<SortState>({
    column: "reach",
    direction: "desc",
  });
  const [isPending, startTransition] = useTransition();
  // Guard yang sama seperti `DashboardHome.tsx` — mencegah response
  // out-of-order (period diganti dua kali cepat-cepat) menimpa state yang
  // lebih baru.
  const latestRequestedPeriod = useRef<SnapshotPeriod>(initialPeriod);

  const sortedRows = useMemo(() => sortRows(rows, sort), [rows, sort]);

  function handlePeriodChange(value: string) {
    const nextPeriod = value as SnapshotPeriod;
    setPeriod(nextPeriod);
    latestRequestedPeriod.current = nextPeriod;
    startTransition(async () => {
      const result = await getPostPerformanceAction(nextPeriod);
      if (latestRequestedPeriod.current === nextPeriod) {
        setRows(result);
      }
    });
  }

  function handleSort(column: SortColumn) {
    setSort((current) => {
      if (current.column === column) {
        return {
          column,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return { column, direction: DEFAULT_DIRECTION_BY_COLUMN[column] };
    });
  }

  return (
    // eslint-disable-next-line no-restricted-syntax -- layout-only, file ini sudah dimigrasi shadcn (ADR-097)
    <div className="flex flex-col gap-6">
      {/* eslint-disable-next-line no-restricted-syntax -- layout-only */}
      <div className="flex items-center justify-between gap-4">
        {/* eslint-disable-next-line no-restricted-syntax -- layout-only */}
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Analyze
          </h1>
          <Text variant="muted">Performa post per akun terhubung</Text>
        </div>
        <Select
          value={period}
          onValueChange={handlePeriodChange}
          disabled={isPending}
        >
          <SelectTrigger aria-label="Rentang waktu" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* eslint-disable-next-line no-restricted-syntax -- layout-only */}
      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          Post Performance
        </h2>

        {sortedRows.length === 0 ? (
          // eslint-disable-next-line no-restricted-syntax -- pola sama MembersTable.tsx (KI-055): border+rounded manual, tanpa Card
          <div className="rounded-xl border border-border p-6">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Belum ada data</EmptyTitle>
                <EmptyDescription>
                  Belum ada post dengan metrik untuk rentang waktu ini. Data
                  akan muncul setelah sinkronisasi metrik berjalan.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          // eslint-disable-next-line no-restricted-syntax -- pola sama MembersTable.tsx (KI-055)
          <div className="overflow-hidden rounded-xl border border-border py-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead
                    column="caption"
                    label="Post"
                    sort={sort}
                    onSort={handleSort}
                  />
                  <SortableTableHead
                    column="accountHandle"
                    label="Akun"
                    sort={sort}
                    onSort={handleSort}
                  />
                  <SortableTableHead
                    column="reach"
                    label="Reach"
                    align="right"
                    sort={sort}
                    onSort={handleSort}
                  />
                  <SortableTableHead
                    column="engagementRate"
                    label="Eng. Rate"
                    align="right"
                    sort={sort}
                    onSort={handleSort}
                  />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRows.map((row) => {
                  const platformEntry = PLATFORM_ICON[row.platform];
                  return (
                    <TableRow key={`${row.postId}-${row.connectedAccountId}`}>
                      <TableCell>
                        {/* eslint-disable-next-line no-restricted-syntax -- layout-only */}
                        <div className="flex items-center gap-3">
                          {/* Placeholder visual "thumbnail" — `PostPerformanceRow`
                              tidak punya field gambar (bukan field karangan
                              di luar `AnalyticsPostMetric`/history), jadi
                              dipakai badge ikon platform sebagai representasi
                              visual, bukan thumbnail gambar post asli. */}
                          {/* eslint-disable-next-line no-restricted-syntax -- layout-only */}
                          <div
                            aria-hidden
                            className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted"
                          >
                            {platformEntry ? (
                              <platformEntry.Icon
                                size={16}
                                color={platformEntry.color}
                              />
                            ) : null}
                          </div>
                          <span
                            className="block max-w-70 truncate"
                            title={row.caption}
                          >
                            {row.caption}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {/* eslint-disable-next-line no-restricted-syntax -- layout-only */}
                        <div className="flex flex-col">
                          <Text variant="small">{row.accountHandle}</Text>
                          <Text variant="muted">
                            {platformEntry?.label ?? row.platform}
                          </Text>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {row.reach === null ? (
                          <span className="text-muted-foreground">
                            Belum ada data
                          </span>
                        ) : (
                          row.reach.toLocaleString("id-ID")
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.engagementRate === null ? (
                          <span className="text-muted-foreground">
                            Belum ada data
                          </span>
                        ) : (
                          formatPercentage(row.engagementRate)
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
