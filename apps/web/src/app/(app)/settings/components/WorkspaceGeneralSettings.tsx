"use client";

import { useState } from "react";

import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Layout, LayoutContent, LayoutFooter } from "@astryxdesign/core/Layout";
import { Selector } from "@astryxdesign/core/Selector";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";

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
 * Settings → Organization → General (T-008.4). Dua card: General (rename,
 * reversible/tanpa konfirmasi) dan Danger Zone (Owner-only, hidden total
 * untuk role selain Owner — bukan read-only, sesuai desain final di Claude
 * Design `templates/settings-general.html`).
 *
 * Danger Zone tidak punya `Card` variant "error border" di Astryx (props
 * Card cuma width/height/padding/variant warna latar, bukan border) —
 * dipakai `Banner status="error"` sebagai header section, bukan meniru
 * `border-color: var(--color-error)` mentah (yang butuh Tailwind arbitrary
 * value / swizzle, keduanya dilarang di tahap ini).
 *
 * Transfer Ownership butuh target Admin yang belum eksplisit ada di file
 * desain itu sendiri (dialognya generik "ketik nama workspace", tidak
 * menunjukkan pemilihan target) — dipilih lewat `Selector` sebelum dialog
 * Tier 1 dibuka, komposisi dari primitives yang sudah ada (Selector +
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
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState(false);

  const [isPending, setIsPending] = useState(pendingTargetName !== null);
  const [pendingName, setPendingName] = useState(pendingTargetName);
  const [dangerError, setDangerError] = useState<string | null>(null);

  const [selectedAdminId, setSelectedAdminId] = useState<string | undefined>(
    admins[0]?.id,
  );
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [transferConfirmText, setTransferConfirmText] = useState("");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  async function handleSaveName() {
    setNameError(null);
    setNameSuccess(false);
    const result = await renameWorkspaceAction(name);
    if (!result.ok) {
      setNameError(result.error);
      return;
    }
    setName(result.name);
    setNameSuccess(true);
  }

  async function handleCancelPending() {
    setDangerError(null);
    const result = await cancelOwnershipTransferAction();
    if (result.error) {
      setDangerError(result.error);
      return;
    }
    setIsPending(false);
    setPendingName(null);
  }

  async function handleConfirmTransfer() {
    if (!selectedAdminId) return;
    setDangerError(null);
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
  }

  async function handleConfirmDelete() {
    setDangerError(null);
    const result = await deleteWorkspaceAction();
    if (result?.error) {
      setDangerError(result.error);
    }
    // Kalau sukses, deleteWorkspaceAction redirect ke /onboarding — tidak
    // ada state sukses untuk dirender di sini.
  }

  const adminOptions = admins.map((admin) => ({
    value: admin.id,
    label: admin.name,
  }));

  return (
    <VStack gap={5}>
      <Card padding={4}>
        <VStack gap={4}>
          <Heading level={2}>General</Heading>

          {nameError ? <Banner status="error" title={nameError} /> : null}
          {nameSuccess ? (
            <Banner
              status="success"
              title="Nama workspace berhasil disimpan."
            />
          ) : null}

          <TextInput
            type="text"
            label="Nama Workspace"
            value={name}
            onChange={(value) => {
              setName(value);
              setNameSuccess(false);
            }}
            description="Nama ini tampil di seluruh workspace dan email notifikasi anggota."
            width="100%"
            isRequired
          />

          <HStack>
            <Button
              label="Simpan"
              variant="primary"
              clickAction={handleSaveName}
            />
          </HStack>
        </VStack>
      </Card>

      {isOwner ? (
        <Card padding={0}>
          <VStack gap={0}>
            <Banner
              status="error"
              title="Danger Zone"
              description="Tindakan di bawah ini berdampak permanen pada seluruh workspace."
              container="section"
            />

            <VStack gap={4} padding={4}>
              {dangerError ? (
                <Banner status="error" title={dangerError} />
              ) : null}

              {isPending ? (
                <Banner
                  status="warning"
                  title={`Menunggu persetujuan ${pendingName}`}
                  description="Danger Zone terkunci sampai transfer diterima atau ditolak."
                  endContent={
                    <Button
                      label="Batalkan Permintaan"
                      variant="secondary"
                      size="sm"
                      clickAction={handleCancelPending}
                    />
                  }
                />
              ) : null}

              <HStack justify="between" align="center" gap={4}>
                <VStack gap={1}>
                  <Text type="body" weight="semibold">
                    Transfer Ownership
                  </Text>
                  <Text type="supporting">
                    Serahkan kendali penuh workspace ini ke Admin lain. Admin
                    target harus menyetujui sebelum kepemilikan benar-benar
                    berpindah.
                  </Text>
                </VStack>
                <Button
                  label="Transfer Ownership"
                  variant="secondary"
                  isDisabled={isPending || admins.length === 0}
                  tooltip={
                    admins.length === 0
                      ? "Belum ada Admin aktif untuk dijadikan target."
                      : isPending
                        ? "Danger Zone terkunci selama transfer pending."
                        : undefined
                  }
                  onClick={() => setIsTransferDialogOpen(true)}
                />
              </HStack>

              <HStack justify="between" align="center" gap={4}>
                <VStack gap={1}>
                  <Text type="body" weight="semibold">
                    Hapus Workspace
                  </Text>
                  <Text type="supporting">
                    Menghapus seluruh data workspace ini secara permanen — post,
                    draft, akun terhubung, anggota, riwayat. Tidak bisa
                    dibatalkan.
                  </Text>
                </VStack>
                <Button
                  label="Hapus Workspace"
                  variant="destructive"
                  isDisabled={isPending}
                  tooltip={
                    isPending
                      ? "Danger Zone terkunci selama transfer pending."
                      : undefined
                  }
                  onClick={() => setIsDeleteDialogOpen(true)}
                />
              </HStack>
            </VStack>
          </VStack>
        </Card>
      ) : null}

      <Dialog
        isOpen={isTransferDialogOpen}
        onOpenChange={(open) => {
          setIsTransferDialogOpen(open);
          if (!open) setTransferConfirmText("");
        }}
        purpose="form"
        width={400}
      >
        <Layout
          header={
            <DialogHeader
              title="Transfer Ownership workspace ini?"
              subtitle="Admin target harus menyetujui sebelum kepemilikan benar-benar berpindah."
              onOpenChange={setIsTransferDialogOpen}
            />
          }
          content={
            <LayoutContent>
              <VStack gap={4}>
                <Selector
                  label="Pilih Admin target"
                  options={adminOptions}
                  value={selectedAdminId}
                  onChange={(value) => setSelectedAdminId(value)}
                  placeholder="Pilih Admin"
                />
                <TextInput
                  type="text"
                  label={`Ketik ${name} untuk konfirmasi`}
                  value={transferConfirmText}
                  onChange={setTransferConfirmText}
                  placeholder={name}
                  width="100%"
                />
              </VStack>
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button
                  label="Batal"
                  variant="secondary"
                  onClick={() => setIsTransferDialogOpen(false)}
                />
                <Button
                  label="Transfer Ownership"
                  variant="destructive"
                  isDisabled={transferConfirmText !== name || !selectedAdminId}
                  clickAction={handleConfirmTransfer}
                />
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>

      <Dialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setDeleteConfirmText("");
        }}
        purpose="form"
        width={400}
      >
        <Layout
          header={
            <DialogHeader
              title="Hapus workspace ini?"
              subtitle="Seluruh data — post, draft, akun terhubung, anggota, riwayat — dihapus permanen dan tidak bisa dikembalikan."
              onOpenChange={setIsDeleteDialogOpen}
            />
          }
          content={
            <LayoutContent>
              <TextInput
                type="text"
                label={`Ketik ${name} untuk konfirmasi`}
                value={deleteConfirmText}
                onChange={setDeleteConfirmText}
                placeholder={name}
                width="100%"
              />
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button
                  label="Batal"
                  variant="secondary"
                  onClick={() => setIsDeleteDialogOpen(false)}
                />
                <Button
                  label="Hapus Workspace"
                  variant="destructive"
                  isDisabled={deleteConfirmText !== name}
                  clickAction={handleConfirmDelete}
                />
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>
    </VStack>
  );
}
