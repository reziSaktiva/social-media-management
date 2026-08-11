"use client";

import { MemberRole, MemberStatus } from "@social/shared";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { pixel, proportional, Table } from "@astryxdesign/core/Table";
import type { TableColumn } from "@astryxdesign/core/Table";
import { Section } from "@astryxdesign/core/Section";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

import type { WorkspaceMemberWithUser } from "@/domains/workspace";

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

/**
 * Row berupa Owner atau baris milik diri sendiri tidak boleh punya aksi:
 * Owner tidak bisa diubah/dihapus, dan user tidak bisa remove/downgrade
 * dirinya sendiri. Kedua tombol yang ditampilkan (kalau ada) disabled
 * karena dialog konfirmasinya masih T-007.5.
 */
function MemberActions({
  member,
  currentUserId,
}: {
  member: WorkspaceMemberWithUser;
  currentUserId: string;
}) {
  if (member.role === MemberRole.Owner || member.userId === currentUserId) {
    return null;
  }

  return (
    <HStack gap={2} align="center">
      <Button
        label="Change Role"
        variant="secondary"
        size="sm"
        isDisabled
        tooltip="Tersedia setelah T-007.5 selesai"
      />
      <Button
        label="Remove"
        variant="secondary"
        size="sm"
        isDisabled
        tooltip="Tersedia setelah T-007.5 selesai"
      />
    </HStack>
  );
}

interface MemberRow extends Record<string, unknown>, WorkspaceMemberWithUser {}

function buildColumns(currentUserId: string): TableColumn<MemberRow>[] {
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
      width: pixel(160),
      align: "end",
      renderCell: (member) => (
        <MemberActions member={member} currentUserId={currentUserId} />
      ),
    },
  ];
}

export function MembersTable({
  members,
  currentUserId,
}: {
  members: WorkspaceMemberWithUser[];
  currentUserId: string;
}) {
  return (
    <Section>
      <VStack gap={4}>
        <Heading level={2}>Members</Heading>

        {members.length === 0 ? (
          <EmptyState
            title="Belum ada anggota"
            description="Workspace ini belum memiliki anggota."
            isCompact
          />
        ) : (
          <Table
            data={members as MemberRow[]}
            columns={buildColumns(currentUserId)}
            idKey="id"
            density="balanced"
            dividers="rows"
          />
        )}
      </VStack>
    </Section>
  );
}
