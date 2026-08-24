"use client";

import { usePathname } from "next/navigation";

import { FaArrowLeft } from "react-icons/fa6";

import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from "@astryxdesign/core/SideNav";

// Sidebar Settings tunggal, pola Buffer (ADR-077, T-039.5) — dirender lewat
// slot `sideNav` AppShell oleh AppSideNav (../../components/AppSideNav.tsx)
// saat pathname di bawah /settings, MENGGANTIKAN TOTAL WorkspaceSideNav
// (bukan sidebar kedua yang berdampingan seperti pola lama ADR-076/
// T-039.1-3). Header back-navigation (ikon back + label "Settings", link ke
// "/") ditaruh di prop `header` SideNav lewat SideNavHeading — pure link,
// bukan submit/reload.
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

  return (
    <SideNav
      header={
        <SideNavHeading
          heading="Settings"
          icon={<FaArrowLeft />}
          headingHref="/"
        />
      }
    >
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
