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
    findDefaultWorkspaceForUser: async () => null,
    findById: async () => null,
    listConnectedAccounts: async () => [],
    countActiveConnectedAccounts: async () => 0,
    listMembers: async () => [],
    findUsersByIds: async () => [],
    saveChannelOrder: async () => undefined,
    getChannelOrder: async () => [],
    deleteWorkspace: async () => undefined,
    setPendingOwnerTransfer: async () => undefined,
    clearPendingOwnerTransfer: async () => undefined,
    acceptOwnershipTransfer: async () => undefined,
    renameWorkspace: async (workspaceId, name) => ({
      id: workspaceId,
      name,
      slug: "workspace-1",
    }),
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

describe("WorkspaceService.getWorkspaceById", () => {
  it("delegates to the repository", async () => {
    const record: WorkspaceRecord = {
      id: WORKSPACE_ID,
      name: "Acme",
      slug: "acme",
    };
    const service = new WorkspaceService(
      createFakeRepository({
        findById: async () => record,
      }),
    );

    await expect(service.getWorkspaceById(WORKSPACE_ID)).resolves.toEqual(
      record,
    );
  });

  it("returns null when no workspace matches the id", async () => {
    const service = new WorkspaceService(createFakeRepository());

    await expect(
      service.getWorkspaceById(asWorkspaceId("missing")),
    ).resolves.toBeNull();
  });
});

describe("WorkspaceService.getMembership", () => {
  it("delegates to the repository", async () => {
    const ownerId = asUserId("owner-user");
    const ownerMemberId = asMemberId("member-owner");
    const record = member(ownerId, ownerMemberId, MemberRole.Owner);
    const service = new WorkspaceService(
      createFakeRepository(seedMembers([record])),
    );

    await expect(service.getMembership(WORKSPACE_ID, ownerId)).resolves.toEqual(
      record,
    );
  });

  it("returns null when the user has no membership", async () => {
    const service = new WorkspaceService(createFakeRepository());

    await expect(
      service.getMembership(WORKSPACE_ID, asUserId("stranger-user")),
    ).resolves.toBeNull();
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
      service.listConnectedAccounts(asWorkspaceId("workspace-1"), USER_ID),
    ).resolves.toBe(accounts);
  });
});

describe("WorkspaceService.countActiveConnectedAccounts", () => {
  it("delegates to the repository's count-only query (T-042.2)", async () => {
    const service = new WorkspaceService(
      createFakeRepository({
        countActiveConnectedAccounts: async () => 2,
      }),
    );

    await expect(
      service.countActiveConnectedAccounts(
        asWorkspaceId("workspace-1"),
        USER_ID,
      ),
    ).resolves.toBe(2);
  });

  it("returns 0 when the repository reports no active accounts", async () => {
    const service = new WorkspaceService(
      createFakeRepository({ countActiveConnectedAccounts: async () => 0 }),
    );

    await expect(
      service.countActiveConnectedAccounts(
        asWorkspaceId("workspace-1"),
        USER_ID,
      ),
    ).resolves.toBe(0);
  });
});

describe("WorkspaceService.listMembersWithUser", () => {
  it("joins member records with user name/email", async () => {
    const ownerId = asUserId("owner-user");
    const adminId = asUserId("admin-user");
    const ownerMemberId = asMemberId("member-owner");
    const adminMemberId = asMemberId("member-admin");

    const service = new WorkspaceService(
      createFakeRepository({
        listMembers: async () => [
          member(ownerId, ownerMemberId, MemberRole.Owner),
          member(adminId, adminMemberId, MemberRole.Admin),
        ],
        findUsersByIds: async () => [
          { id: ownerId, name: "Raka", email: "raka@example.com" },
          { id: adminId, name: "Maya", email: "maya@example.com" },
        ],
      }),
    );

    const result = await service.listMembersWithUser(WORKSPACE_ID, USER_ID);

    expect(result).toEqual([
      {
        id: ownerMemberId,
        userId: ownerId,
        name: "Raka",
        email: "raka@example.com",
        role: MemberRole.Owner,
        status: MemberStatus.Active,
      },
      {
        id: adminMemberId,
        userId: adminId,
        name: "Maya",
        email: "maya@example.com",
        role: MemberRole.Admin,
        status: MemberStatus.Active,
      },
    ]);
  });

  it("silently skips members whose user record is missing", async () => {
    const ownerId = asUserId("owner-user");
    const orphanUserId = asUserId("orphan-user");
    const ownerMemberId = asMemberId("member-owner");
    const orphanMemberId = asMemberId("member-orphan");

    const service = new WorkspaceService(
      createFakeRepository({
        listMembers: async () => [
          member(ownerId, ownerMemberId, MemberRole.Owner),
          member(orphanUserId, orphanMemberId, MemberRole.Creator),
        ],
        findUsersByIds: async () => [
          { id: ownerId, name: "Raka", email: "raka@example.com" },
        ],
      }),
    );

    const result = await service.listMembersWithUser(WORKSPACE_ID, USER_ID);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(ownerMemberId);
  });
});

describe("WorkspaceService.removeMember", () => {
  const OWNER_USER = asUserId("owner-user");
  const ADMIN_USER = asUserId("admin-user");
  const CREATOR_USER = asUserId("creator-user");

  const OWNER_MEMBER_ID = asMemberId("member-owner");
  const ADMIN_MEMBER_ID = asMemberId("member-admin");
  const CREATOR_MEMBER_ID = asMemberId("member-creator");

  function baseSeed(): WorkspaceMemberRecord[] {
    return [
      member(OWNER_USER, OWNER_MEMBER_ID, MemberRole.Owner),
      member(ADMIN_USER, ADMIN_MEMBER_ID, MemberRole.Admin),
      member(CREATOR_USER, CREATOR_MEMBER_ID, MemberRole.Creator),
    ];
  }

  it("allows Owner to remove an Admin or Creator member", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await service.removeMember(WORKSPACE_ID, OWNER_USER, CREATOR_MEMBER_ID);

    await expect(
      service.removeMember(WORKSPACE_ID, OWNER_USER, CREATOR_MEMBER_ID),
    ).rejects.toThrow(NotFoundError);
  });

  it("allows Admin to remove a Creator member", async () => {
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

  it("rejects Creator as actor even against a valid target", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.removeMember(WORKSPACE_ID, CREATOR_USER, ADMIN_MEMBER_ID),
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
        CREATOR_MEMBER_ID,
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
        CREATOR_MEMBER_ID,
      ),
    ).rejects.toThrow(AuthorizationError);
  });
});

describe("WorkspaceService.updateMemberRole", () => {
  const OWNER_USER = asUserId("owner-user");
  const ADMIN_USER = asUserId("admin-user");
  const CREATOR_USER = asUserId("creator-user");

  const OWNER_MEMBER_ID = asMemberId("member-owner");
  const ADMIN_MEMBER_ID = asMemberId("member-admin");
  const CREATOR_MEMBER_ID = asMemberId("member-creator");

  function baseSeed(): WorkspaceMemberRecord[] {
    return [
      member(OWNER_USER, OWNER_MEMBER_ID, MemberRole.Owner),
      member(ADMIN_USER, ADMIN_MEMBER_ID, MemberRole.Admin),
      member(CREATOR_USER, CREATOR_MEMBER_ID, MemberRole.Creator),
    ];
  }

  it("allows Owner to update an Admin or Creator member's role", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.updateMemberRole(
        WORKSPACE_ID,
        OWNER_USER,
        CREATOR_MEMBER_ID,
        MemberRole.Admin,
      ),
    ).resolves.toBeUndefined();
  });

  it("allows Admin to update a Creator member's role", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.updateMemberRole(
        WORKSPACE_ID,
        ADMIN_USER,
        CREATOR_MEMBER_ID,
        MemberRole.Admin,
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

  it("rejects Creator as actor even against a valid target", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.updateMemberRole(
        WORKSPACE_ID,
        CREATOR_USER,
        ADMIN_MEMBER_ID,
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
        CREATOR_MEMBER_ID,
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
        CREATOR_MEMBER_ID,
        MemberRole.Admin,
      ),
    ).rejects.toThrow(AuthorizationError);
  });
});

describe("WorkspaceService.inviteMember", () => {
  const OWNER_USER = asUserId("owner-user");
  const ADMIN_USER = asUserId("admin-user");
  const CREATOR_USER = asUserId("creator-user");

  const OWNER_MEMBER_ID = asMemberId("member-owner");
  const ADMIN_MEMBER_ID = asMemberId("member-admin");
  const CREATOR_MEMBER_ID = asMemberId("member-creator");

  function baseSeed(): WorkspaceMemberRecord[] {
    return [
      member(OWNER_USER, OWNER_MEMBER_ID, MemberRole.Owner),
      member(ADMIN_USER, ADMIN_MEMBER_ID, MemberRole.Admin),
      member(CREATOR_USER, CREATOR_MEMBER_ID, MemberRole.Creator),
    ];
  }

  it("allows Owner to invite a new member and generates a token + 7-day expiry", async () => {
    const before = Date.now();
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    const invitation = await service.inviteMember(WORKSPACE_ID, OWNER_USER, {
      email: "Newbie@Example.com",
      role: MemberRole.Creator,
    });

    expect(invitation.email).toBe("newbie@example.com");
    expect(invitation.role).toBe(MemberRole.Creator);
    expect(invitation.status).toBe(InvitationStatus.Pending);
    expect(invitation.token).toMatch(/^[0-9a-f]{64}$/);

    const expectedMinExpiry = before + 7 * 24 * 60 * 60 * 1000;
    const expectedMaxExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
    expect(invitation.expiresAt.getTime()).toBeGreaterThanOrEqual(
      expectedMinExpiry,
    );
    expect(invitation.expiresAt.getTime()).toBeLessThanOrEqual(
      expectedMaxExpiry,
    );
  });

  it("allows Admin to invite a new member", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.inviteMember(WORKSPACE_ID, ADMIN_USER, {
        email: "another@example.com",
        role: MemberRole.Admin,
      }),
    ).resolves.toMatchObject({ email: "another@example.com" });
  });

  it("rejects Creator as actor", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.inviteMember(WORKSPACE_ID, CREATOR_USER, {
        email: "another@example.com",
        role: MemberRole.Creator,
      }),
    ).rejects.toThrow(AuthorizationError);
  });

  it("throws AuthorizationError when the actor is not a member", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.inviteMember(WORKSPACE_ID, asUserId("stranger-user"), {
        email: "another@example.com",
        role: MemberRole.Creator,
      }),
    ).rejects.toThrow(AuthorizationError);
  });

  it("rejects inviting a new member as Owner", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.inviteMember(WORKSPACE_ID, OWNER_USER, {
        email: "another@example.com",
        role: MemberRole.Owner,
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("rejects an empty email", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.inviteMember(WORKSPACE_ID, OWNER_USER, {
        email: "   ",
        role: MemberRole.Creator,
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("rejects a malformed email", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.inviteMember(WORKSPACE_ID, OWNER_USER, {
        email: "not-an-email",
        role: MemberRole.Creator,
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("propagates ConflictError when an invitation for the email already exists", async () => {
    const service = new WorkspaceService(
      createFakeRepository({
        ...seedMembers(baseSeed()),
        createInvitation: async () => {
          throw new ConflictError(
            'Undangan untuk "dup@example.com" di workspace ini sudah ada.',
          );
        },
      }),
    );

    await expect(
      service.inviteMember(WORKSPACE_ID, OWNER_USER, {
        email: "dup@example.com",
        role: MemberRole.Creator,
      }),
    ).rejects.toThrow(ConflictError);
  });
});

describe("WorkspaceService.saveChannelOrder", () => {
  it("drops ids that are not owned by the workspace before persisting", async () => {
    const ownedAccount: ConnectedAccountRecord = {
      id: asConnectedAccountId("conn-owned"),
      workspaceId: WORKSPACE_ID,
      platform: SocialPlatform.Instagram,
      outstandAccountId: "mock-ig-owned",
      handle: "@owned",
      status: "active",
      reconnectRequired: false,
      connectedAt: new Date("2026-01-01T00:00:00Z"),
    };
    let received:
      Parameters<IWorkspaceRepository["saveChannelOrder"]>[0] | null = null;
    const service = new WorkspaceService(
      createFakeRepository({
        listConnectedAccounts: async () => [ownedAccount],
        saveChannelOrder: async (input) => {
          received = input;
        },
      }),
    );

    await service.saveChannelOrder(WORKSPACE_ID, USER_ID, [
      asConnectedAccountId("conn-foreign"),
      ownedAccount.id,
    ]);

    expect(received).toEqual({
      workspaceId: WORKSPACE_ID,
      userId: USER_ID,
      orderedConnectedAccountIds: [ownedAccount.id],
    });
  });
});

describe("WorkspaceService.listTransferEligibleMembers", () => {
  it("returns only Active Admins, excluding Owner/Creator/pending Admin", async () => {
    const ownerId = asUserId("owner-user");
    const activeAdminId = asUserId("active-admin");
    const pendingAdminId = asUserId("pending-admin");
    const creatorId = asUserId("creator-user");

    const service = new WorkspaceService(
      createFakeRepository({
        listMembers: async () => [
          member(ownerId, asMemberId("m-owner"), MemberRole.Owner),
          member(activeAdminId, asMemberId("m-admin-active"), MemberRole.Admin),
          member(
            pendingAdminId,
            asMemberId("m-admin-pending"),
            MemberRole.Admin,
            MemberStatus.Pending,
          ),
          member(creatorId, asMemberId("m-creator"), MemberRole.Creator),
        ],
        findUsersByIds: async () => [
          { id: ownerId, name: "Raka", email: "raka@example.com" },
          { id: activeAdminId, name: "Maya", email: "maya@example.com" },
          { id: pendingAdminId, name: "Sinta", email: "sinta@example.com" },
          { id: creatorId, name: "Dimas", email: "dimas@example.com" },
        ],
      }),
    );

    const result = await service.listTransferEligibleMembers(
      WORKSPACE_ID,
      ownerId,
    );

    expect(result).toEqual([
      {
        id: asMemberId("m-admin-active"),
        userId: activeAdminId,
        name: "Maya",
        email: "maya@example.com",
        role: MemberRole.Admin,
        status: MemberStatus.Active,
      },
    ]);
  });
});

describe("WorkspaceService.deleteWorkspace", () => {
  const OWNER_USER = asUserId("owner-user");
  const ADMIN_USER = asUserId("admin-user");
  const OWNER_MEMBER_ID = asMemberId("member-owner");
  const ADMIN_MEMBER_ID = asMemberId("member-admin");

  function baseSeed(): WorkspaceMemberRecord[] {
    return [
      member(OWNER_USER, OWNER_MEMBER_ID, MemberRole.Owner),
      member(ADMIN_USER, ADMIN_MEMBER_ID, MemberRole.Admin),
    ];
  }

  it("allows Owner to delete the workspace", async () => {
    let deleted = 0;
    const service = new WorkspaceService(
      createFakeRepository({
        ...seedMembers(baseSeed()),
        deleteWorkspace: async () => {
          deleted += 1;
        },
      }),
    );

    await expect(
      service.deleteWorkspace(WORKSPACE_ID, OWNER_USER),
    ).resolves.toBeUndefined();
    expect(deleted).toBe(1);
  });

  it("rejects Admin trying to delete the workspace", async () => {
    let deleted = 0;
    const service = new WorkspaceService(
      createFakeRepository({
        ...seedMembers(baseSeed()),
        deleteWorkspace: async () => {
          deleted += 1;
        },
      }),
    );

    await expect(
      service.deleteWorkspace(WORKSPACE_ID, ADMIN_USER),
    ).rejects.toThrow(AuthorizationError);
    expect(deleted).toBe(0);
  });

  it("rejects a non-member", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.deleteWorkspace(WORKSPACE_ID, asUserId("stranger-user")),
    ).rejects.toThrow(AuthorizationError);
  });
});

describe("WorkspaceService.transferOwnership", () => {
  const OWNER_USER = asUserId("owner-user");
  const ADMIN_USER = asUserId("admin-user");
  const CREATOR_USER = asUserId("creator-user");
  const OWNER_MEMBER_ID = asMemberId("member-owner");
  const ADMIN_MEMBER_ID = asMemberId("member-admin");
  const CREATOR_MEMBER_ID = asMemberId("member-creator");

  function baseSeed(): WorkspaceMemberRecord[] {
    return [
      member(OWNER_USER, OWNER_MEMBER_ID, MemberRole.Owner),
      member(ADMIN_USER, ADMIN_MEMBER_ID, MemberRole.Admin),
      member(CREATOR_USER, CREATOR_MEMBER_ID, MemberRole.Creator),
    ];
  }

  it("sets pendingOwnerTransferTo and notifies the target Admin", async () => {
    let pendingCall: { targetUserId: string; actingUserId: string } | null =
      null;
    let notified: unknown = null;
    const service = new WorkspaceService(
      createFakeRepository({
        ...seedMembers(baseSeed()),
        setPendingOwnerTransfer: async (
          _workspaceId,
          targetUserId,
          actingUserId,
        ) => {
          pendingCall = { targetUserId, actingUserId };
        },
      }),
      undefined,
      {
        notify: async (input) => {
          notified = input;
        },
      },
    );

    await service.transferOwnership(WORKSPACE_ID, OWNER_USER, ADMIN_MEMBER_ID);

    expect(pendingCall).toEqual({
      targetUserId: ADMIN_USER,
      actingUserId: OWNER_USER,
    });
    expect(notified).toMatchObject({
      workspaceId: WORKSPACE_ID,
      userId: ADMIN_USER,
      type: "ownership_transfer_requested",
    });
  });

  it("rejects a non-Owner actor", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.transferOwnership(WORKSPACE_ID, ADMIN_USER, CREATOR_MEMBER_ID),
    ).rejects.toThrow(AuthorizationError);
  });

  it("rejects a target that is not an Admin", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.transferOwnership(WORKSPACE_ID, OWNER_USER, CREATOR_MEMBER_ID),
    ).rejects.toThrow(ValidationError);
  });

  it("rejects a non-existent target", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.transferOwnership(
        WORKSPACE_ID,
        OWNER_USER,
        asMemberId("missing"),
      ),
    ).rejects.toThrow(NotFoundError);
  });
});

describe("WorkspaceService.cancelOwnershipTransfer", () => {
  const OWNER_USER = asUserId("owner-user");
  const ADMIN_USER = asUserId("admin-user");
  const OWNER_MEMBER_ID = asMemberId("member-owner");
  const ADMIN_MEMBER_ID = asMemberId("member-admin");

  function baseSeed(): WorkspaceMemberRecord[] {
    return [
      member(OWNER_USER, OWNER_MEMBER_ID, MemberRole.Owner),
      member(ADMIN_USER, ADMIN_MEMBER_ID, MemberRole.Admin),
    ];
  }

  it("allows Owner to cancel a pending transfer", async () => {
    let cleared = 0;
    const service = new WorkspaceService(
      createFakeRepository({
        ...seedMembers(baseSeed()),
        clearPendingOwnerTransfer: async () => {
          cleared += 1;
        },
      }),
    );

    await service.cancelOwnershipTransfer(WORKSPACE_ID, OWNER_USER);
    expect(cleared).toBe(1);
  });

  it("rejects a non-Owner actor", async () => {
    const service = new WorkspaceService(
      createFakeRepository(seedMembers(baseSeed())),
    );

    await expect(
      service.cancelOwnershipTransfer(WORKSPACE_ID, ADMIN_USER),
    ).rejects.toThrow(AuthorizationError);
  });
});

describe("WorkspaceService.acceptOwnershipTransfer", () => {
  const OWNER_USER = asUserId("owner-user");
  const ADMIN_USER = asUserId("admin-user");
  const OWNER_MEMBER_ID = asMemberId("member-owner");
  const ADMIN_MEMBER_ID = asMemberId("member-admin");

  function baseSeed(): WorkspaceMemberRecord[] {
    return [
      member(OWNER_USER, OWNER_MEMBER_ID, MemberRole.Owner),
      member(ADMIN_USER, ADMIN_MEMBER_ID, MemberRole.Admin),
    ];
  }

  it("swaps roles and notifies the old Owner when the target accepts", async () => {
    let swapInput: unknown = null;
    let notified: unknown = null;
    const service = new WorkspaceService(
      createFakeRepository({
        ...seedMembers(baseSeed()),
        findById: async () => ({
          id: WORKSPACE_ID,
          name: "Acme",
          slug: "acme",
          pendingOwnerTransferTo: ADMIN_USER,
        }),
        listMembers: async () => baseSeed(),
        acceptOwnershipTransfer: async (input) => {
          swapInput = input;
        },
      }),
      undefined,
      {
        notify: async (input) => {
          notified = input;
        },
      },
    );

    await service.acceptOwnershipTransfer(WORKSPACE_ID, ADMIN_USER);

    expect(swapInput).toEqual({
      workspaceId: WORKSPACE_ID,
      currentOwnerMemberId: OWNER_MEMBER_ID,
      targetMemberId: ADMIN_MEMBER_ID,
      newOwnerUserId: ADMIN_USER,
    });
    expect(notified).toMatchObject({
      workspaceId: WORKSPACE_ID,
      userId: OWNER_USER,
      type: "ownership_transfer_resolved",
    });
  });

  it("rejects a user with no pending transfer directed at them", async () => {
    const service = new WorkspaceService(
      createFakeRepository({
        ...seedMembers(baseSeed()),
        findById: async () => ({
          id: WORKSPACE_ID,
          name: "Acme",
          slug: "acme",
          pendingOwnerTransferTo: null,
        }),
      }),
    );

    await expect(
      service.acceptOwnershipTransfer(WORKSPACE_ID, ADMIN_USER),
    ).rejects.toThrow(AuthorizationError);
  });

  it("rejects when the workspace does not exist", async () => {
    const service = new WorkspaceService(
      createFakeRepository({ findById: async () => null }),
    );

    await expect(
      service.acceptOwnershipTransfer(WORKSPACE_ID, ADMIN_USER),
    ).rejects.toThrow(NotFoundError);
  });
});

describe("WorkspaceService.listSidebarChannels", () => {
  function account(id: string, connectedAt: string): ConnectedAccountRecord {
    return {
      id: asConnectedAccountId(id),
      workspaceId: WORKSPACE_ID,
      platform: SocialPlatform.Instagram,
      outstandAccountId: `mock-${id}`,
      handle: `@${id}`,
      status: "active",
      reconnectRequired: false,
      connectedAt: new Date(connectedAt),
    };
  }

  it("orders accounts by stored channel order, appending new channels at the end", async () => {
    const accA = account("conn-a", "2026-01-01T00:00:00Z");
    const accB = account("conn-b", "2026-01-02T00:00:00Z");
    const accC = account("conn-c", "2026-01-03T00:00:00Z");
    const service = new WorkspaceService(
      createFakeRepository({
        listConnectedAccounts: async () => [accA, accB, accC],
        getChannelOrder: async () => [accB.id, accA.id],
      }),
    );

    const result = await service.listSidebarChannels(WORKSPACE_ID, USER_ID);

    expect(result.map((c) => c.id)).toEqual([accB.id, accA.id, accC.id]);
  });

  it("defaults scheduledCount to 0 when constructed without a scheduledCounts port", async () => {
    const acc = account("conn-a", "2026-01-01T00:00:00Z");
    const service = new WorkspaceService(
      createFakeRepository({
        listConnectedAccounts: async () => [acc],
      }),
    );

    const result = await service.listSidebarChannels(WORKSPACE_ID, USER_ID);

    expect(result).toEqual([
      {
        id: acc.id,
        platform: acc.platform,
        handle: acc.handle,
        status: acc.status,
        reconnectRequired: acc.reconnectRequired,
        scheduledCount: 0,
      },
    ]);
  });

  it("fills scheduledCount from the provided ScheduledCountsPort", async () => {
    const acc = account("conn-a", "2026-01-01T00:00:00Z");
    const service = new WorkspaceService(
      createFakeRepository({
        listConnectedAccounts: async () => [acc],
      }),
      {
        countScheduledByAccount: async () => new Map([[acc.id, 5]]),
      },
    );

    const result = await service.listSidebarChannels(WORKSPACE_ID, USER_ID);

    expect(result[0]?.scheduledCount).toBe(5);
  });
});
