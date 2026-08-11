/**
 * Tujuan navigasi setelah aksi terminal Draft Editor — ADR-054 / NP-D13.
 *
 * Dipisah dari `modal.tsx` supaya aturannya bisa diuji tanpa merender
 * component: sejak CTA sidebar aktif (ADR-053) editor bisa dibuka dari section
 * manapun, jadi salah destinasi tidak lagi kelihatan sebagai bug lokal di
 * Publish — pengguna hanya "tertinggal" di Home/Analyze tanpa jejak aksi.
 *
 * `publish-now` sengaja belum ada di sini: implementasinya belum dibuat
 * (T-029), dan ADR-054 menetapkan tujuan sementaranya Calendar sampai layar
 * History dibangun.
 */
export type TerminalAction = "save-draft" | "schedule";

export function resolveTerminalDestination(action: TerminalAction): string {
  switch (action) {
    case "save-draft":
      return "/publish/drafts";
    case "schedule":
      return "/publish/queue";
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
