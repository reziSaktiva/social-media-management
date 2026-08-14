import { randomBytes } from "node:crypto";
import {
  EMAIL_PATTERN,
  MemberRole,
  MemberStatus,
  NotificationType,
} from "@social/shared";
import type {
  ConnectedAccountId,
  MemberId,
  UserId,
  WorkspaceId,
} from "@social/shared";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/utils/errors";
import { slugify } from "../value-objects/slugify";
import type {
  ConnectedAccountRecord,
  IWorkspaceRepository,
  WorkspaceInvitationRecord,
  WorkspaceMemberRecord,
  WorkspaceRecord,
} from "../repositories/workspace.repository";
import type { SidebarChannelAccount, WorkspaceMemberWithUser } from "../types";

const MAX_NAME_LENGTH = 100;
const MAX_SLUG_ATTEMPTS = 6;
/** ADR-072 & ADR-080 — copy "Undangan berlaku 7 hari" di dialog Claude Design. */
const INVITATION_EXPIRY_DAYS = 7;
/**
 * Port lokal untuk cross-domain `publishing` → `workspace` (T-012.2,
 * AGENTS.md #7) — implementation detail `WorkspaceService`, bukan kontrak
 * publik domain `workspace`. Sengaja TIDAK `export` (bukan cuma "tidak
 * diekspor dari barrel") — `index.ts` memakai `export *` per file, jadi
 * kalau interface ini di-export dari sini, dia otomatis ikut ke-export
 * ulang lewat barrel juga (tidak ada cara meng-exclude satu named export
 * dari `export *`). Constructor param di bawah cukup memakai tipe ini
 * secara lokal (structural typing) — caller (`layout.tsx`, dan fake port
 * di `workspace.service.test.ts`) tidak perlu mengimpor tipe ini sama
 * sekali, cukup passing object literal yang bentuknya cocok.
 * `PublishingService` konkret TIDAK boleh diimport ke file ini; import
 * cross-domain hanya terjadi di composition root (`app/(app)/layout.tsx`),
 * yang menyuplai instance ini lewat constructor.
 */
interface ScheduledCountsPort {
  countScheduledByAccount(
    workspaceId: WorkspaceId,
    connectedAccountIds: ConnectedAccountId[],
    userId: UserId,
  ): Promise<Map<ConnectedAccountId, number>>;
}

/**
 * Port lokal untuk cross-domain `workspace` → `notification` (T-008.3,
 * ADR-050, AGENTS.md #7) — pola sama seperti `ScheduledCountsPort` di atas.
 * `NotificationService` konkret TIDAK boleh diimport ke file ini; composition
 * root (Server Action) menyuplai instance lewat constructor. Opsional (bisa
 * `undefined`, mis. di test) supaya caller lama tanpa notifikasi tidak perlu
 * berubah — tapi wajib disuplai di composition root produksi untuk
 * `transferOwnership`/`acceptOwnershipTransfer` supaya notifikasi
 * benar-benar terkirim (ADR-050).
 */
interface NotificationPort {
  notify(input: {
    workspaceId: WorkspaceId;
    userId: UserId;
    type: NotificationType;
    title: string;
    body: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }): Promise<unknown>;
}

export class WorkspaceService {
  constructor(
    private readonly repository: IWorkspaceRepository,
    private readonly scheduledCounts?: ScheduledCountsPort,
    private readonly notifications?: NotificationPort,
  ) {}

  async createWorkspace(input: {
    userId: UserId;
    name: string;
  }): Promise<WorkspaceRecord> {
    const name = input.name.trim();

    if (!name) {
      throw new ValidationError("Nama workspace wajib diisi.");
    }
    if (name.length > MAX_NAME_LENGTH) {
      throw new ValidationError(
        `Nama workspace maksimal ${MAX_NAME_LENGTH} karakter.`,
      );
    }

    const baseSlug = slugify(name);
    if (!baseSlug) {
      throw new ValidationError("Nama workspace tidak valid.");
    }

    for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
      const candidateSlug =
        attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;

      try {
        return await this.repository.createWithOwner({
          name,
          slug: candidateSlug,
          ownerId: input.userId,
        });
      } catch (error) {
        const isLastAttempt = attempt === MAX_SLUG_ATTEMPTS - 1;
        if (error instanceof ConflictError && !isLastAttempt) {
          continue;
        }
        throw error;
      }
    }

    throw new ConflictError(
      "Gagal membuat slug workspace yang unik. Coba nama lain.",
    );
  }

  async getDefaultWorkspaceForUser(
    userId: UserId,
  ): Promise<WorkspaceRecord | null> {
    return this.repository.findDefaultWorkspaceForUser(userId);
  }

  /** Dipakai `getWorkspaceContext()` (ADR-076) — resolve workspace by cookie id. */
  async getWorkspaceById(
    workspaceId: WorkspaceId,
  ): Promise<WorkspaceRecord | null> {
    return this.repository.findById(workspaceId);
  }

  /**
   * Lookup membership by user — satu-satunya membership-check di codebase
   * ini, dipakai `assertActorCanManageMembers` (dedup, bukan pola baru).
   */
  async getMembership(
    workspaceId: WorkspaceId,
    userId: UserId,
  ): Promise<WorkspaceMemberRecord | null> {
    return this.repository.getMember(workspaceId, userId);
  }

  async listConnectedAccounts(
    workspaceId: WorkspaceId,
    userId: UserId,
  ): Promise<ConnectedAccountRecord[]> {
    return this.repository.listConnectedAccounts(workspaceId, userId);
  }

  /**
   * Jumlah akun terhubung berstatus "active" (T-042.2, dikonsumsi
   * `AnalyticsService.getDashboardSummary` via `ActiveAccountsPort` —
   * `WorkspaceService` cocok secara struktural, tidak perlu wrapper
   * terpisah). "active" adalah default `WorkspaceConnectedAccount.status`
   * (schema.prisma) — akun dengan status lain (mis. hasil disconnect)
   * sengaja tidak dihitung, konsisten dengan `reconnectRequired` sebagai
   * sinyal degradasi terpisah di `listSidebarChannels`.
   */
  async countActiveConnectedAccounts(
    workspaceId: WorkspaceId,
    userId: UserId,
  ): Promise<number> {
    return this.repository.countActiveConnectedAccounts(workspaceId, userId);
  }

  /**
   * Returns connected accounts shaped for sidebar rendering (T-012,
   * ADR-058), diurutkan sesuai posisi tersimpan personal user (T-012.1).
   * Channel yang belum punya posisi tersimpan (baru terhubung) di-append
   * di akhir sesuai urutan `connectedAt` asli dari repository.
   */
  async listSidebarChannels(
    workspaceId: WorkspaceId,
    userId: UserId,
  ): Promise<SidebarChannelAccount[]> {
    const accounts = await this.repository.listConnectedAccounts(
      workspaceId,
      userId,
    );
    const counts =
      (await this.scheduledCounts?.countScheduledByAccount(
        workspaceId,
        accounts.map((account) => account.id),
        userId,
      )) ?? new Map<ConnectedAccountId, number>();

    const storedOrder = await this.repository.getChannelOrder(
      workspaceId,
      userId,
    );
    const positionById = new Map(
      storedOrder.map((connectedAccountId, index) => [
        connectedAccountId,
        index,
      ]),
    );
    const orderedAccounts = [...accounts].sort((a, b) => {
      const posA = positionById.get(a.id);
      const posB = positionById.get(b.id);
      if (posA === undefined && posB === undefined) {
        return 0;
      }
      if (posA === undefined) {
        return 1;
      }
      if (posB === undefined) {
        return -1;
      }
      return posA - posB;
    });

    return orderedAccounts.map((account) => ({
      id: account.id,
      platform: account.platform,
      handle: account.handle,
      status: account.status,
      reconnectRequired: account.reconnectRequired,
      scheduledCount: counts.get(account.id) ?? 0,
    }));
  }

  /**
   * Persist urutan channel sidebar personal user (T-012.1). Defensif
   * anti-IDOR: intersect `orderedConnectedAccountIds` dengan akun yang
   * benar-benar milik `workspaceId` ini sebelum persist — id yang tidak
   * valid di-drop diam-diam, pola sama seperti `listMembersWithUser`.
   */
  async saveChannelOrder(
    workspaceId: WorkspaceId,
    userId: UserId,
    orderedConnectedAccountIds: ConnectedAccountId[],
  ): Promise<void> {
    const accounts = await this.repository.listConnectedAccounts(
      workspaceId,
      userId,
    );
    const ownedIds = new Set(accounts.map((account) => account.id));
    const validOrderedIds = Array.from(
      new Set(orderedConnectedAccountIds.filter((id) => ownedIds.has(id))),
    );

    await this.repository.saveChannelOrder({
      workspaceId,
      userId,
      orderedConnectedAccountIds: validOrderedIds,
    });
  }

  /**
   * Daftar anggota workspace tergabung dengan nama/email (T-007.4). Join
   * dilakukan manual (bukan Prisma `include`) karena `WorkspaceMember.userId`
   * tidak punya relasi FK ke `User` — lihat catatan di
   * `IWorkspaceRepository.findUsersByIds`. Anggota yang usernya tidak
   * ditemukan (data korup) dilewati diam-diam, bukan throw — konsisten
   * dengan gaya defensif `listSidebarChannels`.
   */
  async listMembersWithUser(
    workspaceId: WorkspaceId,
    actingUserId: UserId,
  ): Promise<WorkspaceMemberWithUser[]> {
    const members = await this.repository.listMembers(
      workspaceId,
      actingUserId,
    );
    const users = await this.repository.findUsersByIds(
      members.map((member) => member.userId),
    );
    const userById = new Map(users.map((user) => [user.id, user]));

    const result: WorkspaceMemberWithUser[] = [];
    for (const member of members) {
      const user = userById.get(member.userId);
      if (!user) {
        continue;
      }
      result.push({
        id: member.id,
        userId: member.userId,
        name: user.name,
        email: user.email,
        role: member.role,
        status: member.status,
      });
    }
    return result;
  }

  /** Owner/Admin only; dipakai removeMember & updateMemberRole. */
  private async assertActorCanManageMembers(
    workspaceId: WorkspaceId,
    actorUserId: UserId,
    actionErrorMessage: string,
  ): Promise<void> {
    const actor = await this.getMembership(workspaceId, actorUserId);
    if (!actor || actor.status !== MemberStatus.Active) {
      throw new AuthorizationError("Anda bukan anggota aktif workspace ini.");
    }
    if (actor.role !== MemberRole.Owner && actor.role !== MemberRole.Admin) {
      throw new AuthorizationError(actionErrorMessage);
    }
  }

  /** Owner tidak bisa jadi target; dipakai removeMember & updateMemberRole. */
  private async getManageableTarget(
    workspaceId: WorkspaceId,
    targetMemberId: MemberId,
    actingUserId: UserId,
    ownerErrorMessage: string,
  ): Promise<WorkspaceMemberRecord> {
    const target = await this.repository.findMemberById(
      workspaceId,
      targetMemberId,
      actingUserId,
    );
    if (!target) {
      throw new NotFoundError("Anggota tidak ditemukan.");
    }
    if (target.role === MemberRole.Owner) {
      throw new AuthorizationError(ownerErrorMessage);
    }
    return target;
  }

  async removeMember(
    workspaceId: WorkspaceId,
    actorUserId: UserId,
    targetMemberId: MemberId,
  ): Promise<void> {
    await this.assertActorCanManageMembers(
      workspaceId,
      actorUserId,
      "Hanya Owner atau Admin yang bisa menghapus anggota.",
    );
    await this.getManageableTarget(
      workspaceId,
      targetMemberId,
      actorUserId,
      "Owner tidak bisa dihapus dari workspace.",
    );

    await this.repository.removeMember(
      workspaceId,
      targetMemberId,
      actorUserId,
    );
  }

  async updateMemberRole(
    workspaceId: WorkspaceId,
    actorUserId: UserId,
    targetMemberId: MemberId,
    newRole: MemberRole,
  ): Promise<void> {
    if (newRole === MemberRole.Owner) {
      throw new ValidationError(
        "Gunakan alur Transfer Ownership untuk menjadikan anggota sebagai Owner.",
      );
    }

    await this.assertActorCanManageMembers(
      workspaceId,
      actorUserId,
      "Hanya Owner atau Admin yang bisa mengubah role anggota.",
    );
    await this.getManageableTarget(
      workspaceId,
      targetMemberId,
      actorUserId,
      "Role Owner tidak bisa diubah lewat sini.",
    );

    await this.repository.updateMemberRole(
      workspaceId,
      targetMemberId,
      newRole,
      actorUserId,
    );
  }

  /**
   * Jalur **Copy Link** invite member (T-007.1, ADR-080 poin 1 & 3) — generate
   * invitation email-bound + token, TIDAK bergantung pada T-005 (email
   * provider). RBAC sama seperti `removeMember`/`updateMemberRole` (Owner/
   * Admin only, reuse `assertActorCanManageMembers`); role `Owner` ditolak
   * sama seperti `updateMemberRole` (Transfer Ownership adalah alur
   * terpisah). Pengiriman email untuk metode "Kirim via Email" adalah
   * langkah opsional TERPISAH (T-007.7, blocked T-005) yang dipanggil
   * composition root setelah invitation ini dibuat — tidak ada percabangan
   * logic RBAC/token/expiry di sini (ADR-080 poin 3).
   */
  async inviteMember(
    workspaceId: WorkspaceId,
    actorUserId: UserId,
    input: { email: string; role: MemberRole },
  ): Promise<WorkspaceInvitationRecord> {
    if (input.role === MemberRole.Owner) {
      throw new ValidationError(
        "Gunakan alur Transfer Ownership untuk menjadikan anggota sebagai Owner.",
      );
    }

    const email = input.email.trim().toLowerCase();
    if (!email) {
      throw new ValidationError("Email wajib diisi.");
    }
    if (!EMAIL_PATTERN.test(email)) {
      throw new ValidationError("Format email tidak valid.");
    }

    await this.assertActorCanManageMembers(
      workspaceId,
      actorUserId,
      "Hanya Owner atau Admin yang bisa mengundang anggota.",
    );

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(
      Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    return this.repository.createInvitation({
      workspaceId,
      email,
      role: input.role,
      invitedByUserId: actorUserId,
      token,
      expiresAt,
    });
  }

  /**
   * Actor harus member aktif workspace ini, atau lempar `AuthorizationError`.
   * Dipakai `assertActorIsOwner`, `acceptOwnershipTransfer`, dan
   * `renameWorkspace` — satu tempat untuk aturan "aktif" ini, bukan
   * terduplikasi di tiap method.
   */
  private async assertActiveMembership(
    workspaceId: WorkspaceId,
    actorUserId: UserId,
  ): Promise<WorkspaceMemberRecord> {
    const actor = await this.getMembership(workspaceId, actorUserId);
    if (!actor || actor.status !== MemberStatus.Active) {
      throw new AuthorizationError("Anda bukan anggota aktif workspace ini.");
    }
    return actor;
  }

  /** Owner-only, dipakai deleteWorkspace & transferOwnership. */
  private async assertActorIsOwner(
    workspaceId: WorkspaceId,
    actorUserId: UserId,
    actionErrorMessage: string,
  ): Promise<void> {
    const actor = await this.assertActiveMembership(workspaceId, actorUserId);
    if (actor.role !== MemberRole.Owner) {
      throw new AuthorizationError(actionErrorMessage);
    }
  }

  /**
   * Hapus workspace beserta seluruh data terkait (T-008.2, ADR-050). RBAC:
   * Owner saja. Tidak ada state "pending" — satu langkah setelah konfirmasi
   * Tier 1 di sisi UI (beda dengan Transfer Ownership). Cascade mengikuti
   * `ON DELETE CASCADE` per `workspace_id` (`database-strategy.md`) —
   * service ini TIDAK menghapus baris per tabel secara manual.
   */
  async deleteWorkspace(
    workspaceId: WorkspaceId,
    actorUserId: UserId,
  ): Promise<void> {
    await this.assertActorIsOwner(
      workspaceId,
      actorUserId,
      "Hanya Owner yang bisa menghapus workspace.",
    );

    await this.repository.deleteWorkspace(workspaceId, actorUserId);
  }

  /**
   * Single source of truth untuk "siapa yang eligible jadi target Transfer
   * Ownership" (ADR-050: Admin aktif) — dipakai `transferOwnership` untuk
   * validasi DAN `listTransferEligibleMembers` untuk render pilihan di RSC.
   * Sebelumnya aturan ini sempat terduplikasi inline di
   * `(app)/settings/page.tsx`; diekstrak ke sini supaya hanya ada satu
   * tempat yang mendefinisikan kriterianya (code review Ridwan).
   */
  private isTransferEligible(member: {
    role: MemberRole;
    status: MemberStatus;
  }): boolean {
    return (
      member.role === MemberRole.Admin && member.status === MemberStatus.Active
    );
  }

  /**
   * Daftar anggota yang eligible jadi target Transfer Ownership (Admin
   * aktif) — dipakai RSC (`(app)/settings/page.tsx`) untuk render pilihan
   * Selector Danger Zone. Kriteria eligibility sama persis dengan yang
   * divalidasi `transferOwnership` lewat `isTransferEligible`.
   */
  async listTransferEligibleMembers(
    workspaceId: WorkspaceId,
    actorUserId: UserId,
  ): Promise<WorkspaceMemberWithUser[]> {
    const members = await this.listMembersWithUser(workspaceId, actorUserId);
    return members.filter((member) => this.isTransferEligible(member));
  }

  /**
   * Langkah 1 Transfer Ownership (T-008.3, ADR-050) — Owner memicu, target
   * harus Admin aktif di workspace yang sama. Mengisi
   * `pendingOwnerTransferTo`, kirim notifikasi `ownership_transfer_requested`
   * ke target. **Tidak** langsung menukar role.
   */
  async transferOwnership(
    workspaceId: WorkspaceId,
    actorUserId: UserId,
    targetMemberId: MemberId,
  ): Promise<void> {
    await this.assertActorIsOwner(
      workspaceId,
      actorUserId,
      "Hanya Owner yang bisa memulai Transfer Ownership.",
    );

    const target = await this.repository.findMemberById(
      workspaceId,
      targetMemberId,
      actorUserId,
    );
    if (!target) {
      throw new NotFoundError("Anggota tidak ditemukan.");
    }
    if (!this.isTransferEligible(target)) {
      throw new ValidationError(
        "Transfer Ownership hanya bisa ditujukan ke Admin aktif.",
      );
    }

    await this.repository.setPendingOwnerTransfer(
      workspaceId,
      target.userId,
      actorUserId,
    );

    await this.notifications?.notify({
      workspaceId,
      userId: target.userId,
      type: NotificationType.OwnershipTransferRequested,
      title: "Permintaan Transfer Ownership",
      body: "Anda diminta menerima transfer kepemilikan workspace ini.",
      relatedEntityType: "member",
      relatedEntityId: targetMemberId,
    });
  }

  /**
   * Batalkan Transfer Ownership yang masih pending (dibutuhkan UI banner
   * pending — tidak disebut eksplisit sebagai method di
   * `application-layer.md`/ADR-050, ditambahkan konsisten dengan pola
   * method lain: RBAC Owner saja, reset `pendingOwnerTransferTo`).
   */
  async cancelOwnershipTransfer(
    workspaceId: WorkspaceId,
    actorUserId: UserId,
  ): Promise<void> {
    await this.assertActorIsOwner(
      workspaceId,
      actorUserId,
      "Hanya Owner yang bisa membatalkan Transfer Ownership.",
    );

    await this.repository.clearPendingOwnerTransfer(workspaceId, actorUserId);
  }

  /**
   * Langkah 2 Transfer Ownership (T-008.3, ADR-050) — Admin target
   * menerima. RBAC: hanya user yang cocok dengan `pendingOwnerTransferTo`.
   * Role Owner lama dan Admin target bertukar dalam satu transaksi;
   * `pendingOwnerTransferTo` dikosongkan; notifikasi
   * `ownership_transfer_resolved` ke Owner lama.
   */
  async acceptOwnershipTransfer(
    workspaceId: WorkspaceId,
    actorUserId: UserId,
  ): Promise<void> {
    const workspace = await this.repository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace tidak ditemukan.");
    }
    if (
      !workspace.pendingOwnerTransferTo ||
      workspace.pendingOwnerTransferTo !== actorUserId
    ) {
      throw new AuthorizationError(
        "Tidak ada Transfer Ownership yang ditujukan untuk Anda.",
      );
    }

    const targetMember = await this.assertActiveMembership(
      workspaceId,
      actorUserId,
    );

    const currentOwnerMember = await this.repository.listMembers(
      workspaceId,
      actorUserId,
    );
    const oldOwner = currentOwnerMember.find(
      (candidate) => candidate.role === MemberRole.Owner,
    );
    if (!oldOwner) {
      throw new NotFoundError("Owner saat ini tidak ditemukan.");
    }

    await this.repository.acceptOwnershipTransfer({
      workspaceId,
      currentOwnerMemberId: oldOwner.id,
      targetMemberId: targetMember.id,
      newOwnerUserId: actorUserId,
    });

    await this.notifications?.notify({
      workspaceId,
      userId: oldOwner.userId,
      type: NotificationType.OwnershipTransferResolved,
      title: "Transfer Ownership diterima",
      body: "Kepemilikan workspace ini telah berpindah tangan.",
      relatedEntityType: "member",
      relatedEntityId: targetMember.id,
    });
  }

  /**
   * Ganti nama workspace (T-008.4) — RBAC: member aktif mana pun (bukan
   * Owner-only), reversible/low-stakes, tanpa dialog konfirmasi di UI (beda
   * dengan Danger Zone). Validasi nama reuse aturan yang sama dengan
   * `createWorkspace` (panjang max, tidak boleh kosong) — slug TIDAK
   * ikut berubah di sini.
   */
  async renameWorkspace(
    workspaceId: WorkspaceId,
    actorUserId: UserId,
    name: string,
  ): Promise<WorkspaceRecord> {
    await this.assertActiveMembership(workspaceId, actorUserId);

    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new ValidationError("Nama workspace wajib diisi.");
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      throw new ValidationError(
        `Nama workspace maksimal ${MAX_NAME_LENGTH} karakter.`,
      );
    }

    return this.repository.renameWorkspace(
      workspaceId,
      trimmedName,
      actorUserId,
    );
  }
}
