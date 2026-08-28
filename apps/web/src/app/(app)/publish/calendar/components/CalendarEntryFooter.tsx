import { Badge } from "@astryxdesign/core/Badge";
import { HStack } from "@astryxdesign/core/HStack";
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
 */
export function CalendarEntryFooter({ entry }: CalendarEntryFooterProps) {
  return (
    <>
      <HStack gap={1.5} align="center" className="flex md:hidden">
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
      </HStack>
      <HStack gap={1} align="center" wrap="wrap" className="hidden md:flex">
        <Badge
          variant="neutral"
          label={CONTENT_FORMAT_LABEL[entry.contentFormat]}
        />
        <Badge
          variant={CONTENT_STATUS_BADGE_VARIANT[entry.status]}
          label={CONTENT_STATUS_LABEL[entry.status]}
        />
      </HStack>
    </>
  );
}
