import type { CalendarItemRecord } from "../repositories/publishing.repository";

/**
 * Tanggal efektif satu item Calendar (T-033.1, KSP-02) — dipakai untuk
 * mengurutkan hasil `PublishingService.listCalendarPosts` ascending.
 * `scheduledAt` didahulukan (post Scheduled/Failed masih membawa jadwal
 * aslinya), fallback ke `publishedAt` (post yang dipublish langsung lewat
 * Publish Now tanpa pernah melalui status Scheduled — lihat
 * `publishNow` di repository Prisma, tidak mengisi `scheduledAt`).
 *
 * Post tanpa `scheduledAt` maupun `publishedAt` (Draft/InReview/
 * ReadyToSchedule — lihat catatan gap di `CalendarItemRecord`) tidak
 * mungkin lolos filter rentang tanggal repository, jadi tidak akan pernah
 * mencapai fungsi ini dengan kedua field null — tapi tetap ditangani
 * (fallback ke `createdAt`) supaya fungsi ini tetap total, bukan partial,
 * kalau suatu saat dipanggil di luar hasil query berrentang.
 */
function effectiveDate(item: CalendarItemRecord): Date {
  return item.scheduledAt ?? item.publishedAt ?? item.createdAt;
}

/**
 * Urutkan item Calendar ascending berdasar tanggal efektif — pure
 * function (tanpa I/O), sama pola dengan `groupQueueItemsByDate`. Tidak
 * mengelompokkan per tanggal (beda dari Queue) — pengelompokan ke sel
 * grid Week/Month adalah tanggung jawab UI (T-033.3/.4), bukan service
 * ini, supaya `listCalendarPosts` tetap generik untuk kedua tampilan.
 */
export function sortCalendarItemsByEffectiveDate(
  items: CalendarItemRecord[],
): CalendarItemRecord[] {
  return [...items].sort(
    (a, b) => effectiveDate(a).getTime() - effectiveDate(b).getTime(),
  );
}
