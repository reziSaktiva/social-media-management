import type { MediaId, MediaType, UserId, WorkspaceId } from "@social/shared";
import { NotFoundError } from "@/lib/utils/errors";
import type { IMediaStorageAdapter } from "../adapters/media-storage-adapter";
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
  /**
   * `storageAdapter` opsional (bug fix QA T-056, 2026-10-06) — kalau
   * disuplai, `getMediaItem`/`listMediaItems`/`listByIds` SELALU
   * meregenerate `url` dari `storagePath` lewat `getSignedUrl` sebelum
   * mengembalikan record, menggantikan kolom `url` yang di-cache permanen
   * sejak upload (root cause thumbnail broken: signed URL expired 1 jam
   * setelah upload, tapi dibaca apa adanya tanpa regenerate — lihat
   * `IMediaStorageAdapter.getSignedUrl` untuk detail). Dibuat opsional
   * (bukan wajib di constructor) supaya caller yang hanya butuh data
   * domain murni tanpa display (mis. validasi ownership
   * `resolveDraftMediaIds`, atau test unit yang pakai fake repository
   * saja) tidak perlu menyuplai storage adapter sungguhan — kalau tidak
   * disuplai, `url` dikembalikan apa adanya dari repository (perilaku
   * lama, backward compatible).
   */
  constructor(
    private readonly repository: IMediaRepository,
    private readonly storageAdapter?: IMediaStorageAdapter,
  ) {}

  /**
   * Regenerate `url` tiap record dari `storagePath` lewat
   * `storageAdapter.getSignedUrl` (paralel, `Promise.all`). Kegagalan
   * regenerate SATU item (mis. file sudah terhapus manual di Storage)
   * tidak melempar untuk seluruh batch — item itu kembali dengan `url:
   * null` (caller treat sebagai "media tanpa thumbnail", pola sama
   * `mediaItem?.url` guard yang sudah ada di `engage/actions.ts`), bukan
   * menggagalkan seluruh list/detail hanya karena satu media bermasalah.
   */
  private async withFreshUrls(
    items: MediaItemRecord[],
  ): Promise<MediaItemRecord[]> {
    if (!this.storageAdapter || items.length === 0) {
      return items;
    }
    const adapter = this.storageAdapter;
    return Promise.all(
      items.map(async (item) => {
        try {
          const url = await adapter.getSignedUrl(item.storagePath);
          return { ...item, url };
        } catch {
          return { ...item, url: null };
        }
      }),
    );
  }

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
    const [fresh] = await this.withFreshUrls([item]);
    return fresh;
  }

  /** Daftar seluruh `MediaItem` milik satu workspace — delegasi tipis ke repository, `url` diregenerate (lihat `withFreshUrls`). */
  async listMediaItems(
    input: { workspaceId: WorkspaceId },
    userId: UserId,
  ): Promise<MediaItemRecord[]> {
    const items = await this.repository.findByWorkspace(input, userId);
    return this.withFreshUrls(items);
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
    const items = await this.repository.findByIds(input, userId);
    return this.withFreshUrls(items);
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

  async saveOutstandWorkingCopy(
    input: {
      workspaceId: WorkspaceId;
      mediaId: MediaId;
      outstandMediaId: string;
      outstandMediaUrl: string;
      outstandExpiresAt: Date;
    },
    userId: UserId,
  ): Promise<void> {
    await this.repository.saveOutstandWorkingCopy(input, userId);
  }
}
