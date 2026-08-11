"use client";

import { usePathname } from "next/navigation";

import {
  SideNav,
  SideNavItem,
  SideNavSection,
} from "@astryxdesign/core/SideNav";

// Subnav internal untuk /settings/* (T-039.1-3, ADR-076). Dirender di dalam
// LayoutPanel di layout.tsx — bukan pengganti WorkspaceSideNav primary
// (route ini sudah dibungkus AppShell + WorkspaceSideNav di
// (app)/layout.tsx, jadi tidak menumpuk AppShell/SideNav kedua).
//
// Direstrukturisasi jadi 2 grup berlabel (Organization/Account) sesuai IA
// (information-architecture.md) — dulu satu List flat tanpa grouping saat
// Account masih route top-level terpisah (/account/*). SideNav+SideNavSection
// dipilih (bukan List) karena ini pola resmi Astryx untuk grouped nav lists
// (lihat block template `SideNavSectionBasic`: "organize longer navigation
// lists into scannable clusters like Overview and Account").
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

  return (
    <SideNav>
      {NAV_GROUPS.map((group) => (
        <SideNavSection key={group.title} title={group.title}>
          {group.items.map((item) => {
            const isSelected = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <SideNavItem
                key={item.label}
                label={item.label}
                href={item.href}
                isSelected={isSelected}
              />
            );
          })}
        </SideNavSection>
      ))}
    </SideNav>
  );
}
