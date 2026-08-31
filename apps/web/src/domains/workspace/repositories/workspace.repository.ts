import type {
  ConnectedAccountId,
  InvitationId,
  InvitationStatus,
  MemberId,
  MemberRole,
  MemberStatus,
  SocialPlatform,
  UserId,
  WorkspaceId,
} from "@social/shared";

export interface WorkspaceRecord {
  id: WorkspaceId;
  name: string;
  slug: string;
  /**
   * Transfer Ownership dua langkah (ADR-050, DM-D11). `null` saat tidak ada
   * transfer pending. `undefined` di record yang belum pernah mem-fetch
   * kolom ini (mis. `findDefaultWorkspaceForUser`, yang tidak butuh field
   * ini) — dibedakan dari `null` supaya caller tidak salah asumsi "tidak
   * ada transfer pending" padahal sebenarnya belum pernah dicek.
   */
  pendingOwnerTransferTo?: UserId | null;
}

export interface ConnectedAccountRecord {
  id: ConnectedAccountId;
  workspaceId: WorkspaceId;
  platform: SocialPlatform;
  outstandAccountId: string;
  handle: string;
  status: string;
  reconnectRequired: boolean;
  connectedAt: Date;
}

export interface WorkspaceMemberRecord {
  id: MemberId;
  workspaceId: WorkspaceId;
  userId: UserId;
  role: MemberRole;
  status: MemberStatus;
}

/**
 * Satu baris hasil `listWorkspacesForUser` (T-089.2, ADR-088) — workspace +
 * role membership user di dalamnya. `slug` disertakan karena berguna untuk
 * render avatar/link di UI list Workspace Switcher, konsisten dengan
 * `WorkspaceRecord`.
 */
export interface WorkspaceMembershipSummary {
  workspaceId: WorkspaceId;
  name: string;
  slug: string;
  role: MemberRole;
}

export interface WorkspaceInvitationRecord {
  id: InvitationId;
  workspaceId: WorkspaceId;
  email: string;
  role: MemberRole;
  token: string;
  status: InvitationStatus;
  invitedByUserId: UserId;
  expiresAt: Date;
}

/** Repository interface — implementation (Prisma) lives in src/lib/repositories/workspace. */
export interface IWorkspaceRepository {
  createWithOwner(input: {
    name: string;
    slug: string;
    ownerId: UserId;
  }): Promise<WorkspaceRecord>;

  /** Membership aktif terlama milik user, dengan WorkspaceRecord lengkap. */
  findDefaultWorkspaceForUser(userId: UserId): Promise<WorkspaceRecord | null>;

  /**
   * Seluruh workspace dengan membership AKTIF milik satu user, beserta
   * role-nya (T-089.2, ADR-088 — Workspace Switcher). Beda dengan
   * `findDefaultWorkspaceForUser` (cuma 1 hasil, membership terlama) —
   * method ini dipakai untuk render list "Settings → Account → Workspaces"
   * (semua workspace yang bisa di-switch user, bukan cuma default-nya).
   * Urutan tidak dispesifikasikan oleh domain (bebas bagi implementasi),
   * `WorkspaceService.listWorkspacesForUser` sekadar meneruskan.
   */
  listWorkspacesForUser(userId: UserId): Promise<WorkspaceMembershipSummary[]>;

  /**
   * Dipakai `getWorkspaceContext()` (ADR-076) — resolve workspace by cookie
   * id. Menyertakan `pendingOwnerTransferTo` (T-008.3, ADR-050) supaya
   * caller (mis. `WorkspaceService.acceptOwnershipTransfer`) tidak perlu
   * query terpisah.
   */
  findById(workspaceId: WorkspaceId): Promise<WorkspaceRecord | null>;

  /**
   * Ordered by `connectedAt` ascending. `userId` (RLS, KI-026 follow-up) —
   * acting user whose session sets `app.current_user_id` for this query;
   * NOT a filter on the result set (semua akun aktif workspace tetap
   * dikembalikan, bukan cuma milik user itu).
   */
  listConnectedAccounts(
    workspaceId: WorkspaceId,
    userId: UserId,
  ): Promise<ConnectedAccountRecord[]>;

  /**
   * Count-only variant of `listConnectedAccounts` filtered to
   * `status: "active"` (T-042.2). `userId` (RLS, KI-026 follow-up) — acting
   * user, sama seperti `listConnectedAccounts`.
   */
  countActiveConnectedAccounts(
    workspaceId: WorkspaceId,
    userId: UserId,
  ): Promise<number>;

  /**
   * Ordered by `joinedAt` ascending — dipakai UI daftar anggota (T-007.4).
   * `actingUserId` (RLS, KI-026 follow-up) — user yang memicu query ini
   * (bukan filter hasil).
   */
  listMembers(
    workspaceId: WorkspaceId,
    actingUserId: UserId,
  ): Promise<WorkspaceMemberRecord[]>;

  /**
   * Batch lookup nama/email user by id. `WorkspaceMember.userId` tidak
   * punya relasi FK Prisma ke `User` (kemungkinan disengaja, beda bounded
   * context), jadi join dilakukan manual di service layer lewat method ini
   * — bukan Prisma `include`. Dipakai `WorkspaceService.listMembersWithUser`.
   */
  findUsersByIds(
    userIds: UserId[],
  ): Promise<{ id: UserId; name: string; email: string }[]>;

  /** Lookup membership by user — dipakai RBAC untuk resolve role actor. */
  getMember(
    workspaceId: WorkspaceId,
    userId: UserId,
  ): Promise<WorkspaceMemberRecord | null>;

  /**
   * Lookup membership by row id — dipakai untuk resolve target member.
   * `actingUserId` (RLS, KI-026 follow-up) — user yang memicu query ini.
   */
  findMemberById(
    workspaceId: WorkspaceId,
    memberId: MemberId,
    actingUserId: UserId,
  ): Promise<WorkspaceMemberRecord | null>;

  /**
   * Hard delete (DB-D03) — bukan soft-delete. `actingUserId` (RLS, KI-026
   * follow-up) — user yang memicu mutasi ini.
   */
  removeMember(
    workspaceId: WorkspaceId,
    memberId: MemberId,
    actingUserId: UserId,
  ): Promise<void>;

  /** `actingUserId` (RLS, KI-026 follow-up) — user yang memicu mutasi ini. */
  updateMemberRole(
    workspaceId: WorkspaceId,
    memberId: MemberId,
    role: MemberRole,
    actingUserId: UserId,
  ): Promise<void>;

  createInvitation(input: {
    workspaceId: WorkspaceId;
    email: string;
    role: MemberRole;
    invitedByUserId: UserId;
    token: string;
    expiresAt: Date;
  }): Promise<WorkspaceInvitationRecord>;

  /**
   * Belum dipakai service manapun — disiapkan untuk acceptInvite (task lain).
   * SENGAJA TIDAK dibungkus `withCurrentUser` (KI-026 follow-up, code review
   * PR #71) — invitee yang lookup token ini belum jadi member workspace
   * tujuan (chicken-and-egg struktural, sama seperti bootstrap INSERT
   * `workspace_members` di `createWithOwner`), jadi tidak ada `userId` valid
   * yang bisa memenuhi RLS policy `workspace_invitations_workspace_isolation`.
   * Butuh RLS policy exception (mis. trusted self-select by validated token)
   * — keputusan desain terpisah, di luar scope task ini.
   */
  findInvitationByToken(
    token: string,
  ): Promise<WorkspaceInvitationRecord | null>;

  /**
   * Lookup Better Auth `User` by email (T-093.1) — dipakai untuk auto-detect
   * `isExistingUser` di halaman accept-invite (`/invite/[token]`): kalau
   * email invitation sudah punya akun, tampilkan form "Masuk"; kalau belum,
   * tampilkan form "Buat Akun Baru". Query langsung ke tabel `identity_user`
   * lewat Prisma — konsisten dengan precedent `findUsersByIds` di atas
   * (bounded context `workspace` sengaja boleh membaca `User` langsung,
   * tidak ada relasi FK, dua bounded context berbeda tapi satu database).
   * TIDAK dibungkus `withCurrentUser` — pemanggil (invitee) belum jadi
   * member workspace mana pun, sama seperti alasan `findInvitationByToken`
   * di atas tidak memakai RLS context.
   */
  findUserByEmail(email: string): Promise<{ id: UserId } | null>;

  /**
   * Terima invitation (T-093.3) — SATU transaksi atomik: (1) flip
   * `WorkspaceInvitation.status` dari `pending` ke `accepted` + set
   * `acceptedAt` HANYA kalau status saat ini masih `pending` (guard
   * race/replay — token yang sudah dipakai tidak bisa dipakai ulang), (2)
   * upsert `WorkspaceMember` dengan `role` yang diteruskan APA ADANYA dari
   * `invitation.role` (bukan default) dan `status: active`. Implementasi
   * WAJIB set `app.current_user_id` ke `userId` (RLS chicken-and-egg) —
   * pola sama seperti `createWithOwner`, karena membership baru ini belum
   * ada saat insert dieksekusi. Melempar `ConflictError` bila invitation
   * sudah tidak `pending` lagi (accepted/revoked/expired) saat transaksi
   * dieksekusi.
   */
  acceptInvitation(input: {
    workspaceId: WorkspaceId;
    invitationId: InvitationId;
    userId: UserId;
    role: MemberRole;
  }): Promise<WorkspaceMemberRecord>;

  /**
   * Persist urutan channel sidebar personal user (T-012.1). Full rewrite
   * (delete+createMany) — caller (`WorkspaceService.saveChannelOrder`)
   * sudah memfilter `orderedConnectedAccountIds` supaya hanya berisi id
   * milik `workspaceId` ini (anti-IDOR); implementasi TIDAK perlu
   * re-verifikasi ownership.
   */
  saveChannelOrder(input: {
    workspaceId: WorkspaceId;
    userId: UserId;
    orderedConnectedAccountIds: ConnectedAccountId[];
  }): Promise<void>;

  /** Ordered by `position` ascending — urutan tersimpan milik satu user. */
  getChannelOrder(
    workspaceId: WorkspaceId,
    userId: UserId,
  ): Promise<ConnectedAccountId[]>;

  /**
   * Hapus workspace beserta seluruh data terkait — mengandalkan
   * `ON DELETE CASCADE` per `workspace_id` (T-008.2, ADR-050,
   * `database-strategy.md`). `actingUserId` (RLS, KI-026 follow-up) — user
   * yang memicu mutasi ini; RBAC (Owner-only) sudah diverifikasi di
   * `WorkspaceService.deleteWorkspace` sebelum method ini dipanggil.
   */
  deleteWorkspace(
    workspaceId: WorkspaceId,
    actingUserId: UserId,
  ): Promise<void>;

  /**
   * Set `Workspace.pendingOwnerTransferTo` (T-008.3, ADR-050) — langkah
   * pertama Transfer Ownership. `actingUserId` (RLS) adalah Owner yang
   * memicu, `targetUserId` adalah Admin yang dituju.
   */
  setPendingOwnerTransfer(
    workspaceId: WorkspaceId,
    targetUserId: UserId,
    actingUserId: UserId,
  ): Promise<void>;

  /**
   * Kosongkan `Workspace.pendingOwnerTransferTo` tanpa menukar role —
   * dipakai `WorkspaceService.cancelOwnershipTransfer` (method tambahan,
   * dibutuhkan UI banner pending — tidak disebut eksplisit di
   * `application-layer.md`/ADR-050, tapi konsisten dengan pola method
   * lain: Owner-only, no-op sederhana).
   */
  clearPendingOwnerTransfer(
    workspaceId: WorkspaceId,
    actingUserId: UserId,
  ): Promise<void>;

  /**
   * Terima Transfer Ownership (T-008.3, ADR-050) — dalam SATU transaksi:
   * role Owner lama diturunkan jadi Admin, role target dinaikkan jadi
   * Owner, `Workspace.ownerId` diupdate ke `newOwnerUserId` (field ini
   * merepresentasikan Owner aktual — domain-model.md BC-02), dan
   * `pendingOwnerTransferTo` dikosongkan. `actingUserId` (RLS) adalah
   * `newOwnerUserId` — user yang menerima transfer dan memicu mutasi ini.
   */
  acceptOwnershipTransfer(input: {
    workspaceId: WorkspaceId;
    currentOwnerMemberId: MemberId;
    targetMemberId: MemberId;
    newOwnerUserId: UserId;
  }): Promise<void>;

  /**
   * Ubah `Workspace.name` (T-008.4) — reversible, low-stakes, tanpa
   * konfirmasi (beda dengan Danger Zone). `actingUserId` (RLS, KI-026
   * follow-up) — user yang memicu mutasi ini; RBAC (member aktif) sudah
   * diverifikasi di `WorkspaceService.renameWorkspace` sebelum method ini
   * dipanggil. Slug TIDAK ikut berubah — hanya nama tampilan.
   */
  renameWorkspace(
    workspaceId: WorkspaceId,
    name: string,
    actingUserId: UserId,
  ): Promise<WorkspaceRecord>;
}
