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
