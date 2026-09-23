"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

// Sidebar Settings tunggal, pola Buffer (ADR-077, T-039.5) — dirender lewat
// slot sideNav di (app)/layout.tsx oleh AppSideNav (../../components/AppSideNav.tsx)
// saat pathname di bawah /settings, MENGGANTIKAN TOTAL WorkspaceSideNav
// (bukan sidebar kedua yang berdampingan seperti pola lama ADR-076/
// T-039.1-3). Header back-navigation (ikon back + label "Settings", link ke
// "/") — pure link, bukan submit/reload.
//
// Direstrukturisasi jadi 2 grup berlabel (Organization/Account) sesuai IA
// (information-architecture.md) — dulu satu List flat tanpa grouping saat
// Account masih route top-level terpisah (/account/*).
const NAV_GROUPS = [
  {
    title: "Organization",
    items: [
      { label: "General", href: "/settings", exact: true },
      {
        label: "Connected Accounts",
        href: "/settings/connected-accounts",
        exact: false,
      },
      { label: "Members", href: "/settings/members", exact: false },
      { label: "Roles & Permissions", href: "/settings/roles", exact: false },
      { label: "Billing", href: "/settings/billing", exact: false },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Workspaces",
        href: "/settings/account/workspaces",
        exact: false,
      },
      { label: "Profile", href: "/settings/account", exact: true },
      {
        label: "Notifications",
        href: "/settings/account/notifications",
        exact: false,
      },
      {
        label: "Preferences",
        href: "/settings/account/preferences",
        exact: false,
      },
    ],
  },
] as const;

export function SettingsSideNav() {
  const pathname = usePathname();
  // T-105.3 (KI-066): drawer mobile ditangani `SidebarProvider` (decision #5
  // T-105.1) — tutup drawer setelah klik nav item, sama seperti
  // `WorkspaceSideNav`. Tidak perlu prop `onNavigate` lagi (dulu diteruskan
  // dari `MobileTopBar` yang merender Sheet-nya sendiri, T-098.4).
  const { isMobile, setOpenMobile } = useSidebar();
  function closeMobileSidebar() {
    if (isMobile) setOpenMobile(false);
  }

  return (
    // Keputusan #4 (T-105.0/T-105.1, dikunci King Rezi): SettingsSideNav
    // SENGAJA DIKECUALIKAN dari fitur collapse/expand — tetap fixed-width,
    // tidak dapat trigger. `collapsible="icon"` tetap dipasang di sini
    // (bukan "none") supaya perilaku mobile Sheet bawaan (keputusan #5)
    // tetap berfungsi di route ini — pemaksaan "selalu expanded" di desktop
    // dilakukan di `AppShell.tsx` (mengontrol `open` SidebarProvider secara
    // eksplisit saat pathname `/settings`), BUKAN di sini, supaya tidak ada
    // flash collapsed-lalu-dipaksa-expand. Tidak ada `SidebarTrigger` yang
    // dirender di header di bawah — konsisten dengan "tidak dapat trigger".
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href="/"
          onClick={closeMobileSidebar}
          className="flex items-center gap-2 px-1 font-heading text-sm font-semibold"
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            strokeWidth={2}
            className="size-4"
          />
          Settings
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const isSelected = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild isActive={isSelected}>
                      <Link
                        href={item.href}
                        onClick={closeMobileSidebar}
                        aria-current={isSelected ? "page" : undefined}
                      >
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
