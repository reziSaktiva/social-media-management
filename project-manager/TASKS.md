# TASKS — Backlog Berjenjang

Rencana pengerjaan project dari fondasi sampai Public Launch, dikelompokkan per **release** dan dipecah jadi **task → subtask**.

Dokumen ini adalah **indeks**. Detail task ada di `tasks/`.

---

## Cara pakai (AI — baca ini dulu)

1. Baca **indeks di halaman ini** untuk tahu release aktif dan ID task yang relevan.
2. Buka **hanya satu file** `tasks/vXX-*.md` yang memuat task itu. Jangan menyapu seluruh folder `tasks/`.
3. Buka dokumen yang disebut di field **Baca dulu** pada task tersebut — itu daftar bacaan minimal yang sudah dikurasi, jadi tidak perlu menebak atau menyisir `product-discovery/`.
4. **Kalau task ini scope implementasi kode:** cek field **Domain** terhadap pemetaan Domain → Subagent di [`.claude/agents/README.md`](../.claude/agents/README.md) sebelum eksekusi — evaluasi delegasi, termasuk kemungkinan menjalankan beberapa subagent paralel kalau ada task/subtask independen (ADR-063). Jangan default mengerjakan sendiri tanpa mengevaluasi ini.
5. Setelah task selesai: ubah status di file release **dan** perbarui hitungan di indeks ini.

Untuk mode percakapan aktif, Known Issues, dan Blockers → tetap ke [`PROJECT_STATE.md`](PROJECT_STATE.md).

**Peta release ↔ milestone.** Backlog memakai release `v0.x`, `PROJECT_STATE.md` memakai milestone `M0–M9`. Pemetaannya:

| Milestone                | Release yang membentuknya | Status milestone |
| ------------------------ | ------------------------- | ---------------- |
| **M8** — Development     | v0.1 · v0.2 · v0.3 · v0.4 · v0.5 · v0.6 | aktif sekarang |
| **M9** — Testing & Release | v1.0                    | belum mulai      |

Ini penting untuk aturan `PROJECT_RULES.md` "Hindari implementasi fitur di luar ruang lingkup milestone" dan `Active Conversation Mode` yang hanya mengizinkan "Feature Implementation (M8)": **seluruh v0.1–v0.6 berada di dalam M8**, jadi task di rilis manapun dari v0.1 sampai v0.6 tidak melanggar scope milestone aktif. Yang di luar M8 hanya v1.0 (M9). Urutan pengerjaan tetap diatur oleh indeks release + `Depends`, bukan oleh milestone.

---

## Legend status

| Simbol | Arti           | Keterangan                                                        |
| ------ | -------------- | ----------------------------------------------------------------- |
| ⏳      | Not Started    | Belum disentuh.                                                   |
| 🟡      | In Progress    | Sudah dimulai, sebagian subtask selesai.                          |
| ✅      | Done           | Selesai dan terverifikasi (lolos QA/review bila fitur berdampak). |
| 🚫      | Blocked        | Tidak bisa jalan karena dependency eksternal. Alasan wajib ditulis di field **Blocker**. |
| ⏸️      | Deferred       | Sengaja ditunda ke release lain. Alasan wajib ditulis.            |

---

## Aturan ID

* **Task:** `T-001` … `T-088`, nomor global berurutan. ID **tidak** memuat kode release, supaya task bisa berpindah antar release tanpa penomoran ulang dan tanpa membuat referensi lama jadi salah.
* **Subtask:** `T-021.4` — nomor task diikuti nomor urut subtask.
* ID **tidak pernah didaur ulang**. Task yang dibatalkan ditandai `⏸️ Deferred` beserta alasannya, bukan dihapus.
* Setiap release menyisakan beberapa nomor kosong di akhir sebagai ruang tumbuh (per 2026-08-12: T-046–T-049 untuk v0.3, T-056–T-059 untuk v0.4, T-066–T-069 untuk v0.5, T-075–T-079 untuk v0.6 — v0.1/v0.2 sudah habis, lihat catatan kaki ¹).

---

## Indeks release

| Release                    | Fokus                                              | Rentang ID  | Task | Status              | File                                                 |
| -------------------------- | -------------------------------------------------- | ----------- | ---- | ------------------- | ---------------------------------------------------- |
| **v0.1** Foundation        | Setup, Auth, Workspace, Connect Account, Settings  | T-001–T-019, T-039¹ | 20   | 🟡 11 ✅ · 1 🚫 · 5 🟡 · 1 ⏸️ · 2 ⏳ | [tasks/v01-foundation.md](tasks/v01-foundation.md)         |
| **v0.2** Publishing MVP    | Draft, Format, Schedule, Queue, Calendar, History  | T-020–T-038 | 19   | 🟡 7 ✅ · 12 ⏳       | [tasks/v02-publishing-mvp.md](tasks/v02-publishing-mvp.md) |
| **v0.3** Analytics MVP     | Dashboard, Metrics, Engagement Summary, Reports    | T-040–T-045 | 6    | 🟡 3 ✅ · 3 ⏳       | [tasks/v03-analytics-mvp.md](tasks/v03-analytics-mvp.md)   |
| **v0.4** Engagement MVP    | Comment sync 30 menit, Inbox, Reply                | T-050–T-055 | 6    | ⏳ 0 / 6             | [tasks/v04-engagement-mvp.md](tasks/v04-engagement-mvp.md) |
| **v0.5** AI Assistant MVP  | Caption generation, improvement, rewrite           | T-060–T-065 | 6    | ⏳ 0 / 6             | [tasks/v05-ai-assistant-mvp.md](tasks/v05-ai-assistant-mvp.md) |
| **v0.6** Start Page MVP    | Public profile, Link management, Theme             | T-070–T-074 | 5    | ⏳ 0 / 5             | [tasks/v06-start-page-mvp.md](tasks/v06-start-page-mvp.md) |
| **v1.0** Public Launch     | Stabilitas, Performance, Security, Docs            | T-080–T-088 | 9    | ⏳ 0 / 9             | [tasks/v10-public-launch.md](tasks/v10-public-launch.md)   |

**Total:** 71 task · 21 selesai · 140 subtask terdefinisi (v0.1–v0.3).

¹ **T-039** ID-nya dipinjam dari rentang v0.2 (bukan urutan lanjutan v0.1) — nomor kosong v0.1 sudah habis, jadi diambil ID global berikutnya yang belum pernah dipakai. Lihat Catatan Rilis di `tasks/v01-foundation.md` dan `tasks/v02-publishing-mvp.md` untuk detailnya.

Urutan release mengikuti [`release-roadmap.md`](../product-discovery/02-product/release-roadmap.md). Perubahan urutan atau ruang lingkup release wajib lewat ADR.

> ⚠️ **v0.1 dan v0.2 tidak sepenuhnya sekuensial.** Tiga task v0.1 (T-013, T-015, T-016) punya subtask yang bergantung pada task v0.2 (T-025, T-026, T-036 + domain publishing), jadi v0.1 tidak bisa ditutup sebelum v0.2 berjalan. T-012 sudah ✅ Done (2026-08-12), tidak lagi bagian dari daftar ini. Rinciannya di Catatan Rilis [`tasks/v01-foundation.md`](tasks/v01-foundation.md).

---

## Kedalaman perencanaan (rolling wave)

| Release       | Kedalaman                                                                    |
| ------------- | ---------------------------------------------------------------------------- |
| v0.1 – v0.3   | **Detail penuh** — task + subtask siap dikerjakan.                            |
| v0.4 – v1.0   | **Task-level saja** — ID dan cakupan sudah dikunci, subtask sengaja belum diisi. |

Subtask untuk v0.4 ke atas diisi saat release-nya mendekat. Alasannya: menyusunnya sekarang berarti menebak detail teknis tanpa desain atau ADR pendukung — hasilnya hampir pasti direvisi, dan backlog yang isinya banyak tebakan lebih berbahaya daripada backlog yang jujur mengatakan "belum dirinci".

---

## Fokus sekarang

**Ini satu-satunya daftar fokus.** `PROJECT_STATE.md` hanya menyalin ID-nya di Snapshot dan menunjuk ke sini — jangan menulis daftar fokus versi ketiga di manapun. Kalau daftar ini berubah, perbarui juga baris `Top Next Tasks` di Snapshot `PROJECT_STATE.md` (hanya ID + judul singkat).

| ID        | Task                                            | Status | Catatan                                              |
| --------- | ----------------------------------------------- | ------ | ---------------------------------------------------- |
| **T-025** | Real OutstandAdapter                            | ⏳      | Rantai blocker terbesar — lihat di bawah. **Terhenti**: butuh `OUTSTAND_API_KEY`/`OUTSTAND_WEBHOOK_SECRET` asli (KI-003, `PROJECT_STATE.md` § Blockers), belum bisa dikerjakan sampai kredensial tersedia |

> **T-029** (Publish Now) sudah ✅ **Done** (2026-08-18) — via `FakeOutstandAdapter` (ADR-059), jalur nyata tetap menunggu T-025. Detail: `tasks/v02-publishing-mvp.md` § T-029.

> **T-012** (Sidebar "Channels") sudah ✅ **Done** (2026-08-12) — seluruh subtask termasuk T-012.1/2 selesai, lolos review Ridwan + QA Najwa. Detail: `tasks/v01-foundation.md` § T-012.

**Rantai blocker terbesar:** T-025 (Real OutstandAdapter) → T-026 (webhook) → T-027 (job runner). Ketiganya mengunci sebagian besar v0.2, seluruh v0.3, dan seluruh v0.4. Menyelesaikan T-025 membuka lebih banyak pekerjaan daripada task lain manapun.

---

## Keputusan terbuka

Task yang **menghasilkan ADR**, bukan sekadar mengikuti ADR. Semuanya menunggu keputusan King Rezi:

| Task      | Keputusan yang belum diambil                              | Menghambat                     |
| --------- | --------------------------------------------------------- | ------------------------------ |
| **T-005** | Transactional email provider (AS-D04)                     | Email verification; invite member T-007.7 (jalur "Kirim via Email") — T-007.1 "Copy Link" (ADR-080) tidak terhambat |
| **T-060** | Provider + model AI                                       | Seluruh v0.5                   |
| **T-070** | Strategi route publik tanpa auth (+ custom domain?)       | Seluruh v0.6                   |
| **T-081** | Framework E2E test                                        | Verifikasi golden path         |
| **T-086** | Tool observability / monitoring                           | Visibilitas kegagalan job      |
| —         | **Billing** belum muncul di release manapun               | Belum masuk backlog sama sekali |

---

## Aturan maintenance

* **Status task hidup di sini dan di `tasks/*.md`** — pengecualian resmi terhadap aturan "status hanya di `PROJECT_STATE.md`" (ADR-062). Yang tetap eksklusif milik `PROJECT_STATE.md`: phase, milestone (M0–M9), overall progress, Active Conversation Mode, Known Issues, dan Blockers.
* Hitungan di **Indeks release** dan **Total** adalah angka turunan. Saat status sebuah task berubah, perbarui file release **dan** baris indeksnya dalam perubahan yang sama — kalau tidak, angka di sini jadi bohong.
* **Jangan** menyalin detail task ke `PROJECT_STATE.md`. `PROJECT_STATE.md` hanya menyebut **ID + judul singkat** dan menunjuk ke sini.
* Task baru ditambahkan memakai nomor kosong di release yang bersangkutan. Kalau nomor kosongnya habis, ambil nomor berikutnya yang belum pernah dipakai secara global — jangan menggeser ID yang sudah ada.
* Menambah/memindahkan **release** atau mengubah ruang lingkupnya → wajib ADR (`release-roadmap.md` adalah baseline).
* Task yang selesai tetap tinggal di file release-nya sebagai jejak ringkas (satu paragraf, tanpa checklist subtask). Riwayat lengkap per sesi kerja tetap di `COMPLETE_TASK.md`.

---

## Related Documents

* [PROJECT_STATE.md](PROJECT_STATE.md) — phase, milestone, Known Issues, Blockers
* [PROJECT_RULES.md](PROJECT_RULES.md) — klasifikasi dokumen & governance
* [DECISIONS.md](DECISIONS.md) — indeks ADR
* [../product-discovery/02-product/release-roadmap.md](../product-discovery/02-product/release-roadmap.md) — baseline urutan release
* [../product-discovery/02-product/mvp-definition.md](../product-discovery/02-product/mvp-definition.md) — batas MVP
* [../product-discovery/02-product/feature-priority.md](../product-discovery/02-product/feature-priority.md) — MoSCoW per fitur
