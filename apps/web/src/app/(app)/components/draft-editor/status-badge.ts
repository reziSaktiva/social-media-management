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
 * Status → shadcn `Badge` variant (T-102 cleanup, ADR-097). `badge.tsx`
 * sekarang punya variant `warning` (token `--warning`, ADR-098) — dipakai di
 * sini untuk `InReview`/`Scheduled` supaya tetap beda warna dari
 * `Draft`/`ReadyToSchedule` yang berbagi tahap yang sama (code review PR
 * #105), bukan cuma beda label teks.
 */
export const CONTENT_STATUS_BADGE_VARIANT: Record<ContentStatus, BadgeVariant> =
  {
    [ContentStatus.Draft]: "outline",
    [ContentStatus.InReview]: "warning",
    [ContentStatus.ReadyToSchedule]: "secondary",
    [ContentStatus.Scheduled]: "warning",
    [ContentStatus.Published]: "default",
    [ContentStatus.Failed]: "destructive",
  };
