import { NextResponse, type NextRequest } from "next/server";
import { asUserId } from "@social/shared";
import { auth } from "@/lib/better-auth/auth";
import { workspaceRepository } from "@/lib/repositories/workspace";
import { WorkspaceService } from "@/domains/workspace";
import {
  ACTIVE_WORKSPACE_ID_COOKIE,
  activeWorkspaceCookieOptions,
} from "@/lib/workspace/active-workspace-cookie";

/**
 * Menutup gap redirect-loop (ADR-076): `onboarding/page.tsx` (RSC) tidak
 * bisa `cookies().set()`, jadi user yang sudah punya workspace tapi belum
 * punya `ACTIVE_WORKSPACE_ID_COOKIE` (mis. cookie expired/dihapus) di-redirect
 * ke sini dulu supaya cookie-nya di-set lewat Route Handler sebelum lanjut ke
 * Home (`/`).
 */
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const workspaceService = new WorkspaceService(workspaceRepository);
  const workspace = await workspaceService.getDefaultWorkspaceForUser(
    asUserId(session.user.id),
  );

  const response = NextResponse.redirect(
    new URL(workspace ? "/" : "/onboarding", request.url),
  );
  if (workspace) {
    response.cookies.set(
      ACTIVE_WORKSPACE_ID_COOKIE,
      workspace.id,
      activeWorkspaceCookieOptions(),
    );
  }
  return response;
}
