"use client";

import { useState, useTransition } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { getInitials } from "@/lib/utils";

import { selectWorkspaceAction } from "./actions";

export interface WorkspaceOption {
  id: string;
  name: string;
  role: string;
}

interface Props {
  workspaces: WorkspaceOption[];
}

function formatRoleLabel(role: string): string {
  if (!role) return role;
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

/**
 * State "Pilih Workspace" di `/onboarding` (T-039.4) — user existing dengan
 * >1 membership aktif tapi cookie `active-workspace-id` hilang. Tidak ada
 * baris "Aktif" (belum ada workspace aktif sama sekali di titik ini) dan
 * tidak ada `AlertDialog` konfirmasi (beda dari `WorkspaceRow` di Settings →
 * Account → Workspaces, T-089) — klik langsung memilih, sesuai desain
 * Claude Design `templates/onboarding.html`.
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
            <Item
              key={workspace.id}
              asChild
              variant="outline"
              className="cursor-pointer hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
            >
              <button
                type="button"
                onClick={() => handleSelect(workspace.id)}
                disabled={isPending}
              >
                <ItemMedia>
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(workspace.name)}
                    </AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{workspace.name}</ItemTitle>
                  <ItemDescription>
                    {isSelecting
                      ? "Memilih workspace ini..."
                      : formatRoleLabel(workspace.role)}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    strokeWidth={2}
                    className="size-4 text-muted-foreground"
                  />
                </ItemActions>
              </button>
            </Item>
          );
        })}
      </ItemGroup>
    </div>
  );
}
