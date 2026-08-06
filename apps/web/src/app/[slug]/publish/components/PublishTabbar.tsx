"use client";

import { usePathname, useRouter } from "next/navigation";

import { Tab, TabList } from "@astryxdesign/core/TabList";

const TABS = [
  { value: "calendar", label: "Calendar" },
  { value: "queue", label: "Queue" },
  { value: "drafts", label: "Drafts" },
  { value: "history", label: "History" },
] as const;

export function PublishTabbar({ slug }: { slug: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab =
    TABS.find((tab) => pathname.includes(`/publish/${tab.value}`))?.value ??
    "calendar";

  return (
    <TabList
      value={activeTab}
      onChange={(value) => router.push(`/${slug}/publish/${value}`)}
      hasDivider
    >
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          label={tab.label}
          href={`/${slug}/publish/${tab.value}`}
        />
      ))}
    </TabList>
  );
}
