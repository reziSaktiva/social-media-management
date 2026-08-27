import type { PostId, SocialPlatform } from "@social/shared";
import type { ContentStatus } from "@social/shared";

import {
  effectiveCalendarDate,
  type CalendarPostItem,
} from "@/domains/publishing";

/**
 * Util bersama untuk grid Week (T-033.3) & Month (T-033.4) — acuan visual
 * `templates/publish-calendar.html` (Claude Design). Kalender **UTC**
 * (`toUtcDateKey`/`addDays` pakai `Date.UTC`/epoch ms), konsisten dengan
 * `getWeekRange`/`getMonthRange` (`@/domains/publishing`) dan pola
 * `formatGroupDateHeading` di `QueueList.tsx`.
 */

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Senin di index 0 — minggu mulai Senin (sama seperti `getWeekRange`). */
export const DAY_LABELS = [
  "Sen",
  "Sel",
  "Rab",
  "Kam",
  "Jum",
  "Sab",
  "Ming",
] as const;

/**
 * 12 label slot waktu grid Week (per 2 jam) — persis mockup
 * `templates/publish-calendar.html` (`cal-week-time`). Index slot ke-i
 * mencakup jam `[2i, 2i+1]` — post di-floor ke slot terdekat ke bawah
 * (`Math.floor(hour / 2)`).
 */
export const TIME_SLOT_LABELS = [
  "12 AM",
  "2 AM",
  "4 AM",
  "6 AM",
  "8 AM",
  "10 AM",
  "12 PM",
  "2 PM",
  "4 PM",
  "6 PM",
  "8 PM",
  "10 PM",
] as const;

export function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/**
 * Geser `date` sejumlah bulan kalender UTC, dipatok ke tanggal 1 (bukan
 * mempertahankan `date.getUTCDate()`) supaya aman dari overflow bulan
 * pendek — 31 Jan + 1 bulan via `Date.UTC` day-preserving akan lompat ke
 * 3 Maret, bukan akhir Februari. Anchor Calendar hanya perlu jatuh di
 * bulan yang benar (`getMonthRange`/`getWeekRange` yang menghitung rentang
 * sebenarnya), jadi tanggal-di-dalam-bulan tidak relevan di sini.
 */
export function addMonths(date: Date, months: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1),
  );
}

/**
 * Satu kartu post di grid — **satu kartu per target** (bukan per post),
 * supaya post multi-platform tampil sebagai beberapa kartu granular sesuai
 * mockup (`item.targets.map(...)` per kartu).
 */
export interface CalendarCardEntry {
  key: string;
  postId: PostId;
  caption: string;
  status: ContentStatus;
  platform: SocialPlatform;
  accountHandle: string;
  /** Kalender UTC "YYYY-MM-DD" dari tanggal efektif (`scheduledAt ?? publishedAt`). */
  dateKey: string;
  /** Jam UTC (0-23) dari tanggal efektif — dipakai grid Week untuk bucket slot 2 jam. */
  hour: number;
}

/**
 * Ratakan `CalendarPostItem[]` jadi kartu per target, dengan tanggal
 * efektif dihitung lewat `effectiveCalendarDate` (`@/domains/publishing`
 * — satu-satunya sumber aturan "tanggal efektif", sama yang dipakai
 * `sortCalendarItemsByEffectiveDate`, termasuk fallback `createdAt`-nya).
 * Item tanpa target dilewati (post tanpa `targets` tidak punya kartu untuk
 * ditampilkan).
 */
export function flattenCalendarItemsToEntries(
  items: CalendarPostItem[],
): CalendarCardEntry[] {
  const entries: CalendarCardEntry[] = [];

  for (const item of items) {
    const effectiveDate = effectiveCalendarDate(item);
    const dateKey = toUtcDateKey(effectiveDate);
    const hour = effectiveDate.getUTCHours();

    for (const target of item.targets) {
      entries.push({
        key: `${item.id}-${target.id}`,
        postId: item.id,
        caption: item.caption,
        status: item.status,
        platform: target.platform,
        accountHandle: target.accountHandle,
        dateKey,
        hour,
      });
    }
  }

  return entries;
}
