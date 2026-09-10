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

/**
 * RBAC untuk Cancel Schedule (T-030.1, ADR-049 Tier 2).
 * `roles-permissions.md` (Aturan Transisi Status per Role, ADR-074) baris
 * `Scheduled → Draft (tarik jadwal)` menetapkan ketiga role — Account
 * Owner, Admin, Creator — sama-sama boleh ✅, tidak ada pembatasan khusus
 * untuk aksi ini (sama seperti Publish Now/Schedule). Assertion tetap
 * eksplisit untuk alasan yang sama seperti `assertActorCanPublishNow` di
 * atas.
 */
const ROLES_ALLOWED_TO_CANCEL_SCHEDULE: ReadonlySet<MemberRole> = new Set([
  MemberRole.Owner,
  MemberRole.Admin,
  MemberRole.Creator,
]);

export function assertActorCanCancelSchedule(actorRole: MemberRole): void {
  if (!ROLES_ALLOWED_TO_CANCEL_SCHEDULE.has(actorRole)) {
    throw new AuthorizationError(
      "Anda tidak memiliki izin untuk membatalkan jadwal post ini (Cancel Schedule).",
    );
  }
}

/**
 * RBAC untuk Delete Post (T-035.1, ADR-049 Tier 2).
 * `roles-permissions.md` tidak punya baris eksplisit untuk "Delete Post" —
 * beda dari `deleteWorkspace`/transfer ownership (Tier 1, dibatasi Account
 * Owner) atau remove member/connected account (dibatasi Owner+Admin), delete
 * post adalah bagian dari siklus hidup konten ("Buat/edit konten" di tabel
 * Ringkasan Hak Akses, ✅ untuk ketiga role), sama seperti Schedule/Publish
 * Now/Cancel Schedule yang semuanya ✅ untuk Account Owner, Admin, DAN
 * Creator (ADR-074, struktur 3-role). Assertion tetap eksplisit untuk alasan
 * yang sama seperti `assertActorCanPublishNow`/`assertActorCanCancelSchedule`
 * di atas — bukan pola RBAC baru, mengikuti preseden yang sudah ada untuk
 * aksi Tier 2 pada konten.
 */
const ROLES_ALLOWED_TO_DELETE_POST: ReadonlySet<MemberRole> = new Set([
  MemberRole.Owner,
  MemberRole.Admin,
  MemberRole.Creator,
]);

export function assertActorCanDeletePost(actorRole: MemberRole): void {
  if (!ROLES_ALLOWED_TO_DELETE_POST.has(actorRole)) {
    throw new AuthorizationError(
      "Anda tidak memiliki izin untuk menghapus post ini (Delete Post).",
    );
  }
}
