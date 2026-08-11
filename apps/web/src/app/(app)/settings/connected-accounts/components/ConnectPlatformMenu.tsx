"use client";

import { FaPlus } from "react-icons/fa6";

import {
  DropdownMenu,
  DropdownMenuItem,
} from "@astryxdesign/core/DropdownMenu";
import { Tooltip } from "@astryxdesign/core/Tooltip";

import { SocialPlatform } from "@social/shared";

import { PLATFORM_ICON } from "../../../components/platform-icons";

const ALL_PLATFORMS = Object.values(SocialPlatform);

/**
 * CTA "Connect Account" — dropdown 8 platform, SEMUA item disabled + tooltip
 * "Segera hadir" (T-013.3). Tidak ada handler OAuth nyata di sini: inisiasi
 * redirect (T-013.1/T-013.2) diblokir T-025 (Real OutstandAdapter, v0.2),
 * jadi setiap platform — termasuk Twitter/X — belum punya endpoint untuk
 * disambungkan.
 */
export function ConnectPlatformMenu() {
  return (
    <DropdownMenu
      button={{
        label: "Connect Account",
        variant: "primary",
        icon: <FaPlus />,
      }}
    >
      {ALL_PLATFORMS.map((platform) => {
        const entry = PLATFORM_ICON[platform];
        return (
          <Tooltip key={platform} content="Segera hadir">
            <DropdownMenuItem
              icon={entry.Icon}
              label={entry.label}
              isDisabled
            />
          </Tooltip>
        );
      })}
    </DropdownMenu>
  );
}
