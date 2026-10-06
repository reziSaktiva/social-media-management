import { cn } from "@/lib/utils";

/**
 * Thumbnail media (video/image) dari URL Supabase Storage — dipakai draft
 * editor (`Modal.tsx`, grid preview carousel) dan Comments Inbox
 * (`EngageInboxView.tsx`, kotak "Post asal"). Diekstrak (review PR #143)
 * karena kedua tempat itu sebelumnya punya markup video/img branching yang
 * identik, tanpa komponen bersama.
 */
export function MediaThumbnail({
  url,
  type,
  alt,
  className,
}: {
  url: string | null | undefined;
  /** Dibandingkan sebagai string ("video" vs selainnya) supaya cocok dengan kedua caller: `MediaItemRecord.type` (`MediaType` enum, domain `media`) dan `DraftMediaDto.type` (`string` mentah, actions.ts draft-editor). */
  type: string;
  alt: string;
  className?: string;
}) {
  if (type === "video") {
    return (
      <video
        src={url ?? undefined}
        className={cn("size-full object-cover", className)}
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
      className={cn("size-full object-cover", className)}
    />
  );
}
