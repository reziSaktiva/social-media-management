/*
  Warnings:

  - You are about to drop the column `outstand_job_id` on the `publishing_post_targets` table. All the data in the column will be lost.
  - You are about to drop the column `published_url` on the `publishing_post_targets` table. All the data in the column will be lost.

  Context (ADR baru, 2026-08-26 — redesain kontrak ACL `IOutstandAdapter`
  setelah mismatch ditemukan terhadap dokumentasi resmi Outstand):
  Outstand `create-a-post` menerima SEMUA target/akun dalam SATU call dan
  menghasilkan SATU `post.id` — bukan satu job per akun. `outstand_job_id`
  (per-target) dan `published_url` (diasumsikan instan sinkron) di
  `publishing_post_targets` merepresentasikan model yang salah dan tidak
  pernah terisi oleh integrasi Outstand ASLI (T-025/`OUTSTAND_API_KEY`
  belum ada di environment manapun) — seluruh baris yang ada hanya diisi
  oleh `FakeOutstandAdapter` (ADR-059, placeholder `fake-*`/
  `https://fake.outstand.local/...`), jadi drop kolom ini TIDAK
  menghilangkan data bisnis nyata di environment manapun.

  Diganti oleh:
  - `publishing_posts.outstand_post_id` — SATU id post-level Outstand,
    mencakup semua target dalam post ini.
  - `publishing_post_targets.platform_post_id` /
    `publishing_post_targets.platform_post_url` — ID/URL post di PLATFORM
    ASLI (Instagram, dst.) per akun, diisi belakangan (async) via
    `OutstandAdapter.fetchPostOutcome` (polling) atau webhook (T-026).

*/
-- AlterTable
ALTER TABLE "publishing_post_targets" DROP COLUMN "outstand_job_id",
DROP COLUMN "published_url",
ADD COLUMN     "platform_post_id" TEXT,
ADD COLUMN     "platform_post_url" TEXT;

-- AlterTable
ALTER TABLE "publishing_posts" ADD COLUMN     "outstand_post_id" TEXT;
