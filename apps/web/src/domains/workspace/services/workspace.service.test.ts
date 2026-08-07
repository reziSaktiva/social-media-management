import {
  asConnectedAccountId,
  asInvitationId,
  asMemberId,
  asUserId,
  asWorkspaceId,
  InvitationStatus,
  MemberRole,
  MemberStatus,
  SocialPlatform,
} from "@social/shared";
import type { MemberId, UserId } from "@social/shared";
import { describe, expect, it } from "vitest";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/utils/errors";
import type {
  ConnectedAccountRecord,
  IWorkspaceRepository,
  WorkspaceInvitationRecord,
  WorkspaceMemberRecord,
  WorkspaceRecord,
} from "../repositories/workspace.repository";
import { WorkspaceService } from "./workspace.service";

const USER_ID = asUserId("user-1");
const WORKSPACE_ID = asWorkspaceId("workspace-1");

function createFakeRepository(
  overrides: Partial<IWorkspaceRepository> = {},
): IWorkspaceRepository {
  const members = new Map<string, WorkspaceMemberRecord>();
  const invitations = new Map<string, WorkspaceInvitationRecord>();

  return {
    createWithOwner: async ({ name, slug }): Promise<WorkspaceRecord> => ({
      id: asWorkspaceId("workspace-1"),
      name,
      slug,
    }),
    findAnyMembershipSlugByUserId: async () => null,
    findDefaultWorkspaceForUser: async () => null,
    findBySlug: async () => null,
    listConnectedAccounts: async () => [],
    getMember: async (_workspaceId, userId) => {
      for (const member of members.values()) {
        if (member.userId === userId) {
          return member;
        }
      }
      return null;
    },
    findMemberById: async (_workspaceId, memberId) =>
      members.get(memberId) ?? null,
    removeMember: async (_workspaceId, memberId) => {
      members.delete(memberId);
    },
    updateMemberRole: async (_workspaceId, memberId, role) => {
      const existing = members.get(memberId);
      if (existing) {
        members.set(memberId, { ...existing, role });
      }
    },
    createInvitation: async (input): Promise<WorkspaceInvitationRecord> => {
      const invitation: WorkspaceInvitationRecord = {
        id: asInvitationId(`invitation-${invitations.size + 1}`),
        workspaceId: input.workspaceId,
        email: input.email,
        role: input.role,
        token: input.token,
        status: InvitationStatus.Pending,
        expiresAt: input.expiresAt,
      };
      invitations.set(invitation.token, invitation);
      return invitation;
    },
    findInvitationByToken: async (token) => invitations.get(token) ?? null,
    ...overrides,
  };
}

/** Helper — daftarkan member fake langsung ke Map internal via seed override. */
function seedMembers(
  seed: WorkspaceMemberRecord[],
): Partial<IWorkspaceRepository> {
  const members = new Map<string, WorkspaceMemberRecord>();
  for (const member of seed) {
    members.set(member.id, member);
  }

  return {
    getMember: async (_workspaceId, userId) => {
      for (const member of members.values()) {
        if (member.userId === userId) {
          return member;
        }
      }
      return null;
    },
    findMemberById: async (_workspaceId, memberId) =>
      members.get(memberId) ?? null,
    removeMember: async (_workspaceId, memberId) => {
      members.delete(memberId);
    },
    updateMemberRole: async (_workspaceId, memberId, role) => {
      const existing = members.get(memberId);
      if (existing) {
        members.set(memberId, { ...existing, role });
      }
    },
  };
}

function member(
  userId: UserId,
  memberId: MemberId,
  role: MemberRole,
  status: MemberStatus = MemberStatus.Active,
): WorkspaceMemberRecord {
  return { id: memberId, workspaceId: WORKSPACE_ID, userId, role, status };
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

describe("WorkspaceService.listConnectedAccounts", () => {
  it("delegates to the repository", async () => {
    const accounts: ConnectedAccountRecord[] = [
      {
        id: asConnectedAccountId("conn-1"),
        workspaceId: asWorkspaceId("workspace-1"),
        platform: SocialPlatform.Instagram,
        outstandAccountId: "mock-ig-001",
        handle: "@insvire.demo",
        status: "active",
        reconnectRequired: false,
        connectedAt: new Date("2026-01-01T00:00:00Z"),
      },
    ];
    const service = new WorkspaceService(
      createFakeRepository({
        listConnectedAccounts: async () => accounts,
      }),
    );

    await expect(
      service.listConnectedAccounts(asWorkspaceId("workspace-1")),
    ).resolves.toBe(accounts);
  });
});

describe("WorkspaceService.removeMember", () => {
  const OWNER_USER = asUserId("owner-user");
  const ADMIN_USER = asUserId("admin-user");
  const MANAGER_USER = asUserId("manager-user");
  const CREATOR_USER = asUserId("creator-user");

  const OWNER_MEMBER_ID = asMemberId("member-owner");
  const ADMIN_MEMBER_ID = asMemberId("member-admin");
  const MANAGER_MEMBER_ID = asMemberId("member-manager");
  const CREATOR_MEMBER_ID = asMemberId("member-creator");

  function baseSeed(): WorkspaceMemberRecord[] {
    return [
      member(OWNER_USER, OWNER_MEMBER_ID, MemberRole.Owner),
      member(ADMIN_USER, ADMIN_MEMBER_ID, MemberRole.Admin),
      member(MANAGER_USER, MANAGER_MEMBER_ID, MemberRole.Manager),
      member(CREATOR_USER, CREATOR_MEMBER_ID, MemberRole.Creator),
    ];
  }

  it("allows Owner to remove an Admin/Manager/Creator member", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await service.removeMember(WORKSPACE_ID, OWNER_USER, MANAGER_MEMBER_ID);

    await expect(
      service.removeMember(WORKSPACE_ID, OWNER_USER, MANAGER_MEMBER_ID),
    ).rejects.toThrow(NotFoundError);
  });

  it("allows Admin to remove a Manager/Creator member", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.removeMember(WORKSPACE_ID, ADMIN_USER, CREATOR_MEMBER_ID),
    ).resolves.toBeUndefined();
  });

  it("rejects Admin trying to remove the Owner", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.removeMember(WORKSPACE_ID, ADMIN_USER, OWNER_MEMBER_ID),
    ).rejects.toThrow(AuthorizationError);
  });

  it("rejects Manager as actor even against a valid target", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.removeMember(WORKSPACE_ID, MANAGER_USER, CREATOR_MEMBER_ID),
    ).rejects.toThrow(AuthorizationError);
  });

  it("rejects Creator as actor even against a valid target", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.removeMember(WORKSPACE_ID, CREATOR_USER, MANAGER_MEMBER_ID),
    ).rejects.toThrow(AuthorizationError);
  });

  it("throws NotFoundError when the target member id does not exist", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.removeMember(WORKSPACE_ID, OWNER_USER, asMemberId("missing")),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws AuthorizationError when the actor is not an active member", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.removeMember(
        WORKSPACE_ID,
        asUserId("stranger-user"),
        MANAGER_MEMBER_ID,
      ),
    ).rejects.toThrow(AuthorizationError);
  });

  it("throws AuthorizationError when the actor's membership is not Active", async () => {
    const seed = baseSeed();
    seed.push(
      member(
        asUserId("pending-user"),
        asMemberId("member-pending"),
        MemberRole.Admin,
        MemberStatus.Pending,
      ),
    );
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(seed)),
    );

    await expect(
      service.removeMember(
        WORKSPACE_ID,
        asUserId("pending-user"),
        MANAGER_MEMBER_ID,
      ),
    ).rejects.toThrow(AuthorizationError);
  });
});

describe("WorkspaceService.updateMemberRole", () => {
  const OWNER_USER = asUserId("owner-user");
  const ADMIN_USER = asUserId("admin-user");
  const MANAGER_USER = asUserId("manager-user");

  const OWNER_MEMBER_ID = asMemberId("member-owner");
  const ADMIN_MEMBER_ID = asMemberId("member-admin");
  const MANAGER_MEMBER_ID = asMemberId("member-manager");
  const CREATOR_MEMBER_ID = asMemberId("member-creator");

  function baseSeed(): WorkspaceMemberRecord[] {
    return [
      member(OWNER_USER, OWNER_MEMBER_ID, MemberRole.Owner),
      member(ADMIN_USER, ADMIN_MEMBER_ID, MemberRole.Admin),
      member(MANAGER_USER, MANAGER_MEMBER_ID, MemberRole.Manager),
      member(asUserId("creator-user"), CREATOR_MEMBER_ID, MemberRole.Creator),
    ];
  }

  it("allows Owner to update an Admin/Manager/Creator member's role", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.updateMemberRole(
        WORKSPACE_ID,
        OWNER_USER,
        MANAGER_MEMBER_ID,
        MemberRole.Admin,
      ),
    ).resolves.toBeUndefined();
  });

  it("allows Admin to update a Manager/Creator member's role", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.updateMemberRole(
        WORKSPACE_ID,
        ADMIN_USER,
        CREATOR_MEMBER_ID,
        MemberRole.Manager,
      ),
    ).resolves.toBeUndefined();
  });

  it("rejects Admin trying to change the Owner's role", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.updateMemberRole(
        WORKSPACE_ID,
        ADMIN_USER,
        OWNER_MEMBER_ID,
        MemberRole.Admin,
      ),
    ).rejects.toThrow(AuthorizationError);
  });

  it("rejects Manager as actor even against a valid target", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.updateMemberRole(
        WORKSPACE_ID,
        MANAGER_USER,
        CREATOR_MEMBER_ID,
        MemberRole.Admin,
      ),
    ).rejects.toThrow(AuthorizationError);
  });

  it("rejects promoting a member to Owner via updateMemberRole", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.updateMemberRole(
        WORKSPACE_ID,
        OWNER_USER,
        MANAGER_MEMBER_ID,
        MemberRole.Owner,
      ),
    ).rejects.toThrow(ValidationError);
  });

  it("throws NotFoundError when the target member id does not exist", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.updateMemberRole(
        WORKSPACE_ID,
        OWNER_USER,
        asMemberId("missing"),
        MemberRole.Admin,
      ),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws AuthorizationError when the actor is not an active member", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.updateMemberRole(
        WORKSPACE_ID,
        asUserId("stranger-user"),
        MANAGER_MEMBER_ID,
        MemberRole.Admin,
      ),
    ).rejects.toThrow(AuthorizationError);
  });
});
