"use client";

// Post Performance table (T-043.2/T-043.4, KSP-07) — rancangan dikunci
// Claude Design `templates/analyze-dashboard.html` (komentar SYNCED,
// 2026-09-18): `Table`/`TableHeader`/`TableHead`/`TableBody`/`TableRow`/
// `TableCell` DENGAN `TableHeader` (beda dari Drafts yang TANPA header —
// `DraftsList.tsx` — karena T-043.2 secara literal minta tabel yang
// sortable, kolom butuh header untuk memuat affordance sort), mengikuti
// pola Members (`MembersTable.tsx`, juga PAKAI `TableHeader`) sebagai
// referensi struktural terdekat. Wrapper TANPA `Card` terpisah — border +
// rounded manual (`rounded-xl border border-border`), pola sama
// `MembersTable.tsx`/`DraftsList.tsx`. Baris TIDAK diklik-penuh (beda dari
// Drafts) — navigasi ke detail post ada di halaman History
// (`/publish/history/[postId]`), bukan dari tabel ini.
//
// Kolom: Post (thumbnail placeholder + caption), Akun/Platform, Reach,
// Engagement Rate — urutan dan hanya 4 kolom ini (keputusan desain: supaya
// tabel tidak padat, lihat komentar SYNCED di mockup). Sort client-side,
// default Reach descending (sama seperti mockup, `aria-sort="descending"`).

import { useMemo, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  ArrowUpDownIcon,
} from "@hugeicons/core-free-icons";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Text } from "@/components/ui/text";

import { PLATFORM_ICON } from "../../components/platform-icons";
import { cn } from "@/lib/utils";

import type { PostPerformanceRow } from "@/domains/analytics";

type SortKey = "post" | "account" | "reach" | "engagementRate";
type SortDirection = "asc" | "desc";
interface SortState {
  key: SortKey;
  direction: SortDirection;
}

const DEFAULT_SORT: SortState = { key: "reach", direction: "desc" };

// Kolom numerik (Reach/Eng. Rate) default descending saat pertama diklik
// (nilai terbesar dulu, lebih relevan) — kolom teks (Post/Akun) default
// ascending (A-Z). Keputusan UI lokal ini di luar cakupan yang dikunci
// Claude Design (yang dikunci hanya default sort AWAL tabel: Reach
// descending), bukan pola ambigu.
const DEFAULT_DIRECTION_FOR_KEY: Record<SortKey, SortDirection> = {
  post: "asc",
  account: "asc",
  reach: "desc",
  engagementRate: "desc",
};

function formatReach(value: number): string {
  return value.toLocaleString("id-ID");
}

function formatEngagementRate(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Urutkan baris (T-043.4): baris `hasMetrics: false` TIDAK ikut disortir
 * numerik secara menyesatkan di kolom Reach/Eng. Rate — selalu ditaruh di
 * akhir, terlepas arah sort (treat sebagai nilai terendah). Kolom Akun
 * memperlakukan platform `null` (baris tanpa metrik) dengan cara yang sama
 * supaya konsisten.
 */
function sortRows(
  rows: PostPerformanceRow[],
  sort: SortState,
): PostPerformanceRow[] {
  const dir = sort.direction === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    if (sort.key === "post") {
      return dir * a.caption.localeCompare(b.caption, "id");
    }

    if (sort.key === "account") {
      const labelA = a.platform ? PLATFORM_ICON[a.platform].label : null;
      const labelB = b.platform ? PLATFORM_ICON[b.platform].label : null;
      if (labelA === null && labelB === null) return 0;
      if (labelA === null) return 1;
      if (labelB === null) return -1;
      return dir * labelA.localeCompare(labelB, "id");
    }

    // "reach" | "engagementRate"
    if (!a.hasMetrics && !b.hasMetrics) return 0;
    if (!a.hasMetrics) return 1;
    if (!b.hasMetrics) return -1;

    const valueA = (sort.key === "reach" ? a.reach : a.engagementRate) ?? 0;
    const valueB = (sort.key === "reach" ? b.reach : b.engagementRate) ?? 0;
    return dir * (valueA - valueB);
  });
}

function SortableHead({
  label,
  sortKey,
  sort,
  onSort,
  align,
}: {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  onSort: (key: SortKey) => void;
  align?: "right";
}) {
  const isActive = sort.key === sortKey;
  const ariaSort = isActive
    ? sort.direction === "asc"
      ? "ascending"
      : "descending"
    : "none";
  const Icon = isActive
    ? sort.direction === "asc"
      ? ArrowUp01Icon
      : ArrowDown01Icon
    : ArrowUpDownIcon;

  return (
    <TableHead
      aria-sort={ariaSort}
      className={align === "right" ? "text-right" : undefined}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-foreground select-none",
          align === "right" && "justify-end",
        )}
      >
        {label}
        <HugeiconsIcon
          icon={Icon}
          size={12}
          className={isActive ? "opacity-100" : "opacity-45"}
        />
      </button>
    </TableHead>
  );
}

export function PostPerformanceTable({ rows }: { rows: PostPerformanceRow[] }) {
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);

  const sortedRows = useMemo(() => sortRows(rows, sort), [rows, sort]);

  function handleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: DEFAULT_DIRECTION_FOR_KEY[key] },
    );
  }

  if (rows.length === 0) {
    return (
      // eslint-disable-next-line no-restricted-syntax -- layout-only, pola sama DraftsList/MembersTable
      <div className="rounded-xl border border-border p-6">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Belum ada post yang terpublikasi</EmptyTitle>
            <EmptyDescription>
              Post yang sudah dipublikasikan akan muncul di sini beserta
              performanya.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    // eslint-disable-next-line no-restricted-syntax -- layout-only, pola sama MembersTable
    <div className="rounded-xl border border-border py-2">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHead
              label="Post"
              sortKey="post"
              sort={sort}
              onSort={handleSort}
            />
            <SortableHead
              label="Akun"
              sortKey="account"
              sort={sort}
              onSort={handleSort}
            />
            <SortableHead
              label="Reach"
              sortKey="reach"
              sort={sort}
              onSort={handleSort}
              align="right"
            />
            <SortableHead
              label="Eng. Rate"
              sortKey="engagementRate"
              sort={sort}
              onSort={handleSort}
              align="right"
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.map((row) => (
            <TableRow key={`${row.postId}:${row.connectedAccountId ?? "none"}`}>
              <TableCell className="whitespace-normal">
                {/* eslint-disable-next-line no-restricted-syntax -- layout-only */}
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line no-restricted-syntax -- layout-only, thumbnail placeholder */}
                  <div
                    aria-hidden="true"
                    className="size-10 shrink-0 rounded-md bg-muted"
                  />
                  <Text variant="small" className="min-w-0 flex-1 truncate">
                    {row.caption || "(Tanpa caption)"}
                  </Text>
                </div>
              </TableCell>
              <TableCell>
                {row.hasMetrics && row.platform ? (
                  // eslint-disable-next-line no-restricted-syntax -- layout-only
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const PlatformGlyph = PLATFORM_ICON[row.platform].Icon;
                      return (
                        <PlatformGlyph
                          size={14}
                          color={PLATFORM_ICON[row.platform].color}
                        />
                      );
                    })()}
                    <Text variant="small" as="span">
                      {PLATFORM_ICON[row.platform].label}
                    </Text>
                  </div>
                ) : (
                  <Text variant="muted" as="span" className="text-sm">
                    Belum ada data
                  </Text>
                )}
              </TableCell>
              <TableCell className="text-right">
                {row.hasMetrics && row.reach !== null ? (
                  <Text variant="small" as="span" className="tabular-nums">
                    {formatReach(row.reach)}
                  </Text>
                ) : (
                  <Text variant="muted" as="span" className="text-sm">
                    Belum ada data
                  </Text>
                )}
              </TableCell>
              <TableCell className="text-right">
                {row.hasMetrics && row.engagementRate !== null ? (
                  <Text variant="small" as="span" className="tabular-nums">
                    {formatEngagementRate(row.engagementRate)}
                  </Text>
                ) : (
                  <Text variant="muted" as="span" className="text-sm">
                    Belum ada data
                  </Text>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
