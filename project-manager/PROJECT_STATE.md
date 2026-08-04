# PROJECT STATE

## Snapshot

* **Phase / Milestone:** Phase 6 — Implementation · M8 — Development (Sprint 5) · Overall: M7 100%, M8 in progress
* **Active Mode:** Ready for Development — implementasi fitur produk sesuai Architecture & Engineering Baseline
* **Top Next Tasks:** T-012 Sidebar "Channels" · T-011 Sidebar CTA "+ New Post" · T-029 Publish Now · T-010 Light/Dark persistensi cookie (🟡)
* **Blocker:** Tidak ada blocker aktif. Known issue teratas: dependency Transactional Email Provider belum ditetapkan (T-005, tidak memblokir M8 awal).
* **Backlog task lengkap:** [`TASKS.md`](TASKS.md) — 67 task per release (v0.1 → v1.0), detail di `tasks/`. Jangan cari detail task di file ini.
* Detail phase/mode/issue ada di section di bawah. Riwayat completed/ADR lengkap: lihat `COMPLETE_TASK.md` (⚠️ jangan dibaca AI kecuali diperintah)/`DECISIONS.md`.

---

## Metadata

| Field        | Value      |
| ------------ | ---------- |
| Version      | 1.0.36     |
| Status       | Active     |
| Last Updated | 2026-08-03 |

---

## Current Status

| Item              | Value                            |
| ----------------- | -------------------------------- |
| Current Phase     | Phase 6 — Implementation      |
| Current Milestone | M8 — Development               |
| Current Sprint    | Sprint 5                         |
| Overall Progress  | M7 100% · M8 in progress         |
| Project Status    | M8 berjalan — Publishing MVP (persistensi nyata, Fake OutstandAdapter) |

---

## Current Focus

M7 Repository & Bootstrap **selesai**. M8 Development **berjalan**.

* **AI Context layer** (`context/`) sudah di-scaffold (opsi A) — indeks + aturan operasional agent; bukan duplikasi baseline.
* `AGENTS.md` di root sudah ada; skill resmi vendor yang relevan (Prisma,
  Better Auth, Vercel, Supabase) sudah terpasang di `.agents/skills/`.
* Alignment ADR-040 pada dokumentasi baseline dan schema/migration sudah
  selesai. Implementasi runtime Outstand tetap bagian M8 dan belum dinyatakan
  selesai (T-025 → T-026 → T-027).
* Alignment dokumentasi ADR-041 selesai: Engineering Baseline, Project
  Overview, AGENTS, dan AI Context sudah memakai Astryx permanen, neutral theme
  M8, Tailwind layout-only, wrapper selektif, serta exact pin Beta. Instalasi
  dan smoke test Next.js 16 juga sudah selesai.
* Fokus M8 saat ini: Auth Flows, Workspace Onboarding, App Shell, Draft
  Editor (kini modal fullscreen, ADR-052), persistensi nyata "Save as
  Draft"/"Edit Draft", Drafts List data asli, dan persistensi nyata
  "Schedule" via Fake OutstandAdapter (ADR-059) sudah selesai; lanjut ke
  integrasi Outstand runtime asli (ADR-040) begitu kredensial tersedia.
* **Perencanaan task** kini berjenjang per release di [`TASKS.md`](TASKS.md) +
  `tasks/` (ADR-062), menggantikan flat list `Next Tasks` yang lama.

---

## Active Conversation Mode

Current Mode: Ready for Development

Current Phase: Phase 6 / M8 Development berjalan

Current Objective:
- Memulai implementasi fitur produk sesuai Architecture & Engineering Baseline
- Memakai `context/` + `AGENTS.md` sebagai pintu masuk agent saat coding

Allowed Actions:
- Discussion
- Brainstorm
- Documentation
- Feature Implementation (M8)
- Penyempurnaan AI Context (`context/`, `AGENTS.md`) bila perlu

Restricted Actions:
- Perubahan Architecture / Engineering Baseline tanpa ADR
- Wireframe Detail (kecuali dibutuhkan untuk implementasi layar)

---

## Milestone Progress

| Milestone                    | Status         |
| ---------------------------- | -------------- |
| M0 — Project Foundation      | ✅ Completed    |
| M1 — Discovery               | ✅ Completed    |
| M2 — Business Planning       | ✅ Completed    |
| M3 — Product Planning        | ✅ Completed    |
| M4 — UX Planning             | ✅ Completed    |
| M5 — System Architecture     | ✅ Completed    |
| M6 — Engineering Planning    | ✅ Completed    |
| M7 — Repository & Bootstrap  | ✅ Completed    |
| M8 — Development             | 🟡 In Progress  |
| M9 — Testing & Release       | ⏳ Pending      |

---

## In Progress

Task berstatus 🟡 — detail dan subtask ada di [`TASKS.md`](TASKS.md):

* **T-010** Light/Dark mode toggle — kode sudah lolos QA/review; sisa: persistensi cookie + push `navigation.html` ke Claude Design.
* **T-031** Redirect otomatis ke sub-screen tujuan (ADR-054) — Save as Draft sudah sejalan; sisanya menyusul bersama T-029/T-032/T-034.

Catatan non-task: template `design-tokens.md` berstatus Draft / TBD; nilai final
berkembang iteratif co-equal dengan Claude Design (ADR-056) — tidak ada lagi
gerbang "designer masuk", project ini tidak akan merekrut designer eksternal
(ADR-057, amandemen ADR-038 & ADR-041).

---

## Next Tasks

> Daftar lengkap 67 task (v0.1 → v1.0) beserta subtask, dependency, dan bacaan minimal per task ada di **[`TASKS.md`](TASKS.md)**. File ini hanya menyebut ID + judul singkat — **jangan duplikasi detail task ke sini** (ADR-062).

Fokus terdekat:

| ID        | Task                                               | Status | Release |
| --------- | -------------------------------------------------- | ------ | ------- |
| **T-012** | Sidebar section "Channels" (ADR-058)               | ⏳      | v0.1    |
| **T-011** | Sidebar CTA "+ New Post" (ADR-053)                 | ⏳      | v0.1    |
| **T-010** | Light/Dark — persistensi cookie + push design      | 🟡      | v0.1    |
| **T-029** | Publish Now (ADR-047)                              | ⏳      | v0.2    |
| **T-025** | Real OutstandAdapter (ADR-040)                     | ⏳      | v0.2    |

**Rantai blocker terbesar:** T-025 → T-026 → T-027 (Real adapter → webhook → job runner). Ketiganya mengunci sebagian besar v0.2, seluruh v0.3, dan seluruh v0.4.

**Keputusan terbuka yang menunggu King Rezi:** T-005 (email provider), T-060 (provider AI), T-070 (strategi route publik), T-032 (semantik queue slot), T-081 (framework E2E), T-086 (tool observability), serta status Billing yang belum masuk release manapun. Rinciannya di `TASKS.md` → **Keputusan terbuka**.

---

## Known Issues

* **Dependency terbuka — Transactional Email Provider** (→ T-005). Password reset & email verification (Better Auth) membutuhkan email provider yang belum ditetapkan (kandidat: Resend, Postmark, AWS SES, SMTP Supabase). Dicatat di `auth-strategy.md` (AS-D04). `requireEmailVerification` dinonaktifkan sementara di skeleton. Tidak memblokir M8 awal.
* **RLS SQL policies belum digenerate** di migrasi awal (→ T-017) — ditambahkan saat jalur server set `app.current_user_id` diimplementasi (DO-D06).
* **Runtime ADR-040 belum diimplementasikan** (→ T-025, T-026, T-027). Alignment
  dokumentasi dan schema/migration sudah selesai, tetapi handler webhook, durable
  ingestion, retry internal, media upload Outstand, engagement sync/reply, dan
  reconnect flow masih task M8. `schedulePost` sendiri sudah bisa dipakai lewat
  `FakeOutstandAdapter` (ADR-059) — `getOutstandAdapter()` akan beralih otomatis
  ke real adapter begitu `OUTSTAND_API_KEY` diisi **dan** kode real adapter sudah
  ditulis (kalau env terisi tapi kode belum ada, factory throw error, bukan
  silent fallback ke Fake).
* **Astryx masih Beta.** Kompatibilitas dasar Next.js 16 sudah dibuktikan lewat
  smoke test dan production build, tetapi risiko perubahan API tetap dikelola
  dengan exact pin, tanpa canary/swizzle, wrapper selektif, update manual, dan
  verifikasi ulang saat upgrade.
* **Hydration gagal saat diakses lewat tunnel ngrok** (→ T-018). Saat uji halaman
  auth lewat tunnel ngrok yang dipakai untuk `BETTER_AUTH_URL`, seluruh halaman
  (bukan spesifik komponen auth) tidak ter-hydrate — tidak ada React fiber di
  elemen manapun meski `window.next` termuat tanpa error console; klik submit
  jatuh ke native HTML form-submit. Kemungkinan besar isu HMR/WebSocket Turbopack
  lewat ngrok. Backend/API sendiri terverifikasi benar via raw `fetch()`. Perlu
  ditelusuri sebelum uji interaksi form penuh di browser lewat ngrok bisa
  diandalkan.
* **Light/Dark Mode (ADR-055) — `components/navigation.html` belum ter-push ke
  Claude Design** (→ T-010.3). File hasil edit sudah lengkap di scratchpad,
  terblokir karena tool `DesignSync` sempat nonaktif di sesi kerja desain. Tidak
  memblokir kode `apps/web` (sudah selesai dan lolos QA/review) — hanya dokumen
  referensi komponen di Claude Design yang tertinggal.
* **Light/Dark Mode (ADR-055) — tema masih reset ke Light setiap full reload**
  (→ T-010.2). Perilaku ini **disengaja**, bukan bug. Mekanismenya sudah
  diputuskan 2026-07-31: pakai **Cookie** (bukan localStorage) supaya
  RSC/Middleware bisa membaca preferensi sebelum render pertama, konsisten dengan
  pola session cookie Better Auth. Yang belum ada hanya implementasinya.

---

## Blockers

Tidak ada blocker saat ini.

---

## Completed (Ringkasan)

Berikut ~5 item terakhir yang diselesaikan. Riwayat lengkap (sejak M0): lihat `COMPLETE_TASK.md` — ⚠️ jangan dibaca AI kecuali diperintah eksplisit King Rezi.

* **ADR-062** — Backlog task berjenjang: `TASKS.md` (indeks) + `tasks/` per release, 67 task ber-ID `T-NNN`, rolling wave v0.1–v0.3 detail, dan amandemen aturan lokasi status.
* **ADR-058** — Sidebar "Channels" (quick-glance daftar akun terhubung): selesai di Claude Design, implementasi kode `apps/web` menyusul (T-012).
* **Claude Design** — bug fix Content Format Selector hilang di New Post + penambahan akun mock TikTok & Pinterest (catch-up ADR-037/ADR-039).
* **ADR-059** — Fake OutstandAdapter: persistensi nyata "Schedule" selesai (kode + QA + review arsitektur Ridwan, tanpa temuan baru).
* **ADR-060** — Dokumentasi Efficiency Restructuring: `DECISIONS.md` (3.564→69 baris) dipecah jadi file per-ADR + indeks, `PROJECT_STATE.md` (928→~260 baris) dapat Snapshot + heading rapi + trim duplikasi, skill navigator jadi cascade 3 tingkat.
* **ADR-061** — Konsolidasi `CHANGELOG.md` + arsip jadi satu file `COMPLETE_TASK.md`, dengan peringatan keras: AI dilarang membaca isinya kecuali diperintah eksplisit.

---

## Recent Decisions (Ringkasan)

5 ADR terakhir. Daftar lengkap (indeks + link ke tiap ADR): lihat `DECISIONS.md`.

* **ADR-062** — Backlog task berjenjang per release (`TASKS.md` + `tasks/`) + amandemen aturan "status hanya di `PROJECT_STATE.md`".
* **ADR-061** — Konsolidasi CHANGELOG jadi `COMPLETE_TASK.md` tunggal + larangan baca proaktif AI (amandemen ADR-060).
* **ADR-060** — Dokumentasi Efficiency Restructuring: `DECISIONS.md` dipecah per-file + indeks, `PROJECT_STATE.md` dapat Snapshot + trim, skill navigator jadi cascade 3 tingkat.
* **ADR-059** — Fake OutstandAdapter — persistensi nyata "Schedule" tanpa kredensial Outstand asli.
* **ADR-058** — Sidebar mendapat section "Channels" (quick-glance daftar akun terhubung).

---

## Related Documents

* TASKS.md — backlog task berjenjang (indeks) + `tasks/` per release
* PROJECT_OVERVIEW.md
* ARCHITECTURE_OVERVIEW.md
* PROJECT_RULES.md
* DECISIONS.md
* ../product-discovery/06-engineering/
* ../product-discovery/05-architecture/
* ../product-discovery/04-ux/
