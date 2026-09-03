"use client";

import type { ReactNode } from "react";

import { MemberRole, MemberStatus } from "@social/shared";

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
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Text } from "@/components/ui/text";

import {
  MEMBER_ROLE_LABEL,
  type WorkspaceMemberWithUser,
} from "@/domains/workspace";
import { useConfirmAction } from "@/lib/hooks/use-confirm-action";
import { getInitials } from "@/lib/utils";

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

// KI-041 (Stone theme shadcn belum punya token --success/--warning, dicatat
// saat T-097.3): `Badge` shadcn cuma varian default/secondary/destructive/
// outline/ghost/link — tidak ada "warning". "Pending" (sebelumnya warna
// warning Astryx) dipetakan ke "outline" (bukan "secondary" seperti
// Active/Removed) supaya tetap ada pembeda visual antar status TANPA
// mengarang token warna baru — beda treatment varian yang sudah ada, bukan
// warna baru. Dilaporkan ke King Rezi sebagai perluasan gap KI-041, bukan
// keputusan final.
const STATUS_BADGE_VARIANT: Record<MemberStatus, "secondary" | "outline"> = {
  [MemberStatus.Active]: "secondary",
  [MemberStatus.Pending]: "outline",
  [MemberStatus.Removed]: "secondary",
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
  // T-098.4 (KI-042) — dipakai di kartu mobile MembersTable: tombol jadi
  // full-width (baris terpisah di bawah, bukan rata-kanan di dalam sel
  // tabel) supaya tap target nyaman, sesuai rancangan Claude Design
  // components/table.html § "Mobile — card layout".
  fullWidth,
}: {
  member: WorkspaceMemberWithUser;
  currentUserId: string;
  onRequestRemove: (member: WorkspaceMemberWithUser) => void;
  onRequestRoleChange: (
    member: WorkspaceMemberWithUser,
    newRole: MemberRole,
  ) => void;
  fullWidth?: boolean;
}) {
  if (member.role === MemberRole.Owner || member.userId === currentUserId) {
    return null;
  }

  const roleOptions = ASSIGNABLE_ROLES.filter((role) => role !== member.role);

  return (
    /* eslint-disable-next-line no-restricted-syntax -- T-099.2: file ini
       sudah dimigrasi ke komposisi Tailwind shadcn (ADR-097), bukan lagi
       HStack Astryx. */
    <div
      className={
        fullWidth
          ? "flex items-center gap-2 border-t border-border pt-3"
          : "flex items-center justify-end gap-2"
      }
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className={fullWidth ? "flex-1" : undefined}
          >
            Change Role
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {roleOptions.map((role) => (
            <DropdownMenuItem
              key={role}
              onClick={() => onRequestRoleChange(member, role)}
            >
              {MEMBER_ROLE_LABEL[role]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className={fullWidth ? "flex-1" : undefined}
        onClick={() => onRequestRemove(member)}
      >
        Remove
      </Button>
    </div>
  );
}

/**
 * `MembersTable` (T-099.2, migrasi shadcn/ui). shadcn `Table` — beda dari
 * `@astryxdesign/core/Table` — cuma primitive semantik `<table>` tanpa
 * sistem kolom data-driven (tidak ada `TableColumn[]`/helper
 * `pixel()`/`proportional()` untuk lebar kolom). Baris ditulis langsung
 * sebagai JSX (`TableRow`/`TableCell` per member, bukan `buildColumns` +
 * `data`), dan lebar kolom "Actions" cukup dikunci via Tailwind `w-60`
 * (240px, sama seperti `pixel(240)` sebelumnya) di `<TableHead>`-nya —
 * kolom lain dibiarkan auto-size berdasar konten (bukan proporsi 2:1:1
 * eksplisit), pola yang sama dipakai demo resmi shadcn (`table-demo`,
 * MCP `get_item_examples_from_registries`).
 */
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
    // eslint-disable-next-line no-restricted-syntax -- T-099.2, sama seperti di atas
    <div className="flex flex-col gap-4 p-4">
      <SettingsPageHead
        pageName="Members"
        breadcrumb={`${SETTINGS_BREADCRUMB_GROUP.organization} / Members`}
        action={headerAction}
      />

      {removeConfirm.error ? (
        <Alert variant="destructive">
          <AlertTitle>{removeConfirm.error}</AlertTitle>
        </Alert>
      ) : null}
      {roleConfirm.error ? (
        <Alert variant="destructive">
          <AlertTitle>{roleConfirm.error}</AlertTitle>
        </Alert>
      ) : null}

      <Card>
        <CardContent>
          {members.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Belum ada anggota</EmptyTitle>
                <EmptyDescription>
                  Workspace ini belum memiliki anggota.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              {/* T-098.4 (KI-042): kolom Actions (~800px) butuh scroll
                  horizontal untuk dijangkau (temuan QA Najwa T-099, severity
                  Moderate) — tabel desktop disembunyikan di bawah `md` (768px,
                  sama seperti Mobile Shell), diganti kartu per anggota di
                  bawah. Rancangan: Claude Design components/table.html
                  § "Mobile — card layout". */}
              {/* eslint-disable-next-line no-restricted-syntax -- T-098.4, sama seperti di atas */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-60 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          {/* eslint-disable-next-line no-restricted-syntax -- T-099.2, sama seperti di atas */}
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            {/* eslint-disable-next-line no-restricted-syntax -- T-099.2, sama seperti di atas */}
                            <div className="flex flex-col">
                              <Text variant="small">{member.name}</Text>
                              <Text variant="muted">{member.email}</Text>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {MEMBER_ROLE_LABEL[member.role]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_BADGE_VARIANT[member.status]}>
                            {STATUS_LABEL[member.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <MemberActions
                            member={member}
                            currentUserId={currentUserId}
                            onRequestRemove={(target) =>
                              removeConfirm.open(target)
                            }
                            onRequestRoleChange={(target, newRole) =>
                              roleConfirm.open({ member: target, newRole })
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* eslint-disable-next-line no-restricted-syntax -- T-098.4, sama seperti di atas */}
              <div className="flex flex-col gap-3 md:hidden">
                {members.map((member) => (
                  // eslint-disable-next-line no-restricted-syntax -- T-098.4, sama seperti di atas
                  <div
                    key={member.id}
                    className="flex flex-col gap-3 rounded-xl border border-border p-3"
                  >
                    {/* eslint-disable-next-line no-restricted-syntax -- T-098.4, sama seperti di atas */}
                    <div className="flex items-center justify-between gap-2">
                      {/* eslint-disable-next-line no-restricted-syntax -- T-098.4, sama seperti di atas */}
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        {/* eslint-disable-next-line no-restricted-syntax -- T-098.4, sama seperti di atas */}
                        <div className="flex min-w-0 flex-col">
                          <Text variant="small" className="truncate">
                            {member.name}
                          </Text>
                          <Text variant="muted" className="truncate">
                            {member.email}
                          </Text>
                        </div>
                      </div>
                      <Badge
                        variant={STATUS_BADGE_VARIANT[member.status]}
                        className="shrink-0"
                      >
                        {STATUS_LABEL[member.status]}
                      </Badge>
                    </div>
                    {/* eslint-disable-next-line no-restricted-syntax -- T-098.4, sama seperti di atas */}
                    <div className="flex items-center justify-between text-sm">
                      <Text variant="muted">Role</Text>
                      <Badge variant="secondary">
                        {MEMBER_ROLE_LABEL[member.role]}
                      </Badge>
                    </div>
                    <MemberActions
                      member={member}
                      currentUserId={currentUserId}
                      onRequestRemove={(target) => removeConfirm.open(target)}
                      onRequestRoleChange={(target, newRole) =>
                        roleConfirm.open({ member: target, newRole })
                      }
                      fullWidth
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={removeConfirm.isOpen}
        onOpenChange={(open) => {
          if (!open) removeConfirm.close();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Keluarkan anggota ini?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeConfirm.target
                ? `Keluarkan ${removeConfirm.target.name} dari workspace ini? Mereka akan kehilangan akses (ADR-049, Tier 2).`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={removeConfirm.isLoading}
              onClick={(e) => {
                e.preventDefault();
                void removeConfirm.confirm();
              }}
            >
              {removeConfirm.isLoading ? <Spinner /> : null}
              Keluarkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={roleConfirm.isOpen}
        onOpenChange={(open) => {
          if (!open) roleConfirm.close();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ubah role anggota ini?</AlertDialogTitle>
            <AlertDialogDescription>
              {roleConfirm.target
                ? `Ubah role ${roleConfirm.target.member.name} dari ${MEMBER_ROLE_LABEL[roleConfirm.target.member.role]} ke ${MEMBER_ROLE_LABEL[roleConfirm.target.newRole]}?`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={roleConfirm.isLoading}
              onClick={(e) => {
                e.preventDefault();
                void roleConfirm.confirm();
              }}
            >
              {roleConfirm.isLoading ? <Spinner /> : null}
              Ubah Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
