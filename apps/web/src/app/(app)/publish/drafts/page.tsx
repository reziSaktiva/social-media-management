import { PublishingService } from "@/domains/publishing";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";
import { publishingRepository } from "@/lib/repositories/publishing";

import { DraftsList } from "./components/DraftsList";

export default async function Page() {
  const { workspaceId } = await getWorkspaceContext();

  const publishingService = new PublishingService(publishingRepository);
  const drafts = await publishingService.listDrafts(workspaceId);

  return <DraftsList drafts={drafts} />;
}
