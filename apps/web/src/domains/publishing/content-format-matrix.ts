import { ContentFormat, SocialPlatform } from "@social/shared";
import { PublishingDomainError } from "./errors";

/**
 * Matriks Content Format per platform (ADR-039), mirror server-side dari
 * `getSelectableFormats`/`getDefaultFormat` di client
 * (`apps/web/src/app/(app)/components/draft-editor/Modal.tsx`). Jaga kedua
 * tempat ini konsisten kalau matriks berubah — client menentukan pilihan
 * yang ditampilkan, sini menegakkan aturan yang sama di server sebelum
 * persist/panggil adapter.
 *
 * Platform yang tidak terdaftar di sini hanya mengizinkan `Post` (default
 * client untuk platform selain Instagram/Facebook/Pinterest).
 */
const FORMAT_MATRIX: Partial<Record<SocialPlatform, ContentFormat[]>> = {
  [SocialPlatform.Instagram]: [
    ContentFormat.Post,
    ContentFormat.Reel,
    ContentFormat.Story,
  ],
  [SocialPlatform.Facebook]: [
    ContentFormat.Post,
    ContentFormat.Reel,
    ContentFormat.Story,
  ],
  [SocialPlatform.Pinterest]: [ContentFormat.Pin],
};

function allowedFormatsFor(platform: SocialPlatform): ContentFormat[] {
  return FORMAT_MATRIX[platform] ?? [ContentFormat.Post];
}

/**
 * Throws `PublishingDomainError` kalau `format` tidak diizinkan untuk
 * `platform` menurut matriks ADR-039.
 */
export function assertContentFormatAllowed(
  platform: SocialPlatform,
  format: ContentFormat,
): void {
  const allowed = allowedFormatsFor(platform);
  if (!allowed.includes(format)) {
    throw new PublishingDomainError(
      `Content format "${format}" tidak diizinkan untuk platform "${platform}". ` +
        `Format yang diizinkan: ${allowed.join(", ")}.`,
    );
  }
}

/**
 * Batas maksimum jumlah media (carousel) per `ContentFormat` (T-024.4,
 * ADR-107 — amandemen ADR-039) — batas native platform: IG/FB carousel
 * (Post) maks 10 media, Reel/Story/Pin selalu single media. Mirror
 * client-side WAJIB dijaga sinkron: `maxMediaCountFor` di
 * `apps/web/src/app/(app)/components/draft-editor/Modal.tsx`.
 */
const MAX_MEDIA_COUNT_BY_FORMAT: Record<ContentFormat, number> = {
  [ContentFormat.Post]: 10,
  [ContentFormat.Reel]: 1,
  [ContentFormat.Story]: 1,
  [ContentFormat.Pin]: 1,
};

/** Batas maksimum media untuk SATU `ContentFormat` — lihat `MAX_MEDIA_COUNT_BY_FORMAT`. */
export function maxMediaCountForFormat(format: ContentFormat): number {
  return MAX_MEDIA_COUNT_BY_FORMAT[format];
}

/**
 * Post bisa attach ke beberapa akun target dengan format BERBEDA sekaligus
 * (mis. IG Reel + FB Story dalam 1 post) — karena media yang di-attach itu
 * SATU set untuk seluruh post (`mediaIds` di level `PublishingPost`, bukan
 * per-target), batas efektif untuk seluruh post adalah MINIMUM dari
 * max-count semua format yang sedang dipilih di antara akun target aktif
 * (ADR-107). Array kosong (belum ada akun dipilih sama sekali) → default
 * paling longgar (`Post`, 10), sesuai keputusan King Rezi — supaya user
 * bisa mulai upload media sebelum memilih akun tujuan.
 */
export function maxMediaCountForFormats(formats: ContentFormat[]): number {
  if (formats.length === 0) {
    return MAX_MEDIA_COUNT_BY_FORMAT[ContentFormat.Post];
  }
  return Math.min(
    ...formats.map((format) => MAX_MEDIA_COUNT_BY_FORMAT[format]),
  );
}

/**
 * Throws `PublishingDomainError` kalau `mediaCount` melebihi batas efektif
 * (ADR-107) untuk `formats` yang sedang dipilih.
 */
export function assertMediaCountWithinLimit(
  mediaCount: number,
  formats: ContentFormat[],
): void {
  const max = maxMediaCountForFormats(formats);
  if (mediaCount > max) {
    throw new PublishingDomainError(
      `Jumlah media (${mediaCount}) melebihi batas maksimum ${max} untuk format yang sedang dipilih.`,
    );
  }
}
