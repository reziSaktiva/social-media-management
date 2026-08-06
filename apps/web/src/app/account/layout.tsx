import { AppShell } from "@astryxdesign/core/AppShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  // account layout shell — sidebar/nav internal direncanakan di T-016.1.
  // AppShell tanpa topNav/sideNav dipakai sementara (tidak ada shell lain di
  // atas route ini) hanya untuk memberi surface/background token yang benar
  // (fix kontras ScaffoldPlaceholder di dark mode) — bukan implementasi nav
  // akhir.
  return <AppShell contentPadding={4}>{children}</AppShell>;
}
