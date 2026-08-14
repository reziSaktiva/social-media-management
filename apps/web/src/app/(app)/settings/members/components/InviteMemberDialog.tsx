"use client";

import { useState } from "react";

import { MemberRole } from "@social/shared";
import { Badge } from "@astryxdesign/core/Badge";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { HStack } from "@astryxdesign/core/HStack";
import { Layout, LayoutContent, LayoutFooter } from "@astryxdesign/core/Layout";
import { RadioList, RadioListItem } from "@astryxdesign/core/RadioList";
import { Selector } from "@astryxdesign/core/Selector";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";

import { inviteMemberAction } from "../actions";

// Validasi format email di sisi UI hanya untuk gating tombol submit
// (disabled-until-valid, pola sama seperti WorkspaceGeneralSettings).
// Validasi otoritatif tetap di WorkspaceService.inviteMember (backend).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Role yang bisa dipilih saat invite — Owner tidak ditawarkan, konsisten
// dengan WorkspaceService.inviteMember yang menolak role Owner (ADR-080).
const ROLE_OPTIONS = [
  { value: MemberRole.Admin, label: "Admin" },
  { value: MemberRole.Creator, label: "Creator" },
];

type InviteMethod = "copy-link" | "email";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog "Undang Anggota Baru" (T-007.6, ADR-080). Dua metode: Copy Link
 * (aktif, default) dan Kirim via Email (disabled, badge "Segera", menunggu
 * T-005). Skeleton dialog form meniru Transfer Ownership/Delete Workspace
 * di WorkspaceGeneralSettings.tsx: Dialog purpose="form" + Layout/
 * DialogHeader/LayoutContent/LayoutFooter, tombol footer isDisabled sampai
 * form valid.
 */
export function InviteMemberDialog({ isOpen, onOpenChange }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>(MemberRole.Admin);
  const [method, setMethod] = useState<InviteMethod>("copy-link");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState("Salin");

  const isEmailValid = EMAIL_PATTERN.test(email.trim());

  function resetState() {
    setEmail("");
    setRole(MemberRole.Admin);
    setMethod("copy-link");
    setError(null);
    setInviteLink(null);
    setInvitedEmail(null);
    setCopyLabel("Salin");
  }

  async function handleSubmit() {
    if (!isEmailValid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await inviteMemberAction(email.trim(), role as MemberRole);
      if (result.error) {
        setError(result.error);
        return;
      }
      setInviteLink(result.inviteLink ?? null);
      setInvitedEmail(email.trim());
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopyLabel("Disalin!");
    setTimeout(() => setCopyLabel("Salin"), 2000);
  }

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetState();
      }}
      purpose="form"
      width={440}
    >
      <Layout
        header={
          <DialogHeader
            title="Undang Anggota Baru"
            onOpenChange={onOpenChange}
          />
        }
        content={
          <LayoutContent>
            <VStack gap={4}>
              {error ? <Banner status="error" title={error} /> : null}

              <TextInput
                type="email"
                label="Email Calon Anggota"
                value={email}
                onChange={setEmail}
                description="Link/undangan hanya bisa dipakai oleh email ini."
                placeholder="nama@perusahaan.com"
                width="100%"
                isRequired
                isDisabled={inviteLink !== null}
              />

              <Selector
                label="Role"
                options={ROLE_OPTIONS}
                value={role}
                onChange={setRole}
                placeholder="Pilih role"
                isDisabled={inviteLink !== null}
              />

              <RadioList
                label="Metode Undangan"
                value={method}
                onChange={(value) => setMethod(value as InviteMethod)}
                isDisabled={inviteLink !== null}
              >
                <RadioListItem
                  value="copy-link"
                  label="Copy Link"
                  description="Buat link undangan, lalu bagikan sendiri ke calon anggota (WhatsApp, Slack, dll)."
                />
                <RadioListItem
                  value="email"
                  label="Kirim via Email"
                  description="Undangan terkirim otomatis ke email calon anggota. Menunggu provider email disiapkan (T-005)."
                  isDisabled
                  endContent={<Badge variant="warning" label="Segera" />}
                />
              </RadioList>

              {inviteLink ? (
                <VStack gap={2}>
                  <HStack gap={2} align="end">
                    <TextInput
                      type="text"
                      label="Link Undangan"
                      value={inviteLink}
                      onChange={() => {}}
                      isDisabled
                      width="100%"
                    />
                    <Button
                      label={copyLabel}
                      variant="secondary"
                      onClick={handleCopyLink}
                    />
                  </HStack>
                  <Text type="supporting">
                    Link untuk {invitedEmail} dibuat.
                  </Text>
                </VStack>
              ) : null}
            </VStack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            {inviteLink ? (
              <Button
                label="Tutup"
                variant="secondary"
                onClick={() => onOpenChange(false)}
              />
            ) : (
              <Button
                label="Buat Link Undangan"
                variant="primary"
                isDisabled={!isEmailValid || !role}
                isLoading={isSubmitting}
                clickAction={handleSubmit}
              />
            )}
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
