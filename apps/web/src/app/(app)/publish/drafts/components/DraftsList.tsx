"use client";

import { useCallback, useState } from "react";

import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";

import { ContentStatus } from "@social/shared";
import type {
  CalendarPostItem,
  PublishingPostRecord,
} from "@/domains/publishing";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";
import { useConfirmAction } from "@/lib/hooks/use-confirm-action";
import { usePublishingPostsRealtime } from "@/lib/hooks/use-publishing-posts-realtime";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Text } from "@/components/ui/text";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";

import { cn } from "@/lib/utils";

import { useDraftEditor } from "../../../components/draft-editor/Context";
import {
  CONTENT_STATUS_BADGE_VARIANT,
  CONTENT_STATUS_LABEL,
} from "../../../components/draft-editor/status-badge";
import { deletePostAction, getDraftPostAction } from "../actions";

/**
 * Kriteria tampilan Drafts (T-092.5, ADR-094 poin 5): `Draft`, `InReview`,
 * atau `ReadyToSchedule`. Sub-shape dari `PublishingPostRecord` — hanya
 * field yang benar-benar dipakai render di bawah (`id`/`caption`/`status`/
 * `updatedAt`), supaya hasil `getDraftPostAction` (`CalendarPostItem`, tidak
 * membawa `workspaceId`/`authorId`) bisa dipetakan langsung tanpa
 * memalsukan field yang tidak ada.
 */
type DraftListItem = Pick<
  PublishingPostRecord,
  "id" | "caption" | "status" | "updatedAt"
>;

const DRAFT_VIEW_STATUSES: ReadonlySet<ContentStatus> = new Set([
  ContentStatus.Draft,
  ContentStatus.InReview,
  ContentStatus.ReadyToSchedule,
]);

function toDraftListItem(item: CalendarPostItem): DraftListItem | null {
  if (!DRAFT_VIEW_STATUSES.has(item.status)) {
    return null;
  }
  return {
    id: item.id,
    caption: item.caption,
    status: item.status,
    updatedAt: item.updatedAt,
  };
}

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
 *
 * T-035.2/.3 (Delete Post, ADR-049 Tier 2): tombol trash merah ditambahkan
 * di cell kanan (sebaris dengan Badge status) — pola sama `useConfirmAction`
 * + `ConfirmActionDialog` yang sudah dipakai `ConnectedAccountsList.tsx`
 * (Disconnect account). Klik tombol WAJIB `stopPropagation` (mouse + key)
 * supaya tidak ikut memicu `onClick`/`onKeyDown` milik `TableRow` (yang
 * membuka Edit Draft) — baris tetap klik-penuh untuk buka editor seperti
 * sebelumnya. Entry point ini HANYA ada di Drafts (bukan Queue/History,
 * dikonfirmasi King Rezi) — `PublishingService.deletePost` menolak post
 * yang statusnya bukan Draft, tapi baris di sini memang selalu Draft
 * (query `listDrafts` sudah filter `status: Draft`), jadi guard itu murni
 * safety net server-side.
 *
 * **T-092.5 (ADR-094 poin 5, 6) — client state + granular Realtime patch:**
 * `drafts` (hasil `PublishingService.listDrafts` dari `page.tsx`) disalin ke
 * `useState` lokal (pola sama `QueueScreen`, T-092.4) — disinkronkan ulang
 * SAAT RENDER setiap kali prop `drafts` berubah (`page.tsx` re-render
 * server-side lewat `revalidatePath("/publish/drafts")`, mis. sesudah
 * Delete Post), bukan `useEffect` + `setState` supaya tidak ada render
 * tambahan/cascading.
 *
 * `usePublishingPostsRealtime(workspaceId, {...})` subscribe selama
 * komponen ini mount (lifecycle per-mount, ADR-094 poin 6). Event
 * `INSERT`/`UPDATE` memicu fetch SATU record via `getDraftPostAction`
 * (Server Action → reuse `PublishingService.getCalendarPostById`, bukan
 * refetch seluruh Drafts) lalu di-upsert/remove ke state lokal berdasar
 * kriteria tampilan Drafts (`toDraftListItem` — status `Draft`/`InReview`/
 * `ReadyToSchedule`; status lain, termasuk `null` hasil post tidak
 * ditemukan/soft-deleted, berarti item dihapus dari local state) — echo
 * dari aksi milik user sendiri diproses sama seperti event orang lain,
 * tanpa deteksi/skip apa pun (idempoten by design, ADR-094 poin 5). Urutan
 * dipertahankan `updatedAt` descending (sama `orderBy` `listDrafts`).
 */
export function DraftsList({
  drafts,
  workspaceId,
}: {
  drafts: DraftListItem[];
  /** Workspace aktif — dipakai `usePublishingPostsRealtime` (T-092.5) untuk
   * subscribe channel `publishing_posts:{workspaceId}`, bukan dipakai untuk
   * fetch data apa pun langsung di komponen ini (AGENTS.md #5). */
  workspaceId: string;
}) {
  const { openEditDraft } = useDraftEditor();
  const deleteConfirm = useConfirmAction<DraftListItem>(
    (draft) => deletePostAction(draft.id),
    () => toast("Draft berhasil dihapus"),
  );

  const [prevDrafts, setPrevDrafts] = useState(drafts);
  const [localDrafts, setLocalDrafts] = useState(drafts);

  if (drafts !== prevDrafts) {
    setPrevDrafts(drafts);
    setLocalDrafts(drafts);
  }

  const handlePublishingPostChange = useCallback(
    (event: { postId: CalendarPostItem["id"] }) => {
      void (async () => {
        const fetched = await getDraftPostAction(event.postId);
        const draftItem = fetched ? toDraftListItem(fetched) : null;

        setLocalDrafts((prev) => {
          const withoutStale = prev.filter(
            (draft) => draft.id !== event.postId,
          );

          if (!draftItem) {
            return withoutStale;
          }

          return [...withoutStale, draftItem].sort(
            (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
          );
        });
      })();
    },
    [],
  );

  usePublishingPostsRealtime(workspaceId, {
    onInsert: handlePublishingPostChange,
    onUpdate: handlePublishingPostChange,
  });

  return (
    // eslint-disable-next-line no-restricted-syntax -- T-101.3: layout-only, file sudah dimigrasi shadcn
    <div className="flex flex-col gap-4">
      {/* eslint-disable-next-line no-restricted-syntax -- T-101.3: layout-only */}
      <div
        className={cn(
          "rounded-xl border border-border",
          localDrafts.length === 0 ? "p-6" : "py-2",
        )}
      >
        {localDrafts.length === 0 ? (
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
              {localDrafts.map((draft) => (
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
                    {/* eslint-disable-next-line no-restricted-syntax -- T-101.3: layout-only */}
                    <div className="flex items-center justify-end gap-2">
                      <Badge
                        variant={CONTENT_STATUS_BADGE_VARIANT[draft.status]}
                      >
                        {CONTENT_STATUS_LABEL[draft.status]}
                      </Badge>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-sm"
                            aria-label="Hapus draft"
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteConfirm.open(draft);
                            }}
                            onKeyDown={(event) => event.stopPropagation()}
                          >
                            <HugeiconsIcon icon={Delete02Icon} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Hapus draft</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ConfirmActionDialog
        isOpen={deleteConfirm.isOpen}
        onClose={deleteConfirm.close}
        title="Hapus draft ini?"
        description="Tindakan ini tidak bisa dibatalkan — draft akan hilang permanen dari daftar."
        confirmLabel="Hapus Draft"
        isLoading={deleteConfirm.isLoading}
        error={deleteConfirm.error}
        onConfirm={() => void deleteConfirm.confirm()}
        variant="destructive"
      />
    </div>
  );
}
