"use client";

import type { PublishingPostRecord } from "@/domains/publishing";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";

import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

import { useDraftEditor } from "../../../components/draft-editor/Context";
import {
  CONTENT_STATUS_BADGE_VARIANT,
  CONTENT_STATUS_LABEL,
} from "../../../components/draft-editor/status-badge";

/**
 * KI-055 (poin 1, revisi 2026-09-10 mengikuti pola final poin 3 —
 * Workspaces): Claude Design menetapkan pola `Table` shadcn tanpa
 * header/judul kolom untuk list ini (keputusan King Rezi, menyimpang
 * sengaja dari `templates/publish-drafts.html` yang masih mendokumentasikan
 * pola `.queue-row` lama — belum diresync ke Claude Design). `Card`
 * dihapus — dibungkus `<div>` border+rounded manual (`table.tsx` tidak
 * meneruskan `className` ke div pembungkus `data-slot="table-container"`-
 * nya sendiri), padding horizontal dihilangkan (`py-3` bukan `p-3`) supaya
 * baris tabel menyentuh tepi border (edge-to-edge), mengandalkan padding
 * bawaan `TableCell` (`p-3`) untuk jarak konten. Baris klik penuh lewat
 * `onClick` di `TableRow` (native `<tr>`, tidak ada pola clickable-row lain
 * di project ini untuk dicontoh) + `cursor-pointer`; `TableRow` sudah
 * punya `hover:bg-muted/50` bawaan dari `table.tsx`. `TableHeader` sengaja
 * tidak dipakai sama sekali (tanpa judul kolom).
 */
export function DraftsList({ drafts }: { drafts: PublishingPostRecord[] }) {
  const { openEditDraft } = useDraftEditor();

  return (
    // eslint-disable-next-line no-restricted-syntax -- T-101.3: layout-only, file sudah dimigrasi shadcn
    <div className="flex flex-col gap-4">
      {/* eslint-disable-next-line no-restricted-syntax -- T-101.3: layout-only */}
      <div
        className={cn(
          "rounded-xl border border-border",
          drafts.length === 0 ? "p-6" : "py-2",
        )}
      >
        {drafts.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Belum ada draft</EmptyTitle>
              <EmptyDescription>
                Draft yang belum terjadwal akan muncul di sini.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableBody>
              {drafts.map((draft) => (
                <TableRow
                  key={draft.id}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => openEditDraft(draft.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openEditDraft(draft.id);
                    }
                  }}
                >
                  <TableCell className="whitespace-normal">
                    {/* eslint-disable-next-line no-restricted-syntax -- T-101.3: layout-only */}
                    <div className="flex flex-col gap-1">
                      <Text variant="small">
                        {draft.caption || "(Tanpa caption)"}
                      </Text>
                      <Text variant="muted">
                        Diedit {formatRelativeTime(draft.updatedAt)}
                      </Text>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={CONTENT_STATUS_BADGE_VARIANT[draft.status]}>
                      {CONTENT_STATUS_LABEL[draft.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
