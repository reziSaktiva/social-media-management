import {
  asConnectedAccountId,
  asWorkspaceId,
  ContentFormat,
  SocialPlatform,
} from "@social/shared";
import { describe, expect, it } from "vitest";
import type { ConnectedAccountRecord } from "@/domains/workspace";
import { ValidationError } from "@/lib/utils/errors";
import { resolveScheduleTargets } from "./resolve-schedule-targets";

const WORKSPACE_ID = asWorkspaceId("workspace-1");

function createConnectedAccount(
  overrides: Partial<ConnectedAccountRecord> = {},
): ConnectedAccountRecord {
  return {
    id: asConnectedAccountId("account-1"),
    workspaceId: WORKSPACE_ID,
    platform: SocialPlatform.Instagram,
    outstandAccountId: "outstand-account-1",
    handle: "@raka",
    status: "connected",
    ...overrides,
  };
}

describe("resolveScheduleTargets", () => {
  it("mencocokkan request dengan connected account dan menyertakan outstandAccountId", () => {
    const account = createConnectedAccount();

    const result = resolveScheduleTargets(
      [account],
      [
        {
          connectedAccountId: account.id,
          contentFormat: ContentFormat.Post,
          platformOptions: { caption: "halo" },
        },
      ],
    );

    expect(result).toEqual([
      {
        connectedAccountId: account.id,
        platform: account.platform,
        contentFormat: ContentFormat.Post,
        platformOptions: { caption: "halo" },
        outstandAccountId: account.outstandAccountId,
      },
    ]);
  });

  it("melempar ValidationError kalau connectedAccountId tidak ada di daftar akun workspace", () => {
    const account = createConnectedAccount();

    expect(() =>
      resolveScheduleTargets(
        [account],
        [
          {
            connectedAccountId: asConnectedAccountId("account-lain"),
            contentFormat: ContentFormat.Post,
          },
        ],
      ),
    ).toThrow(ValidationError);
  });
});
