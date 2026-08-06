"use client";

import { usePathname } from "next/navigation";

import { List, ListItem } from "@astryxdesign/core/List";

// Subnav internal untuk /[slug]/settings/* (T-016.1). Dirender di dalam
// LayoutPanel di layout.tsx — bukan pengganti WorkspaceSideNav primary
// (route ini sudah dibungkus AppShell + WorkspaceSideNav di
// [slug]/layout.tsx, jadi tidak menumpuk AppShell/SideNav kedua).
const NAV_ITEMS = [
  { label: "General", path: "" },
  { label: "Connected Accounts", path: "connected-accounts" },
  { label: "Members", path: "members" },
  { label: "Roles", path: "roles" },
  { label: "Billing", path: "billing" },
] as const;

export function SettingsSideNav({ slug }: { slug: string }) {
  const pathname = usePathname();

  return (
    <List>
      {NAV_ITEMS.map((item) => {
        const href = item.path
          ? `/${slug}/settings/${item.path}`
          : `/${slug}/settings`;
        const isSelected = item.path
          ? pathname.startsWith(href)
          : pathname === href;
        return (
          <ListItem
            key={item.label}
            label={item.label}
            href={href}
            isSelected={isSelected}
          />
        );
      })}
    </List>
  );
}
