import type { VariantProps } from "class-variance-authority";

import { ContentStatus } from "@social/shared";

import type { badgeVariants } from "@/components/ui/badge";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

/**
 * Status → label mapping (components/status-chips.html, Claude Design).
 *
 * `[ContentStatus.Imported]` (T-090, ADR-093) — placeholder SEMENTARA,
 * BUKAN keputusan desain final. `Imported` ditambahkan ke `ContentStatus`
 * oleh T-090.1-4 (skema + domain logic Import Posts), tapi UI kartunya
 * (T-090.5) masih **blocked** — belum ada rancangan Claude Design
 * (AGENTS.md rule 17). Entry ini HANYA untuk memenuhi `Record<ContentStatus,
 * string>` (TypeScript exhaustiveness check, bukan tentang UI) supaya
 * codebase tetap compile; `PublishingService.listCalendarPosts` sudah
 * meng-exclude `Imported` dari query default Calendar (lihat
 * `CALENDAR_DEFAULT_STATUSES_EXCLUDING_IMPORTED`) jadi label ini TIDAK
 * seharusnya pernah benar-benar tampil di UI sekarang — ganti nilainya
 * (dan hapus comment ini) saat T-090.5 benar-benar dikerjakan dengan
 * rancangan Claude Design yang sudah dikonfirmasi King Rezi.
 */
export const CONTENT_STATUS_LABEL: Record<ContentStatus, string> = {
  [ContentStatus.Draft]: "Draft",
  [ContentStatus.InReview]: "In Review",
  [ContentStatus.ReadyToSchedule]: "Ready to Schedule",
  [ContentStatus.Scheduled]: "Scheduled",
  [ContentStatus.Published]: "Published",
  [ContentStatus.Failed]: "Failed",
  [ContentStatus.Imported]: "Imported",
};

/**
 * Status → shadcn `Badge` variant (T-102 cleanup, ADR-097). `badge.tsx`
 * punya variant `warning` (token `--warning`, ADR-098) — dipakai di sini
 * untuk `InReview`/`Scheduled` supaya tetap beda warna dari
 * `Draft`/`ReadyToSchedule` yang berbagi tahap yang sama (code review PR
 * #105), bukan cuma beda label teks. `Published` memakai variant `success`
 * (token `--success`, ADR-098, di-wire ke `Badge` saat penutupan KI-051)
 * supaya konsisten dengan mockup Claude Design (`components/status-chips.html`).
 */
export const CONTENT_STATUS_BADGE_VARIANT: Record<ContentStatus, BadgeVariant> =
  {
    [ContentStatus.Draft]: "outline",
    [ContentStatus.InReview]: "warning",
    [ContentStatus.ReadyToSchedule]: "secondary",
    [ContentStatus.Scheduled]: "warning",
    [ContentStatus.Published]: "success",
    [ContentStatus.Failed]: "destructive",
    // T-090, ADR-093 — placeholder, lihat catatan di `CONTENT_STATUS_LABEL`.
    [ContentStatus.Imported]: "outline",
  };
