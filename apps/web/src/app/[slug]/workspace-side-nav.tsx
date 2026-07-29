"use client";

import { usePathname, useRouter } from "next/navigation";

import { DropdownMenu } from "@astryxdesign/core/DropdownMenu";
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from "@astryxdesign/core/SideNav";

import { authClient } from "@/lib/better-auth/client";

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
      footer={
        <DropdownMenu
          button={{
            label: userName || userEmail,
            variant: "ghost",
            width: "100%",
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
