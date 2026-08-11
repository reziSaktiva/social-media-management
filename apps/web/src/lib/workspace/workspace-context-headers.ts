/**
 * Nama header internal yang dipakai `proxy.ts` untuk inject workspace
 * context (resolved dari `ACTIVE_WORKSPACE_ID_COOKIE`) ke setiap request
 * sebelum mencapai Server Component / Server Action (ADR-076).
 *
 * Nama literal ini WAJIB persis sama di seluruh pemakaian — proxy.ts yang
 * menulis, dan `workspace-context.ts` (+ pemakai lain) yang membaca lewat
 * `next/headers`. Jangan diubah tanpa ADR baru.
 */
export const WORKSPACE_ID_HEADER = "x-workspace-id";
export const WORKSPACE_ROLE_HEADER = "x-workspace-role";
