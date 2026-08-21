import type { ReactNode } from "react";

import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VisuallyHidden } from "@astryxdesign/core/VisuallyHidden";
import { VStack } from "@astryxdesign/core/VStack";

/** Segmen breadcrumb tingkat atas yang berulang di tiap halaman Settings. */
export const SETTINGS_BREADCRUMB_GROUP = {
  organization: "Organization",
  account: "Account",
} as const;

/**
 * Header bersama untuk tiap halaman Settings — sebelumnya blok ini
 * disalin identik di ProfileForm/MembersTable/ConnectedAccountsList
 * (code review PR #88). Judul yang tampil sengaja sama ("Settings") di
 * semua halaman sesuai rancangan Claude Design, jadi `pageName` cuma
 * diumumkan lewat `VisuallyHidden` (tidak tampil) supaya tiap halaman
 * tetap punya accessible name berbeda untuk navigasi heading screen
 * reader (code review PR #88).
 */
export function SettingsPageHead({
  pageName,
  breadcrumb,
  action,
}: {
  pageName: string;
  breadcrumb: string;
  action?: ReactNode;
}) {
  return (
    <HStack justify="between" align="start">
      <VStack gap={0.5}>
        <Heading level={2}>
          Settings
          <VisuallyHidden> — {pageName}</VisuallyHidden>
        </Heading>
        <Text type="supporting">{breadcrumb}</Text>
      </VStack>
      {action}
    </HStack>
  );
}
