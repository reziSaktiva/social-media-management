/** Domain-specific types for media (BC-08, domain-model.md § BC-08 — Media). */

import type { MediaId, UserId, WorkspaceId } from "@social/shared";
import type { MediaType } from "@social/shared";

/**
 * Proyeksi domain `MediaItem` (Aggregate Root, BC-08) — bentuk yang
 * dikembalikan repository/service, BUKAN model Prisma mentah. Tetap
 * anemic (interface data, bukan class) mengikuti konvensi domain lain di
 * repo ini (`PublishingPostRecord`, `NotificationRecord`, dst.) —
 * `entities/` sengaja dibiarkan kosong (`.gitkeep`) di seluruh domain,
 * bukan hanya di sini.
 *
 * `url` nullable — cache URL akses aplikasi dari Supabase Storage, boleh
 * kosong/kedaluwarsa dan dibuat ulang dari `storagePath` (T-024.2, di luar
 * scope T-024.1 ini). `outstand*` seluruhnya opsional (working copy T-024.3,
 * ADR-040) dan tidak diisi sama sekali oleh skeleton ini.
 */
export interface MediaItemRecord {
  id: MediaId;
  workspaceId: WorkspaceId;
  uploaderId: UserId;
  filename: string;
  mimeType: string;
  /** Ukuran file dalam bytes. `bigint` — kolom Prisma `size` bertipe `BigInt`. */
  size: bigint;
  url: string | null;
  storagePath: string;
  outstandMediaId: string | null;
  outstandMediaUrl: string | null;
  outstandUploadedAt: Date | null;
  outstandExpiresAt: Date | null;
  type: MediaType;
  width: number | null;
  height: number | null;
  /** Durasi video dalam detik (kolom `Decimal(10,2)`); `null` untuk image/gif. */
  duration: number | null;
  createdAt: Date;
}
