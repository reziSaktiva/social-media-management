"use client";

// Dashboard Home — Analytics Snapshot (T-042.3–T-042.5, KSP-01-F04).
//
// Client Component kecil yang hanya mengurus state `period` (weekly/
// monthly) dan re-fetch lewat Server Action `getDashboardSummaryAction`
// saat selector diganti — polanya sama seperti komponen client lain di
// `(app)/` yang menerima initial data dari Server Component induk
// (`page.tsx`) lalu mengelola interaktivitas di sini.
//
// Astryx: tidak ada komponen Chart (dikonfirmasi T-042.1 via
// `astryx docs chart` — kosong; dicek ulang di sesi ini via
// `astryx component BarChart`/`MetricCard` — juga tidak ada, keduanya cuma
// contoh lokal di template `dashboard` yang memakai `recharts`, bukan
// bagian dari 153 komponen inti). Representasi visual metrik (T-042.3)
// karena itu memakai `ProgressBar` (komponen inti, real) untuk
// `avgEngagementRate` — bukan menambah library chart baru.

import { useRef, useState, useTransition } from "react";

import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { Section } from "@astryxdesign/core/Section";
import { Selector } from "@astryxdesign/core/Selector";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

import { getDashboardSummaryAction } from "../dashboard-actions";

import type { DashboardSummary, SnapshotPeriod } from "@/domains/analytics";

const PERIOD_OPTIONS: Array<{ value: SnapshotPeriod; label: string }> = [
  { value: "weekly", label: "Mingguan" },
  { value: "monthly", label: "Bulanan" },
];

/** Satu tile metrik ringkasan — Card + Heading, tanpa chart (T-042.3). */
function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <VStack gap={2}>
        <Text type="supporting" color="secondary">
          {label}
        </Text>
        <Heading level={2}>{value}</Heading>
      </VStack>
    </Card>
  );
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function DashboardHome({
  initialPeriod,
  initialSummary,
}: {
  initialPeriod: SnapshotPeriod;
  initialSummary: DashboardSummary | null;
}) {
  const [period, setPeriod] = useState<SnapshotPeriod>(initialPeriod);
  const [summary, setSummary] = useState<DashboardSummary | null>(
    initialSummary,
  );
  const [isPending, startTransition] = useTransition();
  // Guards against out-of-order responses: only the reply to the most
  // recently requested period is allowed to update `summary`.
  const latestRequestedPeriod = useRef<SnapshotPeriod>(initialPeriod);

  function handlePeriodChange(value: string) {
    const nextPeriod = value as SnapshotPeriod;
    setPeriod(nextPeriod);
    latestRequestedPeriod.current = nextPeriod;
    startTransition(async () => {
      const result = await getDashboardSummaryAction(nextPeriod);
      if (latestRequestedPeriod.current === nextPeriod) {
        setSummary(result);
      }
    });
  }

  return (
    <VStack gap={6}>
      <HStack justify="between" align="center">
        <VStack gap={1}>
          <Heading level={1}>Home</Heading>
          <Text type="supporting">Ringkasan performa konten</Text>
        </VStack>
        <Selector
          label="Rentang waktu"
          isLabelHidden
          options={PERIOD_OPTIONS}
          value={period}
          onChange={handlePeriodChange}
          isDisabled={isPending}
        />
      </HStack>

      <Section>
        <VStack gap={4}>
          <Heading level={2}>Analytics Snapshot</Heading>

          {summary === null ? (
            <EmptyState
              title="Belum ada data metrik"
              description="Snapshot untuk rentang waktu ini belum tersedia. Data akan muncul setelah sinkronisasi metrik berjalan."
            />
          ) : (
            <VStack gap={4}>
              <Grid gap={4} columns={{ minWidth: 200, repeat: "fit" }}>
                <StatTile
                  label="Post terpublikasi"
                  value={summary.totalPosts.toLocaleString("id-ID")}
                />
                <StatTile
                  label="Total engagement"
                  value={summary.totalEngagements.toLocaleString("id-ID")}
                />
                <StatTile
                  label="Akun aktif"
                  value={summary.activeAccounts.toLocaleString("id-ID")}
                />
              </Grid>

              <Card>
                <VStack gap={3}>
                  <Text type="label">Rata-rata engagement rate</Text>
                  <ProgressBar
                    label="Rata-rata engagement rate"
                    isLabelHidden
                    value={summary.avgEngagementRate * 100}
                    max={100}
                    hasValueLabel
                    formatValueLabel={() =>
                      formatPercentage(summary.avgEngagementRate)
                    }
                  />
                </VStack>
              </Card>
            </VStack>
          )}
        </VStack>
      </Section>
    </VStack>
  );
}
