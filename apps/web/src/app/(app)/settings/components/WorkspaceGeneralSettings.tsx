"use client";

import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  cancelOwnershipTransferAction,
  deleteWorkspaceAction,
  renameWorkspaceAction,
  transferOwnershipAction,
} from "../actions";

interface AdminOption {
  id: string;
  name: string;
}

interface Props {
  workspaceName: string;
  isOwner: boolean;
  pendingTargetName: string | null;
  admins: AdminOption[];
}

/**
 * Settings → Organization → General (T-008.4, migrasi shadcn/ui T-099.1).
 * Dua card: General (rename, reversible/tanpa konfirmasi) dan Danger Zone
 * (Owner-only, hidden total untuk role selain Owner — bukan read-only,
 * sesuai desain final di Claude Design `templates/settings-general.html`).
 *
 * Danger Zone header sebelumnya (Astryx) pakai `Banner status="error"
 * container="section"` — shadcn `Alert` cuma py`variant` "default"/
 * "destructive" (tanpa varian "section header"), jadi dipakai `Alert
 * variant="destructive"` biasa berisi judul+deskripsi, cukup untuk maksud
 * yang sama (penanda visual area berbahaya) tanpa mengarang varian baru.
 *
 * Transfer Ownership butuh target Admin yang belum eksplisit ada di file
 * desain itu sendiri (dialognya generik "ketik nama workspace", tidak
 * menunjukkan pemilihan target) — dipilih lewat `Select` sebelum dialog
 * Tier 1 dibuka, komposisi dari primitives yang sudah ada (Select +
 * Dialog), bukan komponen baru. Gap ini dilaporkan ke King Rezi di
 * ringkasan kerja, bukan diputuskan sendiri sebagai final.
 */
export function WorkspaceGeneralSettings({
  workspaceName,
  isOwner,
  pendingTargetName,
  admins,
}: Props) {
  const [name, setName] = useState(workspaceName);
  // Nama tersimpan (bukan draft input di atas) — dipakai sebagai target
  // perbandingan dialog Tier 1 "ketik nama workspace", supaya draft yang
  // belum disimpan tidak bisa dipakai untuk melewati konfirmasi.
  const [savedName, setSavedName] = useState(workspaceName);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);

  const [isPending, setIsPending] = useState(pendingTargetName !== null);
  const [pendingName, setPendingName] = useState(pendingTargetName);
  const [dangerError, setDangerError] = useState<string | null>(null);
  const [isCancelingPending, setIsCancelingPending] = useState(false);

  const [selectedAdminId, setSelectedAdminId] = useState<string | undefined>(
    admins[0]?.id,
  );
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [transferConfirmText, setTransferConfirmText] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSaveName() {
    setNameError(null);
    setNameSuccess(false);
    setIsSavingName(true);
    try {
      const result = await renameWorkspaceAction(name);
      if (!result.ok) {
        setNameError(result.error);
        return;
      }
      setName(result.name);
      setSavedName(result.name);
      setNameSuccess(true);
    } finally {
      setIsSavingName(false);
    }
  }

  async function handleCancelPending() {
    setDangerError(null);
    setIsCancelingPending(true);
    try {
      const result = await cancelOwnershipTransferAction();
      if (result.error) {
        setDangerError(result.error);
        return;
      }
      setIsPending(false);
      setPendingName(null);
    } finally {
      setIsCancelingPending(false);
    }
  }

  async function handleConfirmTransfer() {
    if (!selectedAdminId) return;
    setDangerError(null);
    setIsTransferring(true);
    try {
      const result = await transferOwnershipAction(selectedAdminId);
      if (result.error) {
        setDangerError(result.error);
        return;
      }
      const target = admins.find((admin) => admin.id === selectedAdminId);
      setIsPending(true);
      setPendingName(target?.name ?? "Admin");
      setIsTransferDialogOpen(false);
      setTransferConfirmText("");
    } finally {
      setIsTransferring(false);
    }
  }

  async function handleConfirmDelete() {
    setDangerError(null);
    setIsDeleting(true);
    try {
      const result = await deleteWorkspaceAction();
      if (result?.error) {
        setDangerError(result.error);
      }
      // Kalau sukses, deleteWorkspaceAction redirect ke /onboarding — tidak
      // ada state sukses untuk dirender di sini.
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    /* eslint-disable-next-line no-restricted-syntax -- T-099.1: file ini
       sudah dimigrasi ke komposisi Tailwind shadcn (ADR-097), bukan lagi
       VStack Astryx. */
    <div className="flex flex-col gap-5">
      <Card>
        <CardContent>
          <FieldGroup>
            <h3 className="font-heading text-base font-medium">General</h3>

            {nameError ? (
              <Alert variant="destructive">
                <AlertTitle>{nameError}</AlertTitle>
              </Alert>
            ) : null}
            {nameSuccess ? (
              <Alert>
                <AlertTitle>Nama workspace berhasil disimpan.</AlertTitle>
              </Alert>
            ) : null}

            <Field>
              <FieldLabel htmlFor="workspace-name">Nama Workspace</FieldLabel>
              <Input
                id="workspace-name"
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameSuccess(false);
                }}
              />
              <FieldDescription>
                Nama ini tampil di seluruh workspace dan email notifikasi
                anggota.
              </FieldDescription>
            </Field>

            <Field>
              <Button
                type="button"
                disabled={isSavingName}
                onClick={handleSaveName}
              >
                {isSavingName ? <Spinner /> : null}
                Simpan
              </Button>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {isOwner ? (
        <Card className="border-destructive/30">
          <CardContent>
            {/* eslint-disable-next-line no-restricted-syntax -- T-099.1, sama seperti di atas */}
            <div className="flex flex-col gap-4">
              <Alert variant="destructive">
                <AlertTitle>Danger Zone</AlertTitle>
                <AlertDescription>
                  Tindakan di bawah ini berdampak permanen pada seluruh
                  workspace.
                </AlertDescription>
              </Alert>

              {dangerError ? (
                <Alert variant="destructive">
                  <AlertTitle>{dangerError}</AlertTitle>
                </Alert>
              ) : null}

              {isPending ? (
                // eslint-disable-next-line no-restricted-syntax -- T-099.1, sama seperti di atas
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/50 px-4 py-3">
                  <Text variant="small">
                    Menunggu persetujuan {pendingName}. Danger Zone terkunci
                    sampai transfer diterima atau ditolak.
                  </Text>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isCancelingPending}
                    onClick={handleCancelPending}
                  >
                    {isCancelingPending ? <Spinner /> : null}
                    Batalkan Permintaan
                  </Button>
                </div>
              ) : null}

              {/* eslint-disable-next-line no-restricted-syntax -- T-099.1, sama seperti di atas */}
              <div className="flex items-center justify-between gap-4">
                {/* eslint-disable-next-line no-restricted-syntax -- T-099.1, sama seperti di atas */}
                <div className="flex flex-col gap-1">
                  <Text variant="small">Transfer Ownership</Text>
                  <Text variant="muted">
                    Serahkan kendali penuh workspace ini ke Admin lain. Admin
                    target harus menyetujui sebelum kepemilikan benar-benar
                    berpindah.
                  </Text>
                </div>
                {admins.length === 0 || isPending ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0} className="inline-flex">
                        <Button
                          type="button"
                          variant="secondary"
                          disabled
                          className="pointer-events-none"
                        >
                          Transfer Ownership
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {admins.length === 0
                        ? "Belum ada Admin aktif untuk dijadikan target."
                        : "Danger Zone terkunci selama transfer pending."}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsTransferDialogOpen(true)}
                  >
                    Transfer Ownership
                  </Button>
                )}
              </div>

              {/* eslint-disable-next-line no-restricted-syntax -- T-099.1, sama seperti di atas */}
              <div className="flex items-center justify-between gap-4">
                {/* eslint-disable-next-line no-restricted-syntax -- T-099.1, sama seperti di atas */}
                <div className="flex flex-col gap-1">
                  <Text variant="small">Hapus Workspace</Text>
                  <Text variant="muted">
                    Menghapus seluruh data workspace ini secara permanen — post,
                    draft, akun terhubung, anggota, riwayat. Tidak bisa
                    dibatalkan.
                  </Text>
                </div>
                {isPending ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0} className="inline-flex">
                        <Button
                          type="button"
                          variant="destructive"
                          disabled
                          className="pointer-events-none"
                        >
                          Hapus Workspace
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Danger Zone terkunci selama transfer pending.
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    Hapus Workspace
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Dialog
        open={isTransferDialogOpen}
        onOpenChange={(open) => {
          setIsTransferDialogOpen(open);
          if (!open) setTransferConfirmText("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Ownership workspace ini?</DialogTitle>
            <DialogDescription>
              Admin target harus menyetujui sebelum kepemilikan benar-benar
              berpindah.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="transfer-target-admin">
                Pilih Admin target
              </FieldLabel>
              <Select
                value={selectedAdminId}
                onValueChange={setSelectedAdminId}
              >
                <SelectTrigger id="transfer-target-admin" className="w-full">
                  <SelectValue placeholder="Pilih Admin" />
                </SelectTrigger>
                <SelectContent>
                  {admins.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="transfer-confirm-text">
                Ketik {savedName} untuk konfirmasi
              </FieldLabel>
              <Input
                id="transfer-confirm-text"
                type="text"
                value={transferConfirmText}
                onChange={(e) => setTransferConfirmText(e.target.value)}
                placeholder={savedName}
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsTransferDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={
                transferConfirmText !== savedName ||
                !selectedAdminId ||
                isTransferring
              }
              onClick={handleConfirmTransfer}
            >
              {isTransferring ? <Spinner /> : null}
              Transfer Ownership
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setDeleteConfirmText("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus workspace ini?</DialogTitle>
            <DialogDescription>
              Seluruh data — post, draft, akun terhubung, anggota, riwayat —
              dihapus permanen dan tidak bisa dikembalikan.
            </DialogDescription>
          </DialogHeader>

          <Field>
            <FieldLabel htmlFor="delete-confirm-text">
              Ketik {savedName} untuk konfirmasi
            </FieldLabel>
            <Input
              id="delete-confirm-text"
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={savedName}
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteConfirmText !== savedName || isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? <Spinner /> : null}
              Hapus Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
