import type { ConnectedAccountId } from "@social/shared";
import type { CalendarPostItem, CalendarViewMode } from "@/domains/publishing";
import type { ConnectedAccountRecord } from "@/domains/workspace";

import { CalendarAgendaList } from "./CalendarAgendaList";
import { CalendarMonthGrid } from "./CalendarMonthGrid";
import { CalendarToolbar } from "./CalendarToolbar";
import { CalendarWeekGrid } from "./CalendarWeekGrid";

type CalendarScreenProps = {
  /** Hasil parse `?view=` (T-033.2) — default `"week"` sudah diresolusi
   * di `page.tsx`, bukan tanggung jawab komponen ini. */
  view: CalendarViewMode;
  /** Hasil parse `?date=` (T-033.2) — anchor periode, default hari ini
   * sudah diresolusi di `page.tsx`. */
  date: Date;
  /** Hasil nyata `PublishingService.listCalendarPosts` (T-033.3/.4, sudah
   * terfilter `statuses`/`connectedAccountIds` T-033.6) untuk rentang
   * Week/Month yang memuat `date` (`getWeekRange`/`getMonthRange`) — sudah
   * data asli dari database, bukan lagi placeholder. */
  items: CalendarPostItem[];
  /** Daftar akun terkoneksi workspace (T-033.6) — opsi filter Channels di `CalendarToolbar`. */
  accounts: ConnectedAccountRecord[];
  /** Filter Channels aktif dari `?accounts=` (T-033.6) — diteruskan ke grid supaya
   * target yang tidak dipilih tidak ikut tampil (post multi-platform). */
  connectedAccountIds: ConnectedAccountId[];
};

/**
 * Calendar (T-033.2 state periode + T-033.3/.4 grid Week/Month + T-033.5
 * navigasi + T-033.6 filter) — `view`/`date`/`items`/`accounts` di sini
 * data nyata dari `page.tsx` (`parseCalendarViewState` +
 * `getWeekRange`/`getMonthRange` + `PublishingService.listCalendarPosts` +
 * `WorkspaceService.listConnectedAccounts`). Popover klik item — T-033.8/
 * T-101.1, `CalendarPostPopover` (shadcn `Popover`, ADR-090/ADR-091).
 *
 * KI-035 poin 3 (mobile ≤768px): di bawah `CalendarToolbar` dirender grid
 * Week/Month (≥768px, TIDAK berubah — addendum, bukan pengganti) DAN
 * `CalendarAgendaList` (≤768px, list per-tanggal dari `items`/
 * `connectedAccountIds` yang SAMA) — toggle murni CSS (`hidden md:block` /
 * `block md:hidden`, breakpoint sama `CalendarEntryFooter.tsx`/
 * `MembersTable.tsx`), bukan JS viewport detection. "Minggu"/"Bulan" di
 * `CalendarToolbar` tetap mengontrol RANGE tanggal yang di-fetch
 * (`page.tsx`), bukan mode render — Agenda dipakai untuk kedua pilihan itu
 * saat mobile.
 */
export function CalendarScreen({
  view,
  date,
  items,
  accounts,
  connectedAccountIds,
}: CalendarScreenProps) {
  return (
    // T-101.1: `VStack` Astryx -> Tailwind flex (layout-only, ADR-097).
    // eslint-disable-next-line no-restricted-syntax
    <div className="flex flex-col gap-4">
      <CalendarToolbar accounts={accounts} />

      {/* eslint-disable-next-line no-restricted-syntax -- KI-035 poin 3: layout-only, toggle CSS-only grid vs agenda */}
      <div className="hidden md:block">
        {view === "month" ? (
          <CalendarMonthGrid
            date={date}
            items={items}
            connectedAccountIds={connectedAccountIds}
          />
        ) : (
          <CalendarWeekGrid
            date={date}
            items={items}
            connectedAccountIds={connectedAccountIds}
          />
        )}
      </div>

      {/* eslint-disable-next-line no-restricted-syntax -- KI-035 poin 3: layout-only */}
      <div className="block md:hidden">
        <CalendarAgendaList
          items={items}
          connectedAccountIds={connectedAccountIds}
        />
      </div>
    </div>
  );
}
