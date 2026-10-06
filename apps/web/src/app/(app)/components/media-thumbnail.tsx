import { cn } from "@/lib/utils";

/**
 * Thumbnail media (video/image) dari URL Supabase Storage — dipakai draft
 * editor (`Modal.tsx`, grid preview carousel), Comments Inbox
 * (`EngageInboxView.tsx`, kotak "Post asal"), dan History Detail
 * (`HistoryDetail.tsx`). Diekstrak (review PR #143) karena beberapa tempat
 * itu sebelumnya punya markup video/img branching yang identik, tanpa
 * komponen bersama.
 */
export function MediaThumbnail({
  url,
  type,
  alt,
  className,
  fit = "cover",
}: {
  url: string | null | undefined;
  /** Dibandingkan sebagai string ("video" vs selainnya) supaya cocok dengan kedua caller: `MediaItemRecord.type` (`MediaType` enum, domain `media`) dan `DraftMediaDto.type` (`string` mentah, actions.ts draft-editor). */
  type: string;
  alt: string;
  className?: string;
  /**
   * `object-fit` (KI-083, review PR #144) — eksplisit lewat prop, bukan
   * string literal `className="object-contain"` di call-site yang
   * mengandalkan tailwind-merge diam-diam men-dedupe konflik dengan default
   * `object-cover` di bawah. `"cover"` (default) untuk grid aktif
   * mengkurasi media sendiri (Modal.tsx — crop mengisi kotak itu wajar);
   * `"contain"` untuk preview read-only media yang sudah dipublish (Post
   * asal Comments Inbox, History Detail — rasio aspek asli harus terlihat
   * utuh, bukan di-crop).
   */
  fit?: "cover" | "contain";
}) {
  const fitClassName = fit === "contain" ? "object-contain" : "object-cover";

  if (type === "video") {
    return (
      <video
        src={url ?? undefined}
        className={cn("size-full", fitClassName, className)}
        muted
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- signed URL Supabase Storage (MediaItemRecord.url), tidak cocok next/image remote pattern statis.
    <img
      src={url ?? undefined}
      alt={alt}
      className={cn("size-full", fitClassName, className)}
    />
  );
}
