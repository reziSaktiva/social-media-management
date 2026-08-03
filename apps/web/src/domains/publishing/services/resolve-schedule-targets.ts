import type { ContentFormat } from "@social/shared";
import { asConnectedAccountId } from "@social/shared";
import type { ConnectedAccountRecord } from "@/domains/workspace";
import { ValidationError } from "@/lib/utils/errors";
import type { SchedulePostsTargetInput } from "./schedule-posts.use-case";

export interface ScheduleTargetRequest {
  connectedAccountId: string;
  contentFormat: string;
  platformOptions?: Record<string, unknown>;
}

/**
 * Cocokkan target request dari client (connectedAccountId sebagai string
 * mentah, belum tentu valid) dengan daftar akun terhubung workspace yang
 * sudah di-resolve dari DB (`WorkspaceService.listConnectedAccounts`).
 * Melempar `ValidationError` kalau ada connectedAccountId yang tidak
 * ditemukan di daftar tersebut.
 *
 * Dipisah dari Server Action (`scheduleDraftAction`) supaya business rule
 * ini bisa dipakai ulang oleh entry point lain (mis. Route Handler mobile
 * `/api/v1`) tanpa duplikasi — temuan review Ridwan Architecture Reviewer,
 * ADR-059 follow-up.
 */
export function resolveScheduleTargets(
  connectedAccounts: ConnectedAccountRecord[],
  requests: ScheduleTargetRequest[],
): SchedulePostsTargetInput[] {
  const connectedAccountById = new Map(
    connectedAccounts.map((account) => [account.id, account]),
  );

  return requests.map((request) => {
    const account = connectedAccountById.get(
      asConnectedAccountId(request.connectedAccountId),
    );
    if (!account) {
      throw new ValidationError(
        "Salah satu akun yang dipilih tidak ditemukan di daftar akun terhubung workspace ini.",
      );
    }

    return {
      connectedAccountId: account.id,
      platform: account.platform,
      contentFormat: request.contentFormat as ContentFormat,
      platformOptions: request.platformOptions,
      outstandAccountId: account.outstandAccountId,
    };
  });
}
