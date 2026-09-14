import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Inisial dari nama/handle untuk `AvatarFallback` (T-099) — shadcn `Avatar`
 * cuma primitive Image/Fallback murni (beda dari `@astryxdesign/core/Avatar`
 * yang otomatis menurunkan inisial dari prop `name`), jadi logiknya
 * dipindah ke sini supaya tidak diduplikasi di tiap file yang pakai Avatar
 * (ProfileForm, MembersTable, ConnectedAccountsList, WorkspacesSettingsView).
 * Dua kata pertama+terakhir diambil huruf awalnya; satu kata diambil dua
 * huruf pertama — sama seperti konvensi umum (mis. demo resmi shadcn
 * "CN" untuk "shadcn").
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase();
}

/**
 * Label role title-case terlepas dari casing mentah yang dikirim page.tsx
 * (`MemberRole` enum di `packages/shared` bernilai lowercase
 * "owner"/"admin"/"creator") — dipusatkan di sini karena sebelumnya
 * diduplikasi verbatim di `WorkspacesSettingsView.tsx` dan
 * `WorkspacePicker.tsx` (code review PR #109). Sengaja menerima `role:
 * string` polos (bukan import `MemberRole`) supaya pemanggilnya tidak
 * terikat ke shared enum, cukup format tampilan.
 */
export function formatRoleLabel(role: string): string {
  if (!role) return role;
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

/**
 * Format kalender `dateKey` ("YYYY-MM-DD") via `formatter` — parse manual
 * dengan `Date.UTC` supaya tidak kena pergeseran timezone browser (code
 * review PR #105: dipusatkan di sini, sebelumnya diduplikasi verbatim di
 * `QueueList.tsx` & `CalendarAgendaList.tsx`, beda cuma opsi `formatter`-nya).
 */
export function formatUtcDateKeyHeading(
  dateKey: string,
  formatter: Intl.DateTimeFormat,
): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return formatter.format(new Date(Date.UTC(year!, month! - 1, day)));
}
