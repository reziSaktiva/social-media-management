import { MediaType } from "@social/shared";

/**
 * MIME type yang diizinkan untuk upload media di Draft Editor → extension +
 * `MediaType` yang dipetakan. Tidak ada baseline eksplisit di
 * `product-discovery/` untuk daftar MIME per platform (beda dari avatar yang
 * eksplisit JPG/PNG only, `identity/validation.ts`) — daftar ini adalah
 * interpretasi wajar dari `MediaType` yang SUDAH didefinisikan
 * (`domain-model.md` § BC-08: `image | video | gif`), bukan tebakan bebas.
 * Perluas di sini kalau King Rezi mengonfirmasi format lain dibutuhkan.
 */
export const ALLOWED_MEDIA_MIME_TYPES: Record<
  string,
  { extension: string; type: MediaType }
> = {
  "image/jpeg": { extension: "jpg", type: MediaType.Image },
  "image/png": { extension: "png", type: MediaType.Image },
  "image/webp": { extension: "webp", type: MediaType.Image },
  "image/gif": { extension: "gif", type: MediaType.Gif },
  "video/mp4": { extension: "mp4", type: MediaType.Video },
  "video/quicktime": { extension: "mov", type: MediaType.Video },
};

/**
 * Batas ukuran file maksimum untuk media MVP: 50 MB (52428800 bytes).
 * Dikonfirmasi King Rezi via `AskUserQuestion` (follow-up T-024.2 — gap yang
 * sebelumnya ditandai belum ada baseline eksplisit). Ditegakkan di dua
 * tempat yang HARUS tetap sinkron:
 * 1. Level aplikasi — `UploadMediaUseCase.execute` menolak upload sebelum
 *    memanggil storage adapter kalau `fileBuffer.byteLength` melebihi ini.
 * 2. Level Storage — `file_size_limit` bucket `media`, migration
 *    `20260914090000_t024_2_create_media_bucket`.
 */
export const MAX_MEDIA_FILE_SIZE_BYTES = 52_428_800;
