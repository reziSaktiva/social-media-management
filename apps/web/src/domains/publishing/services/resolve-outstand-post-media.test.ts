import { asMediaId, asUserId, asWorkspaceId } from "@social/shared";
import { describe, expect, it, vi } from "vitest";

import type { IOutstandAdapter } from "../adapters/outstand-adapter";
import { resolveOutstandPostMedia } from "./resolve-outstand-post-media";

const WORKSPACE_ID = asWorkspaceId("workspace-1");
const USER_ID = asUserId("user-1");

describe("resolveOutstandPostMedia", () => {
  it("returns undefined when mediaIds empty", async () => {
    const result = await resolveOutstandPostMedia({
      workspaceId: WORKSPACE_ID,
      mediaIds: [],
      actingUserId: USER_ID,
      outstandAdapter: {} as IOutstandAdapter,
      mediaLookup: undefined,
    });
    expect(result).toBeUndefined();
  });

  it("reuses valid outstandMediaUrl without re-upload", async () => {
    const upload = vi.fn();
    const result = await resolveOutstandPostMedia({
      workspaceId: WORKSPACE_ID,
      mediaIds: [asMediaId("media-1")],
      actingUserId: USER_ID,
      outstandAdapter: {
        uploadMediaWorkingCopy: upload,
      } as unknown as IOutstandAdapter,
      mediaLookup: {
        listByIds: async () => [
          {
            id: asMediaId("media-1"),
            filename: "photo.jpg",
            mimeType: "image/jpeg",
            storagePath: "ws/photo.jpg",
            url: null,
            outstandMediaUrl: "https://outstand.example/media/photo.jpg",
            outstandExpiresAt: new Date(Date.now() + 60_000),
          },
        ],
        downloadBytes: async () => Buffer.from("x"),
      },
    });

    expect(result).toEqual([
      {
        url: "https://outstand.example/media/photo.jpg",
        filename: "photo.jpg",
      },
    ]);
    expect(upload).not.toHaveBeenCalled();
  });

  it("downloads + uploadMediaWorkingCopy when outstand URL missing", async () => {
    const upload = vi.fn().mockResolvedValue({
      outstandMediaId: "m1",
      outstandMediaUrl: "https://outstand.example/media/new.jpg",
      expiresAt: new Date(Date.now() + 60_000),
    });
    const download = vi.fn().mockResolvedValue(Buffer.from("bytes"));

    const result = await resolveOutstandPostMedia({
      workspaceId: WORKSPACE_ID,
      mediaIds: [asMediaId("media-2")],
      actingUserId: USER_ID,
      outstandAdapter: {
        uploadMediaWorkingCopy: upload,
      } as unknown as IOutstandAdapter,
      mediaLookup: {
        listByIds: async () => [
          {
            id: asMediaId("media-2"),
            filename: "clip.mp4",
            mimeType: "video/mp4",
            storagePath: "ws/clip.mp4",
            url: "https://signed.example/clip.mp4",
            outstandMediaUrl: null,
            outstandExpiresAt: null,
          },
        ],
        downloadBytes: download,
      },
    });

    expect(download).toHaveBeenCalledWith("ws/clip.mp4");
    expect(upload).toHaveBeenCalledWith({
      fileBuffer: Buffer.from("bytes"),
      mimeType: "video/mp4",
    });
    expect(result).toEqual([
      {
        url: "https://outstand.example/media/new.jpg",
        filename: "clip.mp4",
      },
    ]);
  });
});
