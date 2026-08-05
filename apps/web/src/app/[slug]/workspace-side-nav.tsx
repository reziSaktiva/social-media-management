"use client";

import { usePathname, useRouter } from "next/navigation";

import { FaBell, FaMoon, FaPlus, FaSun } from "react-icons/fa6";

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

import { useThemeMode } from "../providers";

import { useDraftEditor } from "./_draft-editor/context";
import { ChannelsSection } from "./_sidebar-channels/channels-section";

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

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
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
        <HStack gap={2} align="center" justify="between" width="100%">
          <IconButton
            label="Notifikasi"
            icon={<FaBell />}
            variant="ghost"
            tooltip="Notifikasi"
            onClick={() => router.push("/account/notifications")}
          />
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
              label: userName || userEmail,
              variant: "ghost",
            }}
            items={[
              {
                label: "Profile",
                onClick: () => router.push("/account/profile"),
              },
              { type: "divider" },
              { label: "Logout", onClick: handleLogout },
            ]}
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
