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
}

export enum WorkspacePlan {
  Free = "free",
  Pro = "pro",
}
