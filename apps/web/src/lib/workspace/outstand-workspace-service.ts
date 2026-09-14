import { WorkspaceService } from "@/domains/workspace";
import { getOutstandAdapter } from "@/lib/adapters/outstand";
import { workspaceRepository } from "@/lib/repositories/workspace";

/**
 * Composition-root helper (T-013.1/T-013.2, T-015.3, ADR-105) — dipakai
 * Server Action (`connected-accounts/actions.ts`) dan Route Handler
 * (`/api/integrations/outstand/callback`), keduanya butuh `WorkspaceService`
 * yang sudah disuplai `IOutstandAdapter` untuk
 * `initiateConnectAccount`/`completeAccountConnection`. Satu factory supaya
 * kedua entry point tidak bisa diam-diam divergen kalau wiring-nya berubah.
 */
export function createWorkspaceServiceWithOutstandAdapter(): WorkspaceService {
  return new WorkspaceService(
    workspaceRepository,
    undefined,
    undefined,
    getOutstandAdapter(),
  );
}
