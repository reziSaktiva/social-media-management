import { asUserId, asWorkspaceId } from "@social/shared";
import { describe, expect, it } from "vitest";
import { ConflictError, ValidationError } from "@/lib/utils/errors";
import type {
  IWorkspaceRepository,
  WorkspaceRecord,
} from "../repositories/workspace.repository";
import { WorkspaceService } from "./workspace.service";

const USER_ID = asUserId("user-1");

function createFakeRepository(
  overrides: Partial<IWorkspaceRepository> = {},
): IWorkspaceRepository {
  return {
    createWithOwner: async ({ name, slug }): Promise<WorkspaceRecord> => ({
      id: asWorkspaceId("workspace-1"),
      name,
      slug,
    }),
    findAnyMembershipSlugByUserId: async () => null,
    findBySlug: async () => null,
    ...overrides,
  };
}

describe("WorkspaceService.createWorkspace", () => {
  it("rejects an empty name without calling the repository", async () => {
    let calls = 0;
    const service = new WorkspaceService(
      createFakeRepository({
        createWithOwner: async (input) => {
          calls += 1;
          return { id: asWorkspaceId("x"), name: input.name, slug: input.slug };
        },
      }),
    );

    await expect(
      service.createWorkspace({ userId: USER_ID, name: "   " }),
    ).rejects.toThrow(ValidationError);
    expect(calls).toBe(0);
  });

  it("rejects a name longer than 100 characters", async () => {
    const service = new WorkspaceService(createFakeRepository());

    await expect(
      service.createWorkspace({ userId: USER_ID, name: "a".repeat(101) }),
    ).rejects.toThrow(ValidationError);
  });

  it("creates a workspace with a slug derived from the name", async () => {
    const service = new WorkspaceService(createFakeRepository());

    const workspace = await service.createWorkspace({
      userId: USER_ID,
      name: "Tim Marketing Acme",
    });

    expect(workspace.slug).toBe("tim-marketing-acme");
  });

  it("retries with a numeric suffix when the slug conflicts", async () => {
    let attempt = 0;
    const service = new WorkspaceService(
      createFakeRepository({
        createWithOwner: async ({ name, slug }) => {
          attempt += 1;
          if (attempt < 3) {
            throw new ConflictError("slug taken");
          }
          return { id: asWorkspaceId("workspace-1"), name, slug };
        },
      }),
    );

    const workspace = await service.createWorkspace({
      userId: USER_ID,
      name: "Acme",
    });

    expect(attempt).toBe(3);
    expect(workspace.slug).toBe("acme-3");
  });

  it("throws once all slug retry attempts are exhausted", async () => {
    const service = new WorkspaceService(
      createFakeRepository({
        createWithOwner: async () => {
          throw new ConflictError("slug taken");
        },
      }),
    );

    await expect(
      service.createWorkspace({ userId: USER_ID, name: "Acme" }),
    ).rejects.toThrow(ConflictError);
  });

  it("does not swallow errors unrelated to slug conflicts", async () => {
    const service = new WorkspaceService(
      createFakeRepository({
        createWithOwner: async () => {
          throw new Error("unexpected");
        },
      }),
    );

    await expect(
      service.createWorkspace({ userId: USER_ID, name: "Acme" }),
    ).rejects.toThrow("unexpected");
  });
});

describe("WorkspaceService.getDefaultWorkspaceSlugForUser", () => {
  it("delegates to the repository", async () => {
    const service = new WorkspaceService(
      createFakeRepository({
        findAnyMembershipSlugByUserId: async () => "acme",
      }),
    );

    await expect(service.getDefaultWorkspaceSlugForUser(USER_ID)).resolves.toBe(
      "acme",
    );
  });
});

describe("WorkspaceService.getWorkspaceBySlug", () => {
  it("delegates to the repository", async () => {
    const record: WorkspaceRecord = {
      id: asWorkspaceId("workspace-1"),
      name: "Acme",
      slug: "acme",
    };
    const service = new WorkspaceService(
      createFakeRepository({
        findBySlug: async () => record,
      }),
    );

    await expect(service.getWorkspaceBySlug("acme")).resolves.toEqual(record);
  });

  it("returns null when no workspace matches the slug", async () => {
    const service = new WorkspaceService(createFakeRepository());

    await expect(service.getWorkspaceBySlug("missing")).resolves.toBeNull();
  });
});
