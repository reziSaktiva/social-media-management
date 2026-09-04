"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Moon02Icon,
  PlusSignIcon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils/get-initials";

import type { NotificationRecord } from "@/domains/notification";
import type { SidebarChannelAccount } from "@/domains/workspace";
import { authClient } from "@/lib/better-auth/client";

import { useThemeMode } from "@/components/Providers";

import { useDraftEditor } from "./draft-editor/Context";
import { NotificationBell } from "./notification-panel/NotificationBell";
import { ChannelsSection } from "./sidebar-channels/ChannelsSection";

const NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Publish", path: "/publish" },
  { label: "Engage", path: "/engage" },
  { label: "Analyze", path: "/analyze" },
  { label: "Start Page", path: "/start-page" },
] as const;

export function WorkspaceSideNav({
  workspaceName,
  userName,
  userEmail,
  // Data untuk section "Channels" (T-012, ADR-058) — dirender via
  // ChannelsSection di bawah, antara nav items dan footer.
  channels,
  // T-036.4 — bell notifikasi self-contained (state + panel) di footer.
  initialNotifications,
  initialUnreadCount,
  userId,
  // T-098.4 (KI-042) — dipanggil saat item nav diklik. Dipakai MobileTopBar
  // untuk menutup Sheet setelah navigasi; di sidebar desktop (bukan di
  // dalam Sheet) tetap undefined, jadi tidak ada perubahan perilaku di sana.
  onNavigate,
}: {
  workspaceName: string;
  userName: string;
  userEmail: string;
  channels: SidebarChannelAccount[];
  initialNotifications: NotificationRecord[];
  initialUnreadCount: number;
  userId: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, toggleMode } = useThemeMode();
  const { openNewPost } = useDraftEditor();

  // T-016.5 / ADR-049 (NP-D10): Logout adalah Tier 2 Safety Check — wajib
  // dialog konfirmasi sebelum eksekusi, karena berpotensi menginterupsi
  // pekerjaan yang belum tersimpan meski aksinya sendiri reversibel.
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  const themeToggleLabel =
    mode === "light" ? "Ganti ke Dark Mode" : "Ganti ke Light Mode";

  return (
    <nav className="flex h-full flex-col">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-2 px-3 pt-3 pb-2 font-heading text-sm font-semibold"
      >
        <Avatar size="sm">
          <AvatarFallback>{getInitials(workspaceName)}</AvatarFallback>
        </Avatar>
        <span className="truncate">{workspaceName}</span>
      </Link>

      {/* ADR-053: CTA pinned di bawah Workspace Selector, di atas nav items. */}
      {/* eslint-disable-next-line no-restricted-syntax -- T-098.1: file ini
          sudah dimigrasi ke komposisi Tailwind shadcn (ADR-097), bukan lagi
          VStack/HStack Astryx. */}
      <div className="px-3 pb-3">
        <Button
          className="w-full"
          // openNewPost sekarang menerima preSelectedAccountId opsional
          // (T-012, ADR-058 addendum poin 9) — wrap supaya event onClick
          // tidak ikut tersalur sebagai argumen pertama.
          onClick={() => {
            onNavigate?.();
            openNewPost();
          }}
        >
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
          New Post
        </Button>
      </div>

      {/* T-012 / ADR-058: section "Channels" didorong ke bawah lewat
          justify-between supaya selalu menempel tepat di atas footer
          (Notifikasi/Theme/Avatar), meniru `.nav{flex:1}` di Claude Design
          yang menghabiskan sisa ruang vertikal sebelum `.channels`. */}
      {/* eslint-disable-next-line no-restricted-syntax -- T-098.1, sama seperti di atas */}
      <div className="flex min-h-0 flex-1 flex-col justify-between gap-4 overflow-y-auto px-3 pb-3">
        {/* eslint-disable-next-line no-restricted-syntax -- T-098.1, sama seperti di atas */}
        <div className="flex flex-col gap-0.5">
          <Text
            variant="muted"
            className="px-2 pb-1 text-xs font-medium tracking-wide uppercase"
          >
            Menu
          </Text>
          {NAV_ITEMS.map((item) => {
            const isSelected =
              item.path === "/"
                ? pathname === item.path
                : pathname.startsWith(item.path);
            return (
              <Link
                key={item.label}
                href={item.path}
                onClick={onNavigate}
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

        <ChannelsSection channels={channels} />
      </div>

      {/* KI-020: Design System mengelompokkan Theme+Avatar jadi satu klaster
          di kanan (Notifikasi terpisah di kiri), bukan spread rata 3 elemen. */}
      {/* eslint-disable-next-line no-restricted-syntax -- T-098.1, sama seperti di atas */}
      <div className="flex items-center justify-between gap-2 border-t border-border p-3">
        <NotificationBell
          initialNotifications={initialNotifications}
          initialUnreadCount={initialUnreadCount}
          userId={userId}
        />
        {/* eslint-disable-next-line no-restricted-syntax -- T-098.1, sama seperti di atas */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={themeToggleLabel}
                onClick={toggleMode}
              >
                <HugeiconsIcon
                  icon={mode === "light" ? Moon02Icon : Sun03Icon}
                  strokeWidth={2}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{themeToggleLabel}</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={userName || userEmail}
              >
                <Avatar size="sm">
                  <AvatarFallback>
                    {getInitials(userName || userEmail)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  onNavigate?.();
                  router.push("/settings/account");
                }}
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setIsLogoutDialogOpen(true)}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout dari akun ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Perubahan yang belum disimpan di halaman ini bisa hilang
              (ADR-049/NP-D10).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>Batal</AlertDialogCancel>
            {/* Button biasa (bukan `AlertDialogAction`) — Radix `Action` selalu
                menutup dialog begitu diklik, sementara logout ini async dan
                dialog HARUS tetap terbuka kalau `handleLogout` gagal (supaya
                user bisa coba lagi/Batal). `open`/`onOpenChange` di atas sudah
                controlled, jadi cukup `setIsLogoutDialogOpen(false)` manual
                cuma di jalur sukses. */}
            <Button
              variant="destructive"
              disabled={isLoggingOut}
              onClick={async () => {
                try {
                  await handleLogout();
                  setIsLogoutDialogOpen(false);
                } catch {
                  // Dialog tetap terbuka supaya user bisa coba lagi atau Batal;
                  // isLoggingOut sudah direset di handleLogout's finally.
                }
              }}
            >
              {isLoggingOut ? <Spinner /> : null}
              Logout
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
}
