import { asUserId } from "@social/shared";
import { redirect } from "next/navigation";

import { WorkspaceService } from "@/domains/workspace";
import { getCachedSession } from "@/lib/better-auth/session";
import { workspaceRepository } from "@/lib/repositories/workspace";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";

import { MembersTable } from "./components/MembersTable";

// ADR-076 (T-039.1-3): workspaceId dari getWorkspaceContext() (header
// proxy.ts), bukan resolve ulang dari `slug`. getCachedSession() masih
// dipanggil di sini (bukan cuma di layout) karena `currentUserId`-nya
// dibutuhkan langsung oleh MembersTable, sama seperti pola
// saveDraftAction di (app)/components/draft-editor/actions.ts.
export default async function Page() {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const workspaceService = new WorkspaceService(workspaceRepository);
  const members = await workspaceService.listMembersWithUser(
    workspaceId,
    asUserId(session.user.id),
  );

  return <MembersTable members={members} currentUserId={session.user.id} />;
}
