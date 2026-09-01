import { asUserId } from "@social/shared";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
  //
  // T-096.3: pengganti `AppShell` Astryx (`variant="elevated"`, satu titik
  // pakai, dampak ke seluruh app). Dipilih layout custom Tailwind (bukan
  // primitive `Sidebar` shadcn) karena isi slot sideNav (`AppSideNav` ->
  // `WorkspaceSideNav`/`SettingsSideNav`) masih Astryx murni dan belum masuk
  // scope T-096 (route-segment App Shell & Navigasi ada di T-098) — memaksa
  // markup Astryx yang belum dimigrasi ke dalam struktur DOM `SidebarProvider`
  // /`Sidebar` shadcn berisiko lebih tinggi daripada wrapper flex biasa.
  // Struktur & warna meniru perilaku `variant="elevated"` yang sudah berjalan
  // (bukan `variant="section"` yang sempat direferensikan di draft awal
  // styles.css Claude Design — lihat catatan laporan T-096 ke King Rezi):
  // shell + kolom sideNav pakai `bg-background` (canvas, sama seperti
  // `navAreaWash` lama), area konten jadi "kartu" mengambang dengan sudut
  // membulat memakai `bg-sidebar` (nilai hex-nya identik dengan
  // `--color-background-surface` lama, lihat design-tokens.md § Engineering
  // Mapping T-095.5).
  //
  // Gap yang disadari & sengaja tidak ditutup di sini: AppShell Astryx
  // otomatis menyediakan hamburger + drawer mobile di bawah breakpoint `md`
  // (prop `mobileNav` bawaan). Layout custom ini TIDAK mereplikasi itu —
  // sideNav selalu tampil sebagai kolom kiri fixed-width di semua ukuran
  // layar. Menutup gap ini dengan benar (Sheet shadcn untuk drawer mobile)
  // lebih koheren dikerjakan bersamaan dengan migrasi isi sideNav itu
  // sendiri di T-098 (App Shell & Navigasi), bukan stub parsial sekarang.
  return (
    <DraftEditorProvider workspaceId={workspaceId}>
      {/* eslint-disable-next-line no-restricted-syntax -- T-096.3: file ini
          sudah dimigrasi ke komposisi Tailwind shadcn (ADR-097 poin 4),
          bukan lagi AppShell Astryx — <div> layout langsung, bukan
          VStack/HStack. */}
      <div className="relative flex h-dvh flex-col bg-background text-foreground">
        {/* eslint-disable-next-line no-restricted-syntax -- T-096.3, sama seperti di atas */}
        <div className="relative flex min-h-0 flex-1">
          <aside className="flex w-64 shrink-0 flex-col overflow-y-auto bg-background">
            <AppSideNav
              workspaceName={workspace.name}
              userName={session.user.name}
              userEmail={session.user.email}
              channels={channels}
              initialNotifications={notifications}
              initialUnreadCount={unreadCount}
              userId={session.user.id}
            />
          </aside>
          <main className="relative min-w-0 flex-1 overflow-y-auto rounded-tl-3xl bg-sidebar p-4">
            {children}
          </main>
        </div>
      </div>
      <DraftEditorMount />
    </DraftEditorProvider>
  );
}
