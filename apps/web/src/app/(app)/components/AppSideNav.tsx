"use client";

import { usePathname } from "next/navigation";

import type { SidebarChannelAccount } from "@/domains/workspace";

import { SettingsSideNav } from "../settings/components/SettingsSideNav";
import { WorkspaceSideNav } from "./WorkspaceSideNav";

// Satu-satunya pemasok slot `sideNav` AppShell di (app)/layout.tsx (ADR-077,
// T-039.5) — kondisional per-route, bukan dua sidebar berdampingan. Di bawah
// /settings, sidebar workspace digantikan TOTAL oleh SettingsSideNav; di
// luar itu tetap WorkspaceSideNav seperti sebelumnya. usePathname() butuh
// Client Component, sementara data workspace/session/channels tetap difetch
// sekali di Server Component (app)/layout.tsx dan diteruskan sebagai props
// ke sini — supaya layout.tsx tidak perlu tahu route aktif sama sekali.
export function AppSideNav({
  workspaceName,
  userName,
  userEmail,
  channels,
}: {
  workspaceName: string;
  userName: string;
  userEmail: string;
  channels: SidebarChannelAccount[];
}) {
  const pathname = usePathname();
  const isSettings = pathname.startsWith("/settings");

  if (isSettings) {
    return <SettingsSideNav />;
  }

  return (
    <WorkspaceSideNav
      workspaceName={workspaceName}
      userName={userName}
      userEmail={userEmail}
      channels={channels}
    />
  );
}
