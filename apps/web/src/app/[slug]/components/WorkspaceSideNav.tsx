"use client";

import { useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import { FaBell, FaMoon, FaPlus, FaSun } from "react-icons/fa6";

import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Button } from "@astryxdesign/core/Button";
import { DropdownMenu } from "@astryxdesign/core/DropdownMenu";
import { HStack } from "@astryxdesign/core/HStack";
import { IconButton } from "@astryxdesign/core/IconButton";
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from "@astryxdesign/core/SideNav";

import type { SidebarChannelAccount } from "@/domains/workspace";
import { authClient } from "@/lib/better-auth/client";

import { useThemeMode } from "@/components/Providers";

import { useDraftEditor } from "./draft-editor/Context";
import { ChannelsSection } from "./sidebar-channels/ChannelsSection";

const NAV_ITEMS = [
  { label: "Home", path: "" },
  { label: "Publish", path: "publish" },
  { label: "Engage", path: "engage" },
  { label: "Analyze", path: "analyze" },
  { label: "Start Page", path: "start-page" },
] as const;

export function WorkspaceSideNav({
  slug,
  workspaceName,
  userName,
  userEmail,
  // Data untuk section "Channels" (T-012, ADR-058) — dirender via
  // ChannelsSection di bawah, antara SideNavSection "Menu" dan footer.
  channels,
}: {
  slug: string;
  workspaceName: string;
  userName: string;
  userEmail: string;
  channels: SidebarChannelAccount[];
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

  return (
    <SideNav
      header={
        <SideNavHeading
          heading={workspaceName}
          headingHref={`/${slug}`}
          superheading="Workspace"
        />
      }
      topContent={
        // ADR-053: CTA pinned di bawah Workspace Selector, di atas nav items.
        <Button
          label="New Post"
          variant="primary"
          width="100%"
          icon={<FaPlus />}
          // openNewPost sekarang menerima preSelectedAccountId opsional
          // (T-012, ADR-058 addendum poin 9) — wrap supaya event Button
          // onClick tidak ikut tersalur sebagai argumen pertama.
          onClick={() => openNewPost()}
        />
      }
      footer={
        // KI-020: Design System mengelompokkan Theme+Avatar jadi satu klaster
        // di kanan (Notifikasi terpisah di kiri), bukan spread rata 3 elemen
        // — direplikasi lewat HStack justify="between" berisi 2 grup, bukan
        // 3 children langsung.
        <HStack gap={2} align="center" justify="between" width="100%">
          <IconButton
            label="Notifikasi"
            icon={<FaBell />}
            variant="ghost"
            tooltip="Notifikasi"
            onClick={() => router.push("/account/notifications")}
          />
          <HStack gap={2} align="center">
            <IconButton
              label={
                mode === "light" ? "Ganti ke Dark Mode" : "Ganti ke Light Mode"
              }
              icon={mode === "light" ? <FaMoon /> : <FaSun />}
              variant="ghost"
              tooltip={
                mode === "light" ? "Ganti ke Dark Mode" : "Ganti ke Light Mode"
              }
              onClick={toggleMode}
            />
            <DropdownMenu
              button={{
                isIconOnly: true,
                icon: <Avatar name={userName || userEmail} size="sm" />,
                variant: "ghost",
                label: userName || userEmail,
              }}
              hasChevron={false}
              items={[
                {
                  label: "Profile",
                  onClick: () => router.push("/account/profile"),
                },
                { type: "divider" },
                {
                  label: "Logout",
                  onClick: () => setIsLogoutDialogOpen(true),
                },
              ]}
            />
          </HStack>
          <AlertDialog
            isOpen={isLogoutDialogOpen}
            onOpenChange={setIsLogoutDialogOpen}
            title="Logout dari akun ini?"
            description="Perubahan yang belum disimpan di halaman ini bisa hilang (ADR-049/NP-D10)."
            cancelLabel="Batal"
            actionLabel="Logout"
            isActionLoading={isLoggingOut}
            onAction={async () => {
              try {
                await handleLogout();
                setIsLogoutDialogOpen(false);
              } catch {
                // Dialog tetap terbuka supaya user bisa coba lagi atau Batal;
                // isLoggingOut sudah direset di handleLogout's finally.
              }
            }}
          />
        </HStack>
      }
    >
      <SideNavSection title="Menu">
        {NAV_ITEMS.map((item) => {
          const href = item.path ? `/${slug}/${item.path}` : `/${slug}`;
          const isSelected = item.path
            ? pathname.startsWith(href)
            : pathname === href;
          return (
            <SideNavItem
              key={item.label}
              label={item.label}
              href={href}
              isSelected={isSelected}
            />
          );
        })}
      </SideNavSection>

      {/* T-012 / ADR-058: section "Channels" — antara nav items dan zona
          bawah (Notifikasi/Theme/Avatar), bukan nav item ke-6 (P-IA-01). */}
      <ChannelsSection slug={slug} channels={channels} />
    </SideNav>
  );
}
