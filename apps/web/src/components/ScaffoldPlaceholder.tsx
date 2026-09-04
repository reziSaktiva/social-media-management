"use client";

// Placeholder untuk halaman scaffold yang belum diimplementasikan. Dipakai
// lintas subtree berbeda ([slug]/*, account/*, dan root) sehingga
// lokasinya di `components/` (LCA, ADR-069) — bukan di salah satu subtree
// route saja.
//
// T-102 cleanup (ADR-097): migrasi dari Astryx (`Center`/`Stack`/
// `EmptyState`/`Badge`) ke shadcn `Empty` (`components/ui/empty.tsx`) +
// Tailwind flex — token-backed, kontras benar di light & dark mode via
// CSS variable shadcn (bukan lagi tema Astryx).

import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

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
    // eslint-disable-next-line no-restricted-syntax -- T-102: padanan Astryx Center, murni Tailwind flex, tidak ada primitive shadcn setara.
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Empty>
        <Badge variant="outline" className="mb-2">
          Scaffold
        </Badge>
        <EmptyHeader>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{message}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
