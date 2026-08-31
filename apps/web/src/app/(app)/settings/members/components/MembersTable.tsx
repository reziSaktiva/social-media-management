"use client";

import type { ReactNode } from "react";

import { MemberRole, MemberStatus } from "@social/shared";
import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Badge } from "@astryxdesign/core/Badge";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { DropdownMenu } from "@astryxdesign/core/DropdownMenu";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { HStack } from "@astryxdesign/core/HStack";
import { Section } from "@astryxdesign/core/Section";
import { pixel, proportional, Table } from "@astryxdesign/core/Table";
import type { TableColumn } from "@astryxdesign/core/Table";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

import {
  MEMBER_ROLE_LABEL,
  type WorkspaceMemberWithUser,
} from "@/domains/workspace";
import { useConfirmAction } from "@/lib/hooks/use-confirm-action";

import {
  SETTINGS_BREADCRUMB_GROUP,
  SettingsPageHead,
} from "../../components/SettingsPageHead";
import { removeMemberAction, updateMemberRoleAction } from "../actions";

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
          label: MEMBER_ROLE_LABEL[role],
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
        <Badge variant="neutral" label={MEMBER_ROLE_LABEL[member.role]} />
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
      width: pixel(240),
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
  const removeConfirm = useConfirmAction<WorkspaceMemberWithUser>((member) =>
    removeMemberAction(member.id),
  );

  const roleConfirm = useConfirmAction<{
    member: WorkspaceMemberWithUser;
    newRole: MemberRole;
  }>((change) => updateMemberRoleAction(change.member.id, change.newRole));

  return (
    <VStack gap={4} padding={4}>
      <SettingsPageHead
        pageName="Members"
        breadcrumb={`${SETTINGS_BREADCRUMB_GROUP.organization} / Members`}
        action={headerAction}
      />

      {removeConfirm.error ? (
        <Banner status="error" title={removeConfirm.error} />
      ) : null}
      {roleConfirm.error ? (
        <Banner status="error" title={roleConfirm.error} />
      ) : null}

      <Section>
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
              (member) => removeConfirm.open(member),
              (member, newRole) => roleConfirm.open({ member, newRole }),
            )}
            idKey="id"
            density="balanced"
            dividers="rows"
          />
        )}
      </Section>

      <AlertDialog
        isOpen={removeConfirm.isOpen}
        onOpenChange={(open) => {
          if (!open) removeConfirm.close();
        }}
        title="Keluarkan anggota ini?"
        description={
          removeConfirm.target
            ? `Keluarkan ${removeConfirm.target.name} dari workspace ini? Mereka akan kehilangan akses (ADR-049, Tier 2).`
            : ""
        }
        cancelLabel="Batal"
        actionLabel="Keluarkan"
        isActionLoading={removeConfirm.isLoading}
        onAction={removeConfirm.confirm}
      />

      <AlertDialog
        isOpen={roleConfirm.isOpen}
        onOpenChange={(open) => {
          if (!open) roleConfirm.close();
        }}
        title="Ubah role anggota ini?"
        description={
          roleConfirm.target
            ? `Ubah role ${roleConfirm.target.member.name} dari ${MEMBER_ROLE_LABEL[roleConfirm.target.member.role]} ke ${MEMBER_ROLE_LABEL[roleConfirm.target.newRole]}?`
            : ""
        }
        cancelLabel="Batal"
        actionLabel="Ubah Role"
        actionVariant="primary"
        isActionLoading={roleConfirm.isLoading}
        onAction={roleConfirm.confirm}
      />
    </VStack>
  );
}
