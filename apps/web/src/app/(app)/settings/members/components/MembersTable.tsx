"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { MemberRole, MemberStatus } from "@social/shared";
import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Badge } from "@astryxdesign/core/Badge";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { DropdownMenu } from "@astryxdesign/core/DropdownMenu";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { pixel, proportional, Table } from "@astryxdesign/core/Table";
import type { TableColumn } from "@astryxdesign/core/Table";
import { Section } from "@astryxdesign/core/Section";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

import type { WorkspaceMemberWithUser } from "@/domains/workspace";

import { removeMemberAction, updateMemberRoleAction } from "../actions";

const ROLE_LABEL: Record<MemberRole, string> = {
  [MemberRole.Owner]: "Owner",
  [MemberRole.Admin]: "Admin",
  [MemberRole.Creator]: "Creator",
};

const STATUS_LABEL: Record<MemberStatus, string> = {
  [MemberStatus.Active]: "Active",
  [MemberStatus.Pending]: "Pending",
  [MemberStatus.Removed]: "Removed",
};

const STATUS_BADGE_VARIANT: Record<MemberStatus, "neutral" | "warning"> = {
  [MemberStatus.Active]: "neutral",
  [MemberStatus.Pending]: "warning",
  [MemberStatus.Removed]: "neutral",
};

// Role yang bisa ditetapkan lewat "Change Role" — Owner tidak termasuk,
// karena perpindahan ke Owner hanya lewat alur Transfer Ownership (T-008.3),
// bukan lewat aksi member biasa di sini.
const ASSIGNABLE_ROLES = [MemberRole.Admin, MemberRole.Creator];

/**
 * Row berupa Owner atau baris milik diri sendiri tidak boleh punya aksi:
 * Owner tidak bisa diubah/dihapus, dan user tidak bisa remove/downgrade
 * dirinya sendiri.
 *
 * Konfirmasi (T-007.5, ADR-049 Tier 2): "Change Role" menampilkan pilihan
 * role via DropdownMenu (bukan langsung apply), lalu membuka AlertDialog
 * konfirmasi sebelum memanggil updateMemberRoleAction — role target belum
 * berubah tampilannya di mana pun sebelum dikonfirmasi, jadi tidak ada
 * state optimistic yang perlu di-revert kalau user Batal. "Remove" membuka
 * AlertDialog konfirmasi sebelum memanggil removeMemberAction.
 */
function MemberActions({
  member,
  currentUserId,
  onRequestRemove,
  onRequestRoleChange,
}: {
  member: WorkspaceMemberWithUser;
  currentUserId: string;
  onRequestRemove: (member: WorkspaceMemberWithUser) => void;
  onRequestRoleChange: (
    member: WorkspaceMemberWithUser,
    newRole: MemberRole,
  ) => void;
}) {
  if (member.role === MemberRole.Owner || member.userId === currentUserId) {
    return null;
  }

  const roleOptions = ASSIGNABLE_ROLES.filter((role) => role !== member.role);

  return (
    <HStack gap={2} align="center">
      <DropdownMenu
        button={{ label: "Change Role", variant: "secondary", size: "sm" }}
        items={roleOptions.map((role) => ({
          label: ROLE_LABEL[role],
          onClick: () => onRequestRoleChange(member, role),
        }))}
      />
      <Button
        label="Remove"
        variant="destructive"
        size="sm"
        onClick={() => onRequestRemove(member)}
      />
    </HStack>
  );
}

interface MemberRow extends Record<string, unknown>, WorkspaceMemberWithUser {}

function buildColumns(
  currentUserId: string,
  onRequestRemove: (member: WorkspaceMemberWithUser) => void,
  onRequestRoleChange: (
    member: WorkspaceMemberWithUser,
    newRole: MemberRole,
  ) => void,
): TableColumn<MemberRow>[] {
  return [
    {
      key: "member",
      header: "Member",
      width: proportional(2),
      renderCell: (member) => (
        <HStack gap={3} align="center">
          <Avatar name={member.name} size="md" />
          <VStack gap={0}>
            <Text type="body">{member.name}</Text>
            <Text type="supporting">{member.email}</Text>
          </VStack>
        </HStack>
      ),
    },
    {
      key: "role",
      header: "Role",
      width: proportional(1),
      renderCell: (member) => (
        <Badge variant="neutral" label={ROLE_LABEL[member.role]} />
      ),
    },
    {
      key: "status",
      header: "Status",
      width: proportional(1),
      renderCell: (member) => (
        <Badge
          variant={STATUS_BADGE_VARIANT[member.status]}
          label={STATUS_LABEL[member.status]}
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: pixel(180),
      align: "end",
      renderCell: (member) => (
        <MemberActions
          member={member}
          currentUserId={currentUserId}
          onRequestRemove={onRequestRemove}
          onRequestRoleChange={onRequestRoleChange}
        />
      ),
    },
  ];
}

export function MembersTable({
  members,
  currentUserId,
  headerAction,
}: {
  members: WorkspaceMemberWithUser[];
  currentUserId: string;
  headerAction?: ReactNode;
}) {
  const [removeTarget, setRemoveTarget] =
    useState<WorkspaceMemberWithUser | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const [roleChange, setRoleChange] = useState<{
    member: WorkspaceMemberWithUser;
    newRole: MemberRole;
  } | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  async function handleConfirmRemove() {
    if (!removeTarget) return;
    setIsRemoving(true);
    setRemoveError(null);
    try {
      const result = await removeMemberAction(removeTarget.id);
      if (result.error) {
        setRemoveError(result.error);
        return;
      }
      setRemoveTarget(null);
    } finally {
      setIsRemoving(false);
    }
  }

  async function handleConfirmRoleChange() {
    if (!roleChange) return;
    setIsUpdatingRole(true);
    setRoleError(null);
    try {
      const result = await updateMemberRoleAction(
        roleChange.member.id,
        roleChange.newRole,
      );
      if (result.error) {
        setRoleError(result.error);
        return;
      }
      setRoleChange(null);
    } finally {
      setIsUpdatingRole(false);
    }
  }

  return (
    <Section>
      <VStack gap={4}>
        <HStack justify="between" align="center">
          <Heading level={2}>Members</Heading>
          {headerAction}
        </HStack>

        {removeError ? <Banner status="error" title={removeError} /> : null}
        {roleError ? <Banner status="error" title={roleError} /> : null}

        {members.length === 0 ? (
          <EmptyState
            title="Belum ada anggota"
            description="Workspace ini belum memiliki anggota."
            isCompact
          />
        ) : (
          <Table
            data={members as MemberRow[]}
            columns={buildColumns(
              currentUserId,
              (member) => {
                setRemoveError(null);
                setRemoveTarget(member);
              },
              (member, newRole) => {
                setRoleError(null);
                setRoleChange({ member, newRole });
              },
            )}
            idKey="id"
            density="balanced"
            dividers="rows"
          />
        )}
      </VStack>

      <AlertDialog
        isOpen={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
        title="Keluarkan anggota ini?"
        description={
          removeTarget
            ? `Keluarkan ${removeTarget.name} dari workspace ini? Mereka akan kehilangan akses (ADR-049, Tier 2).`
            : ""
        }
        cancelLabel="Batal"
        actionLabel="Keluarkan"
        isActionLoading={isRemoving}
        onAction={handleConfirmRemove}
      />

      <AlertDialog
        isOpen={roleChange !== null}
        onOpenChange={(open) => {
          if (!open) setRoleChange(null);
        }}
        title="Ubah role anggota ini?"
        description={
          roleChange
            ? `Ubah role ${roleChange.member.name} dari ${ROLE_LABEL[roleChange.member.role]} ke ${ROLE_LABEL[roleChange.newRole]}?`
            : ""
        }
        cancelLabel="Batal"
        actionLabel="Ubah Role"
        actionVariant="primary"
        isActionLoading={isUpdatingRole}
        onAction={handleConfirmRoleChange}
      />
    </Section>
  );
}
