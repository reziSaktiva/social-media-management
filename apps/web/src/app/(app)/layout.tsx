import { asUserId } from "@social/shared";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AppShell } from "@astryxdesign/core/AppShell";

import { NotificationService } from "@/domains/notification";
import { PublishingService } from "@/domains/publishing";
import { WorkspaceService } from "@/domains/workspace";
import { auth } from "@/lib/better-auth/auth";
import { notificationRepository } from "@/lib/repositories/notification";
import { publishingRepository } from "@/lib/repositories/publishing";
import { workspaceRepository } from "@/lib/repositories/workspace";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";

import { AppSideNav } from "./components/AppSideNav";
import { DraftEditorProvider } from "./components/draft-editor/Context";
import { DraftEditorMount } from "./components/draft-editor/Mount";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const { workspaceId } = await getWorkspaceContext();

  // Composition root untuk cross-domain publishing -> workspace (T-012.2,
  // AGENTS.md #7) — satu-satunya tempat `PublishingService` konkret di-wire
  // ke `WorkspaceService` lewat `ScheduledCountsPort`.
  const workspaceService = new WorkspaceService(
    workspaceRepository,
    new PublishingService(publishingRepository),
  );
  // Defensif: proxy.ts (ADR-076) seharusnya sudah menjamin workspace context
  // valid sebelum request mencapai sini, tapi tetap di-gate di sini kalau
  // diakses tanpa melalui proxy (mis. route belum ke-cover matcher).
  const workspace = await workspaceService.getWorkspaceById(workspaceId);
  if (!workspace) {
    redirect("/onboarding");
  }

  // Sidebar "Channels" — service mengembalikan SidebarChannelAccount[]
  // siap-render (T-012, ADR-058), termasuk scheduledCount real (T-012.2)
  // dan urutan personal tersimpan per user (T-012.1).
  const channels = await workspaceService.listSidebarChannels(
    workspaceId,
    asUserId(session.user.id),
  );

  // Bell notifikasi sidebar footer (T-036.4) — data awal via Server
  // Component (read), bukan Server Action (ADR-095, pola sama channels di
  // atas). Realtime insert baru ditangani client-side oleh `NotificationBell`
  // (`useNotificationRealtime`, T-036.2).
  const notificationService = new NotificationService(notificationRepository);
  const notifications = await notificationService.list(
    asUserId(session.user.id),
  );
  // Query `count` terpisah dari `list` (yang dibatasi 50 baris) supaya badge
  // unread di bell tidak under-count begitu user punya >50 notifikasi belum
  // dibaca.
  const unreadCount = await notificationService.countUnread(
    asUserId(session.user.id),
  );

  // Provider + modal duduk di level workspace (bukan lagi di `publish/`)
  // supaya CTA "+ New Post" di sidebar bisa membuka Draft Editor dari section
  // manapun — ADR-053, T-011.2.
  return (
    <DraftEditorProvider workspaceId={workspaceId}>
      <AppShell
        contentPadding={4}
        variant="elevated"
        height="fill"
        sideNav={
          <AppSideNav
            workspaceName={workspace.name}
            userName={session.user.name}
            userEmail={session.user.email}
            channels={channels}
            initialNotifications={notifications}
            initialUnreadCount={unreadCount}
            userId={session.user.id}
          />
        }
      >
        {children}
      </AppShell>
      <DraftEditorMount />
    </DraftEditorProvider>
  );
}
