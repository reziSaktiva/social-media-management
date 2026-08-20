"use client";

import { usePathname } from "next/navigation";

import { Button } from "@astryxdesign/core/Button";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

import { useDraftEditor } from "../../components/draft-editor/Context";

const TAB_SUBTITLE: Record<string, string> = {
  calendar: "Jadwal publish dalam tampilan kalender",
  queue: "Antrean linear berdasarkan waktu publish",
  drafts: "Draft yang belum terjadwal",
  history: "Riwayat post yang sudah dipublikasikan",
};

/**
 * Header halaman Publish (judul "Publish" + subtitle per tab + "+ New Post")
 * — dipindah ke level layout (mockup Claude Design KSP-03/KSP-04: page-head
 * SELALU tampil di atas tabbar, bukan di bawahnya). Sebelumnya tiap tab
 * (QueueList, DraftsList) merender header sendiri-sendiri DI BAWAH tabbar,
 * menyimpang dari urutan mockup.
 */
export function PublishPageHeader() {
  const pathname = usePathname();
  const { openNewPost } = useDraftEditor();

  const activeTab =
    Object.keys(TAB_SUBTITLE).find((tab) =>
      pathname.includes(`/publish/${tab}`),
    ) ?? "calendar";

  return (
    <HStack justify="between" align="center">
      <VStack gap={1}>
        <Heading level={1}>Publish</Heading>
        <Text type="supporting">{TAB_SUBTITLE[activeTab]}</Text>
      </VStack>
      <Button
        label="+ New Post"
        variant="primary"
        onClick={() => openNewPost()}
      />
    </HStack>
  );
}
