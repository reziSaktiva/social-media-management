import { Badge } from "@astryxdesign/core/Badge";
import { Icon } from "@astryxdesign/core/Icon";
import { StatusDot } from "@astryxdesign/core/StatusDot";

import {
  CONTENT_STATUS_BADGE_VARIANT,
  CONTENT_STATUS_LABEL,
} from "../../../components/draft-editor/status-badge";
import {
  type CalendarCardEntry,
  CONTENT_FORMAT_ICON,
  CONTENT_FORMAT_LABEL,
  CONTENT_STATUS_DOT_VARIANT,
} from "./calendar-grid-shared";

export interface CalendarEntryFooterProps {
  entry: Pick<CalendarCardEntry, "status" | "contentFormat">;
}

/**
 * Footer status/format kartu Calendar (revisi keempat T-033 poin 2-3) —
 * dipakai `CalendarMonthGrid`/`CalendarWeekGrid`, sebelumnya duplikat
 * verbatim di kedua file. ≤768px `Badge` teks overflow di card sempit
 * (Badge "Scheduled" 77px vs ruang card ~22-39px di 375px, Badge tidak
 * punya prop size/truncation) — diganti StatusDot+Icon compact di bawah
 * 768px (breakpoint sama dengan AppShell mobile nav, `md: 768` di
 * `AppShell.tsx`), 2 Badge tetap seperti semula di >768px (tidak berubah).
 * CSS murni (Tailwind `md:`), bukan JS resize-hook — `useMediaQuery`
 * Astryx eksplisit "always returns false on first render" (SSR), berisiko
 * hydration mismatch/layout shift untuk switch yang harus benar di first
 * paint. Detail lengkap tetap ada lewat tap kartu → `CalendarPostPopover`
 * (tidak berubah).
 *
 * T-101.1: `HStack` -> Tailwind flex (layout-only, ADR-097). `Badge`/
 * `StatusDot`/`Icon` SENGAJA tetap Astryx — Stone theme (shadcn) belum
 * punya token warna semantik (success/warning/info/purple) untuk 6 varian
 * `ContentStatus`, cuma `accent`/`destructive` (dicek `globals.css`, tidak
 * ada `--color-success` dkk). Pola sama persis dengan `Modal.tsx` (T-100.1,
 * status chip header) — koeksistensi Astryx/shadcn di level komponen
 * (bukan cuma route-segment) untuk kasus spesifik ini, bukan keputusan
 * baru. Dilaporkan ke King Rezi sebagai gap desain-token, bukan diputuskan
 * sepihak sebagai final — lihat laporan sesi T-101.1.
 */
export function CalendarEntryFooter({ entry }: CalendarEntryFooterProps) {
  return (
    <>
      {/* eslint-disable-next-line no-restricted-syntax -- T-101.1: layout-only, lihat catatan di atas */}
      <div className="flex items-center gap-1.5 md:hidden">
        <StatusDot
          variant={CONTENT_STATUS_DOT_VARIANT[entry.status]}
          label={CONTENT_STATUS_LABEL[entry.status]}
          tooltip={CONTENT_STATUS_LABEL[entry.status]}
        />
        <Icon
          icon={CONTENT_FORMAT_ICON[entry.contentFormat]}
          size="xsm"
          color="secondary"
          label={CONTENT_FORMAT_LABEL[entry.contentFormat]}
        />
      </div>
      {/* eslint-disable-next-line no-restricted-syntax -- T-101.1: layout-only, lihat catatan di atas */}
      <div className="hidden flex-wrap items-center gap-1 md:flex">
        <Badge
          variant="neutral"
          label={CONTENT_FORMAT_LABEL[entry.contentFormat]}
        />
        <Badge
          variant={CONTENT_STATUS_BADGE_VARIANT[entry.status]}
          label={CONTENT_STATUS_LABEL[entry.status]}
        />
      </div>
    </>
  );
}
