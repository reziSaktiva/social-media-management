"use client";

import { useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";

import { InviteMemberDialog } from "./InviteMemberDialog";

/**
 * Tombol "Invite Member" (T-007.6, ADR-080, migrasi shadcn/ui T-099.2),
 * dirender sebagai `headerAction` MembersTable — sejajar heading "Settings —
 * Members" yang sudah ada di sana (bukan heading terpisah, supaya tidak
 * duplikat dengan `SettingsPageHead`). Label literal "+ Invite Member"
 * (Astryx) diganti ikon `PlusSignIcon` (hugeicons, default preset Maia
 * untuk komponen baru) + teks, bukan lagi karakter "+" mentah di dalam
 * string label.
 */
export function InviteMemberAction() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setIsInviteOpen(true)}>
        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
        Invite Member
      </Button>

      <InviteMemberDialog
        isOpen={isInviteOpen}
        onOpenChange={setIsInviteOpen}
      />
    </>
  );
}
