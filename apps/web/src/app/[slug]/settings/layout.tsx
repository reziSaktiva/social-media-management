import {
  Layout as AstryxLayout,
  LayoutContent,
  LayoutPanel,
} from "@astryxdesign/core/Layout";

import { SettingsSideNav } from "./components/SettingsSideNav";

// settings layout shell (T-016.1) — subnav General/Connected Accounts/
// Members/Roles/Billing di LayoutPanel start, konten child page.tsx tidak
// diubah sama sekali. Route ini sudah dibungkus AppShell + WorkspaceSideNav
// di [slug]/layout.tsx — jadi TIDAK menumpuk AppShell/SideNav kedua di sini,
// hanya Layout+LayoutPanel (secondary nav di dalam content area).
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <AstryxLayout
      height="fill"
      start={
        <LayoutPanel role="navigation" width={220} hasDivider>
          <SettingsSideNav slug={slug} />
        </LayoutPanel>
      }
      content={<LayoutContent padding={4}>{children}</LayoutContent>}
    />
  );
}
