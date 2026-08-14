"use client";

import { useState } from "react";

import { Button } from "@astryxdesign/core/Button";

import { InviteMemberDialog } from "./InviteMemberDialog";

/**
 * Tombol "+ Invite Member" (T-007.6, ADR-080), dirender sebagai `headerAction`
 * MembersTable — sejajar Heading "Members" yang sudah ada di sana (bukan
 * heading terpisah, supaya tidak duplikat dengan Section title MembersTable).
 */
export function InviteMemberAction() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  return (
    <>
      <Button
        label="+ Invite Member"
        variant="primary"
        onClick={() => setIsInviteOpen(true)}
      />

      <InviteMemberDialog
        isOpen={isInviteOpen}
        onOpenChange={setIsInviteOpen}
      />
    </>
  );
}
