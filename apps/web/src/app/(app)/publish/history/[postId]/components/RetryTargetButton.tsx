"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { retryFailedTargetAction } from "../actions";

/**
 * Tombol "Coba Lagi" (T-034.4, ADR-092) — menggantikan `RetryButton` statis
 * yang sebelumnya selalu `disabled` (draft T-034.3). Desain tombol sudah
 * final & dikonfirmasi King Rezi (2026-09-08) — komponen ini murni
 * mem-fungsikannya (wiring), tidak mengubah komponen shadcn apa pun.
 *
 * Tidak memakai dialog konfirmasi (`useConfirmAction`, pola Cancel
 * Schedule di `QueueScreen.tsx`) — retry bukan aksi destruktif dua langkah
 * seperti Tier 2 (Cancel Schedule/Delete), murni memperbaiki target yang
 * sudah gagal, jadi klik langsung memicu aksi (state lokal
 * `useTransition` + `useState` untuk error, sama semangat pola
 * `useConfirmAction` tapi tanpa langkah "open"/"confirm" terpisah).
 * `revalidatePath` di `retryFailedTargetAction` sudah cukup untuk
 * merefresh badge status target — tidak perlu state hasil lokal di sini.
 */
export function RetryTargetButton({
  postId,
  targetId,
}: {
  postId: string;
  targetId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleRetry() {
    setError(null);
    startTransition(async () => {
      const result = await retryFailedTargetAction(postId, targetId);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast("Percobaan retry selesai — lihat status terbaru di daftar.");
    });
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="inline-flex">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isPending}
            onClick={handleRetry}
          >
            {isPending ? <Spinner /> : null}
            Coba Lagi
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {error ?? "Hapus percobaan gagal lalu publish ulang ke akun ini"}
      </TooltipContent>
    </Tooltip>
  );
}
