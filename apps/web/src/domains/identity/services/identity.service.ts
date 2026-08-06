import type { UserId } from "@social/shared";
import { ValidationError } from "@/lib/utils/errors";

import type { IAvatarStorageAdapter } from "../adapters/avatar-storage-adapter";
import type { IIdentityRepository } from "../repositories/identity.repository";
import type { UserProfileRecord } from "../types";

const MAX_NAME_LENGTH = 100;
const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB, sesuai mockup account-profile.html

/** MIME type → file extension, dipakai untuk validasi format + naming path storage. */
const ALLOWED_AVATAR_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
};

export interface UpdateProfileInput {
  userId: UserId;
  name: string;
  /** `null`/`undefined` = tidak ganti avatar. */
  avatarFile?: { buffer: Buffer; contentType: string } | null;
}

export class IdentityService {
  constructor(
    private readonly repository: IIdentityRepository,
    private readonly avatarStorage: IAvatarStorageAdapter,
  ) {}

  async getProfile(userId: UserId): Promise<UserProfileRecord | null> {
    return this.repository.findById(userId);
  }

  /**
   * Scope T-016.2: hanya nama + avatar. Email tetap read-only — tidak ada
   * parameter email di sini secara sengaja (tidak ada flow ganti email).
   */
  async updateProfile(input: UpdateProfileInput): Promise<UserProfileRecord> {
    const name = input.name.trim();

    if (!name) {
      throw new ValidationError("Nama wajib diisi.");
    }
    if (name.length > MAX_NAME_LENGTH) {
      throw new ValidationError(`Nama maksimal ${MAX_NAME_LENGTH} karakter.`);
    }

    let image: string | undefined;

    if (input.avatarFile) {
      const extension = ALLOWED_AVATAR_MIME_TYPES[input.avatarFile.contentType];
      if (!extension) {
        throw new ValidationError("Format avatar harus JPG atau PNG.");
      }
      if (input.avatarFile.buffer.byteLength > MAX_AVATAR_BYTES) {
        throw new ValidationError("Ukuran avatar maksimal 2MB.");
      }

      const uploaded = await this.avatarStorage.uploadAvatar({
        userId: input.userId,
        fileBuffer: input.avatarFile.buffer,
        contentType: input.avatarFile.contentType,
        extension,
      });
      image = uploaded.url;
    }

    return this.repository.updateProfile(input.userId, { name, image });
  }
}
