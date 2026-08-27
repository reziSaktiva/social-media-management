import { Badge } from "@astryxdesign/core/Badge";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { VStack } from "@astryxdesign/core/VStack";

import type { CalendarViewMode } from "@/domains/publishing";

const VIEW_LABEL: Record<CalendarViewMode, string> = {
  week: "Minggu",
  month: "Bulan",
};

const ANCHOR_DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

type CalendarScreenProps = {
  /** Hasil parse `?view=` (T-033.2) — default `"week"` sudah diresolusi
   * di `page.tsx`, bukan tanggung jawab komponen ini. */
  view: CalendarViewMode;
  /** Hasil parse `?date=` (T-033.2) — anchor periode, default hari ini
   * sudah diresolusi di `page.tsx`. */
  date: Date;
};

/**
 * Placeholder Calendar (T-033.2) — menampilkan state periode yang sudah
 * ter-parse dari query param URL supaya terlihat benar sebelum grid asli
 * ada. Grid Week/Month (hari × jam / hari × tanggal) menyusul di
 * T-033.3/.4 dan akan menggantikan `EmptyState` di sini, memakai `view`/
 * `date` props yang sama.
 */
export function CalendarScreen({ view, date }: CalendarScreenProps) {
  return (
    <Card padding={4}>
      <VStack gap={3} align="center">
        <Badge variant="neutral" label={`Tampilan ${VIEW_LABEL[view]}`} />
        <EmptyState
          title="Grid Calendar segera hadir"
          description={`Periode acuan: ${ANCHOR_DATE_FORMATTER.format(
            date,
          )}. Grid Week/Month, navigasi periode, dan filter menyusul di T-033.3–.7.`}
        />
      </VStack>
    </Card>
  );
}
