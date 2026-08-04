# v0.6 — Start Page MVP

> Bagian dari backlog berjenjang. Indeks + legend status: [`../TASKS.md`](../TASKS.md).

**Tujuan rilis:** Menyediakan halaman publik untuk kebutuhan bio link.
**Baseline rilis:** `product-discovery/02-product/release-roadmap.md` → v0.6

**Kedalaman dokumen ini:** task-level saja (rolling wave). **Subtask sengaja belum diisi** — akan dirinci saat rilis ini mendekat. ID task sudah dikunci sejak sekarang agar bisa dirujuk.

**Titik awal:** domain `start-page/` masih stub kosong. Model `StartPagePage` + `StartPageLink` **sudah ada** di schema. Route `/[slug]/start-page` masih placeholder.

> ⚠️ **Karakter khusus rilis ini:** ini satu-satunya rilis yang menghasilkan **halaman publik tanpa autentikasi**. Seluruh arsitektur sekarang mengasumsikan setiap request melewati auth guard di `proxy.ts` dan berada di dalam workspace scope. Rilis ini melanggar asumsi itu, jadi butuh perhatian arsitektur lebih awal — lihat T-070.

---

### T-070 · Start Page domain skeleton + strategi route publik

`⏳ Not Started` · **Domain** start-page · **ADR** ADR-017, ADR-024, ADR-031 — **berpotensi butuh ADR baru** · **Depends** T-002 ✅
**Baca dulu:** `05-architecture/auth-architecture.md` · `apps/web/src/proxy.ts` · `05-architecture/database-strategy.md`

Service + repository, plus keputusan arsitektur: di mana route publik hidup, bagaimana ia melewati auth guard, bagaimana RLS diperlakukan untuk data yang memang publik, dan apakah pakai custom domain atau subpath. Keputusan ini material — kemungkinan besar butuh ADR.

### T-071 · Public profile page

`⏳ Not Started` · **Domain** start-page · UI · **ADR** ADR-046 · **Depends** T-070
**Baca dulu:** `04-ux/key-screen-patterns.md` · `04-ux/information-architecture.md`

**Must Have.** Halaman publik yang bisa dibagikan lewat media sosial. Perlu perhatian pada SEO/meta tag, caching, dan performa — ini satu-satunya halaman yang dilihat audiens, bukan pengguna produk.

### T-072 · Link management

`⏳ Not Started` · **Domain** start-page · UI · **ADR** — · **Depends** T-070
**Baca dulu:** `02-product/mvp-definition.md`

**Must Have.** CRUD daftar tautan + urutan tampil. Pertimbangkan konfirmasi hapus tautan (ADR-049).

### T-073 · Theme configuration

`⏳ Not Started` · **Domain** start-page · UI · **ADR** ADR-038, ADR-041 · **Depends** T-071
**Baca dulu:** `06-engineering/design-tokens.md`

Berstatus **Should Have** di `feature-priority.md`. Tentukan hubungannya dengan design tokens produk: apakah tema Start Page memakai token yang sama, atau punya set sendiri yang bebas diubah pengguna.

### T-074 · Basic analytics Start Page

`⏳ Not Started` · **Domain** start-page · analytics · **ADR** ADR-018 · **Depends** T-071, T-040
**Baca dulu:** `02-product/feature-priority.md`

Berstatus **Could Have** — hitungan kunjungan + klik per tautan. Ambil/kirim data lintas domain lewat public API, bukan query tabel domain lain langsung.

---

## Catatan Rilis

* T-075–T-079 sengaja dikosongkan sebagai ruang penambahan task v0.6.
* **Definition of Done rilis ini:** pengguna dapat membagikan halaman publik melalui media sosial.
* **Yang sengaja di luar rilis ini (`feature-priority.md`):** E-commerce Widgets (Won't Have).
