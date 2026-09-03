"use client";

import { useState } from "react";

import { usePathname } from "next/navigation";

import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import type { NotificationRecord } from "@/domains/notification";
import type { SidebarChannelAccount } from "@/domains/workspace";

import { AppSideNav } from "./AppSideNav";

/**
 * T-098.4 (KI-042) — top bar + Sheet drawer di bawah breakpoint `md`
 * (768px, sama seperti KSP-02-F10, lihat foundations/layout.html § "Shell —
 * Mobile" di Claude Design). `<aside>` desktop di (app)/layout.tsx
 * disembunyikan lewat `hidden md:flex`; komponen ini menggantikannya di
 * bawah breakpoint. Sheet membungkus `AppSideNav` yang SAMA PERSIS dengan
 * sidebar desktop (WorkspaceSideNav/SettingsSideNav, kondisional per
 * pathname) — tidak ada konten yang diduplikasi/didesain ulang, hanya
 * direflow ke lebar Sheet (pola sama dengan NotificationBell, T-098.2).
 */
export function MobileTopBar({
  workspaceName,
  userName,
  userEmail,
  channels,
  initialNotifications,
  initialUnreadCount,
  userId,
}: {
  workspaceName: string;
  userName: string;
  userEmail: string;
  channels: SidebarChannelAccount[];
  initialNotifications: NotificationRecord[];
  initialUnreadCount: number;
  userId: string;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isSettings = pathname.startsWith("/settings");
  const title = isSettings ? "Settings" : workspaceName;

  return (
    // T-098.4: file baru, dikomposisi Tailwind shadcn (ADR-097) sejak awal,
    // bukan migrasi Astryx.
    // eslint-disable-next-line no-restricted-syntax
    <div className="flex h-13 shrink-0 items-center gap-2 border-b border-border px-3 md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Buka menu"
        onClick={() => setIsOpen(true)}
      >
        <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
      </Button>
      <span className="flex-1 truncate font-heading text-sm font-semibold">
        {title}
      </span>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-3/4 gap-0 p-0 sm:max-w-xs">
          {/* SheetTitle wajib untuk aksesibilitas Radix Dialog — disembunyikan
              visual (sr-only) karena AppSideNav sudah menampilkan judulnya
              sendiri (workspace switcher / label "Settings") di dalam. */}
          <SheetHeader className="sr-only">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <AppSideNav
            workspaceName={workspaceName}
            userName={userName}
            userEmail={userEmail}
            channels={channels}
            initialNotifications={initialNotifications}
            initialUnreadCount={initialUnreadCount}
            userId={userId}
            onNavigate={() => setIsOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
