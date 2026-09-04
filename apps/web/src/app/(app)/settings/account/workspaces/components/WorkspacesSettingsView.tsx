"use client";

import { useState, useTransition } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";

import { getInitials } from "@/lib/utils";

import {
  SETTINGS_BREADCRUMB_GROUP,
  SettingsPageHead,
} from "../../../components/SettingsPageHead";
import { createWorkspaceAction, switchWorkspaceAction } from "../actions";

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  role: string;
  isActive: boolean;
}

interface Props {
  workspaces: WorkspaceSummary[];
}

// Label role ditampilkan title-case terlepas dari casing mentah yang
// dikirim page.tsx (MemberRole enum di packages/shared bernilai lowercase
// "owner"/"admin"/"creator") — kontrak prop di sini sengaja `role: string`
// polos (bukan import MemberRole) supaya komponen ini tidak terikat ke
// shared enum, cukup format tampilan.
function formatRoleLabel(role: string): string {
  if (!role) return role;
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

/**
 * Baris "Aktif" — non-interactive, Badge status dengan dot indikator
 * (spek: "Chip/Badge Aktif dengan dot indicator"). `Badge` shadcn tidak
 * punya varian "success" (KI-041, Stone theme belum punya token
 * `--success`) — dipetakan ke "secondary" (netral, bukan mengarang warna
 * hijau baru), dot indikatornya cukup `bg-foreground/60` (turunan token
 * netral yang sudah ada, bukan token warna baru).
 */
function ActiveBadge() {
  return (
    <Badge variant="secondary">
      <span aria-hidden className="size-1.5 rounded-full bg-foreground/60" />
      Aktif
    </Badge>
  );
}

function WorkspaceRow({
  workspace,
  isSwitchPending,
  onRequestSwitch,
}: {
  workspace: WorkspaceSummary;
  isSwitchPending: boolean;
  onRequestSwitch: (workspace: WorkspaceSummary) => void;
}) {
  if (workspace.isActive) {
    return (
      <Item>
        <ItemMedia>
          <Avatar>
            <AvatarFallback>{getInitials(workspace.name)}</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{workspace.name}</ItemTitle>
          <ItemDescription>{formatRoleLabel(workspace.role)}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ActiveBadge />
        </ItemActions>
      </Item>
    );
  }

  return (
    <Item
      asChild
      variant="outline"
      className="cursor-pointer hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
    >
      <button
        type="button"
        onClick={() => onRequestSwitch(workspace)}
        disabled={isSwitchPending}
      >
        <ItemMedia>
          <Avatar>
            <AvatarFallback>{getInitials(workspace.name)}</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{workspace.name}</ItemTitle>
          <ItemDescription>
            {isSwitchPending
              ? "Memindahkan ke workspace ini..."
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
}

/**
 * View Settings → Account → Workspaces (T-089.3/.4, ADR-088, migrasi
 * shadcn/ui T-099.3). Client Component murni presentasi + orkestrasi
 * Server Action — semua validasi membership/role tetap di
 * `WorkspaceService` (dipanggil lewat `switchWorkspaceAction`/
 * `createWorkspaceAction` di `../actions`).
 *
 * Baris workspace non-aktif dirender lewat `Item asChild` membungkus
 * `<button>` (pola sama seperti contoh resmi shadcn `item-demo`, varian
 * `asChild` + `<a>`) — seluruh baris jadi target klik, bukan cuma ikon
 * chevron-nya.
 */
export function WorkspacesSettingsView({ workspaces }: Props) {
  const [isSwitchPending, startSwitchTransition] = useTransition();
  const [switchingWorkspaceId, setSwitchingWorkspaceId] = useState<
    string | null
  >(null);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [pendingSwitchWorkspace, setPendingSwitchWorkspace] =
    useState<WorkspaceSummary | null>(null);
  const [lastSwitchTargetName, setLastSwitchTargetName] = useState("");

  function handleRequestSwitch(workspace: WorkspaceSummary) {
    setPendingSwitchWorkspace(workspace);
    setLastSwitchTargetName(workspace.name);
  }

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreatePending, startCreateTransition] = useTransition();
  const [createError, setCreateError] = useState<string | null>(null);

  function handleSwitch(targetWorkspaceId: string) {
    setSwitchError(null);
    setSwitchingWorkspaceId(targetWorkspaceId);
    startSwitchTransition(async () => {
      const result = await switchWorkspaceAction(targetWorkspaceId);
      if (result?.error) {
        setSwitchError(result.error);
        setSwitchingWorkspaceId(null);
        setPendingSwitchWorkspace(null);
      }
      // Kalau sukses: Server Action redirect("/") di server, komponen ini
      // akan unmount — tidak perlu reset state manual.
    });
  }

  function resetDialogState() {
    setNewWorkspaceName("");
    setCreateError(null);
  }

  function handleCloseDialog() {
    setDialogOpen(false);
    resetDialogState();
  }

  function handleCreate() {
    const name = newWorkspaceName.trim();
    if (!name) return;
    setCreateError(null);
    startCreateTransition(async () => {
      const result = await createWorkspaceAction(name);
      if (result?.error) {
        setCreateError(result.error);
      }
      // Sukses: Server Action redirect("/") di server.
    });
  }

  return (
    /* eslint-disable-next-line no-restricted-syntax -- T-099.3: file ini
       sudah dimigrasi ke komposisi Tailwind shadcn (ADR-097), bukan lagi
       VStack Astryx. */
    <div className="flex flex-col gap-4 p-4">
      <SettingsPageHead
        pageName="Workspaces"
        breadcrumb={`${SETTINGS_BREADCRUMB_GROUP.account} / Workspaces`}
        action={
          <Button type="button" onClick={() => setDialogOpen(true)}>
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
            Buat Workspace Baru
          </Button>
        }
      />

      {switchError ? (
        <Alert variant="destructive">
          <AlertTitle>{switchError}</AlertTitle>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Workspace Anda</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <ItemGroup className="gap-0 divide-y divide-border">
            {workspaces.map((workspace) => (
              <WorkspaceRow
                key={workspace.id}
                workspace={workspace}
                isSwitchPending={
                  isSwitchPending && switchingWorkspaceId === workspace.id
                }
                onRequestSwitch={handleRequestSwitch}
              />
            ))}
          </ItemGroup>
        </CardContent>
      </Card>

      <AlertDialog
        open={pendingSwitchWorkspace !== null}
        onOpenChange={(open) => {
          if (!open && !isSwitchPending) setPendingSwitchWorkspace(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {`Pindah ke workspace ${
                pendingSwitchWorkspace?.name ?? lastSwitchTargetName
              }?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan keluar dari workspace saat ini dan berpindah konteks
              kerja.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={
                isSwitchPending &&
                switchingWorkspaceId === pendingSwitchWorkspace?.id
              }
              onClick={(e) => {
                e.preventDefault();
                if (pendingSwitchWorkspace)
                  handleSwitch(pendingSwitchWorkspace.id);
              }}
            >
              {isSwitchPending &&
              switchingWorkspaceId === pendingSwitchWorkspace?.id ? (
                <Spinner />
              ) : null}
              Pindah
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetDialogState();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Workspace Baru</DialogTitle>
            <DialogDescription>
              Workspace baru akan langsung aktif dan Anda pindah ke sana setelah
              dibuat.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            {createError ? (
              <Alert variant="destructive">
                <AlertTitle>{createError}</AlertTitle>
              </Alert>
            ) : null}

            <Field>
              <FieldLabel htmlFor="new-workspace-name">
                Nama Workspace
              </FieldLabel>
              <Input
                id="new-workspace-name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="Roti Selasar"
                required
                disabled={isCreatePending}
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseDialog}
              disabled={isCreatePending}
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={!newWorkspaceName.trim() || isCreatePending}
              onClick={handleCreate}
            >
              {isCreatePending ? <Spinner /> : null}
              Buat Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
