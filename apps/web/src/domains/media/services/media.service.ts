import type { MediaId, MediaType, UserId, WorkspaceId } from "@social/shared";
import { NotFoundError } from "@/lib/utils/errors";
import type { IMediaRepository } from "../repositories/media.repository";
import type { MediaItemRecord } from "../types";

/**
 * `MediaService` (BC-08, Application Service) — T-024.1 skeleton.
 *
 * Scope SENGAJA dipersempit ke CRUD record `MediaItem` murni (orchestrate
 * `IMediaRepository` + validasi ownership workspace dasar). TIDAK ADA di
 * sini:
 * - Upload fisik ke Supabase Storage (T-024.2) — caller (Server Action)
 *   yang akan melakukan upload dulu, baru memanggil `createMediaItem`
 *   dengan `storagePath`/`url` hasil upload itu.
 * - `OutstandAdapter` media working copy (T-024.3, ADR-040).
 *
 * Error handling mengikuti pola nyata yang dipakai domain lain di repo ini
 * (`PublishingService`, dst.): `NotFoundError`/`ConflictError` dari
 * `@/lib/utils/errors` (hierarki `ApplicationError`), BUKAN
 * `MediaDomainError` di `errors.ts` — base class itu ada di seluruh
 * scaffold domain (`PublishingDomainError`, `NotificationDomainError`,
 * dst.) tapi tidak pernah benar-benar dipakai/di-extend di kode manapun;
 * `MediaService` mengikuti konvensi yang benar-benar berjalan, bukan
 * scaffold yang belum diadopsi.
 */
export class MediaService {
  constructor(private readonly repository: IMediaRepository) {}

  /**
   * Buat record `MediaItem` baru. Dipanggil SETELAH file fisik sudah
   * ter-upload ke Supabase Storage (T-024.2) — `storagePath` di sini
   * diasumsikan sudah valid, service ini tidak memvalidasi keberadaan file
   * di Storage.
   */
  async createMediaItem(
    input: {
      workspaceId: WorkspaceId;
      uploaderId: UserId;
      filename: string;
      mimeType: string;
      size: bigint;
      storagePath: string;
      type: MediaType;
      url?: string;
      width?: number;
      height?: number;
      duration?: number;
    },
    userId: UserId,
  ): Promise<MediaItemRecord> {
    return this.repository.create(input, userId);
  }

  /**
   * Ambil satu `MediaItem` by id, di-scope ke `workspaceId` (anti-IDOR).
   * Throws `NotFoundError` kalau tidak ditemukan atau bukan milik
   * workspace ini — caller tidak perlu membedakan null dari error.
   */
  async getMediaItem(
    input: { workspaceId: WorkspaceId; mediaId: MediaId },
    userId: UserId,
  ): Promise<MediaItemRecord> {
    const item = await this.repository.findById(input, userId);
    if (!item) {
      throw new NotFoundError("Media tidak ditemukan.");
    }
    return item;
  }

  /** Daftar seluruh `MediaItem` milik satu workspace — delegasi tipis ke repository. */
  async listMediaItems(
    input: { workspaceId: WorkspaceId },
    userId: UserId,
  ): Promise<MediaItemRecord[]> {
    return this.repository.findByWorkspace(input, userId);
  }

  /**
   * Batch fetch beberapa `MediaItem` by id sekaligus, di-scope ke
   * `workspaceId` (T-024.4) — dipakai untuk resolve `PublishingPost.mediaIds`
   * jadi preview lengkap (`getDraftAction`) dan validasi ownership sebelum
   * mediaIds dipersist ke draft. Skip panggilan repository sama sekali
   * kalau `mediaIds` kosong (pola sama `countScheduledByAccount`).
   *
   * **Keputusan (batch `findByIds`, bukan loop `getMediaItem` per id):**
   * satu query `findMany` untuk N id lebih efisien daripada N round-trip
   * DB terpisah, terutama untuk draft dengan carousel media (sampai 10
   * item, ADR-107) — biaya implementasi tambahan minimal (satu method baru
   * di `IMediaRepository`, mirror pola `findByWorkspace`).
   */
  async listByIds(
    input: { workspaceId: WorkspaceId; mediaIds: MediaId[] },
    userId: UserId,
  ): Promise<MediaItemRecord[]> {
    if (input.mediaIds.length === 0) {
      return [];
    }
    return this.repository.findByIds(input, userId);
  }

  /**
   * Hapus satu `MediaItem`, di-scope ke `workspaceId` (anti-IDOR). Throws
   * `NotFoundError` kalau tidak ditemukan atau bukan milik workspace ini.
   *
   * Pembersihan file fisik di Supabase Storage BUKAN tanggung jawab
   * method ini (T-024.5, out of scope T-024.1) — caller yang mengorkestrasi
   * urutan "hapus record DB dulu, lalu best-effort hapus file Storage
   * pakai `storagePath` dari record yang dikembalikan di sini", konsisten
   * pola "persist dulu, side-effect eksternal sesudah" yang dipakai
   * `PublishingService`.
   */
  async deleteMediaItem(
    input: { workspaceId: WorkspaceId; mediaId: MediaId },
    userId: UserId,
  ): Promise<MediaItemRecord> {
    const deleted = await this.repository.delete(input, userId);
    if (!deleted) {
      throw new NotFoundError("Media tidak ditemukan.");
    }
    return deleted;
  }
}
