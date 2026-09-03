# PROJECT STATE

## Snapshot

* **Phase / Milestone:** Phase 6 — Implementation · M8 — Development (Sprint 5) · Overall: M7 100%, M8 in progress
* **Active Mode:** Ready for Development — implementasi fitur produk sesuai Architecture & Engineering Baseline
* **Top Next Tasks:** **T-098 Migrasi App Shell & Navigasi — ✅ Done (2026-09-02, ADR-097)**, seluruh 4/4 subtask tuntas (T-098.1–.3: `WorkspaceSideNav`/`SettingsSideNav`/`ChannelsSection`, `NotificationBell` ke `Sheet` + hapus `Drawer.tsx`, re-verifikasi **KI-040** → Closed; T-098.4: sidebar mobile + tabel mobile card, menutup **KI-042**), lolos review Ridwan (0 temuan) + QA Najwa (PASS penuh). **T-099 Migrasi Settings — ✅ Done (2026-09-02, ADR-097)**, seluruh 3 subtask tuntas (General/Profile/Preferences, Members Table + Invite, Connected Accounts + Workspaces list); lolos review Ridwan (0 temuan) + QA Najwa (PASS dengan 1 temuan minor viewport sempit). Gap strategi responsive/mobile dari kedua task ini dicatat **KI-042** (Closed 2026-09-02). **T-100 Migrasi Publish — Draft Editor Modal — 🟡 In Progress (2026-09-03)**, T-100.1/4 subtask selesai (lihat `TASKS.md`/`tasks/v07-astryx-shadcn-migration.md` § T-100 untuk detail). **T-101**, **T-102** menyusul sebagai task berikutnya rilis v0.7. T-025 Real OutstandAdapter dan T-036 In-app notification + Supabase Realtime (🟡 In Progress, T-036.1–.3 selesai; T-036.4 dibuka kembali untuk verifikasi visual, tersisa juga T-036.5 trigger dari webhook) tetap di antrean — salinan ID dari **Fokus sekarang** di [`TASKS.md`](TASKS.md), yang merupakan satu-satunya daftar fokus
* **Blocker:** 2 blocker aktif (env var Outstand belum diisi + kode Real OutstandAdapter belum ditulis; env var Google OAuth belum diisi) — lihat section **Blockers** di bawah. Railway staging sudah live & terverifikasi (2026-08-14) sehingga blocker itu resolved; JOB_SECRET juga sudah diisi di Railway staging. Tidak memblokir M8 awal, tapi memblokir T-025→T-026→T-027.
* **Backlog task lengkap:** [`TASKS.md`](TASKS.md) — 85 task per release (v0.1 → v1.0, + v0.7 migrasi Astryx→shadcn/ui, ADR-097), detail di `tasks/`. Jangan cari detail task di file ini.
* Detail phase/mode/issue ada di section di bawah. Riwayat completed/ADR lengkap: lihat `COMPLETE_TASK.md` (⚠️ jangan dibaca AI kecuali diperintah)/`DECISIONS.md`.

---

## Metadata

| Field        | Value      |
| ------------ | ---------- |
| Version      | 1.0.61     |
| Status       | Active     |
| Last Updated | 2026-09-03 |

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

* **Prioritas utama saat ini (2026-09-02):** migrasi UI component system
  dari Astryx ke shadcn/ui (**ADR-097**, rilis **v0.7**,
  `tasks/v07-astryx-shadcn-migration.md`, T-095–T-102) — permintaan
  eksplisit King Rezi, dikerjakan **sebelum** T-025/T-036. Strategi
  incremental per route-segment, Astryx & shadcn coexist sementara.
  T-095/T-096/T-097/T-098/T-099 sudah `✅ Done`; **T-100** `🟡 In
  Progress` (1/4 subtask); T-101, T-102 tersisa.
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
* Alignment dokumentasi ADR-041 (2026-07-23) — **sekarang superseded oleh
  ADR-097 (2026-09-01)**, lihat bullet prioritas utama di atas. Riwayat:
  Engineering Baseline, Project Overview, AGENTS, dan AI Context sempat
  disinkronkan memakai Astryx permanen (theme Stone sejak ADR-087),
  Tailwind layout-only, wrapper selektif, exact pin Beta — seluruh dokumen
  itu sudah disinkronkan ulang ke shadcn/ui (ADR-097, T-095.7). Instalasi
  dan smoke test Next.js 16 (2026-07-23) tetap valid, tidak terpengaruh
  perubahan ini.
* Fokus M8 saat ini: Auth Flows, Workspace Onboarding, App Shell, Draft
  Editor (modal, default Standard per ADR-065; Fullscreen via toggle,
  ADR-052), persistensi nyata "Save as Draft"/"Edit Draft", Drafts List
  data asli, dan persistensi nyata "Schedule" via Fake OutstandAdapter
  (ADR-059) sudah selesai; lanjut ke integrasi Outstand runtime asli
  (ADR-040) begitu kredensial tersedia.
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
| Status | Sebagian Resolved — sisa scope: T-039.4 (onboarding picker workspace); T-089 (workspace switcher, ADR-088) sudah ✅ Done (2026-08-24), tidak lagi bagian sisa scope |
| Kategori | Tech-Debt |
| Terkait | T-009, T-039, T-089, ADR-076, ADR-077, ADR-088, ADR-089 |

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

**Update 2026-08-24 (lanjutan lagi) — T-089 diimplementasikan lalu
mekanismenya diamandemen, ADR-089:** T-089.2/.3/.4 (kode `apps/web`) sudah
diselesaikan, lolos review Ridwan + QA Najwa, T-089 ditutup `✅ Done`.
Setelah itu King Rezi mengubah rancangan switch di Claude Design —
klik row workspace sekarang membuka dialog konfirmasi Tier 2 (reuse
`AlertDialog`, pola Logout/Remove Member) sebelum overwrite cookie
dieksekusi, bukan langsung switch seperti versi awal ADR-088. Diamandemen
lewat **ADR-089**, dicatat subtask baru **T-089.6**. Gap QA retest formal
sempat terbuka sebagai KI-034 — sudah Resolved 2026-08-24 (QA Najwa lolos
penuh, tidak ada bug), lihat `COMPLETE_TASK.md`.

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

### KI-033 · 2 workspace test tersisa dari QA T-089 belum dibersihkan

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Data Hygiene |
| Terkait | T-089 (`tasks/v01-foundation.md` § T-089) |

Ditemukan saat QA Najwa untuk T-089.2–.4 (2026-08-24): 2 workspace test
tersisa di database — **"Najwa QA Test Workspace"** (sengaja dibuat untuk
menguji `createWorkspaceAction`) dan **"QA Queue Test"** (sisa sesi QA
sebelumnya, bukan dari sesi T-089). Bukan bug — keduanya sengaja tidak
dihapus oleh Najwa karena hapus workspace bersifat ireversibel dan di luar
wewenang eksekusi otonom QA. Perlu dibersihkan manual oleh King Rezi via
Settings → General → Danger Zone kalau perlu. Tidak memblokir M8.

### KI-035 · Gap infrastruktur ditemukan saat polishing UI Calendar (T-033)

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt / Infra |
| Terkait | T-033 (`tasks/v02-publishing-mvp.md` § T-033) |

Ditemukan 2026-08-27 saat polishing grid Calendar (Month/Week, di atas
T-033.1–.6/.8, sebelum T-033.7). Tiga temuan, dicatat sebagai referensi ke
depan — bukan blocker M8, belum ada keputusan arsitektur final jadi belum
layak ADR:

1. **StyleX belum ter-setup.** `@stylexjs/stylex` ter-install sebagai
   dependency, tapi compiler-nya (babel plugin/Next.js plugin) tidak
   ter-setup di `apps/web`. Rencana awal memakai `xstyle` Astryx (jalur
   resmi CLI untuk override track template `Grid`) urung dipakai — dipakai
   `isScrollable`+`StackItem size="fill"` sebagai gantinya. Kalau ke depan
   ada kebutuhan `xstyle`, compiler harus disetup dulu, jangan diasumsikan
   tersedia.
2. **`Badge` Astryx tanpa prop `size`/truncation** — overflow di kolom
   sempit. Kartu Calendar mobile (≤768px) memakai `StatusDot`+`Icon`
   compact sebagai workaround, beda pola dari `Badge` yang dipakai
   Queue/Draft. Kalau mau diperluas ke UI lain, perlu keputusan konsistensi
   dulu.
3. **Layout Calendar di viewport sangat sempit (~375px)** masih padat
   (grid 7-kolom fixed di-shrink). Perbaikan lanjutan (mis. tampilan
   agenda/list khusus mobile) butuh rancangan baru di Claude Design dulu
   (rule 17 `AGENTS.md`), bukan sekadar tweak CSS.

### KI-036 · Dashboard (`app/(app)/page.tsx`) fetch data lewat Server Action, menyimpang RS-D02

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt |
| Terkait | ADR-095, T-094 |

Ditemukan saat penulisan `rendering-strategy.md` (ADR-095, 2026-08-28): `app/(app)/page.tsx` (dashboard) mengambil data lewat Server Action (`getDashboardSummaryAction`) untuk pure read — seharusnya memanggil Application Service langsung dari Server Component (composition root), seperti pola yang sudah benar di `app/(app)/publish/calendar/page.tsx` (sesuai AGENTS.md rule 5 dan RS-D02 di `rendering-strategy.md`). ADR-095 secara eksplisit **tidak** memperbaiki ini sebagai bagian ADR — dicatat sebagai exception pra-existing, cleanup terpisah di **T-094.4** (`tasks/v01-foundation.md`). Tidak urgent, tidak memblokir M8.

**Update (2026-08-28) — 2 exception tambahan ditemukan review arsitektur Ridwan** (sesi yang sama, setelah ADR-095/T-094 dicatat, belum masuk subtask formal manapun — technical debt yang perlu di-follow-up terpisah dari T-094.4 di atas):
1. **RS-D03** — `app/(app)/settings/account/preferences/page.tsx` punya `"use client"` di baris pertama, membuat seluruh page jadi Client Component (seharusnya Server Component dengan `"use client"` hanya di leaf yang butuh interactivity).
2. **CC-D02** — `draft-editor/actions.ts` (6 fungsi) tidak punya `try/catch`/`toActionError()` sama sekali; `settings/account/actions.ts` dan `onboarding/components/actions.ts` masih pakai pola `instanceof` manual sendiri, bukan `toActionError()`.

### KI-037 · `design-tokens.md` section Spacing (ADR-095) belum disinkronkan ke Claude Design

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Process |
| Terkait | ADR-095, ADR-056 |

Section Spacing di `design-tokens.md` baru dikunci (base 1 unit = 4px, skala 0/0.5/1/1.5/2/3/4/5/6/8 = 0–32px, menggantikan `TBD` sejak ADR-038) lewat ADR-095. Mengikuti pola reminder ADR-056 (dokumen ini co-equal dengan Claude Design, perubahan salah satu wajib disinkronkan ke yang lain), sinkronisasi ke Claude Design belum dilakukan di sesi ADR-095 — perlu langkah lanjutan terpisah. Tidak memblokir M8.

### KI-039 · Rancangan Notifications Panel belum ada di Claude Design (T-036.4) — Resolved

| Field | Value |
|-------|-------|
| Status | Resolved (2026-09-01) |
| Kategori | Design Gap |
| Terkait | T-036 |

Ditemukan saat mengerjakan T-036 (2026-08-31): sesuai gate AGENTS.md rule 17, dicek dulu ke Claude Design (project "Social Media Management") sebelum menulis kode UI untuk T-036.4 (notification bell + panel daftar) — App Prototype interaktif menampilkan toast "Panel notifikasi belum ada layarnya" saat ikon bell diklik, jadi rancangannya belum ada sama sekali. T-036.1 dan T-036.2 (domain skeleton + subscribe Realtime, tidak ada permukaan visual) tetap bisa dikerjakan dan sudah selesai. **Resolved (2026-09-01):** saat dicek ulang di sesi berikutnya, rancangan (`components/notifications-panel.html`, wired di App Prototype) ternyata sudah ditambahkan ke Claude Design sebelum sesi ini dimulai — T-036.4 dilanjutkan dan sudah selesai (lolos review Ridwan + QA Najwa), lihat `tasks/v02-publishing-mvp.md` § T-036.

### KI-041 · Stone theme shadcn belum punya token `--success`/`--warning`

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Design Gap |
| Terkait | T-097 |

Ditemukan 2026-09-02 saat migrasi Accept Invite (T-097.3) ke shadcn/ui —
Mark UI Engineer menemukan gap, dikonfirmasi independen oleh Ridwan lewat
grep `globals.css`: Stone theme yang sudah dipetakan ke CSS variable
shadcn (T-095.5/T-096.1) hanya punya token `--destructive`, **tidak ada**
`--success`/`--warning`. Astryx lama punya `EmptyState
color="success"/"warning"/"error"` yang dipakai untuk 3 state Accept
Invite (success/expired/invalid) — tanpa token pengganti, state "invalid"
dipetakan ke `text-destructive` (token yang memang ada), sedangkan
"expired"/"success" dibiarkan netral (bukan mengarang hex/token baru
tanpa ADR, sesuai `AGENTS.md` rule 15).

**Keputusan terbuka untuk King Rezi:** apakah perlu menambah token
`--success`/`--warning` ke Stone theme shadcn (butuh ADR baru kalau iya,
mengamandemen pemetaan T-095.5) atau tetap netral selamanya untuk 2 state
itu. Tidak memblokir M8 — Accept Invite tetap fungsional, ini murni gap
visual/semantik warna status. Lihat `tasks/v07-astryx-shadcn-migration.md`
§ T-097 untuk detail implementasi.

**Update (2026-09-02, T-099) — gap meluas:** `MembersTable.tsx` status
"Pending" dipetakan ke `Badge variant="outline"` (bukan "secondary" seperti
Active/Removed) karena tetap tidak ada token warning — treatment varian,
bukan warna baru, konsisten dengan keputusan di atas. Tidak mengubah
keputusan terbuka; lihat `tasks/v07-astryx-shadcn-migration.md` § T-099.

### KI-042 · Aplikasi belum punya strategi responsive/mobile yang didesain

| Field | Value |
|-------|-------|
| Status | Closed (2026-09-02) |
| Kategori | UI/Visual |
| Terkait | T-098, T-099, T-096 |

Ditemukan 2026-09-02 saat migrasi App Shell & Navigasi (T-098) dan meluas
saat migrasi Settings (T-099) — root cause sama: aplikasi belum punya
strategi responsive/mobile yang didesain (bukan bug lokal di satu
komponen), jadi dicatat sebagai satu KI, bukan entri terpisah per temuan.

**Temuan T-098 (sidebar mobile):** komentar existing di
`apps/web/src/app/(app)/layout.tsx` (peninggalan T-096.3) menyebut gap
**sidebar mobile (hamburger + drawer)** akan "menyusul di T-098 bersamaan
migrasi `WorkspaceSideNav`/`SettingsSideNav` ke `Sheet`" — tapi breakdown
resmi T-098 (3 subtask: T-098.1–.3) **tidak mencakup** migrasi
`layout.tsx`/`AppSideNav.tsx` ke shadcn `Sidebar` primitive (yang punya
built-in mobile-`Sheet`). Belum ada regresi fungsional dilaporkan, murni
gap migrasi UI foundation, belum dikerjakan karena di luar file yang
di-scope T-098.

**Temuan T-099 (`MembersTable.tsx`):** kolom "Actions" (Change Role/
Remove) tidak terlihat penuh pada viewport sempit (~800px) — perlu scroll
horizontal untuk diakses. shadcn `Table` primitive sudah menyediakan
`overflow-x-auto` bawaan, jadi ini bukan crash/broken, tapi UX kurang
optimal di layar sempit. Ditemukan QA Najwa saat verifikasi end-to-end
T-099, severity Moderate.

**Keputusan (2026-09-02):** King Rezi memutuskan bentuknya jadi subtask
baru **T-098.4** (bukan task terpisah, bukan ditunda ke T-102) begitu
dikerjakan — tapi **ditunda dulu**, belum dikerjakan sekarang. Sebelum
mulai, dicek dulu ke Claude Design (project "Social Media Management")
sesuai rule 17 `AGENTS.md`: saat itu **rancangan mobile/responsive belum
ada** — `foundations/layout.html` eksplisit menyatakan "sidebar shape
never changes", tidak ada varian mobile-nav atau pola tabel sempit yang
dirancang di manapun. Satu-satunya precedent breakpoint terdokumentasi
(`product-discovery/04-ux/key-screen-patterns.md` § KSP-02-F10, `≤768px`)
spesifik untuk indikator tipe konten Calendar, tidak berlaku langsung ke
sidebar/table.

**Update (2026-09-02, rancangan dibuat):** blocker desain di atas
**resolved** — rancangan mobile/responsive untuk App Shell dan pola tabel
sudah dibuat di Claude Design (project "Social Media Management",
`projectId` `84aded99-bb23-49b1-be9f-dd8f21c6873e`), murni penambahan
(append-only, tidak ada markup/CSS existing yang diubah/dihapus):
* `styles.css` — 2 blok CSS baru di akhir file: pattern "Mobile Shell"
  (`.mobile-topbar`, `.mobile-nav-backdrop`, `.mobile-nav-drawer` +
  `@media (max-width: 768px)`, reuse anatomy overlay
  `.notif-backdrop`/`.notif-drawer` yang sudah ada, dicerminkan buka dari
  kiri) dan pattern "Table — mobile card layout" (class opt-in
  `.table-responsive` + `.table-card`/`.table-card-row`/
  `.table-card-actions`, di-gate lewat wrapper supaya tabel yang belum
  pakai tidak terpengaruh). Breakpoint `768px` dipakai deliberate reuse
  dari precedent KSP-02-F10 di atas, dinyatakan eksplisit di komentar
  CSS (bukan asumsi diam-diam) karena precedent itu untuk konteks lain.
* `foundations/layout.html` — section baru "Shell — Mobile (≤768px,
  KI-042)" ditambahkan **setelah** section "Shell — AppShell + SideNav"
  yang sudah ada; baris "sidebar shape never changes" di section desktop
  tidak diubah.
* `components/navigation-mobile.html` (file baru) — 3 demo state static
  (pola `demo-frame` seperti `components/notifications-panel.html`):
  Collapsed (top bar saja), Open — Workspace drawer, Open — Settings
  drawer; markup drawer reuse persis `WorkspaceSideNav`/`SettingsSideNav`
  desktop, direflow ke lebar drawer.
* `components/table.html` — section baru "Mobile — card layout (KI-042)"
  ditambahkan **setelah** tabel desktop existing (tidak diubah), pakai
  data sama dengan `templates/settings-members.html` (Raka/Maya/Lara).

Seluruh write dikonfirmasi tersimpan (dibaca ulang setelah `write_files`).
Verifikasi visual browser belum dilakukan (sandbox tidak bisa render file
lokal Claude Design) — King Rezi disarankan cek visual langsung di Claude
Design sebelum lanjut implementasi.

**Update (2026-09-02, implementasi T-098.4 dimulai):** King Rezi minta
lanjut ke implementasi kode. Dikerjakan di sesi utama (bukan lewat Mark UI
Engineer — `DesignSync` juga gagal dimuat di sesi subagent Mark, konfirmasi
ketiga kalinya pola keterbatasan yang sama seperti Neymar sebelumnya).
Scope 1 (sidebar mobile hamburger+`Sheet` di `apps/web/src/app/(app)/`,
file baru `MobileTopBar.tsx`) dan Scope 2 (`MembersTable.tsx` card layout
mobile) sudah selesai ditulis — typecheck & lint bersih. **Verifikasi
visual browser TIDAK berhasil dilakukan** sesi ini (tool Browser pane
timeout berulang, tampak masalah infrastruktur/tooling, bukan masalah
kode — dev server Next.js sendiri start normal tanpa error compile).
Review Ridwan dan QA Najwa **belum jalan**. Status realistis: **kode
ditulis, menunggu review + QA** — T-098.4 belum ditandai selesai, T-098
tetap `🟡 In Progress`, **KI-042 tetap Open** sampai T-098.4 benar-benar
lolos review+QA. Detail: `tasks/v07-astryx-shadcn-migration.md` § T-098.

**Penutupan (2026-09-02):** Review Ridwan (Architecture Reviewer) selesai
dengan **0 temuan** — entry point bersih, tidak ada import Prisma/Supabase
di komponen client (`MobileTopBar.tsx`, `AppSideNav.tsx`,
`WorkspaceSideNav.tsx`, `SettingsSideNav.tsx`, `MembersTable.tsx`),
cross-domain lewat public API domain, prop `onNavigate?: () => void`
opsional dikonfirmasi tidak breaking (default `undefined` di sidebar
desktop), prop `fullWidth` di `MemberActions` konsisten dipakai
desktop/mobile. QA Najwa: **PASS penuh** — automated `typecheck`/`lint`/
`test` PASS (235 lulus, 4 skipped), desktop (≥768px) tanpa regresi, mobile
(375px, 320px) `MobileTopBar`+hamburger+`Sheet` berfungsi benar untuk
`WorkspaceSideNav`/`SettingsSideNav` (termasuk auto-close `Sheet` saat
navigasi), `MembersTable.tsx` beralih ke card layout dengan
Change Role/Remove full-width + dialog konfirmasi Tier-2 (ADR-049) muncul
normal, tidak ada horizontal overflow di 320–375px, dark mode smoke test
oke. 2 temuan di luar scope T-098.4 dicatat tapi **bukan** blocker
penutupan: (a) tabel Members di lebar persis 768px butuh scroll horizontal
internal — perilaku pre-existing sebelum T-098.4, bukan regresi baru;
(b) card "Analytics Snapshot" halaman Home tetap berlatar putih saat dark
mode — bug dark mode pre-existing, tidak terkait T-098.4. **T-098.4
selesai, T-098 ditutup `✅ Done` (4/4 subtask), KI-042 Closed.** Detail:
`tasks/v07-astryx-shadcn-migration.md` § T-098, `COMPLETE_TASK.md`.

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

**Resolved 2026-08-24:** KI-034 (QA Najwa belum retest golden path switch
workspace dengan dialog konfirmasi Tier 2 baru, T-089.6/ADR-089) — QA
formal Najwa selesai, lolos penuh (unit test + full suite 157 passed/3
skipped/0 gagal + golden path browser end-to-end, tidak ada bug baru),
lihat `COMPLETE_TASK.md`.

**Resolved 2026-08-31:** KI-038 (T-093.4 verifikasi RBAC end-to-end 2-akun
browser nyata belum dilakukan) — Najwa QA Engineer menuntaskan verifikasi
dengan 3 akun real (Owner/Admin/Creator) di satu workspace, seluruh skenario
RBAC PASS; 1 bug ditemukan (Creator bisa mengakses `/settings/members` yang
seharusnya "Tidak ada akses") dan sudah diperbaiki + diverifikasi ulang
(commit `6fdf272`), lihat `COMPLETE_TASK.md`.

Detail masing-masing ada di section **Known Issues** di atas — tabel ini
hanya pointer supaya blocker aktif langsung terlihat tanpa harus menyisir
seluruh daftar Known Issues.

---

## Completed (Ringkasan)

Berikut ~5 item terakhir yang diselesaikan. Riwayat lengkap (sejak M0): lihat `COMPLETE_TASK.md` — ⚠️ jangan dibaca AI kecuali diperintah eksplisit King Rezi.

* **T-099 Migrasi Settings selesai (2026-09-02, ADR-097)** — task rilis v0.7 (migrasi Astryx→shadcn/ui), 3/3 subtask tuntas: T-099.1 (General/Profile/Preferences settings), T-099.2 (`MembersTable.tsx` — helper `pixel()`/`proportional()` Astryx dihapus total diganti shadcn `Table` primitive, `InviteMemberDialog.tsx`, `InviteMemberAction.tsx`), T-099.3 (`ConnectedAccountsList.tsx`, `ConnectPlatformMenu.tsx`, `WorkspacesSettingsView.tsx`). Implementasi Mark UI Engineer, lolos review Ridwan (0 temuan) + QA Najwa (PASS, 1 temuan minor). Komponen shadcn baru: `alert-dialog`, `avatar`, `badge`, `dropdown-menu`, `item`, `radio-group`, `select`, `table`, `toggle`/`toggle-group`, `tooltip`. Temuan minor viewport sempit dicatat **KI-042**; gap **KI-041** meluas (Badge "Pending" pakai `outline`). Detail: `tasks/v07-astryx-shadcn-migration.md` § T-099, `COMPLETE_TASK.md`.
* **T-098 Migrasi App Shell & Navigasi selesai (2026-09-02, ADR-097)** — task keempat rilis v0.7 (migrasi Astryx→shadcn/ui), 4/4 subtask tuntas: T-098.1–.3 (`WorkspaceSideNav.tsx`/`SettingsSideNav.tsx`/`ChannelsSection.tsx`, `NotificationBell.tsx` ke shadcn `Sheet` + hapus `Drawer.tsx` custom, re-verifikasi **KI-040** → Closed), T-098.4 (sidebar mobile hamburger+`Sheet` via `MobileTopBar.tsx` baru, `MembersTable.tsx` card layout mobile, menutup **KI-042**). Lolos review Ridwan (0 temuan) + QA Najwa (PASS penuh — typecheck/lint/Vitest bersih 235 lulus/4 skipped, desktop tanpa regresi, mobile 375px/320px berfungsi benar). 2 temuan di luar scope dicatat tapi bukan blocker (tabel Members di 768px persis butuh scroll horizontal — pre-existing; card Analytics Snapshot Home putih saat dark mode — bug pre-existing). **KI-042 Closed.** Detail: `tasks/v07-astryx-shadcn-migration.md` § T-098, `COMPLETE_TASK.md`.
* **T-097 Migrasi Auth Flows & Onboarding selesai (2026-09-02, ADR-097)** — task ketiga rilis v0.7 (migrasi Astryx→shadcn/ui), 5/5 subtask tuntas: T-097.1 (Login & Register), T-097.2 (Forgot/Reset password), T-097.3 (Accept Invite), T-097.4 (`app/(auth)/layout.tsx`), T-097.5 (Onboarding flow). Implementasi Mark UI Engineer, lolos review Ridwan (0 temuan) + QA Najwa (semua PASS: typecheck 0 error, lint 0 error, Vitest 235 passed/4 skipped, browser E2E golden+edge case). Komponen shadcn baru: `alert`, `checkbox`, `label`, `separator`, `field`, `empty`, `input-group`. Gap desain ditemukan (dicatat, tidak ditutup sendiri): Stone theme shadcn belum punya token `--success`/`--warning` — **KI-041** baru. Detail: `tasks/v07-astryx-shadcn-migration.md` § T-097, `COMPLETE_TASK.md`.
* **T-096 Migrasi Core Infra & Shared Primitives selesai (2026-09-01, ADR-097)** — task kedua rilis v0.7 (migrasi Astryx→shadcn/ui), 4/4 subtask tuntas: `globals.css` baru berbasis Tailwind v4 + shadcn (`@import` Astryx sengaja dipertahankan sementara untuk route-segment yang belum dimigrasi, dihapus di T-102), `Providers.tsx` (class `dark` shadcn berdampingan dengan `<Theme>` Astryx, bukan pengganti, supaya dark/light mode tidak desync; dilepas di T-102), root `app/(app)/layout.tsx` dimigrasi ke komposisi shadcn (gap sidebar mobile hamburger+drawer sengaja belum direplikasi, dicatat KI-042), primitive baru `Button`/`Card`/`Dialog`/`Input` (CLI shadcn resmi) + `Text`/Typography (ditulis manual). Dikerjakan Mark UI Engineer, typecheck & lint bersih, verifikasi visual manual browser tanpa regresi, dikonfirmasi King Rezi. Detail: `tasks/v07-astryx-shadcn-migration.md` § T-096, `COMPLETE_TASK.md`.
* **T-095 Setup Fondasi shadcn/ui & Tooling Migrasi selesai (2026-09-01, ADR-097)** — task pertama rilis v0.7 (migrasi Astryx→shadcn/ui), 7/7 subtask tuntas: init shadcn/ui (base Radix + preset Maia), MCP server shadcn di `.mcp.json`+`.cursor/mcp.json`, `apps/web/.claude/CLAUDE.md` ditulis ulang ke workflow discover-first shadcn CLI/MCP, `AGENTS.md` rule 14/15 (sudah selesai lebih dulu di commit `07a3aa2`), pemetaan literal Stone theme (ADR-087) → CSS variable shadcn di `design-tokens.md` (referensi T-096.1, termasuk gap `--font-heading` belum Montserrat), subagent Mark UI Engineer diupdate ke shadcn (izin eksplisit King Rezi), sinkronisasi docs baseline. Detail: `tasks/v07-astryx-shadcn-migration.md` § T-095, `COMPLETE_TASK.md`.
---

## Recent Decisions (Ringkasan)

5 ADR terakhir. Daftar lengkap (indeks + link ke tiap ADR): lihat `DECISIONS.md`.

* **ADR-097** — Migrasi UI Component System dari Astryx ke shadcn/ui (Reverse ADR-041): shadcn/ui menggantikan Astryx sebagai fondasi komponen permanen, dipicu audit 49 file/~44 komponen Astryx dan keterbatasan Beta berulang (KI-005/030/035/040). Migrasi **incremental per route-segment** (Astryx & shadcn coexist sementara), MCP shadcn dipasang, wrapper `Drawer.tsx` diganti `Sheet`. Mengamendemen ADR-055/057/082. Detail task: `tasks/v07-astryx-shadcn-migration.md` (T-095–T-102).
* **ADR-096** — RLS untuk Operasi Pra-Membership — Pola SECURITY DEFINER + Session-Variable GUC (Accept Invite): GUC transaksi `app.invite_lookup_token` (default-deny), dual SELECT policy (token-lookup pra-auth + by-email paska-auth), role-locked INSERT `workspace_members` via `SECURITY DEFINER` function `has_accepted_invitation` — ditetapkan sebagai preseden untuk kasus RLS pra-membership serupa di masa depan.
* **ADR-095** — Baseline Rendering Strategy, Code Conventions, dan Spacing Scale — Server Actions Khusus Mutation (Konkretisasi ADR-016): 2 dokumen baseline baru (`rendering-strategy.md`, `code-conventions.md`), skala Spacing di `design-tokens.md` dikunci (base 1 unit = 4px, 0/0.5/1/1.5/2/3/4/5/6/8 = 0–32px), menegaskan ulang Server Actions eksklusif mutation; 3 rule ESLint enforcement ditambahkan. Dashboard (`app/(app)/page.tsx`) dicatat exception pra-existing yang sengaja tidak diperbaiki (KI-036).
* **ADR-089** — Amandemen ADR-088 — Dialog Konfirmasi Tier 2 Sebelum Switch Workspace: klik row workspace tidak lagi langsung overwrite cookie + redirect, sekarang membuka `AlertDialog` Tier 2 (reuse pola Logout/Remove Member) sebelum switch dieksekusi; dicatat sebagai T-089.6 (bukan T-016.6 — koreksi penomoran).
* **ADR-088** — Amandemen ADR-076 (poin 4) — Deliberate Workspace Switcher via Settings → Account → Workspaces: halaman baru untuk switch antar membership + create workspace tambahan (scope MVP narrow, bukan multi-workspace management penuh); mekanisme switch overwrite cookie `active-workspace-id` langsung setelah validasi membership, bukan hapus-cookie-lalu-onboarding-ulang — **Amended by ADR-089 (2026-08-24)**.

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
