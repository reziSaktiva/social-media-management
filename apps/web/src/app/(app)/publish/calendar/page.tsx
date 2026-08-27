import { parseCalendarViewState } from "@/domains/publishing";

import { CalendarScreen } from "./components/CalendarScreen";

type CalendarPageSearchParams = {
  view?: string | string[];
  date?: string | string[];
};

/**
 * `/publish/calendar` (T-033.2, ADR-046 — route tunggal, tidak ada
 * `/publish/calendar/week` dst.). Entry point tipis: baca `searchParams`
 * mentah lalu delegasikan parsing & fallback ke `parseCalendarViewState`
 * (pure function domain `publishing`) — tidak ada business logic di sini.
 *
 * Grid Week/Month asli (T-033.3/.4) belum diimplementasikan — `view`/`date`
 * hasil parse untuk sementara hanya ditampilkan di placeholder
 * `CalendarScreen` supaya subtask berikutnya tinggal render grid
 * memakai state yang sama, tanpa perlu mengubah `page.tsx` ini lagi.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<CalendarPageSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const { view, date } = parseCalendarViewState(resolvedSearchParams);

  return <CalendarScreen view={view} date={date} />;
}
