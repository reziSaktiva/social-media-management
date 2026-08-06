/**
 * Nama cookie yang menyimpan slug workspace terakhir dikunjungi (diset oleh
 * `proxy.ts` di setiap request ke `/{slug}/*`, dibaca oleh `account/layout.tsx`
 * untuk link "Kembali ke Workspace" — code-review finding: sebelumnya
 * link itu selalu mengarah ke membership tertua user, bukan workspace yang
 * sedang dilihat). File terpisah (bukan di dalam `proxy.ts`/`layout.tsx`)
 * supaya bisa diimpor dari middleware (Edge runtime) tanpa menarik
 * dependency lain.
 */
export const LAST_WORKSPACE_SLUG_COOKIE = "last_workspace_slug";
