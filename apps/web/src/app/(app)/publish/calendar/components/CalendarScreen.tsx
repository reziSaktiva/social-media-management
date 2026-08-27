import { VStack } from "@astryxdesign/core/VStack";

import type { CalendarPostItem, CalendarViewMode } from "@/domains/publishing";
import type { ConnectedAccountRecord } from "@/domains/workspace";

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
};

/**
 * Calendar (T-033.2 state periode + T-033.3/.4 grid Week/Month + T-033.5
 * navigasi + T-033.6 filter) — `view`/`date`/`items`/`accounts` di sini
 * data nyata dari `page.tsx` (`parseCalendarViewState` +
 * `getWeekRange`/`getMonthRange` + `PublishingService.listCalendarPosts` +
 * `WorkspaceService.listConnectedAccounts`). Popover klik item BELUM
 * diimplementasikan — T-033.8, di luar scope task ini.
 */
export function CalendarScreen({
  view,
  date,
  items,
  accounts,
}: CalendarScreenProps) {
  return (
    <VStack gap={4}>
      <CalendarToolbar accounts={accounts} />
      {view === "month" ? (
        <CalendarMonthGrid date={date} items={items} />
      ) : (
        <CalendarWeekGrid date={date} items={items} />
      )}
    </VStack>
  );
}
