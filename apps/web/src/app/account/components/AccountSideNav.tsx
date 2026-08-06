"use client";

import { usePathname } from "next/navigation";

import { FaArrowLeft } from "react-icons/fa6";

import {
  SideNav,
  SideNavItem,
  SideNavSection,
} from "@astryxdesign/core/SideNav";

// Nav internal untuk section /account/* (T-016.1). Route ini top-level, tidak
// punya konteks workspace — SideNav di sini BUKAN pengganti WorkspaceSideNav,
// hanya untuk 3 sub-halaman Account + link kembali ke workspace terakhir.
const NAV_ITEMS = [
  { label: "Profile", path: "profile" },
  { label: "Notifications", path: "notifications" },
  { label: "Preferences", path: "preferences" },
] as const;

export function AccountSideNav({
  workspaceSlug,
  workspaceName,
}: {
  workspaceSlug: string | null;
  workspaceName: string | null;
}) {
  const pathname = usePathname();

  const backHref = workspaceSlug ? `/${workspaceSlug}` : "/";
  const backLabel = workspaceName
    ? `Kembali ke ${workspaceName}`
    : "Kembali ke Workspace";

  return (
    <SideNav
      topContent={
        <SideNavItem label={backLabel} href={backHref} icon={FaArrowLeft} />
      }
    >
      <SideNavSection title="Account">
        {NAV_ITEMS.map((item) => {
          const href = `/account/${item.path}`;
          return (
            <SideNavItem
              key={item.label}
              label={item.label}
              href={href}
              isSelected={pathname.startsWith(href)}
            />
          );
        })}
      </SideNavSection>
    </SideNav>
  );
}
