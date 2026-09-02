import type { ReactNode } from "react";

import { Text } from "@/components/ui/text";

/** Segmen breadcrumb tingkat atas yang berulang di tiap halaman Settings. */
export const SETTINGS_BREADCRUMB_GROUP = {
  organization: "Organization",
  account: "Account",
} as const;

/**
 * Header bersama untuk tiap halaman Settings (T-099.1, migrasi shadcn/ui
 * ADR-097) — sebelumnya blok ini disalin identik di ProfileForm/
 * MembersTable/ConnectedAccountsList (code review PR #88). Judul yang
 * tampil sengaja sama ("Settings") di semua halaman sesuai rancangan
 * Claude Design, jadi `pageName` cuma diumumkan lewat elemen `sr-only`
 * (tidak tampil) supaya tiap halaman tetap punya accessible name berbeda
 * untuk navigasi heading screen reader (code review PR #88). Heading
 * ditulis langsung sebagai `<h2>` + Tailwind (bukan lewat `Text` variant)
 * mengikuti pola `CardTitle` (`font-heading font-medium`) — tidak ada
 * variant `Text` yang cocok untuk heading ringkas tanpa margin/border
 * bawaan prosa (`h2`/`h3`/`h4` semua punya `mt-*`/`border-b` untuk konten
 * artikel panjang, bukan page header).
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
    /* eslint-disable-next-line no-restricted-syntax -- T-099.1: file ini
       sudah dimigrasi ke komposisi Tailwind shadcn (ADR-097), bukan lagi
       HStack Astryx. */
    <div className="flex items-start justify-between gap-4">
      {/* eslint-disable-next-line no-restricted-syntax -- T-099.1, sama seperti di atas */}
      <div className="flex flex-col gap-0.5">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          Settings
          <span className="sr-only"> — {pageName}</span>
        </h2>
        <Text variant="muted">{breadcrumb}</Text>
      </div>
      {action}
    </div>
  );
}
