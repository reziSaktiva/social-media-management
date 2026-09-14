"use client";

import { useState, useTransition } from "react";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { ItemGroup } from "@/components/ui/item";
import { WorkspacePickableRow } from "@/components/workspace/WorkspacePickableRow";

import { selectWorkspaceAction } from "./actions";

export interface WorkspaceOption {
  id: string;
  name: string;
  role: string;
}

interface Props {
  workspaces: WorkspaceOption[];
}

/**
 * State "Pilih Workspace" di `/onboarding` (T-039.4) — user existing dengan
 * >1 membership aktif tapi cookie `active-workspace-id` hilang. Tidak ada
 * baris "Aktif" (belum ada workspace aktif sama sekali di titik ini) dan
 * tidak ada `AlertDialog` konfirmasi (beda dari `WorkspaceRow` di Settings →
 * Account → Workspaces, T-089) — klik langsung memilih, sesuai desain
 * Claude Design `templates/onboarding.html`. Baris workspace direuse dari
 * `WorkspacePickableRow` (dibagi dengan `WorkspacesSettingsView`, code
 * review PR #109) — hanya orkestrasi klik (langsung pilih di sini, dialog
 * konfirmasi di Settings) yang beda, bukan markup barisnya.
 */
export function WorkspacePicker({ workspaces }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSelect(workspaceId: string) {
    setError(null);
    setSelectingId(workspaceId);
    startTransition(async () => {
      const result = await selectWorkspaceAction(workspaceId);
      if (result?.error) {
        setError(result.error);
        setSelectingId(null);
      }
      // Sukses: Server Action redirect("/") di server.
    });
  }

  return (
    // eslint-disable-next-line no-restricted-syntax -- T-039.4: file ini dikomposisi Tailwind shadcn (ADR-097) sejak awal, sama seperti WorkspacesSettingsView (T-099.3).
    <div className="flex flex-col gap-4">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      ) : null}

      <ItemGroup className="gap-2">
        {workspaces.map((workspace) => {
          const isSelecting = isPending && selectingId === workspace.id;
          return (
            <WorkspacePickableRow
              key={workspace.id}
              name={workspace.name}
              role={workspace.role}
              pendingLabel={isSelecting ? "Memilih workspace ini..." : null}
              disabled={isPending}
              onClick={() => handleSelect(workspace.id)}
            />
          );
        })}
      </ItemGroup>
    </div>
  );
}
