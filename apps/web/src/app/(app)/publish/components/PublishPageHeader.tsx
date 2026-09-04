"use client";

import { usePathname } from "next/navigation";

import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

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
 *
 * Migrasi shadcn/ui (T-101.4, ADR-097): `HStack`/`VStack`/`Heading`/`Text`/
 * `Button` Astryx → Tailwind flex + `Button` shadcn. Judul ditulis langsung
 * sebagai `<h1>` + Tailwind (bukan `Text` variant `h1`/`h2`/dst.) mengikuti
 * pola `SettingsPageHead` (T-099.1) — variant heading `Text` punya
 * `mt-*`/`border-b` untuk konten artikel/prosa, bukan page header ringkas.
 * Label literal "+ New Post" (Astryx) diganti ikon `PlusSignIcon`
 * (hugeicons, default preset Maia) + teks, mengikuti pola
 * `InviteMemberAction` (T-099.2).
 */
export function PublishPageHeader() {
  const pathname = usePathname();
  const { openNewPost } = useDraftEditor();

  const activeTab =
    Object.keys(TAB_SUBTITLE).find((tab) =>
      pathname.includes(`/publish/${tab}`),
    ) ?? "calendar";

  return (
    // eslint-disable-next-line no-restricted-syntax -- T-101.4: file ini sudah dimigrasi ke komposisi Tailwind shadcn (ADR-097), bukan lagi HStack Astryx.
    <div className="flex items-center justify-between gap-4">
      {/* eslint-disable-next-line no-restricted-syntax -- T-101.4, sama seperti di atas */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Publish
        </h1>
        <Text variant="muted">{TAB_SUBTITLE[activeTab]}</Text>
      </div>
      <Button type="button" onClick={() => openNewPost()}>
        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
        New Post
      </Button>
    </div>
  );
}
