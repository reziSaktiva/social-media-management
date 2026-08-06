"use client";

// Placeholder Astryx-compliant untuk halaman scaffold yang belum
// diimplementasikan. Dipakai lintas subtree berbeda ([slug]/*, account/*,
// dan root) sehingga lokasinya di `components/` (LCA, ADR-069) — bukan di
// salah satu subtree route saja.
//
// Menggantikan pola lama `<main>`/`<div>` + warna Tailwind hardcoded
// (text-zinc-900/600/500) yang rusak kontrasnya di dark mode. Style di sini
// sepenuhnya lewat komponen Astryx (Center, EmptyState, Badge, Stack) yang
// otomatis kontras benar di light & dark mode lewat token tema.

import { Badge } from "@astryxdesign/core/Badge";
import { Center } from "@astryxdesign/core/Center";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Stack } from "@astryxdesign/core/Layout";

type ScaffoldPlaceholderProps = {
  /** Judul halaman, ditampilkan sebagai heading utama EmptyState. */
  title: string;
  /** Pesan placeholder — wajib menyebut task ID spesifik (T-XXX) atau,
   * kalau memang belum ada task tercatat, pernyataan jujur soal itu. */
  message: string;
};

export function ScaffoldPlaceholder({
  title,
  message,
}: ScaffoldPlaceholderProps) {
  return (
    <Center height="100vh">
      <Stack direction="vertical" gap={3} hAlign="center">
        <Badge variant="neutral" label="Scaffold" />
        <EmptyState headingLevel={1} title={title} description={message} />
      </Stack>
    </Center>
  );
}
