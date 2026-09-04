import type { VariantProps } from "class-variance-authority";

import { ContentStatus } from "@social/shared";

import type { badgeVariants } from "@/components/ui/badge";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

/** Status → label mapping (components/status-chips.html, Claude Design). */
export const CONTENT_STATUS_LABEL: Record<ContentStatus, string> = {
  [ContentStatus.Draft]: "Draft",
  [ContentStatus.InReview]: "In Review",
  [ContentStatus.ReadyToSchedule]: "Ready to Schedule",
  [ContentStatus.Scheduled]: "Scheduled",
  [ContentStatus.Published]: "Published",
  [ContentStatus.Failed]: "Failed",
};

/**
 * Status → shadcn `Badge` variant (T-102 cleanup, ADR-097). KI-041: Stone
 * theme shadcn belum punya token warna semantik success/warning/info/purple
 * untuk 6 `ContentStatus` (cuma `destructive` yang punya padanan asli) —
 * dipetakan ke variant shadcn yang SUDAH ADA (`default`/`secondary`/
 * `outline`/`destructive`), bukan warna baru. Pola sama persis dengan
 * `STATUS_BADGE_VARIANT` (`MembersTable.tsx`, T-099) dan
 * `ConnectedAccountsList.tsx` (T-097.3) — perluasan gap KI-041 yang sudah
 * dilaporkan berulang ke King Rezi, BUKAN keputusan baru/menutup KI-041.
 */
export const CONTENT_STATUS_BADGE_VARIANT: Record<ContentStatus, BadgeVariant> =
  {
    [ContentStatus.Draft]: "outline",
    [ContentStatus.InReview]: "outline",
    [ContentStatus.ReadyToSchedule]: "secondary",
    [ContentStatus.Scheduled]: "secondary",
    [ContentStatus.Published]: "default",
    [ContentStatus.Failed]: "destructive",
  };
