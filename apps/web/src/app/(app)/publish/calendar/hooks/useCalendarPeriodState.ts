"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import type { CalendarViewState } from "@/domains/publishing";
import { parseCalendarViewState } from "@/domains/publishing";

export type SetCalendarPeriod = (next: Partial<CalendarViewState>) => void;

export type UseCalendarPeriodStateResult = CalendarViewState & {
  /**
   * Update `view` dan/atau `date` di query param URL `/publish/calendar`
   * (ADR-046, KSP-02-F05). Field yang tidak dikirim dipertahankan dari
   * state saat ini — panggil `setPeriod({ view: "month" })` untuk toggle
   * tampilan saja, atau `setPeriod({ date })` untuk navigasi periode saja.
   *
   * Pakai `router.replace` (bukan `push`) supaya berpindah periode/toggle
   * tampilan tidak menumpuk browser history satu per satu — konsisten
   * dengan sifat state ini yang murni dari URL dan tidak persist antar
   * sesi/reload (readme prototipe, catatan T-033).
   */
  setPeriod: SetCalendarPeriod;
};

/**
 * Fondasi client-side (T-033.2) untuk membaca & mengubah state periode
 * Calendar (`view`/`date`) langsung dari URL — dipakai oleh kontrol
 * navigasi periode (Today/‹/›) dan toggle Minggu/Bulan yang akan dibangun
 * di T-033.5. Hook ini sendiri tidak merender UI apa pun.
 *
 * Parsing memakai `parseCalendarViewState` yang sama dengan `page.tsx`
 * (Server Component) supaya aturan fallback identik di kedua sisi.
 */
export function useCalendarPeriodState(): UseCalendarPeriodStateResult {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const state = useMemo(
    () =>
      parseCalendarViewState({
        view: searchParams.get("view") ?? undefined,
        date: searchParams.get("date") ?? undefined,
      }),
    [searchParams],
  );

  const setPeriod = useCallback<SetCalendarPeriod>(
    (next) => {
      const nextView = next.view ?? state.view;
      const nextDate = next.date ?? state.date;

      const params = new URLSearchParams(searchParams.toString());
      params.set("view", nextView);
      params.set("date", String(nextDate.getTime()));

      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams, state.date, state.view],
  );

  return { ...state, setPeriod };
}
