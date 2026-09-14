import { asMediaId, asUserId, asWorkspaceId, MediaType } from "@social/shared";
import { describe, expect, it } from "vitest";
import { NotFoundError } from "@/lib/utils/errors";
import type { IMediaRepository } from "../repositories/media.repository";
import type { MediaItemRecord } from "../types";
import { MediaService } from "./media.service";

const WORKSPACE_ID = asWorkspaceId("workspace-1");
const UPLOADER_ID = asUserId("user-1");
const MEDIA_ID = asMediaId("media-1");

function createRecord(
  overrides: Partial<MediaItemRecord> = {},
): MediaItemRecord {
  return {
    id: MEDIA_ID,
    workspaceId: WORKSPACE_ID,
    uploaderId: UPLOADER_ID,
    filename: "photo.jpg",
    mimeType: "image/jpeg",
    size: BigInt(1024),
    url: null,
    storagePath: "workspace-1/photo.jpg",
    outstandMediaId: null,
    outstandMediaUrl: null,
    outstandUploadedAt: null,
    outstandExpiresAt: null,
    type: MediaType.Image,
    width: 800,
    height: 600,
    duration: null,
    createdAt: new Date("2026-09-14T00:00:00Z"),
    ...overrides,
  };
}

function createFakeRepository(
  overrides: Partial<IMediaRepository> = {},
): IMediaRepository {
  return {
    create: async () => createRecord(),
    findById: async () => null,
    findByWorkspace: async () => [],
    delete: async () => null,
    ...overrides,
  };
}

describe("MediaService", () => {
  it("createMediaItem() delegates to repository.create() and returns the created record", async () => {
    let captured: Parameters<IMediaRepository["create"]>[0] | null = null;
    const repository = createFakeRepository({
      create: async (input) => {
        captured = input;
        return createRecord({ filename: input.filename });
      },
    });
    const service = new MediaService(repository);

    const result = await service.createMediaItem(
      {
        workspaceId: WORKSPACE_ID,
        uploaderId: UPLOADER_ID,
        filename: "photo.jpg",
        mimeType: "image/jpeg",
        size: BigInt(1024),
        storagePath: "workspace-1/photo.jpg",
        type: MediaType.Image,
        width: 800,
        height: 600,
      },
      UPLOADER_ID,
    );

    expect(captured).toEqual({
      workspaceId: WORKSPACE_ID,
      uploaderId: UPLOADER_ID,
      filename: "photo.jpg",
      mimeType: "image/jpeg",
      size: BigInt(1024),
      storagePath: "workspace-1/photo.jpg",
      type: MediaType.Image,
      width: 800,
      height: 600,
    });
    expect(result.id).toBe(MEDIA_ID);
    expect(result.filename).toBe("photo.jpg");
  });

  it("getMediaItem() returns the record when found", async () => {
    const repository = createFakeRepository({
      findById: async () => createRecord(),
    });
    const service = new MediaService(repository);

    const result = await service.getMediaItem(
      { workspaceId: WORKSPACE_ID, mediaId: MEDIA_ID },
      UPLOADER_ID,
    );

    expect(result.id).toBe(MEDIA_ID);
  });

  it("getMediaItem() throws NotFoundError when repository returns null (not found or wrong workspace)", async () => {
    const repository = createFakeRepository({ findById: async () => null });
    const service = new MediaService(repository);

    await expect(
      service.getMediaItem(
        { workspaceId: WORKSPACE_ID, mediaId: MEDIA_ID },
        UPLOADER_ID,
      ),
    ).rejects.toThrow(NotFoundError);
  });

  it("listMediaItems() delegates to repository.findByWorkspace()", async () => {
    const records = [
      createRecord(),
      createRecord({ id: asMediaId("media-2") }),
    ];
    const repository = createFakeRepository({
      findByWorkspace: async () => records,
    });
    const service = new MediaService(repository);

    const result = await service.listMediaItems(
      { workspaceId: WORKSPACE_ID },
      UPLOADER_ID,
    );

    expect(result).toHaveLength(2);
  });

  it("deleteMediaItem() returns the deleted record when found", async () => {
    const repository = createFakeRepository({
      delete: async () => createRecord(),
    });
    const service = new MediaService(repository);

    const result = await service.deleteMediaItem(
      { workspaceId: WORKSPACE_ID, mediaId: MEDIA_ID },
      UPLOADER_ID,
    );

    expect(result.id).toBe(MEDIA_ID);
  });

  it("deleteMediaItem() throws NotFoundError when repository returns null (not found or wrong workspace)", async () => {
    const repository = createFakeRepository({ delete: async () => null });
    const service = new MediaService(repository);

    await expect(
      service.deleteMediaItem(
        { workspaceId: WORKSPACE_ID, mediaId: MEDIA_ID },
        UPLOADER_ID,
      ),
    ).rejects.toThrow(NotFoundError);
  });
});
