"use client";

import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

import { useToast } from "@astryxdesign/core/Toast";

import type { PostId } from "@social/shared";
import type { QueueGroup } from "@/domains/publishing";
import { useConfirmAction } from "@/lib/hooks/use-confirm-action";

import { cancelScheduleAction } from "../actions";
import { QueueList } from "./QueueList";

/**
 * Client wrapper untuk halaman Queue (T-032.4) — memisahkan state dialog
 * Cancel Schedule (T-030, ADR-049 Tier 2) dari `QueueList` supaya
 * `QueueList` tetap murni presentational + filter akun. Pola dialog persis
 * `MembersTable.tsx`, sekarang lewat hook bersama `useConfirmAction`.
 *
 * Copy dialog final dari mockup Claude Design (T-032.0, dikonfirmasi via
 * DesignSync): warning "Post kembali menjadi Draft dan tidak akan
 * dipublikasikan otomatis" + tombol aksi "Batalkan Jadwal" (danger).
 *
 * T-101.2: migrasi Astryx `AlertDialog`/`Banner`/`VStack` ke shadcn
 * `AlertDialog` (pola `AlertDialogAction` + `e.preventDefault()` supaya
 * dialog tetap terbuka sampai `confirm()` selesai, persis
 * `MembersTable.tsx` T-099.2) + `Alert variant="destructive"` untuk pesan
 * error, dibungkus Tailwind `flex flex-col gap-4` (layout-only).
 * `useToast` SENGAJA tetap `@astryxdesign/core/Toast` — belum ada padanan
 * shadcn toast (`sonner`/`toast`) di-install di `components/ui/` mana pun
 * di seluruh app (dicek grep, ini satu-satunya titik pakai), jadi migrasi
 * toast di luar scope T-101.2 (perlu keputusan sistem toast baru, bukan
 * satu file) — dilaporkan sebagai gap, bukan diputuskan sepihak.
 */
export function QueueScreen({ groups }: { groups: QueueGroup[] }) {
  const showToast = useToast();
  const cancelConfirm = useConfirmAction<PostId>(cancelScheduleAction, () =>
    showToast({ body: "Jadwal dibatalkan — post kembali ke Drafts" }),
  );

  return (
    // eslint-disable-next-line no-restricted-syntax -- T-101.2: layout-only, file sudah dimigrasi shadcn
    <div className="flex flex-col gap-4">
      {cancelConfirm.error ? (
        <Alert variant="destructive">
          <AlertTitle>{cancelConfirm.error}</AlertTitle>
        </Alert>
      ) : null}

      <QueueList
        groups={groups}
        onCancelSchedule={(postId) => cancelConfirm.open(postId)}
      />

      <AlertDialog
        open={cancelConfirm.isOpen}
        onOpenChange={(open) => {
          if (!open) cancelConfirm.close();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan jadwal ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Post kembali menjadi Draft dan tidak akan dipublikasikan otomatis.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelConfirm.isLoading}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={cancelConfirm.isLoading}
              onClick={(e) => {
                e.preventDefault();
                void cancelConfirm.confirm();
              }}
            >
              {cancelConfirm.isLoading ? <Spinner /> : null}
              Batalkan Jadwal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
