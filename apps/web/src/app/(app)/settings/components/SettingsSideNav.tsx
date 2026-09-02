"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

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

  return (
    <nav className="flex h-full flex-col gap-4 p-3">
      <Link
        href="/"
        className="flex items-center gap-2 font-heading text-sm font-semibold"
      >
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          strokeWidth={2}
          className="size-4"
        />
        Settings
      </Link>

      {/* eslint-disable-next-line no-restricted-syntax -- T-098.1: file ini
          sudah dimigrasi ke komposisi Tailwind shadcn (ADR-097), bukan lagi
          VStack/HStack Astryx. */}
      <div className="flex flex-col gap-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          // eslint-disable-next-line no-restricted-syntax -- T-098.1, sama seperti di atas
          <div key={group.title} className="flex flex-col gap-0.5">
            <Text
              variant="muted"
              className="px-2 pb-1 text-xs font-medium tracking-wide uppercase"
            >
              {group.title}
            </Text>
            {group.items.map((item) => {
              const isSelected = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isSelected ? "page" : undefined}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}
