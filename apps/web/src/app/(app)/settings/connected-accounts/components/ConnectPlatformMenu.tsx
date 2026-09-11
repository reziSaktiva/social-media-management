"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";

import { SocialPlatform } from "@social/shared";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { PLATFORM_ICON } from "../../../components/platform-icons";
import { initiateConnectAccountAction } from "../actions";

const ALL_PLATFORMS = Object.values(SocialPlatform);

/**
 * CTA "Connect Account" (T-013.3 UI, T-013.1/T-013.2 wiring, ADR-105) —
 * dropdown 8 platform, tiap item memicu `initiateConnectAccountAction`
 * (Server Action → `WorkspaceService.initiateConnectAccount` →
 * `OutstandAdapter.connectAccount`, Fake loopback ke callback route kita
 * sendiri sampai real adapter T-025 tersedia). Sukses berarti Server Action
 * `redirect()` ke `redirectUrl` OAuth — komponen ini unmount, tidak perlu
 * reset state manual (pola sama `WorkspacesSettingsView.handleSwitch`).
 * Gagal (RBAC/validasi) mengembalikan `{ error }` tanpa redirect —
 * ditampilkan lewat `toast.error` (pola sama `RetryTargetButton`).
 *
 * Ikon trigger "+" `PlusSignIcon` (hugeicons, default preset Maia) — ikon
 * brand per platform (`PLATFORM_ICON`) tetap `react-icons` (ADR-058,
 * pengecualian logo bermerek dagang). Item dinonaktifkan HANYA selagi
 * request untuk platform itu sendiri pending (`pendingPlatform`), platform
 * lain tetap bisa diklik — konsisten "satu aksi async per klik", bukan
 * mengunci seluruh menu.
 */
export function ConnectPlatformMenu() {
  const [isPending, startTransition] = useTransition();
  const [pendingPlatform, setPendingPlatform] = useState<SocialPlatform | null>(
    null,
  );

  function handleConnect(platform: SocialPlatform) {
    setPendingPlatform(platform);
    startTransition(async () => {
      const result = await initiateConnectAccountAction(platform);
      if (result?.error) {
        toast.error(result.error);
        setPendingPlatform(null);
      }
      // Sukses: Server Action redirect() di server, komponen ini unmount —
      // tidak perlu reset `pendingPlatform` manual (pola sama
      // `WorkspacesSettingsView.handleSwitch`).
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button">
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
          Connect Account
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {ALL_PLATFORMS.map((platform) => {
          const entry = PLATFORM_ICON[platform];
          const PlatformGlyph = entry.Icon;
          return (
            <DropdownMenuItem
              key={platform}
              disabled={isPending && pendingPlatform === platform}
              onSelect={(event) => {
                event.preventDefault();
                handleConnect(platform);
              }}
            >
              <PlatformGlyph size={16} color={entry.color} />
              {entry.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
