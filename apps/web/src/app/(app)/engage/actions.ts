"use server";

import { MemberStatus, asUserId } from "@social/shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { SyncCommentsUseCase } from "@/domains/engagement";
import { NotificationService } from "@/domains/notification";
import { WorkspaceService } from "@/domains/workspace";
import { getOutstandAdapter } from "@/lib/adapters/outstand";
import { getCachedSession } from "@/lib/better-auth/session";
import { engagementRepository } from "@/lib/repositories/engagement";
import { notificationRepository } from "@/lib/repositories/notification";
import { workspaceRepository } from "@/lib/repositories/workspace";
import { toActionError } from "@/lib/utils/errors";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";

/**
 * Manual refresh Comments Inbox (T-052, `background-jobs.md` § JOB-03).
 * Reuse `SyncCommentsUseCase.sync` — logic sync (fetch+upsert+notify) yang
 * SAMA dipakai `EngagementSyncJobHandler` (job periodik 30 menit) — tapi
 * DIPANGGIL LANGSUNG dari sini, tanpa lewat handler, karena refresh manual
 * bukan job periodik: sync sekali untuk seluruh `ConnectedAccount` aktif
 * workspace ini, lalu selesai — TIDAK enqueue job baru/self-reschedule.
 * `SyncCommentsUseCase` sendiri sudah tidak mensyaratkan `IJobScheduler`
 * sama sekali di constructor-nya (reschedule murni tanggung jawab
 * `EngagementSyncJobHandler.handle()` yang memanggil `sync()` lalu enqueue
 * sendiri) — jadi tidak ada penyesuaian constructor yang diperlukan untuk
 * mendukung use case ini.
 *
 * Data engagement TIDAK memakai Supabase Realtime (ADR-023 membatasinya
 * hanya untuk tabel `notifications`) — ini satu-satunya cara halaman
 * `/engage` (T-053, masih placeholder) bisa dapat data terbaru tanpa
 * menunggu siklus cron.
 *
 * Entry point ini murni wiring (AGENTS.md #5): resolve workspace/session,
 * rakit dependency konkret (composition root, pola sama
 * `/api/jobs/run/route.ts`), ambil daftar `ConnectedAccount` AKTIF lewat
 * `WorkspaceService.listConnectedAccounts` (`ConnectedAccountsPort` di
 * `publishing.service.ts`), lalu sync SETIAP akun secara berurutan
 * (menghindari beban paralel ke Outstand yang tidak perlu untuk operasi
 * yang dipicu manual/jarang) dan akumulasi `newCommentsCount`.
 */
export async function refreshInboxAction(): Promise<{
  error?: string;
  newCommentsCount?: number;
}> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }
  const userId = asUserId(session.user.id);

  const workspaceService = new WorkspaceService(workspaceRepository);
  const syncCommentsUseCase = new SyncCommentsUseCase(
    engagementRepository,
    getOutstandAdapter(),
    new NotificationService(notificationRepository),
    {
      async listActiveMembers(targetWorkspaceId, actingUserId) {
        const members = await workspaceRepository.listMembers(
          targetWorkspaceId,
          actingUserId,
        );
        return members
          .filter((member) => member.status === MemberStatus.Active)
          .map((member) => ({ userId: member.userId }));
      },
    },
  );

  try {
    const accounts = await workspaceService.listConnectedAccounts(
      workspaceId,
      userId,
    );
    const activeAccounts = accounts.filter(
      (account) => account.status === "active",
    );

    let newCommentsCount = 0;
    for (const account of activeAccounts) {
      const result = await syncCommentsUseCase.sync(
        {
          workspaceId,
          connectedAccountId: account.id,
          outstandAccountId: account.outstandAccountId,
        },
        userId,
      );
      newCommentsCount += result.newCommentsCount;
    }

    revalidatePath("/engage");
    return { newCommentsCount };
  } catch (error) {
    return toActionError(error);
  }
}
