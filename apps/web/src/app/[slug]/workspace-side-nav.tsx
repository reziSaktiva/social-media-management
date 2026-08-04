"use client";

import { usePathname, useRouter } from "next/navigation";

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

import { authClient } from "@/lib/better-auth/client";

import { useThemeMode } from "../providers";

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
}: {
  slug: string;
  workspaceName: string;
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, toggleMode } = useThemeMode();

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
        // Wiring ke DraftEditorProvider menyusul di T-011.2.
        <Button
          label="New Post"
          variant="primary"
          width="100%"
          icon={<span aria-hidden>＋</span>}
        />
      }
      footer={
        <HStack gap={2} align="center" justify="between" width="100%">
          <IconButton
            label="Notifikasi"
            icon={<span aria-hidden>🔔</span>}
            variant="ghost"
            tooltip="Notifikasi"
            onClick={() => router.push("/account/notifications")}
          />
          <IconButton
            label={
              mode === "light" ? "Ganti ke Dark Mode" : "Ganti ke Light Mode"
            }
            icon={<span aria-hidden>{mode === "light" ? "🌙" : "☀️"}</span>}
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
    </SideNav>
  );
}
