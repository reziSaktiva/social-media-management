# PROJECT STATE

## Snapshot

* **Phase / Milestone:** Phase 6 — Implementation · M8 — Development (Sprint 5) · Overall: M7 100%, M8 in progress
* **Active Mode:** Ready for Development — implementasi fitur produk sesuai Architecture & Engineering Baseline
* **Top Next Tasks:** T-025 Real OutstandAdapter — salinan ID dari **Fokus sekarang** di [`TASKS.md`](TASKS.md), yang merupakan satu-satunya daftar fokus (T-029 Publish Now sudah ✅ Done, 2026-08-18)
* **Blocker:** 2 blocker aktif (env var Outstand belum diisi + kode Real OutstandAdapter belum ditulis; env var Google OAuth belum diisi) — lihat section **Blockers** di bawah. Railway staging sudah live & terverifikasi (2026-08-14) sehingga blocker itu resolved; JOB_SECRET juga sudah diisi di Railway staging. Tidak memblokir M8 awal, tapi memblokir T-025→T-026→T-027.
* **Backlog task lengkap:** [`TASKS.md`](TASKS.md) — 72 task per release (v0.1 → v1.0), detail di `tasks/`. Jangan cari detail task di file ini.
* Detail phase/mode/issue ada di section di bawah. Riwayat completed/ADR lengkap: lihat `COMPLETE_TASK.md` (⚠️ jangan dibaca AI kecuali diperintah)/`DECISIONS.md`.

---

## Metadata

| Field        | Value      |
| ------------ | ---------- |
| Version      | 1.0.52     |
| Status       | Active     |
| Last Updated | 2026-08-24 |

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
  Better Auth, Vercel, Supabase) sudah terpasang di `.claude/skills/` —
  satu-satunya lokasi skill sejak ADR-064 (`.agents/skills/` dihapus).
* Project dikerjakan di **dua tool**: Claude Code (utama) dan Cursor. Paritas
  aset agent + dua pasang file kembar yang wajib dijaga sinkron (config MCP,
  proteksi baca secret) didokumentasikan di section "Kompatibilitas tool"
  pada `AGENTS.md` (ADR-064).
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

Task berstatus 🟡 dan subtask detail **hanya** ada di [`TASKS.md`](TASKS.md) +
`tasks/vXX-*.md` (ADR-062) — tidak diduplikasi di sini supaya tidak desync.

Catatan non-task (bukan task, jadi memang layak di sini): template
`design-tokens.md` berstatus Draft / TBD; nilai final berkembang iteratif
co-equal dengan Claude Design (ADR-056) — tidak ada lagi gerbang "designer
masuk", project ini tidak akan merekrut designer eksternal (ADR-057,
amandemen ADR-038 & ADR-041).

---

## Next Tasks

Daftar lengkap 72 task (v0.1 → v1.0) beserta subtask, dependency, rantai
blocker, catatan urutan rilis, dan keputusan terbuka yang menunggu King
Rezi — semuanya **hanya** di **[`TASKS.md`](TASKS.md)** (section **Fokus
sekarang** + **Keputusan terbuka**). Snapshot di atas sudah menyalin ID +
judul singkatnya. **Jangan menulis ulang daftar/detail task di sini**
(ADR-062) — daftar ketiga akan langsung desync.

---

## Known Issues

> **ID `KI-XXX`** (ADR-066, amandemen ADR-067) — global, tidak pernah didaur ulang. `Status`: `Open` / `Resolved` / `Sebagian Resolved — sisa scope: <ID>` / `Promoted to T-XXX`. `Sebagian Resolved` dipakai kalau sebagian besar gap sudah ditutup tapi ada 1 subtask/scope kecil yang eksplisit belum — sebutkan sisa scope-nya di string status. Terpisah dari namespace task (`T-XXX`) karena belum tentu jadi task formal. **Entry `Resolved` yang sudah tercatat di `COMPLETE_TASK.md` dihapus dari daftar ini** (bukan dibiarkan dengan status `Resolved`) — riwayatnya tetap ada di `COMPLETE_TASK.md`, ID-nya tidak didaur ulang untuk entry baru.

### KI-001 · Transactional Email Provider belum ditetapkan

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Dependency |
| Terkait | T-005 |

Password reset & email verification (Better Auth) membutuhkan email provider yang belum ditetapkan (kandidat: Resend, Postmark, AWS SES, SMTP Supabase). Dicatat di `auth-strategy.md` (AS-D04). `requireEmailVerification` dinonaktifkan sementara di skeleton. Tidak memblokir M8 awal.

### KI-003 · Runtime ADR-040 belum diimplementasikan

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt |
| Terkait | T-025, T-026, T-027 |

Alignment dokumentasi dan schema/migration sudah selesai, tetapi handler webhook, durable ingestion, retry internal, media upload Outstand, engagement sync/reply, dan reconnect flow masih task M8. `schedulePost` sendiri sudah bisa dipakai lewat `FakeOutstandAdapter` (ADR-059) — `getOutstandAdapter()` akan beralih otomatis ke real adapter begitu `OUTSTAND_API_KEY` diisi **dan** kode real adapter sudah ditulis (kalau env terisi tapi kode belum ada, factory throw error, bukan silent fallback ke Fake). Per 2026-08-13, T-041 (metric ingestion) juga sudah diselesaikan lewat pola Fake yang sama (ADR-079) — `fetchPostMetrics`/`fetchWorkspaceMetrics` mengembalikan data mock deterministik sampai kredensial asli tersedia. T-042 (Dashboard Home) juga sudah ✅ Done (2026-08-13, seluruh subtask), tapi datanya tetap dari `FakeOutstandAdapter` sampai KI-003 ini resolved.

### KI-005 · Astryx masih Beta

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Process |
| Terkait | [astryx.atmeta.com](https://astryx.atmeta.com) |

Kompatibilitas dasar Next.js 16 sudah dibuktikan lewat smoke test dan production build, tetapi risiko perubahan API tetap dikelola dengan exact pin, tanpa canary/swizzle, wrapper selektif, update manual, dan verifikasi ulang saat upgrade.

### KI-014 · Domain `identity` belum punya unit test

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt |
| Terkait | T-016 |

`IdentityService`, `IIdentityRepository`, dan `SupabaseAvatarStorageAdapter` (domain `identity`, diisi pertama kali lewat T-016.2) belum punya unit test Vitest. Review arsitektur Ridwan sudah memverifikasi boundary domain bersih (tidak ada pelanggaran), tetapi coverage test-nya nihil. Tidak memblokir penutupan T-016.1/.2/.3/.5 — keempatnya sudah lolos QA browser end-to-end.

### KI-015 · Env var `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` belum diisi

| Field | Value |
|-------|-------|
| Status | Sebagian Resolved — sisa scope: `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` |
| Kategori | Dependency |
| Terkait | T-025, T-026 |

Sama seperti `OUTSTAND_API_KEY` (lihat KI-003):

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — kode Google OAuth di `auth.ts` sudah siap (`socialProviders.google` terdaftar kondisional lewat `env.ts`), tapi tanpa env ini "Sign in with Google" tidak aktif. Masih placeholder dummy.
- `JOB_SECRET` — **resolved 2026-08-14**: sudah diisi nilai asli generated di Railway staging (env var), dan job runner (T-027, `POST /api/jobs/run` via Railway Cron `X-Job-Secret`) sudah terverifikasi end-to-end 2x run berturut-turut SUCCESS di staging. Local `.env.local` masih boleh memakai nilai dummy untuk dev.

### KI-023 · Kode `apps/web` belum dimigrasikan ke baseline routing/Settings baru (ADR-076/ADR-077)

| Field | Value |
|-------|-------|
| Status | Sebagian Resolved — sisa scope: T-039.4 (onboarding picker workspace), T-089 (workspace switcher, ADR-088) |
| Kategori | Tech-Debt |
| Terkait | T-009, T-039, T-089, ADR-076, ADR-077, ADR-088 |

Ditemukan awalnya sebagai gap "Workspace Selector tidak pernah
diimplementasikan" (baseline navigasi lama, IA-D05/NP-D07 versi lama).
Investigasi lanjutan 2026-08-10 menyimpulkan premis itu sendiri sudah
tidak relevan: **ADR-076** menghapus konsep Workspace Selector dari
baseline sama sekali — bukan cuma belum dibangun, tapi memang tidak lagi
jadi bagian desain (digantikan entry point avatar/user menu tunggal ke
Settings gabungan Organization + Account).

**Update 2026-08-11 — bagian inti gap ini sudah ditutup oleh T-039.1–.3:**
`apps/web/src/app/[slug]/...` sudah dipindah ke route group `(app)/...`,
`apps/web/src/app/account/...` sudah digabung ke `(app)/settings/account/*`
(dua grup Organization + Account), dan Middleware/`src/proxy.ts` sudah
resolve workspace dari cookie `active-workspace-id` (tervalidasi ulang
terhadap `workspace_members` per request) alih-alih dari URL/komponen
statis. Sudah lolos review arsitektur Ridwan + QA Najwa (detail lengkap di
`tasks/v01-foundation.md` § T-039).

**Update 2026-08-11 — T-039.5 (ADR-077) juga sudah ditutup:** migrasi kode
pola sidebar Settings ke sidebar tunggal pola Buffer (`AppShell` `sideNav`
kondisional per-route, hapus `LayoutPanel` secondary nav, header
back-navigation di `SettingsSideNav`) sudah lolos review Ridwan (tidak ada
temuan) dan QA Najwa end-to-end browser (PASS semua golden path, 79/79
test). Detail: `tasks/v01-foundation.md` § T-039.

Sisa gap: halaman `/onboarding` dengan picker workspace (re-entry point
untuk user dengan >1 workspace saat cookie hilang) — ini **T-039.4**,
belum dikerjakan. Untuk skenario "cookie hilang, tepat 1 workspace",
`onboarding/resume/route.ts` (bagian T-039.3) sudah menangani otomatis
lewat `getDefaultWorkspaceForUser`; sisanya (>1 workspace, perlu pilihan
eksplisit user) masih menunggu T-039.4.

**Update 2026-08-24:** Desain T-039.4 sudah selesai di Claude Design
(`templates/onboarding.html` + class `.ws-pick-*` di `styles.css`) —
gate rule 17 `AGENTS.md` sudah terpenuhi untuk UI ini. Implementasi kode
di `apps/web` masih belum dikerjakan, menunggu approval King Rezi atas
desain tersebut. Detail: `tasks/v01-foundation.md` § T-039 (catatan
T-039.4), `COMPLETE_TASK.md`.

**Update 2026-08-24 (lanjutan) — gap terpisah ditemukan, ADR-088:** Setelah
T-039.4 didesain, King Rezi menyadari tidak ada cara *sengaja* pindah
workspace setelah user pernah memilih satu (picker T-039.4 hanya re-entry
saat cookie hilang). Diamandemen lewat **ADR-088** — halaman baru Settings
→ Account → Workspaces (switch antar membership + create workspace
tambahan), desainnya sudah selesai di Claude Design
(`templates/settings-workspaces.html` + 6 halaman lain + dialog + styles).
Dipecah jadi task baru **T-089** (bukan subtask T-039.6), lihat
`tasks/v01-foundation.md` § T-089. Mekanisme switch: overwrite langsung
cookie `active-workspace-id` setelah validasi membership + redirect Home
— bukan hapus-cookie-lalu-onboarding-ulang. **Implementasi kode kedua
fitur (T-039.4 dan T-089 switcher baru) masih sama-sama belum
dikerjakan** — hanya desain + ADR yang selesai di sesi ini. Detail:
`COMPLETE_TASK.md`.

### KI-024 · Header sidebar Settings belum sesuai spec Design System (back-button vs judul)

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt |
| Terkait | T-039.5, ADR-077 |

Ditemukan 2026-08-11 saat memperbaiki header `WorkspaceSideNav.tsx` agar
sesuai Design System (lihat `COMPLETE_TASK.md`). `SettingsSideNav.tsx`
(dibuat via T-039.5/ADR-077) merender `SideNavHeading` dengan back-icon +
judul "Settings" sebagai **satu link utuh**, sedangkan spec desain
(`.settings-sidebar-header` di `styles.css` Claude Design, baris ~316-319)
memisahkan back-button (kotak ikon 28px, klik-able sendiri) dari judul
"Settings" (teks statis, font `--text-body-size`, lebih kecil dari default
`SideNavHeading` yang pakai `--text-large-size`). Belum diperbaiki — dicatat
sebagai temuan untuk follow-up King Rezi, belum dibuatkan task formal.

### KI-027 · Selector target Admin di dialog Transfer Ownership (T-008) belum dikonfirmasi ke desain

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Process |
| Terkait | T-008 |

Mockup `templates/settings-general.html` di Claude Design tidak menunjukkan cara memilih Admin target sebelum dialog Transfer Ownership dibuka. Mark UI Engineer menambahkan komponen `Selector` Admin aktif sebagai keputusan implementasi sendiri (bukan sesuai desain final yang disetujui King Rezi) supaya alur tetap bisa dipakai. Perlu konfirmasi/update balik ke Claude Design dari King Rezi — T-008 sengaja belum ditutup `✅ Done` sampai ini selesai (lihat `tasks/v01-foundation.md` § T-008).

### KI-028 · Production Railway environment & Supabase project belum dibuat

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Dependency |
| Terkait | T-027, seluruh CI/CD deploy step (ADR-028, ADR-029, ADR-032) |

Ditemukan saat menutup KI-025 (2026-08-14): staging environment (Railway +
Supabase) sudah live & terverifikasi, tapi **production** belum ada sama
sekali — belum ada project/environment Railway `production`, dan belum
ada project Supabase terpisah untuk production (staging permanen memakai
project Supabase existing "Sosial Media Management",
ref `ndcrkzqgqukqfmekgoze` — dikonfirmasi permanen via ADR-081, amandemen
EM-D02; lihat catatan di `COMPLETE_TASK.md` 2026-08-14). Baseline
`deployment-infrastructure.md`, `environment-topology`
(ADR-029), region Singapore (ADR-028), dan CI/CD pipeline (ADR-032) untuk
jalur production masih rencana, belum ada realisasi. Tidak memblokir M8,
tapi wajib dituntaskan sebelum rilis production.

### KI-030 · `TimeInput` Astryx tidak membatasi input real-time (bisa ketik >4 digit/huruf bebas)

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt |
| Terkait | T-029, ADR-041 |

Ditemukan 2026-08-18 saat King Rezi menguji Schedule Picker Draft Editor secara langsung: field `TimeInput` menerima ketikan bebas tanpa batas — dikonfirmasi lewat inspeksi DOM, elemen `<input>` internalnya `type="text"` tanpa `maxLength`/`pattern` sama sekali (bukan salah konfigurasi kita). Astryx TimeInput didesain sebagai field yang di-parse saat blur (bukan masking real-time per-keystroke seperti native `<input type="time">`), dan **tidak ada prop resmi** (`maxLength`, `pattern`, `onKeyDown`, dll) untuk membatasi ini. Opsi mitigasi yang dipertimbangkan:

- **Wrapper `onKeyDownCapture`/`onPaste`** untuk intercept keystroke dari luar (level "wrapper selektif", bukan swizzle) — secara arsitektur boleh, tapi tidak solid (tidak menangkap paste/drag-drop/IME sepenuhnya tanpa handler tambahan) dan berisiko konflik dengan state internal `TimeInput` yang tidak kita kontrol. Sempat diimplementasikan (varian: `status` error saat blur untuk feedback, bukan mencegah ketik) tapi **dihapus atas keputusan King Rezi** (2026-08-18) — dianggap belum sesuai harapan, bukan solusi final.
- Menunggu Astryx menambah prop resmi untuk ini (masih Beta, KI-005) — solusi paling bersih, tidak instan.

Tidak memblokir M8. Icon kalender/jam Draft Editor sempat diperbaiki terpisah (posisi kanan, sesuai mockup) tapi **direvert** 2026-08-18 karena masalah a11y — resolved 2026-08-19 (lihat `COMPLETE_TASK.md`), posisi kiri sekarang final. Sisa gap di KI ini murni soal pembatasan input real-time, belum ada solusi yang disetujui.

**Catatan penutup sesi 2026-08-19:** King Rezi memutuskan menghentikan investigasi lebih lanjut untuk saat ini. Status tetap `Open`, bukan Resolved — gap ini murni soal behavior/validasi keystroke, tidak terkait keputusan Astryx Tailwind-only (ADR-082, lihat `DECISIONS.md`) yang menutup KI-029.

### KI-032 · Publish Now dari Queue belum auto-advance ke Confirmation Summary

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt |
| Terkait | T-032 (§ T-032.4, `tasks/v02-publishing-mvp.md`) |

Ditemukan 2026-08-20 saat wiring tombol "Publish Now" di Queue (T-032.4): tombol ini reuse modal Draft Editor via `openEditDraft` dengan `initialPendingAction: "publish-now"` supaya modal auto-advance ke step Confirmation Summary begitu draft ready — tapi `getDraftAction` **belum preload target akun** yang sudah dijadwalkan, sehingga `isReadyToPublishNow` sering `false` saat dibuka dari Queue. Efeknya: modal jatuh ke form biasa (bukan langsung ke Confirmation Summary) — bukan bug fungsional (Publish Now tetap bisa dilakukan lewat form), murni gap UX auto-advance. Sengaja dibiarkan (di luar scope T-032.4) — perlu subtask terpisah nanti (preload target akun untuk Edit Draft) kalau UX ini mau disempurnakan. Tidak memblokir M8.

---

## Blockers

**Wajib dicek AI sebelum mengerjakan subtask apapun yang menyentuh area di
bawah.** Keduanya adalah dependency eksternal yang belum tersedia di
lingkungan lokal/CI — bukan bug kode. Kalau eksekusi subtask di area ini
gagal/crash, cek dulu apakah salah satu blocker ini penyebabnya sebelum
menyimpulkan ada bug dan mulai "memperbaiki" kode yang sebenarnya sudah
benar.

| ID         | Blocker                                                        | Menghambat                          |
| ---------- | --------------------------------------------------------------- | ------------------------------------ |
| **KI-003** | `OUTSTAND_API_KEY`/`OUTSTAND_WEBHOOK_SECRET` belum diisi **dan** kode Real OutstandAdapter belum ditulis sama sekali (bukan cuma env — factory sengaja throw kalau env terisi tapi kode belum ada) | T-025 → T-026 → T-027 (rantai terbesar) |
| **KI-015** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` belum diisi (JOB_SECRET sudah resolved 2026-08-14 di Railway staging) | Google OAuth sign-in |

**Resolved 2026-08-14:** KI-025 (Railway belum pernah dibuat) — staging
sudah live & terverifikasi, lihat `COMPLETE_TASK.md`. Sisa gap production
dicatat terpisah sebagai **KI-028** (tidak memblokir M8/T-027 staging).

Detail masing-masing ada di section **Known Issues** di atas — tabel ini
hanya pointer supaya blocker aktif langsung terlihat tanpa harus menyisir
seluruh daftar Known Issues.

---

## Completed (Ringkasan)

Berikut ~5 item terakhir yang diselesaikan. Riwayat lengkap (sejak M0): lihat `COMPLETE_TASK.md` — ⚠️ jangan dibaca AI kecuali diperintah eksplisit King Rezi.

* **Desain + ADR-088 Workspace Switcher deliberate selesai (2026-08-24)** — Task baru **T-089**: halaman baru Settings → Account → Workspaces (switch antar membership + create workspace tambahan), lahir dari amandemen ADR-076 poin 4 setelah King Rezi menemukan gap "tidak ada cara sengaja pindah workspace" pasca desain T-039.4 (onboarding picker). Desain sudah selesai di Claude Design (AI utama via `DesignSync`, mengikuti pola delegasi T-039.4): `templates/settings-workspaces.html` + 6 halaman lain + kolom dialog baru + `styles.css`; belum diwire ke `AppPrototype.dc.html` (follow-up terbuka). Mekanisme switch dikoreksi: overwrite cookie `active-workspace-id` langsung setelah validasi membership, **bukan** hapus-cookie-lalu-onboarding-ulang. Implementasi kode `apps/web` untuk T-039.4 **dan** T-089 masih sama-sama belum dikerjakan. Detail: `tasks/v01-foundation.md` § T-089, `COMPLETE_TASK.md`, `project-manager/decisions/ADR-088-*.md`.
* **Ganti theme Astryx dari Neutral ke Stone (2026-08-21, ADR-087)** — Atas permintaan eksplisit King Rezi (preferensi visual, bukan bug), theme Astryx diganti dari `@astryxdesign/theme-neutral` ke `@astryxdesign/theme-stone` (versi `0.4.3`): `apps/web/package.json` (field `astryx.theme` + dependency), `apps/web/src/app/globals.css` (`@import`), `apps/web/src/components/Providers.tsx` (`stoneTheme`). Sudah diverifikasi computed style browser (`data-astryx-theme="stone"`, font Montserrat/Figtree) dan `bun run build` hijau 30 route. Rule 17 `AGENTS.md` (gate Claude Design) sengaja dilewati atas instruksi King Rezi — **item terbuka:** Claude Design belum disinkronkan ke theme Stone. Detail: `COMPLETE_TASK.md`, `project-manager/decisions/ADR-087-*.md`.
* **Revert total swap warna AppShell, kembali ke default Astryx (2026-08-21, ADR-086)** — Membatalkan ADR-084 (2026-08-20): blok `@layer components` di `apps/web/src/app/globals.css` yang menukar warna sidebar (abu→putih) dan konten (putih→abu) dihapus total. AppShell kembali ke default `neutralTheme` Astryx sepenuhnya — sidebar abu-abu, konten putih di light mode; dark mode tidak berubah. Bagian dari audit menyeluruh King Rezi terhadap seluruh override warna custom (satu rangkaian dengan ADR-085 di hari yang sama). ADR-084 tidak dihapus (sudah jadi rujukan di dokumen lain), hanya ditandai Reverted. Sudah diverifikasi visual browser (light & dark mode), tidak ada regresi. Detail: `COMPLETE_TASK.md`, `project-manager/decisions/ADR-086-*.md`.
* **Settings pakai `Section` murni tanpa `Card` (2026-08-21, ADR-085)** — `SettingsSectionCard` direstrukturisasi total (Card dihapus), `DashboardHome.tsx` "Analytics Snapshot" dikembalikan ke default — mengoreksi pola `Section > Card` yang melanggar aturan resmi Astryx ("dense data jangan Card-wrapped", `bunx astryx docs layout`/`docs shape`). ADR-085 & ADR-086 versi lama (dibuat hari yang sama) **dihapus total** (bukan diamandemen) — pengecualian eksplisit dari pola append-only ADR karena belum jadi preseden di tempat lain. Konsekuensi visual disadari: 3 halaman Settings jadi flat/persegi, menyimpang dari mockup Claude Design lama. Detail: `COMPLETE_TASK.md`, `project-manager/decisions/ADR-085-*.md`.
* **T-032 Queue management selesai (2026-08-20)** — `listQueue` dari data asli `PublishingPost`/`PublishingPostTarget` (bukan `PublishingQueueSlot`, dihapus lewat migration ADR-083), UI Astryx nyata (grouping per tanggal, 1 Card per schedule, tanpa status chip), dan 3 aksi per item (Publish Now, Edit, Cancel Schedule). Cancel Schedule sekaligus menutup sebagian besar **T-030** (implementasi nyata untuk konteks Queue — RBAC ADR-074, `AlertDialog` Tier 2, `useToast` pertama di codebase); sisa scope Calendar menunggu T-033. Lolos review Ridwan (0 temuan) + QA Najwa (Vitest, `tsc`, `eslint`, E2E browser lengkap, 1 bug kosmetik ditemukan & diperbaiki di sesi yang sama). 1 Known Issue baru: **KI-032** (Publish Now dari Queue belum auto-advance ke konfirmasi). Detail: `tasks/v02-publishing-mvp.md` § T-032, `COMPLETE_TASK.md`.
---

## Recent Decisions (Ringkasan)

5 ADR terakhir. Daftar lengkap (indeks + link ke tiap ADR): lihat `DECISIONS.md`.

* **ADR-088** — Amandemen ADR-076 (poin 4) — Deliberate Workspace Switcher via Settings → Account → Workspaces: halaman baru untuk switch antar membership + create workspace tambahan (scope MVP narrow, bukan multi-workspace management penuh); mekanisme switch overwrite cookie `active-workspace-id` langsung setelah validasi membership, bukan hapus-cookie-lalu-onboarding-ulang.
* **ADR-087** — Ganti theme Astryx dari Neutral ke Stone ("Warm stone and slate tones; Montserrat + Figtree type") — permintaan eksplisit King Rezi, rule 17 `AGENTS.md` (gate Claude Design) sengaja dilewati; item terbuka: Claude Design belum disinkronkan.
* **ADR-086** — Revert total swap warna AppShell — kembali ke default `neutralTheme` Astryx murni, membatalkan ADR-084 (bagian dari audit menyeluruh override warna custom).
* **ADR-085** — Settings pakai `Section` murni tanpa `Card` (kepatuhan aturan Astryx "dense data jangan Card-wrapped") — ADR-085/086 versi lama (pola `Section > Card`) dihapus total, bukan diamandemen.
* **ADR-084** — Swap warna sidebar ↔ konten AppShell (light mode saja) via CSS selector ter-scope, bukan `defineTheme` component override (`LayoutContent` dipakai ulang di seluruh dialog) — **Reverted by ADR-086 (2026-08-21)**.

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
