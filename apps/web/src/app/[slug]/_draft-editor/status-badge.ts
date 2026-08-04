import type { BadgeVariant } from "@astryxdesign/core/Badge";

import { ContentStatus } from "@social/shared";

/** Status → label mapping (components/status-chips.html, Claude Design). */
export const CONTENT_STATUS_LABEL: Record<ContentStatus, string> = {
  [ContentStatus.Draft]: "Draft",
  [ContentStatus.InReview]: "In Review",
  [ContentStatus.ReadyToSchedule]: "Ready to Schedule",
  [ContentStatus.Scheduled]: "Scheduled",
  [ContentStatus.Published]: "Published",
  [ContentStatus.Failed]: "Failed",
};

/** Status → Badge variant mapping (components/status-chips.html, Claude Design). */
export const CONTENT_STATUS_BADGE_VARIANT: Record<ContentStatus, BadgeVariant> =
  {
    [ContentStatus.Draft]: "neutral",
    [ContentStatus.InReview]: "warning",
    [ContentStatus.ReadyToSchedule]: "info",
    [ContentStatus.Scheduled]: "purple",
    [ContentStatus.Published]: "success",
    [ContentStatus.Failed]: "error",
  };
