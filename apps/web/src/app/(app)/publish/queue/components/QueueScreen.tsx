"use client";

import { useState } from "react";
import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import { Banner } from "@astryxdesign/core/Banner";
import { useToast } from "@astryxdesign/core/Toast";
import { VStack } from "@astryxdesign/core/VStack";

import type { PostId } from "@social/shared";
import type { QueueGroup } from "@/domains/publishing";

import { cancelScheduleAction } from "../actions";
import { QueueList } from "./QueueList";

/**
 * Client wrapper untuk halaman Queue (T-032.4) — memisahkan state dialog
 * Cancel Schedule (T-030, ADR-049 Tier 2) dari `QueueList` supaya
 * `QueueList` tetap murni presentational + filter akun. Pola dialog persis
 * `MembersTable.tsx` (`AlertDialog` + state lokal target/loading/error).
 *
 * Copy dialog final dari mockup Claude Design (T-032.0, dikonfirmasi via
 * DesignSync): warning "Post kembali menjadi Draft dan tidak akan
 * dipublikasikan otomatis" + tombol aksi "Batalkan Jadwal" (danger).
 */
export function QueueScreen({ groups }: { groups: QueueGroup[] }) {
  const [cancelTarget, setCancelTarget] = useState<PostId | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const showToast = useToast();

  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    setIsCancelling(true);
    setCancelError(null);
    try {
      const result = await cancelScheduleAction(cancelTarget);
      if (result.error) {
        setCancelError(result.error);
        return;
      }
      setCancelTarget(null);
      showToast({ body: "Jadwal dibatalkan — post kembali ke Drafts" });
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <VStack gap={4}>
      {cancelError ? <Banner status="error" title={cancelError} /> : null}

      <QueueList
        groups={groups}
        onCancelSchedule={(postId) => {
          setCancelError(null);
          setCancelTarget(postId);
        }}
      />

      <AlertDialog
        isOpen={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        title="Batalkan jadwal ini?"
        description="Post kembali menjadi Draft dan tidak akan dipublikasikan otomatis."
        cancelLabel="Batal"
        actionLabel="Batalkan Jadwal"
        isActionLoading={isCancelling}
        onAction={handleConfirmCancel}
      />
    </VStack>
  );
}
