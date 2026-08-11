import {
  Layout as AstryxLayout,
  LayoutContent,
  LayoutPanel,
} from "@astryxdesign/core/Layout";

import { SettingsSideNav } from "./components/SettingsSideNav";

// settings layout shell (T-039.1-3, ADR-076) — subnav 2 grup (Organization/
// Account) di LayoutPanel start, konten child page.tsx tidak diubah sama
// sekali. Route ini sudah dibungkus AppShell + WorkspaceSideNav di
// (app)/layout.tsx — jadi TIDAK menumpuk AppShell/SideNav kedua di sini,
// hanya Layout+LayoutPanel (secondary nav di dalam content area). `params`
// dihapus (dulu `{ slug }` dari [slug]/settings/layout.tsx) — workspace
// context sekarang dibaca dari header via getWorkspaceContext() di
// masing-masing page, bukan dynamic segment.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AstryxLayout
      height="fill"
      start={
        <LayoutPanel role="navigation" width={220} hasDivider>
          <SettingsSideNav />
        </LayoutPanel>
      }
      content={<LayoutContent padding={4}>{children}</LayoutContent>}
    />
  );
}
