/**
 * Rentang tanggal Week/Month Calendar (T-033.3/.4, KSP-02) — dipakai
 * composition root (`page.tsx`) untuk menghitung `from`/`to`
 * `PublishingService.listCalendarPosts` dari anchor `date` hasil
 * `parseCalendarViewState` (T-033.2). Pure function, tanpa I/O — sama
 * pola dengan `sortCalendarItemsByEffectiveDate`/`groupQueueItemsByDate`.
 *
 * Kalender UTC (bukan timezone lokal server/browser) — domain model
 * belum punya konsep timezone per workspace, konvensi yang sama dipakai
 * `groupQueueItemsByDate` (`toISOString().slice(0, 10)`). Minggu dimulai
 * **Senin** (mockup Claude Design `templates/publish-calendar.html`:
 * kolom Sen-Sel-Rab-Kam-Jum-Sab-Ming).
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Rentang Week yang memuat `date`: Senin 00:00:00.000 UTC s.d. Minggu
 * 23:59:59.999 UTC. Padding hari dari minggu sebelum/sesudah di grid
 * tidak relevan di sini — grid Week menampilkan tepat 7 hari, tidak ada
 * sel "muted" seperti Month.
 */
export function getWeekRange(date: Date): { from: Date; to: Date } {
  const day = date.getUTCDay(); // 0 (Minggu) - 6 (Sabtu)
  const offsetToMonday = day === 0 ? -6 : 1 - day;

  const from = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + offsetToMonday,
      0,
      0,
      0,
      0,
    ),
  );
  const to = new Date(from.getTime() + 7 * MS_PER_DAY - 1);

  return { from, to };
}

/**
 * Rentang Month yang memuat `date`: tanggal 1 00:00:00.000 UTC s.d. hari
 * terakhir bulan 23:59:59.999 UTC. Tidak diperluas ke hari padding
 * bulan sebelum/sesudah yang tampil "muted" di grid Month — sel itu
 * sengaja kosong by design (Buffer-style), bukan menampilkan post dari
 * bulan lain (keputusan produk, lihat catatan task T-033.3/.4).
 *
 * `Date.UTC` dengan `day: 0` di bulan berikutnya otomatis mengembalikan
 * hari terakhir bulan berjalan — menangani Februari 28/29 hari maupun
 * pergantian tahun (Desember → Januari) tanpa kondisional tambahan.
 */
export function getMonthRange(date: Date): { from: Date; to: Date } {
  const from = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0),
  );
  const to = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999),
  );

  return { from, to };
}
