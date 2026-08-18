/**
 * Tujuan navigasi setelah aksi terminal Draft Editor — ADR-054 / NP-D13.
 *
 * Dipisah dari `modal.tsx` supaya aturannya bisa diuji tanpa merender
 * component: sejak CTA sidebar aktif (ADR-053) editor bisa dibuka dari section
 * manapun, jadi salah destinasi tidak lagi kelihatan sebagai bug lokal di
 * Publish — pengguna hanya "tertinggal" di Home/Analyze tanpa jejak aksi.
 *
 * `publish-now` (T-029, T-031.4): destinasi sementara `/publish/calendar` —
 * History belum jadi layar terdokumentasi (KSP-D10 belum ada), ADR-054
 * menetapkan Calendar sebagai tujuan sementara sampai layar History
 * dibangun (T-034).
 */
export type TerminalAction = "save-draft" | "schedule" | "publish-now";

export function resolveTerminalDestination(action: TerminalAction): string {
  switch (action) {
    case "save-draft":
      return "/publish/drafts";
    case "schedule":
      return "/publish/queue";
    case "publish-now":
      return "/publish/calendar";
  }
}

/**
 * `true` kalau pengguna sudah berada di layar tujuan, sehingga cukup
 * me-refresh data alih-alih mendorong entri baru ke history browser.
 */
export function isAlreadyAtDestination(
  pathname: string | null,
  destination: string,
): boolean {
  return pathname === destination;
}
