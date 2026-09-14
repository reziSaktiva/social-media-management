import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthorizationError } from "@/lib/utils/errors";

const { getSessionMock, redirectMock, cookiesSetMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  redirectMock: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
  cookiesSetMock: vi.fn(),
}));

vi.mock("@/lib/better-auth/auth", () => ({
  auth: { api: { getSession: getSessionMock } },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
  cookies: vi.fn(async () => ({ set: cookiesSetMock })),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

// `@/lib/repositories/workspace` me-load Prisma client di module scope —
// di-stub supaya test tidak butuh koneksi DB nyata. `WorkspaceService`
// di-spy langsung di bawah, jadi repository palsu ini tidak pernah benar-
// benar dipanggil (pola sama seperti
// `(app)/settings/members/actions.test.ts`).
vi.mock("@/lib/repositories/workspace", () => ({
  workspaceRepository: {},
}));

import { WorkspaceService } from "@/domains/workspace";
import { selectWorkspaceAction } from "./actions";

const USER_ID = "user-1";
const WORKSPACE_ID = "11111111-1111-1111-1111-111111111111";

describe("selectWorkspaceAction", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getSessionMock.mockReset();
    redirectMock.mockClear();
    cookiesSetMock.mockClear();
  });

  it("redirects to /login and does not call the service when unauthenticated", async () => {
    getSessionMock.mockResolvedValue(null);
    const switchSpy = vi.spyOn(WorkspaceService.prototype, "switchWorkspace");

    await expect(selectWorkspaceAction(WORKSPACE_ID)).rejects.toThrow(
      "REDIRECT:/login",
    );

    expect(switchSpy).not.toHaveBeenCalled();
    expect(cookiesSetMock).not.toHaveBeenCalled();
  });

  it("sets the active-workspace-id cookie and redirects home on success", async () => {
    getSessionMock.mockResolvedValue({ user: { id: USER_ID } });
    vi.spyOn(WorkspaceService.prototype, "switchWorkspace").mockResolvedValue({
      id: "member-1",
      workspaceId: WORKSPACE_ID,
      userId: USER_ID,
      role: "owner",
      status: "active",
    } as never);

    await expect(selectWorkspaceAction(WORKSPACE_ID)).rejects.toThrow(
      "REDIRECT:/",
    );

    expect(cookiesSetMock).toHaveBeenCalledWith(
      "active-workspace-id",
      WORKSPACE_ID,
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it("returns { error } and does not set the cookie or redirect when the user isn't an active member", async () => {
    getSessionMock.mockResolvedValue({ user: { id: USER_ID } });
    vi.spyOn(WorkspaceService.prototype, "switchWorkspace").mockRejectedValue(
      new AuthorizationError("Anda bukan anggota aktif workspace ini."),
    );

    const result = await selectWorkspaceAction(WORKSPACE_ID);

    expect(result).toEqual({
      error: "Anda bukan anggota aktif workspace ini.",
    });
    expect(cookiesSetMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
