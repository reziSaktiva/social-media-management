import { MemberRole } from "@social/shared";
import { AuthorizationError } from "@/lib/utils/errors";

/**
 * RBAC untuk Publish Now (T-029.1, ADR-047). `roles-permissions.md`
 * (Aturan Transisi Status per Role, ADR-074) menetapkan Publish Now
 * dibatasi ke role yang **sama persis** dengan Schedule — Account Owner,
 * Admin, dan Creator — bukan tingkat akses baru yang lebih ketat.
 *
 * Dengan struktur 3-role saat ini, ini secara efektif mengizinkan setiap
 * member aktif — tapi assertion ini tetap eksplisit (bukan diam-diam
 * "semua boleh") karena dua alasan: (1) `getWorkspaceContext()` membaca
 * `role` dari header request sebagai string lalu men-cast ke `MemberRole`
 * tanpa validasi runtime (`apps/web/src/lib/workspace/workspace-context.ts`)
 * — assertion ini yang benar-benar memvalidasi nilainya adalah salah satu
 * dari 3 role yang sah; (2) mendokumentasikan aturan produk di kode,
 * supaya kalau role baru pernah ditambah lagi, developer wajib memutuskan
 * secara sadar apakah role itu boleh Publish Now atau tidak, bukan
 * otomatis ikut lolos.
 */
const ROLES_ALLOWED_TO_PUBLISH_NOW: ReadonlySet<MemberRole> = new Set([
  MemberRole.Owner,
  MemberRole.Admin,
  MemberRole.Creator,
]);

export function assertActorCanPublishNow(actorRole: MemberRole): void {
  if (!ROLES_ALLOWED_TO_PUBLISH_NOW.has(actorRole)) {
    throw new AuthorizationError(
      "Anda tidak memiliki izin untuk mempublikasikan konten secara langsung (Publish Now).",
    );
  }
}
