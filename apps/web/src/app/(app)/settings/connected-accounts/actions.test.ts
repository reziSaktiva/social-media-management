import { SocialPlatform } from "@social/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getSessionMock,
  redirectMock,
  cookiesSetMock,
  initiateConnectAccountMock,
} = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  redirectMock: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
  cookiesSetMock: vi.fn(),
  initiateConnectAccountMock: vi.fn(),
}));

vi.mock("@/lib/better-auth/auth", () => ({
  auth: { api: { getSession: getSessionMock } },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(
    async () =>
      new Headers({
        "x-workspace-id": "workspace-1",
        "x-workspace-role": "owner",
      }),
  ),
  cookies: vi.fn(async () => ({
    set: cookiesSetMock,
    get: vi.fn(),
    has: vi.fn(() => true),
    delete: vi.fn(),
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/workspace/outstand-workspace-service", () => ({
  createWorkspaceServiceWithOutstandAdapter: () => ({
    initiateConnectAccount: initiateConnectAccountMock,
  }),
}));

// `@/lib/repositories/workspace` me-load Prisma client di module scope —
// di-stub supaya test tidak butuh koneksi DB nyata (pola sama
// `settings/members/actions.test.ts`). Tidak pernah benar-benar dipanggil
// di sini karena `createWorkspaceServiceWithOutstandAdapter` sudah di-mock
// total di atas.
vi.mock("@/lib/repositories/workspace", () => ({
  workspaceRepository: {},
}));

import {
  initiateConnectAccountAction,
  initiateReconnectAccountAction,
} from "./actions";

const SESSION = { user: { id: "user-1" } };

/**
 * Regresi Bug #2 (dialog Facebook Pages Picker macet Loading selamanya,
 * investigasi King Rezi + Elon Backend Engineer, 2026-09-24, T-025.4/KI-070)
 * — root cause: `redirect()` di dalam Server Action ke `redirectUrl`
 * loopback SAME-ORIGIN (Fake: langsung ke Route Handler kita sendiri;
 * Real: balik dari `outstand.so` ke Route Handler kita sendiri) memicu
 * client-side App Router navigation Next.js yang, untuk target Route
 * Handler (bukan page), bisa membuat internal action-dispatch queue macet
 * — Server Action BERIKUTNYA yang dipanggil dialog Page-picker
 * (`listFacebookPendingPagesAction`) tidak pernah ter-resolve (dikonfirmasi
 * lewat instrumentasi `console.log` manual di browser real, network
 * request-nya bahkan tidak pernah terkirim).
 *
 * Fix: KHUSUS `platform === Facebook`, action ini TIDAK memanggil
 * `redirect()` di server — mengembalikan `{ redirectUrl }` mentah supaya
 * client (`ConnectPlatformMenu`/`ReconnectButton`/
 * `FacebookPagesPickerDialog.handleRestartConnect`) melakukan hard
 * navigation (`window.location.href`) sendiri, memutus rantai App Router
 * soft-nav sepenuhnya. Platform lain TIDAK berubah — tetap `redirect()`
 * server seperti semula (dibuktikan test "non-Facebook" di bawah, supaya
 * regresi ke arah sebaliknya juga tertangkap).
 */
describe("initiateConnectAccountAction / initiateReconnectAccountAction — pengecualian Facebook (Bug #2)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getSessionMock.mockReset();
    redirectMock.mockClear();
    cookiesSetMock.mockClear();
    initiateConnectAccountMock.mockReset();
    getSessionMock.mockResolvedValue(SESSION);
  });

  it("initiateConnectAccountAction(Facebook) mengembalikan redirectUrl TANPA memanggil redirect() server-side", async () => {
    const redirectUrl =
      "/api/integrations/outstand/callback?session=fake-fb-session-1&state=abc";
    initiateConnectAccountMock.mockResolvedValue({ redirectUrl });

    const result = await initiateConnectAccountAction(SocialPlatform.Facebook);

    expect(result).toEqual({ redirectUrl });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("initiateConnectAccountAction(platform lain, mis. Instagram) TETAP memanggil redirect() server-side seperti semula", async () => {
    const redirectUrl =
      "https://www.outstand.so/app/api/socials/instagram/org-1";
    initiateConnectAccountMock.mockResolvedValue({ redirectUrl });

    await expect(
      initiateConnectAccountAction(SocialPlatform.Instagram),
    ).rejects.toThrow(`REDIRECT:${redirectUrl}`);

    expect(redirectMock).toHaveBeenCalledWith(redirectUrl);
  });

  it("initiateReconnectAccountAction(Facebook) mengembalikan redirectUrl TANPA memanggil redirect() server-side", async () => {
    const redirectUrl =
      "/api/integrations/outstand/callback?session=fake-fb-session-2&state=def";
    initiateConnectAccountMock.mockResolvedValue({ redirectUrl });

    const result = await initiateReconnectAccountAction(
      "connected-account-1",
      SocialPlatform.Facebook,
    );

    expect(result).toEqual({ redirectUrl });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("initiateReconnectAccountAction(platform lain) TETAP memanggil redirect() server-side seperti semula", async () => {
    const redirectUrl = "https://www.outstand.so/app/api/socials/x/org-1";
    initiateConnectAccountMock.mockResolvedValue({ redirectUrl });

    await expect(
      initiateReconnectAccountAction(
        "connected-account-1",
        SocialPlatform.Twitter,
      ),
    ).rejects.toThrow(`REDIRECT:${redirectUrl}`);

    expect(redirectMock).toHaveBeenCalledWith(redirectUrl);
  });
});
