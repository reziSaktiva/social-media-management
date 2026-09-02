"use client";

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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { PLATFORM_ICON } from "../../../components/platform-icons";

const ALL_PLATFORMS = Object.values(SocialPlatform);

/**
 * CTA "Connect Account" (T-013.3, migrasi shadcn/ui T-099.3) — dropdown 8
 * platform, SEMUA item disabled + tooltip "Segera hadir". Tidak ada
 * handler OAuth nyata di sini: inisiasi redirect (T-013.1/T-013.2)
 * diblokir T-025 (Real OutstandAdapter, v0.2), jadi setiap platform —
 * termasuk Twitter/X — belum punya endpoint untuk disambungkan.
 *
 * Ikon trigger "+" diganti `PlusSignIcon` (hugeicons, default preset Maia
 * untuk komponen baru, ganti `FaPlus` react-icons) — ikon brand per
 * platform (`PLATFORM_ICON`) tetap `react-icons` (ADR-058, pengecualian
 * logo bermerek dagang yang sudah berlaku sejak sebelum migrasi ini).
 * `DropdownMenuItem` disabled dibungkus `<span tabIndex={0}>` supaya
 * `Tooltip` tetap bisa menerima hover (item disabled otomatis
 * `pointer-events-none` lewat class bawaan `DropdownMenuItem`, sama
 * seperti pola di `ConnectedAccountsList`).
 */
export function ConnectPlatformMenu() {
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
            <Tooltip key={platform}>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="block">
                  <DropdownMenuItem disabled>
                    <PlatformGlyph size={16} color={entry.color} />
                    {entry.label}
                  </DropdownMenuItem>
                </span>
              </TooltipTrigger>
              <TooltipContent side="left">Segera hadir</TooltipContent>
            </Tooltip>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
