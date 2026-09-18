"use client";

// Analyze Dashboard (T-043.2, KSP-07) — page head + Summary row + Post
// Performance table. Rancangan dikunci Claude Design
// `templates/analyze-dashboard.html` (komentar SYNCED, 2026-09-18):
// Summary row & Account Overview sudah dipetakan ke Card+CardContent+Text /
// Progress (tidak berubah), Post Performance DIGANTI jadi `Table` DENGAN
// `TableHeader` (beda dari Drafts, sama seperti Members) — lihat
// `PostPerformanceTable.tsx`.
//
// Selector period (weekly/monthly) + `useTransition` untuk re-fetch summary
// PERSIS pola `DashboardHome.tsx` (T-042.3-T-042.5) — disalin, bukan
// direfactor jadi shared hook, supaya migrasi/perubahan salah satu halaman
// tidak diam-diam menjalar ke halaman lain.
//
// Catatan penting: `getPostPerformanceAction()` TIDAK menerima parameter
// `period` (lihat `analyze-actions.ts`, T-043.1) — jadi tabel Post
// Performance TIDAK ikut re-fetch saat selector period diganti, hanya
// Summary row yang re-fetch. Ini bukan bug: data layer T-043.1 sengaja
// belum period-aware, tabel menampilkan seluruh post `Published` apa
// adanya (lihat `AnalyticsService.getPostPerformance`).
//
// Scope halaman ini HANYA 3 bagian di atas — Account Overview (T-045.2) dan
// Engagement Summary (T-044) sengaja tidak dirender di sini (lihat
// `page.tsx`), bukan placeholder "Coming Soon".

import { useRef, useState, useTransition } from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

import { getAnalyzeSummaryAction } from "../analyze-actions";
import { PostPerformanceTable } from "./PostPerformanceTable";

import type {
  PostPerformanceRow,
  SnapshotPeriod,
  WorkspaceSnapshotRecord,
} from "@/domains/analytics";

const PERIOD_OPTIONS: Array<{ value: SnapshotPeriod; label: string }> = [
  { value: "weekly", label: "Mingguan" },
  { value: "monthly", label: "Bulanan" },
];

/** Satu tile metrik ringkasan — Card + heading, sama persis pola `StatTile` `DashboardHome.tsx` (T-042.3). */
function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent>
        {/* eslint-disable-next-line no-restricted-syntax -- layout-only, konsisten pola shadcn+Tailwind DashboardHome */}
        <div className="flex flex-col gap-2">
          <Text variant="muted">{label}</Text>
          <Text variant="h3" as="h2" className="mt-0 scroll-m-0">
            {value}
          </Text>
        </div>
      </CardContent>
    </Card>
  );
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function AnalyzeDashboard({
  initialPeriod,
  summary: initialSummary,
  rows,
}: {
  initialPeriod: SnapshotPeriod;
  summary: WorkspaceSnapshotRecord | null;
  rows: PostPerformanceRow[];
}) {
  const [period, setPeriod] = useState<SnapshotPeriod>(initialPeriod);
  const [summary, setSummary] = useState<WorkspaceSnapshotRecord | null>(
    initialSummary,
  );
  const [isPending, startTransition] = useTransition();
  // Guards against out-of-order responses: only the reply to the most
  // recently requested period is allowed to update `summary` (pola sama
  // `DashboardHome.tsx`).
  const latestRequestedPeriod = useRef<SnapshotPeriod>(initialPeriod);

  function handlePeriodChange(value: string) {
    const nextPeriod = value as SnapshotPeriod;
    setPeriod(nextPeriod);
    latestRequestedPeriod.current = nextPeriod;
    startTransition(async () => {
      const result = await getAnalyzeSummaryAction(nextPeriod);
      if (latestRequestedPeriod.current === nextPeriod) {
        setSummary(result);
      }
    });
  }

  return (
    // eslint-disable-next-line no-restricted-syntax -- layout-only, konsisten pola shadcn+Tailwind DashboardHome
    <div className="flex flex-col gap-6">
      {/* eslint-disable-next-line no-restricted-syntax -- layout-only */}
      <div className="flex items-center justify-between gap-4">
        {/* eslint-disable-next-line no-restricted-syntax -- layout-only */}
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Analyze
          </h1>
          <Text variant="muted">Performa konten untuk keputusan mingguan</Text>
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

      {summary === null ? (
        <Card>
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Belum ada data metrik</EmptyTitle>
                <EmptyDescription>
                  Snapshot untuk rentang waktu ini belum tersedia. Data akan
                  muncul setelah sinkronisasi metrik berjalan.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        // eslint-disable-next-line no-restricted-syntax -- layout-only
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile
            label="Total Posts"
            value={summary.totalPosts.toLocaleString("id-ID")}
          />
          <StatTile
            label="Total Reach"
            value={summary.totalReach.toLocaleString("id-ID")}
          />
          <StatTile
            label="Engagement Rate"
            value={formatPercentage(summary.avgEngagementRate)}
          />
        </div>
      )}

      {/* eslint-disable-next-line no-restricted-syntax -- layout-only */}
      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          Post Performance
        </h2>
        <PostPerformanceTable rows={rows} />
      </div>
    </div>
  );
}
