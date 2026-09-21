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
// kolom (Post, Akun, Reach, Eng. Rate), baris TIDAK diklik-penuh (navigasi
// metrik per-post adalah T-043.3, task terpisah).
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
//
// Section "Account Overview" (T-046.2–T-046.3): pola dikunci di design-prep
// T-043 (`templates/analyze-dashboard.html`, komentar "SYNCED (T-043 design
// prep, 2026-09-18)") — `.bar-track`/`.bar-fill` Astryx-era dipetakan ke
// shadcn `Progress` per baris akun. Satu baris per akun: ikon+label
// platform, jumlah post, `Progress` (value = proporsi `totalReach` akun itu
// relatif ke akun `totalReach` tertinggi di list, dari `AccountOverviewRow[]`
// yang SUDAH disortir `totalReach` descending oleh
// `PublishingService.getAccountOverview` — T-046.1), lalu angka reach
// ter-format. `totalReach: null` (T-046 kriteria "belum ada data" — akun
// belum punya post di period ini ATAU belum ter-ingest metrik) merender
// teks "Belum ada data" menggantikan SELURUH kombinasi bar+angka (bukan
// bar 0%), pola sama seperti sel Reach/Eng. Rate di Post Performance.
//
// REFLOW (lanjutan T-046, 2026-09-18 — King Rezi via `AskUserQuestion`:
// "tolong sesuaikan dengan Claude Design"): `DesignSync get_file` ulang
// pada `templates/analyze-dashboard.html` menunjukkan `.dash-cols` (grid
// `1.6fr 1fr`) membungkus DUA kartu — kartu kiri (1.6fr) adalah SATU
// `card.card-pad` yang berisi section "Account Overview" DIIKUTI section
// "Post Performance" (title + table) DI DALAM kartu yang SAMA (lihat
// komentar SYNCED T-043 di file itu: "Wrapper: TANPA `Card` terpisah —
// table langsung di dalam card.card-pad yang sudah ada di section ini,
// bukan dobel wrapper"); kartu kanan (1fr) adalah "Engagement Summary"
// (T-044). Sesi sebelumnya salah menaruh Account Overview sebagai `Card`
// full-width TERPISAH di atas Post Performance (yang juga masih pakai
// border manual sendiri, pola `MembersTable.tsx`/KI-055) — dua wrapper
// sendiri-sendiri, bukan satu kartu bersama seperti desain.
//
// Diperbaiki di sini: Account Overview + Post Performance sekarang berbagi
// SATU `Card`/`CardContent` (komponen `AccountOverviewContent` +
// `PostPerformanceContent` di bawah TIDAK lagi punya wrapper masing-masing —
// border manual `rounded-xl border` untuk tabel juga dihapus, karena
// `Table` shadcn sudah menyediakan `overflow-x-auto` sendiri dan kartu
// pembungkus sudah memberi border+radius). Kolom kanan (`.dash-cols` kedua,
// Engagement Summary) sempat sengaja dirender full-width sementara sampai
// T-044 dikerjakan (deviasi disengaja + dilaporkan, dikonfirmasi King Rezi
// via `AskUserQuestion`) — **sekarang T-044 sudah jalan** (2026-09-21):
// grid `lg:grid-cols-[1.6fr_1fr]` diaktifkan, kartu kiri (Account
// Overview + Post Performance) di kolom `1.6fr`, kartu kanan baru
// "Engagement Summary" (`EngagementSummaryContent` di bawah) di kolom
// `1fr`. Grid dirender 1 kolom (stack) di layar sempit (`grid-cols-1`,
// breakpoint `lg`), sama pola responsive lain di file ini.
//
// Engagement Summary (T-044): section "Engagement Summary" di
// `templates/analyze-dashboard.html` TIDAK ditandai "SYNCED" (masih
// sketsa awal, bukan locked pattern) — scope-nya sendiri dipersempit lewat
// `AskUserQuestion` ke King Rezi jadi cuma 2 angka (`Komentar`, `Likes`,
// dari `AnalyticsPostMetric`, BUKAN domain `engagement` seperti disebut
// task doc asli T-044.1-T-044.3 — lihat catatan lengkap di
// `PublishingService.getEngagementSummary`/`EngagementSummary`). Markup
// mockup (`.engage-num-row`: label kiri, angka bold kanan, border-bottom)
// dipetakan ke pola row yang SAMA seperti `AccountOverviewRowItem`
// (`flex justify-between`, `border-b border-border py-2.5 last:border-b-0`)
// supaya idiom konsisten dengan section lain di file ini, BUKAN pola baru.
// `EngagementSummaryContent` TANPA wrapper `Card` sendiri (dibungkus
// `Card`/`CardContent` di render utama, sama pola `AccountOverviewContent`/
// `PostPerformanceContent`). Null-safety SAMA PERSIS pola T-043.4/T-046.3/
// T-047.3: `totalComments`/`totalLikes` masing-masing independen render
// "Belum ada data" saat `null` (BUKAN 0), dan card TETAP tampil (2 baris
// "Belum ada data") kalau KEDUA field `null` — tidak disembunyikan.

import { useMemo, useRef, useState, useTransition } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  ArrowUpDownIcon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
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
import { formatEngagementRate } from "../../components/post-metric-tile";
import { StatTile } from "../../components/stat-tile";
import {
  getAccountOverviewAction,
  getAnalyzeSummaryAction,
  getEngagementSummaryAction,
  getPostPerformanceAction,
} from "../analyze-actions";

import type { SnapshotPeriod } from "@/domains/analytics";
import type {
  AccountOverviewRow,
  AnalyzeSummary,
  EngagementSummary,
  PostPerformanceRow,
} from "@/domains/publishing";

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

/**
 * Satu baris akun di section "Account Overview" (T-046.2), pola `.acc-perf-row`
 * di `analyze-dashboard.html`. `maxReach` adalah `totalReach` tertinggi di
 * seluruh list (dihitung sekali oleh caller) — dipakai untuk proporsi bar
 * `Progress`, bukan skala absolut 0-100.
 */
function AccountOverviewRowItem({
  row,
  maxReach,
}: {
  row: AccountOverviewRow;
  maxReach: number;
}) {
  const platformEntry = PLATFORM_ICON[row.platform];
  const postLabel = row.totalPosts === 1 ? "post" : "posts";
  const progressValue =
    row.totalReach === null || maxReach <= 0
      ? 0
      : Math.min((row.totalReach / maxReach) * 100, 100);

  return (
    // eslint-disable-next-line no-restricted-syntax -- layout-only
    <div className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0">
      {/* eslint-disable-next-line no-restricted-syntax -- layout-only */}
      <div className="flex w-36 shrink-0 items-center gap-2">
        {platformEntry ? (
          <platformEntry.Icon size={14} color={platformEntry.color} />
        ) : null}
        <Text variant="small" className="truncate" title={row.accountHandle}>
          {row.accountHandle}
        </Text>
      </div>
      <Text
        variant="muted"
        className="w-20 shrink-0"
      >{`${row.totalPosts} ${postLabel}`}</Text>
      {row.totalReach === null ? (
        <Text variant="muted" className="flex-1">
          Belum ada data
        </Text>
      ) : (
        <>
          <Progress
            value={progressValue}
            className="flex-1"
            aria-label={`Reach ${row.accountHandle}`}
          />
          <Text
            variant="small"
            className="w-16 shrink-0 text-right tabular-nums"
          >
            {row.totalReach.toLocaleString("id-ID")}
          </Text>
        </>
      )}
    </div>
  );
}

/**
 * Isi section "Account Overview" (T-046.2–T-046.3) — TANPA wrapper `Card`
 * sendiri (lihat catatan REFLOW di atas): section ini dan
 * `PostPerformanceContent` sekarang berbagi satu `Card` dari caller
 * (`AnalyzeDashboard`), pola `.dash-cols` kartu kiri di `analyze-dashboard.html`.
 */
function AccountOverviewContent({ rows }: { rows: AccountOverviewRow[] }) {
  const maxReach = useMemo(
    () =>
      rows.reduce(
        (max, row) =>
          row.totalReach !== null ? Math.max(max, row.totalReach) : max,
        0,
      ),
    [rows],
  );

  return (
    // eslint-disable-next-line no-restricted-syntax -- layout-only
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold tracking-tight">
        Account Overview
      </h2>

      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Belum ada data</EmptyTitle>
            <EmptyDescription>
              Belum ada akun terhubung untuk ditampilkan di rentang waktu ini.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        // eslint-disable-next-line no-restricted-syntax -- layout-only
        <div className="flex flex-col">
          {rows.map((row) => (
            <AccountOverviewRowItem
              key={row.connectedAccountId}
              row={row}
              maxReach={maxReach}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Isi section "Post Performance" (T-043.2) — TANPA wrapper border manual
 * sendiri (lihat catatan REFLOW di atas): pola `MembersTable.tsx`/KI-055
 * (border+rounded manual tanpa `Card`) dipakai saat section ini masih
 * berdiri sendiri; sekarang section ini pindah ke dalam `Card` yang sama
 * dengan `AccountOverviewContent`, jadi border manual itu dihapus supaya
 * tidak dobel wrapper — konsisten dengan komentar SYNCED T-043 di
 * `analyze-dashboard.html` ("table langsung di dalam card.card-pad yang
 * sudah ada di section ini, bukan dobel wrapper"). `Table` shadcn sendiri
 * sudah membungkus `<table>` dengan `overflow-x-auto` (lihat `table.tsx`),
 * jadi scroll horizontal di layar kecil tetap terjaga tanpa wrapper
 * tambahan.
 */
function PostPerformanceContent({
  sortedRows,
  sort,
  onSort,
}: {
  sortedRows: PostPerformanceRow[];
  sort: SortState;
  onSort: (column: SortColumn) => void;
}) {
  return (
    // eslint-disable-next-line no-restricted-syntax -- layout-only
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold tracking-tight">
        Post Performance
      </h2>

      {sortedRows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Belum ada data</EmptyTitle>
            <EmptyDescription>
              Belum ada post dengan metrik untuk rentang waktu ini. Data akan
              muncul setelah sinkronisasi metrik berjalan.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                column="caption"
                label="Post"
                sort={sort}
                onSort={onSort}
              />
              <SortableTableHead
                column="accountHandle"
                label="Akun"
                sort={sort}
                onSort={onSort}
              />
              <SortableTableHead
                column="reach"
                label="Reach"
                align="right"
                sort={sort}
                onSort={onSort}
              />
              <SortableTableHead
                column="engagementRate"
                label="Eng. Rate"
                align="right"
                sort={sort}
                onSort={onSort}
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
                      formatEngagementRate(row.engagementRate)
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

/**
 * Satu baris "Komentar"/"Likes" di section "Engagement Summary" (T-044),
 * pola `.engage-num-row` di `analyze-dashboard.html`: label kiri, angka
 * bold kanan, border-bottom — struktur row SAMA seperti
 * `AccountOverviewRowItem` (`flex justify-between`, border-b + py-2.5,
 * `last:border-b-0`), idiom yang sudah dipakai file ini. `value === null`
 * (T-044, pola T-043.4/T-046.3 — belum ada `AnalyticsPostMetric` ter-ingest
 * untuk period ini) merender "Belum ada data", BUKAN "0".
 */
function EngagementSummaryRow({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    // eslint-disable-next-line no-restricted-syntax -- layout-only
    <div className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0">
      <Text variant="small" className="font-normal">
        {label}
      </Text>
      {value === null ? (
        <Text variant="muted">Belum ada data</Text>
      ) : (
        <Text variant="small" className="font-semibold tabular-nums">
          {value.toLocaleString("id-ID")}
        </Text>
      )}
    </div>
  );
}

/**
 * Isi section "Engagement Summary" (T-044) — TANPA wrapper `Card` sendiri
 * (lihat catatan REFLOW di kepala file): section ini dibungkus
 * `Card`/`CardContent` di kolom kanan `.dash-cols` oleh caller
 * (`AnalyzeDashboard`), pola sama `AccountOverviewContent`/
 * `PostPerformanceContent` untuk kolom kiri. Card TETAP dirender meski
 * `totalComments`/`totalLikes` KEDUANYA `null` (2 baris "Belum ada data"),
 * bukan disembunyikan — filosofi sama T-043.4/T-046/T-047.
 */
function EngagementSummaryContent({ summary }: { summary: EngagementSummary }) {
  return (
    // eslint-disable-next-line no-restricted-syntax -- layout-only
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold tracking-tight">
        Engagement Summary
      </h2>
      {/* eslint-disable-next-line no-restricted-syntax -- layout-only */}
      <div className="flex flex-col">
        <EngagementSummaryRow label="Komentar" value={summary.totalComments} />
        <EngagementSummaryRow label="Likes" value={summary.totalLikes} />
      </div>
    </div>
  );
}

export function AnalyzeDashboard({
  initialPeriod,
  initialRows,
  initialAccountOverviewRows,
  initialSummary,
  initialEngagementSummary,
}: {
  initialPeriod: SnapshotPeriod;
  initialRows: PostPerformanceRow[];
  initialAccountOverviewRows: AccountOverviewRow[];
  // T-047.1 (Prabowo Feature Engineer) — data-layer summary row (Total
  // Posts/Total Reach/Engagement Rate). Optional karena `page.tsx` selalu
  // menyuplai objeknya (`getAnalyzeSummary` tidak pernah return `null`,
  // beda dari `DashboardSummary`) — signature optional dipertahankan biar
  // longgar terhadap composition root, bukan karena datanya bisa hilang.
  initialSummary?: AnalyzeSummary;
  // T-044 (Prabowo Feature Engineer) — data-layer card "Engagement Summary"
  // (Komentar/Likes). Optional dengan alasan SAMA PERSIS `initialSummary`
  // di atas: `getEngagementSummary` tidak pernah return `null`/`undefined`,
  // signature optional dipertahankan biar longgar terhadap composition
  // root, bukan karena datanya bisa hilang.
  initialEngagementSummary?: EngagementSummary;
}) {
  const [period, setPeriod] = useState<SnapshotPeriod>(initialPeriod);
  const [rows, setRows] = useState<PostPerformanceRow[]>(initialRows);
  const [accountOverviewRows, setAccountOverviewRows] = useState<
    AccountOverviewRow[]
  >(initialAccountOverviewRows);
  const [summary, setSummary] = useState<AnalyzeSummary | undefined>(
    initialSummary,
  );
  const [engagementSummary, setEngagementSummary] = useState<
    EngagementSummary | undefined
  >(initialEngagementSummary);
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
      const [
        postPerformanceResult,
        accountOverviewResult,
        summaryResult,
        engagementSummaryResult,
      ] = await Promise.all([
        getPostPerformanceAction(nextPeriod),
        getAccountOverviewAction(nextPeriod),
        getAnalyzeSummaryAction(nextPeriod),
        getEngagementSummaryAction(nextPeriod),
      ]);
      if (latestRequestedPeriod.current === nextPeriod) {
        setRows(postPerformanceResult);
        setAccountOverviewRows(accountOverviewResult);
        setSummary(summaryResult);
        setEngagementSummary(engagementSummaryResult);
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

  // Kartu kiri `.dash-cols` (Account Overview + Post Performance bersama,
  // lihat catatan REFLOW di kepala file) — diekstrak ke variabel supaya
  // dipakai ulang di dua cabang render di bawah (grid 2 kolom vs fallback
  // 1 kolom) tanpa duplikasi JSX.
  const mainCard = (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <AccountOverviewContent rows={accountOverviewRows} />
        <PostPerformanceContent
          sortedRows={sortedRows}
          sort={sort}
          onSort={handleSort}
        />
      </CardContent>
    </Card>
  );

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

      {/* Summary row (T-047.2, `.summary-row` di analyze-dashboard.html,
          dikunci "SYNCED" T-043 design prep — grid 3 kolom, Total Posts →
          Total Reach → Engagement Rate, DI ATAS `.dash-cols`). Pola SAMA
          `StatTile` grid di `DashboardHome.tsx` (T-042.3) — diekstrak jadi
          `../../components/stat-tile` supaya tidak duplikasi. `totalPosts`
          selalu angka (termasuk "0"); `totalReach`/`avgEngagementRate`
          masing-masing independen render "Belum ada data" saat `null`
          (T-047.3, pola sama T-043.4) — BUKAN empty state per-section,
          3 card tetap selalu tampil. */}
      {summary ? (
        // eslint-disable-next-line no-restricted-syntax -- layout-only
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile
            label="Total Posts"
            value={summary.totalPosts.toLocaleString("id-ID")}
          />
          <StatTile
            label="Total Reach"
            value={
              summary.totalReach === null
                ? "Belum ada data"
                : summary.totalReach.toLocaleString("id-ID")
            }
          />
          <StatTile
            label="Engagement Rate"
            value={
              summary.avgEngagementRate === null
                ? "Belum ada data"
                : formatEngagementRate(summary.avgEngagementRate)
            }
          />
        </div>
      ) : null}

      {/* `.dash-cols` (analyze-dashboard.html): kartu kiri (1.6fr) berisi
          Account Overview + Post Performance bersama, kartu kanan (1fr)
          "Engagement Summary" (T-044) — lihat catatan REFLOW di kepala
          file. `mainCard` diekstrak ke variabel supaya tidak duplikasi JSX
          antara layout grid 2 kolom (engagementSummary ada) dan fallback
          1 kolom (engagementSummary undefined, kasus jarang — lihat
          catatan `initialEngagementSummary`). */}
      {engagementSummary ? (
        // eslint-disable-next-line no-restricted-syntax, tailwindcss/no-arbitrary-value -- layout-only; proporsi grid `1.6fr 1fr` dikunci `.dash-cols` di analyze-dashboard.html, tidak ada utility Tailwind native untuk rasio fr custom ini.
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
          {mainCard}
          <Card>
            <CardContent className="flex flex-col gap-6">
              <EngagementSummaryContent summary={engagementSummary} />
            </CardContent>
          </Card>
        </div>
      ) : (
        mainCard
      )}
    </div>
  );
}
