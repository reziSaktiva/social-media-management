import type { UserId } from "@social/shared";

export interface UploadAvatarInput {
  userId: UserId;
  fileBuffer: Buffer;
  contentType: string;
  /** File extension without leading dot, e.g. "jpg" or "png". */
  extension: string;
}

export interface UploadAvatarResult {
  /** Public URL to the uploaded avatar (`avatars` bucket is Public). */
  url: string;
}

/**
 * Port for avatar file storage — implementation (Supabase Storage) lives in
 * src/lib/adapters/avatar-storage. Kept out of the repository interface
 * because it is infrastructure for a *file*, not a domain record; mirrors
 * the IOutstandAdapter pattern in domains/publishing/adapters.
 */
export interface IAvatarStorageAdapter {
  uploadAvatar(input: UploadAvatarInput): Promise<UploadAvatarResult>;
}
