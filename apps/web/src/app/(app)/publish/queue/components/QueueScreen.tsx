"use client";

import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import { Banner } from "@astryxdesign/core/Banner";
import { useToast } from "@astryxdesign/core/Toast";
import { VStack } from "@astryxdesign/core/VStack";

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
 */
export function QueueScreen({ groups }: { groups: QueueGroup[] }) {
  const showToast = useToast();
  const cancelConfirm = useConfirmAction<PostId>(cancelScheduleAction, () =>
    showToast({ body: "Jadwal dibatalkan — post kembali ke Drafts" }),
  );

  return (
    <VStack gap={4}>
      {cancelConfirm.error ? (
        <Banner status="error" title={cancelConfirm.error} />
      ) : null}

      <QueueList
        groups={groups}
        onCancelSchedule={(postId) => cancelConfirm.open(postId)}
      />

      <AlertDialog
        isOpen={cancelConfirm.isOpen}
        onOpenChange={(open) => {
          if (!open) cancelConfirm.close();
        }}
        title="Batalkan jadwal ini?"
        description="Post kembali menjadi Draft dan tidak akan dipublikasikan otomatis."
        cancelLabel="Batal"
        actionLabel="Batalkan Jadwal"
        isActionLoading={cancelConfirm.isLoading}
        onAction={cancelConfirm.confirm}
      />
    </VStack>
  );
}
