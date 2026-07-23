/** Canonical enums shared across bounded contexts. */

export enum ContentStatus {
  Draft = "draft",
  InReview = "in_review",
  ReadyToSchedule = "ready_to_schedule",
  Scheduled = "scheduled",
  Published = "published",
  Failed = "failed",
}

export enum MemberRole {
  Owner = "owner",
  Admin = "admin",
  Manager = "manager",
  Creator = "creator",
}

export enum SocialPlatform {
  Instagram = "instagram",
  Facebook = "facebook",
  Twitter = "twitter",
  LinkedIn = "linkedin",
  TikTok = "tiktok",
  YouTube = "youtube",
  Threads = "threads",
  Pinterest = "pinterest",
}

export enum WorkspacePlan {
  Free = "free",
  Pro = "pro",
}

/**
 * Format publikasi per target akun (PostTarget).
 * Selector UI menampilkan opsi yang diizinkan per SocialPlatform (lihat domain-model / ADR-039).
 */
export enum ContentFormat {
  Post = "post",
  Reel = "reel",
  Story = "story",
  Pin = "pin",
}

/**
 * Jenis item Engagement yang dapat di-ingest pada MVP (ADR-040).
 * Direct Message dan mention berada di luar scope MVP.
 */
export enum EngagementType {
  Comment = "comment",
}
