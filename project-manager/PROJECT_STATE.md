# PROJECT STATE

## Snapshot

* **Phase / Milestone:** Phase 6 — Implementation · M8 — Development (Sprint 5) · Overall: M7 100%, M8 in progress
* **Active Mode:** Ready for Development — implementasi fitur produk sesuai Architecture & Engineering Baseline
* **Top Next Tasks:** T-025 Real OutstandAdapter — salinan ID dari **Fokus sekarang** di [`TASKS.md`](TASKS.md), yang merupakan satu-satunya daftar fokus (T-029 Publish Now sudah ✅ Done, 2026-08-18)
* **Blocker:** 2 blocker aktif (env var Outstand belum diisi + kode Real OutstandAdapter belum ditulis; env var Google OAuth belum diisi) — lihat section **Blockers** di bawah. Railway staging sudah live & terverifikasi (2026-08-14) sehingga blocker itu resolved; JOB_SECRET juga sudah diisi di Railway staging. Tidak memblokir M8 awal, tapi memblokir T-025→T-026→T-027.
* **Backlog task lengkap:** [`TASKS.md`](TASKS.md) — 71 task per release (v0.1 → v1.0), detail di `tasks/`. Jangan cari detail task di file ini.
* Detail phase/mode/issue ada di section di bawah. Riwayat completed/ADR lengkap: lihat `COMPLETE_TASK.md` (⚠️ jangan dibaca AI kecuali diperintah)/`DECISIONS.md`.

---

## Metadata

| Field        | Value      |
| ------------ | ---------- |
| Version      | 1.0.51     |
| Status       | Active     |
| Last Updated | 2026-08-14 |

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

Daftar lengkap 71 task (v0.1 → v1.0) beserta subtask, dependency, rantai
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
| Terkait | — |

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
| Status | Sebagian Resolved — sisa scope: T-039.4 (onboarding picker workspace) |
| Kategori | Tech-Debt |
| Terkait | T-009, T-039, ADR-076, ADR-077 |

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

### KI-029 · `@stylexjs/babel-plugin` belum di-wire — prop `xstyle` Astryx tidak bisa dipakai

| Field | Value |
|-------|-------|
| Status | Open — investigated 2026-08-18 (3 putaran), masih blocked oleh bug upstream package (bukan config gap) |
| Kategori | Tech-Debt |
| Terkait | T-029, ADR-041 |

Ditemukan 2026-08-18 saat mengerjakan T-029 (Publish Now) — reposisi ikon kalender/jam di `DateInput`/`TimeInput` Draft Editor awalnya dicoba lewat `xstyle`+`stylex.create()` (mekanisme kustomisasi resmi Astryx, dikonfirmasi via `astryx docs styling`), tapi gagal di runtime: `"Unexpected 'stylex.create' call ... must be compiled by '@stylexjs/babel-plugin'"`. Dependency `@stylexjs/stylex` ada di `package.json` `apps/web`, tapi babel-plugin/Next.js-plugin-nya **tidak pernah di-wire** di `next.config.ts`, dan tidak ada satupun file lain di `apps/web/src` yang memakai `stylex.create()` — jadi prop `xstyle` yang didokumentasikan resmi oleh Astryx **belum benar-benar bisa dipakai** di project ini. Workaround sementara: pakai `className` Tailwind layout-only (sudah disahkan rule 14 AGENTS.md) untuk kasus yang bisa diselesaikan lewat class utility biasa (contoh: `flex-row-reverse` di `apps/web/src/app/(app)/components/draft-editor/Modal.tsx`). Tidak memblokir M8, tapi membatasi kustomisasi Astryx yang butuh `xstyle` sampai plugin build-nya dipasang.

**Investigasi 2026-08-18 (belum bisa ditutup — gap lebih dalam dari dugaan awal):** dicoba wire `@stylexjs/nextjs-plugin` (versi npm terbaru 0.11.1, rilis Maret 2025, jauh tertinggal dari `@stylexjs/stylex@0.19.0` yang ter-pin di project) ke `next.config.ts` via `withStylex({rootDir})(nextConfig)`, dibuktikan dengan halaman test sekali-pakai (`stylex.create()` + `xstyle` di `Card` Astryx). Dua temuan:
1. **Next.js 16.2.10 di project ini memakai Turbopack secara default** untuk `next dev` **maupun** `next build` (bukan cuma dev). `@stylexjs/nextjs-plugin` hanya mengait ke fungsi `webpack()` di `next.config.ts` — fungsi ini **tidak pernah dipanggil** oleh Turbopack, jadi plugin tidak berefek sama sekali di jalur default; error stylex asli tetap muncul persis seperti sebelumnya.
2. Dipaksa pakai `next build --webpack` (opt-out dari Turbopack) untuk uji lebih jauh — plugin tetap gagal, tapi dengan error berbeda: `TypeError: stylexPlugin.transformCode is not a function` di `custom-webpack-loader.js`. Ini bug kompatibilitas `@stylexjs/nextjs-plugin@0.11.1` sendiri dengan webpack5/Next 16 (opsi loader di-serialize lewat query string sehingga instance class kehilangan method-nya) — bukan salah konfigurasi kita. Build `--webpack` juga memunculkan error tak-terkait (`UnhandledSchemeError` untuk `node:crypto` di `workspace.service.ts` via `next/font`), menandakan basis webpack project ini sendiri belum tentu siap dipakai kalau suatu saat harus opt-out Turbopack.

**Kesimpulan (putaran 1):** paket integrasi resmi StyleX↔Next.js sudah stale dan tidak kompatibel dengan kombinasi Next 16 + Turbopack-by-default yang dipakai project ini. Menyelesaikan KI-029 sepenuhnya butuh salah satu keputusan arsitektur (di luar wewenang implementer, perlu ADR + keputusan King Rezi): (a) tulis custom Turbopack loader sendiri (`next.config.ts` → `turbopack.rules`) untuk stylex — belum ada solusi komunitas yang solid untuk CSS-collection cross-module seperti yang dilakukan webpack plugin; (b) paksa seluruh app build lewat `--webpack` (kehilangan Turbopack, dan masih perlu perbaiki bug `transformCode`/`node:crypto` di atas — belum tentu worth it); atau (c) tetap pertahankan gap ini dan lanjutkan workaround `className` Tailwind untuk semua kebutuhan styling kustom Astryx sampai ekosistem StyleX+Turbopack matang. Semua perubahan percobaan (`next.config.ts`, `package.json`, halaman test) sudah di-revert bersih — tidak ada perubahan permanen di codebase dari investigasi ini. `tsc --noEmit` dan `bun run build` (jalur default Turbopack) tetap bersih di kondisi revert.

**Investigasi putaran 2 (2026-08-18, setelah upgrade Astryx 0.1.8 → 0.4.3):** `astryx docs styling` versi 0.4.3 sekarang secara eksplisit merekomendasikan paket berbeda — **`@stylexswc/nextjs-plugin`** (compiler StyleX berbasis SWC/Rust NAPI-RS, bukan Babel/webpack, dengan dukungan resmi untuk Turbopack lewat sub-export `/turbopack`) — dan bilang tegas: *"Do NOT add @stylexjs/babel-plugin to a Next.js App Router app; it disables SWC and breaks next/font."* Ini menunjukkan lead putaran 1 (paket `@stylexjs/nextjs-plugin` lama) memang sudah digantikan Astryx sendiri sebagai rekomendasi resmi. Dicoba wire ulang dengan paket baru ini (`@stylexswc/nextjs-plugin@0.18.3` + `@stylexswc/postcss-plugin@0.18.3`, exact version, dipin konsisten pola project), dibuktikan lagi dengan halaman test sekali-pakai (`stylex.create()` + `xstyle` di `Card` Astryx). Dua temuan baru:
1. **Bug resolusi modul ditemukan & berhasil diperbaiki sendiri**: wiring awal (persis contoh README paket) gagal dengan `Cannot find module '@stylexswc/turbopack-plugin/loader'` di semua route (termasuk `proxy.ts`/middleware) — root cause: `@stylexswc/turbopack-plugin` cuma dependency transitif dari `nextjs-plugin` (di-symlink lewat isolated store bun, bukan langsung ke `apps/web/node_modules`), sementara Turbopack me-resolve bare specifier loader itu relatif ke `apps/web` (karena `turbopack.root` di-set ke root monorepo). Fix: tambahkan `@stylexswc/turbopack-plugin@0.18.3` sebagai devDependency eksplisit di `apps/web/package.json` supaya ke-symlink langsung — setelah ini, compile error hilang total, `tsc --noEmit` dan `bun run build` (Turbopack default) tetap bersih.
2. **Gap baru, lebih dalam — CSS extraction Turbopack cuma sebagian jalan (bukan cuma config gap, bug plugin)**: setelah compile error hilang, halaman test menunjukkan classname StyleX (`x1lr1uin`, dst.) sudah muncul di HTML/computed `className`, tapi **hanya properti dengan nilai keyword string literal yang benar-benar ter-extract ke CSS** (`borderStyle: 'dashed'` dan `marginInline: 'auto'` berhasil, terverifikasi computed style browser). **Properti dengan nilai numerik (auto-unit px, mis. `maxWidth: 420`, `marginBlock: 48`, `borderWidth: 4`) dan nilai fungsi warna (`backgroundColor: 'rgb(255,0,128)'`, `borderColor: 'rgb(0,0,0)'`) hilang total dari CSS yang dihasilkan** — classname-nya ada di markup, tapi rule CSS-nya tidak pernah muncul di file manapun, dikonfirmasi lewat clean rebuild penuh (`rm -rf .next`, restart dev server, ulangi dari nol) dua kali dengan hasil identik — bukan artifact cache. Dampak visual: card test tetap tanpa background/border sama sekali secara visual (screenshot browser), meski tidak ada error build/runtime apapun — persis simptom yang diperingatkan `astryx docs styling`: *"renders completely unstyled: no error, no warning."*

**Kesimpulan putaran 2:** paket resmi baru (`@stylexswc/nextjs-plugin` + `@stylexswc/postcss-plugin` v0.18.3) memperbaiki masalah putaran 1 (bug plugin lama + Turbopack tidak terpanggil sama sekali) tapi punya bug ekstraksi CSS sendiri yang lebih halus di jalur Turbopack: hanya nilai string keyword yang ter-extract, nilai numerik dan `rgb()` tidak. Ini bukan salah konfigurasi kita (sudah dicoba persis sesuai README resmi paket, termasuk `postcss.config.mjs` untuk ekstraksi CSS di jalur Turbopack) — kemungkinan bug di rs-compiler versi 0.18.3 sendiri saat menangani transformasi nilai (number→px, color function) khusus di code path ekstraksi PostCSS/Turbopack (bukan di code path compile classname, yang jalan normal). **Belum dicoba** (di luar scope investigasi ini, butuh keputusan/waktu tambahan): downgrade/upgrade versi `@stylexswc/*` lain, laporkan issue upstream ke `Dwlad90/stylex-swc-plugin`, atau uji ulang di jalur `--webpack` dengan paket baru ini (bug `node:crypto`/`transformCode` putaran 1 spesifik ke paket lama, belum tentu berulang di paket baru — tapi opt-out Turbopack tetap trade-off arsitektur, perlu keputusan King Rezi). Semua perubahan percobaan putaran 2 (`next.config.ts`, `postcss.config.mjs`, `apps/web/package.json`+`bun.lock` untuk 3 paket `@stylexswc/*`, `src/proxy.ts` bypass sementara, halaman test) **sudah di-revert bersih** — tidak ada perubahan permanen dari investigasi ini. `tsc --noEmit` dan `bun run build` (jalur default Turbopack) tetap bersih di kondisi revert.

**Investigasi putaran 3 (2026-08-18, pre-release upstream) — bug identik, belum fixed:** ditemukan pre-release **`@stylexswc/nextjs-plugin@0.18.4-rc.2`** (dist-tag `next`, dipublish sehari sebelum sesi ini) dengan release note eksplisit "Fix number rendering, rounding, and unsupported value handling" (PR #1258 upstream `Dwlad90/stylex-swc-plugin`) — kemungkinan besar menyasar persis bug putaran 2. Dicoba, atas persetujuan eksplisit King Rezi untuk ambil risiko pre-release: `@stylexswc/nextjs-plugin@0.18.4-rc.2` + `@stylexswc/postcss-plugin@0.18.4-rc.2` + `@stylexswc/turbopack-plugin@0.18.4-rc.2` (ketiganya published exact di versi ini, dipin exact — pola devDependency eksplisit putaran 2 untuk `turbopack-plugin` diterapkan ulang dari awal supaya tidak kena bug resolusi modul yang sama). Wiring `next.config.ts` (`withStylexTurbopack` dari sub-export `/turbopack`) + `postcss.config.mjs` (`@stylexswc/postcss-plugin`) sama seperti putaran 2, disesuaikan ke README versi ini (API identik, tidak ada breaking change). Compile bersih (`tsc --noEmit` OK, tidak ada error module resolution). Dibuktikan lagi dengan halaman test sekali-pakai + halaman baseline pembanding (Card tanpa `xstyle`) untuk mengisolasi persis classname mana yang berasal dari override kita (diff classList: 7 classname baru muncul saat pakai `xstyle`, sesuai 7 properti yang diuji) — clean rebuild (`rm -rf .next`, restart dev) sebelum uji.

Hasil (dikonfirmasi lewat `getComputedStyle` di browser DAN grep langsung ke isi CSS chunk yang dikirim server untuk classname override yang teridentifikasi via diff):
- `borderStyle: 'dashed'` → classname `xbsl7fq` → **ter-extract** (`border-style: dashed` ada di CSS, computed style browser konsisten).
- `marginInline: 'auto'` → classname `xvueqy4` → **ter-extract** (`margin-inline: auto` ada di CSS).
- `maxWidth: 420` → classname `x1lr1uin` → **TIDAK ADA** rule apapun untuk classname ini di CSS manapun; computed `maxWidth` tetap `none`.
- `marginBlock: 48` → classname `x12moyr9` → **TIDAK ADA** di CSS; computed `marginTop/marginBottom` tetap `0px`.
- `borderWidth: 4` → classname `x1a87jhh` → **TIDAK ADA** di CSS; computed `borderTopWidth` tetap `0px`.
- `backgroundColor: 'rgb(255,0,128)'` → classname `x15jfrbd` → **TIDAK ADA** di CSS; computed `backgroundColor` tetap transparan.
- `borderColor: 'rgb(0,0,0)'` → classname `x12oo6to` → **TIDAK ADA** di CSS; computed `borderTopColor` tetap warna default token.

**Kesimpulan putaran 3: bug IDENTIK dengan putaran 2, tidak fixed oleh `0.18.4-rc.2`.** Fix upstream PR #1258 ("number rendering, rounding, unsupported value handling") ternyata tidak menyasar (atau tidak cukup untuk) code path ekstraksi CSS PostCSS+Turbopack khusus untuk nilai numerik auto-unit dan fungsi warna — persis simptom putaran 2, dikonfirmasi definitif lewat perbandingan classList baseline-vs-xstyle (bukan asumsi/dugaan) dan grep langsung isi CSS terkirim (bukan hanya "tidak error"). KI-029 **tetap Open**, belum bisa ditutup. Opsi yang tersisa untuk putaran berikutnya (semua butuh keputusan/waktu tambahan, tidak diambil sendiri): (a) laporkan issue upstream ke `Dwlad90/stylex-swc-plugin` dengan reproduksi minimal (classname+properti di atas) dan tunggu fix lebih lanjut; (b) uji jalur `--webpack` (opt-out Turbopack) dengan paket `@stylexswc/*` — belum pernah dicoba di 3 putaran manapun, tapi tetap trade-off arsitektur besar (kehilangan Turbopack utk seluruh app, perlu ADR + keputusan King Rezi); (c) pantau rilis stable `0.18.4` (saat ini masih `rc.2`, dist-tag `next`) untuk cek apakah ada perbaikan tambahan sebelum rc final; (d) tetap pertahankan gap dan lanjutkan workaround `className` Tailwind untuk kebutuhan styling kustom Astryx yang bisa diselesaikan tanpa `xstyle` (tidak menyelesaikan kasus yang butuh nilai numerik/warna kustom). Semua perubahan percobaan putaran 3 (`next.config.ts`, `postcss.config.mjs`, `apps/web/package.json`+`bun.lock` untuk 3 paket `@stylexswc/*` versi `0.18.4-rc.2`, 2 halaman test) **sudah di-revert bersih** — tidak ada perubahan permanen dari investigasi ini, konsisten dengan pola putaran 1 & 2. `tsc --noEmit` tetap bersih di kondisi revert (jalur default Turbopack; `bun run build` production tidak dijalankan ulang di putaran ini karena bug penentu sudah terkonfirmasi gagal sebelum tahap itu, sama seperti putaran 2 yang juga berhenti di titik yang sama).

**Keputusan penutup sesi 2026-08-19:** setelah 3 putaran investigasi (di atas) berakhir negatif — bug ekstraksi CSS numerik/warna konsisten reproduksi di 2 versi paket berbeda (`0.18.3` stable dan `0.18.4-rc.2` pre-release) — King Rezi memutuskan **menghentikan investigasi teknis lebih lanjut untuk saat ini** dan **menempuh jalan lain** (belum ada detail spesifik jalur alternatif yang dimaksud; direkomendasikan klarifikasi lebih lanjut ke King Rezi, lihat laporan akhir sesi). Ini **bukan** keputusan Resolved — status KI-029 tetap `Open`, workaround `className` Tailwind (rule 14 AGENTS.md) tetap berlaku untuk kasus yang bisa diselesaikan tanpa `xstyle`. Bukti lengkap seluruh 3 putaran investigasi (kutipan resmi `astryx docs styling`, output `astryx component TimeInput/DateInput --dense`, changelog Astryx, GitHub Releases upstream `stylex-swc-plugin`, tabel pengukuran computed style/CSS) didokumentasikan mandiri di `project-manager/reports/KI-029-astryx-styling-gaps.html` — rujuk file ini untuk detail teknis lengkap sebelum memulai investigasi baru, supaya tidak mengulang 3 putaran yang sudah terbukti gagal.

### KI-030 · `TimeInput` Astryx tidak membatasi input real-time (bisa ketik >4 digit/huruf bebas)

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt |
| Terkait | T-029, ADR-041 |

Ditemukan 2026-08-18 saat King Rezi menguji Schedule Picker Draft Editor secara langsung: field `TimeInput` menerima ketikan bebas tanpa batas — dikonfirmasi lewat inspeksi DOM, elemen `<input>` internalnya `type="text"` tanpa `maxLength`/`pattern` sama sekali (bukan salah konfigurasi kita). Astryx TimeInput didesain sebagai field yang di-parse saat blur (bukan masking real-time per-keystroke seperti native `<input type="time">`), dan **tidak ada prop resmi** (`maxLength`, `pattern`, `onKeyDown`, dll) untuk membatasi ini. Opsi mitigasi yang dipertimbangkan:

- **Wrapper `onKeyDownCapture`/`onPaste`** untuk intercept keystroke dari luar (level "wrapper selektif", bukan swizzle) — secara arsitektur boleh, tapi tidak solid (tidak menangkap paste/drag-drop/IME sepenuhnya tanpa handler tambahan) dan berisiko konflik dengan state internal `TimeInput` yang tidak kita kontrol. Sempat diimplementasikan (varian: `status` error saat blur untuk feedback, bukan mencegah ketik) tapi **dihapus atas keputusan King Rezi** (2026-08-18) — dianggap belum sesuai harapan, bukan solusi final.
- Menunggu Astryx menambah prop resmi untuk ini (masih Beta, KI-005) — solusi paling bersih, tidak instan.

Tidak memblokir M8. Icon kalender/jam Draft Editor sempat diperbaiki terpisah (posisi kanan, sesuai mockup) tapi **direvert** 2026-08-18 karena masalah a11y — lihat **KI-031**. Sisa gap di KI ini murni soal pembatasan input real-time, belum ada solusi yang disetujui.

**Catatan penutup sesi 2026-08-19:** King Rezi memutuskan menghentikan investigasi lebih lanjut untuk saat ini (bersamaan dengan keputusan yang sama untuk KI-029 — lihat catatan penutup di sana) dan menempuh jalan lain (detail belum ada, direkomendasikan klarifikasi ke King Rezi). Status tetap `Open`, bukan Resolved.

### KI-031 · Ikon kalender/jam Date/TimeInput tidak bisa dipindah ke kanan tanpa merusak keyboard tab order

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt |
| Terkait | T-029, ADR-041 |

Ditemukan 2026-08-18 lewat code review PR #80: perbaikan sebelumnya yang memindah ikon kalender/jam `DateInput`/`TimeInput` dari kiri ke kanan (`className="flex-row-reverse"`, Tailwind, supaya sesuai mockup Claude Design `templates/draft-editor.html`) ternyata hanya membalik urutan **visual**, bukan urutan DOM — ikon (button/span) tetap child pertama secara DOM (dikonfirmasi lewat source `DateInput`/`TimeInput` Astryx: tidak ada `tabIndex` atau CSS `order`), sehingga keyboard Tab dan screen reader tetap mengunjungi ikon LEBIH DULU walau secara visual sekarang tampil di kanan — mismatch WCAG 2.4.3 (Focus Order). CSS `order` juga tidak menyelesaikan ini (MDN: `order` cuma mengubah urutan visual, bukan urutan navigasi sekuensial/tab).

Fix yang diterapkan (2026-08-18): `flex-row-reverse` **dihapus**, ikon dikembalikan ke posisi default Astryx (kiri) — mengutamakan a11y di atas kecocokan visual pixel-perfect dengan mockup. Konsekuensinya: Draft Editor **tidak lagi identik** dengan mockup Claude Design di titik ini (ikon kiri vs kanan).

Opsi yang belum diambil (butuh keputusan King Rezi kalau posisi kanan tetap diinginkan):
- Restrukturisasi DOM manual di sisi kita (bukan CSS) supaya urutan render benar-benar ikon-setelah-input — tapi ini butuh akses ke internal Astryx yang tidak diekspos lewat props resmi, masuk kategori swizzle (perlu amandemen ADR-041 kalau mau diambil).
- Menunggu Astryx menambah opsi resmi posisi ikon (trailing icon) di versi mendatang (masih Beta, KI-005).

Tidak memblokir M8. Trade-off ini murni keputusan a11y vs kecocokan visual, dicatat di sini supaya tidak diasumsikan "belum selesai" di masa depan.

**Catatan penutup sesi 2026-08-19:** salah satu opsi solusi (restrukturisasi DOM manual / swizzle) terhalang status `Open` KI-029 (`xstyle` belum bisa dipakai andal) — King Rezi memutuskan menghentikan investigasi lebih lanjut untuk saat ini pada KI-029 dan menempuh jalan lain (lihat catatan penutup KI-029). Opsi lain KI-031 (menunggu Astryx menambah trailing-icon resmi) tidak terhalang oleh keputusan ini, berdiri sendiri. Status KI-031 tetap `Open`.

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

* **Upgrade Astryx 0.1.8 → 0.4.3 (2026-08-19)** — `apps/web/package.json` (`@astryxdesign/core`, `@astryxdesign/cli`, `@astryxdesign/theme-neutral`) dinaikkan ke 0.4.3; `astryx upgrade --apply` melaporkan "No changes needed" untuk 156 komponen (tidak ada breaking change yang menyentuh kode existing). `apps/web/.claude/CLAUDE.md` regenerated otomatis via `bunx astryx init --features agents --agent claude`. Diverifikasi `tsc --noEmit`, `bun run build`, dan smoke-test browser semua lolos. Selesai bersih, tidak ada gap terbuka dari upgrade ini sendiri (gap terpisah lihat KI-029). Detail: `COMPLETE_TASK.md`.
* **T-029 Publish Now selesai (2026-08-18)** — `PublishNowUseCase` (RBAC Owner/Admin/Creator ADR-074, validasi `ContentFormat` ADR-039, jalur via `FakeOutstandAdapter` pola ADR-059 — T-025 real adapter masih blocked KI-003) + Server Action `publishNowAction` + tombol "Publish Now" & dialog Confirmation Summary di Draft Editor, redirect ke Publish/Calendar (menutup T-031.4 sekaligus). Bagian commit yang sama: perbaikan UI Schedule Picker Draft Editor (heading "Jadwal" tunggal, ikon kalender/jam pindah ke kanan, dot indicator Badge status) + 2 Known Issue baru **KI-029** (xstyle Astryx belum bisa dipakai) dan **KI-030** (TimeInput Astryx tidak membatasi input real-time). Diverifikasi `tsc --noEmit` bersih, Vitest suite terkait lulus, end-to-end browser. Detail: `tasks/v02-publishing-mvp.md` § T-029, `COMPLETE_TASK.md`.
* **Bug fix — redirect `localhost:8080` di proxy/onboarding (2026-08-14)** — Ditemukan saat test login manual di staging: sesekali browser di-redirect ke `http://localhost:8080` (bind internal container Railway) alih-alih domain publik. Root cause: `proxy.ts` (5 titik) dan `app/onboarding/resume/route.ts` (2 titik) membangun redirect pakai `new URL(path, request.url)` — `request.url` tidak bisa dipercaya di balik reverse proxy Railway saat race container baru start. Fix: origin redirect sekarang selalu dari `getServerEnv().BETTER_AUTH_URL` (pola sama dengan invite link di `settings/members/actions.ts`). Diverifikasi: `tsc --noEmit` bersih, login lokal (akun test Raka Pratama) tetap normal tanpa regresi. Bukan task bernomor — perbaikan ad-hoc, tidak ada ADR baru (bug fix, bukan perubahan baseline arsitektur).
* **KI-025 resolved — Railway staging live (2026-08-14)** — Project Railway `social-media-management` (workspace Insvire, region Singapore) dibuat, environment `staging` deploy sukses: service `web` (Next.js, domain `web-staging-60d7.up.railway.app`, health check `/api/health` 200 OK) dan service `cron` (`* * * * *` trigger `POST /api/jobs/run`, 2x run SUCCESS berturut-turut). Env var staging lengkap (DATABASE_URL, DIRECT_URL, Supabase, Better Auth, `JOB_SECRET` generated asli); `GOOGLE_CLIENT_ID/SECRET`, `OUTSTAND_API_KEY/WEBHOOK_SECRET` masih placeholder dummy (KI-015 sebagian resolved, KI-003 tetap open). Database staging memakai project Supabase Cloud existing "Sosial Media Management" (ref `ndcrkzqgqukqfmekgoze`) — bukan project baru terpisah; production Railway environment & production Supabase project belum dibuat (gap baru, KI-028). Branch `staging` dibuat & di-push; branch protection GitHub diaktifkan untuk `main`+`staging` (wajib PR + status check CI hijau). Detail: `COMPLETE_TASK.md`.
* **T-007.1/.5/.6 selesai (2026-08-14)** — Members management: **pembuatan** invitation jalur Copy Link (`WorkspaceService.inviteMember`, ADR-080 — bukan alur invite-to-membership yang utuh, halaman accept-invite `/invite/[token]` belum dibuat), dialog konfirmasi Remove Member + Update Member Role (ADR-049 Tier 2), dan UI dialog invite 2 metode (Copy Link aktif, Kirim via Email disabled — email-bound wajib). Lolos review Ridwan (bersih, tanpa temuan) dan QA Najwa (126 test passed + 3 skip pre-existing; gating UI & radio group terverifikasi browser — submit generate-link gagal karena `JOB_SECRET` belum diisi, belum pernah dibuktikan sukses visual, dikoreksi setelah review CodeRabbit PR #73). Heading duplikat "Members" yang sempat muncul saat implementasi sudah diperbaiki lewat slot `headerAction` di `MembersTable`. Remove/Update Role tidak bisa diuji end-to-end penuh karena dev DB baru punya 1 member (known gap, KI-015). T-007 tetap 🟡 In Progress — sisa T-007.7 (jalur Kirim via Email) blocked T-005, plus halaman accept-invite (task terpisah, belum ada nomor). Detail: `tasks/v01-foundation.md` § T-007, `COMPLETE_TASK.md`.
---

## Recent Decisions (Ringkasan)

5 ADR terakhir. Daftar lengkap (indeks + link ke tiap ADR): lihat `DECISIONS.md`.

* **ADR-079** — Promosi `IOutstandAdapter` jadi cross-domain shared contract (`packages/shared`) + Fake metric ingestion untuk T-041 — amandemen ADR-059.
* **ADR-078** — Amandemen ADR-018: port lokal + composition root untuk cross-domain service call (`ScheduledCountsPort` / T-012.2).
* **ADR-077** — Settings pakai sidebar tunggal yang menggantikan main sidebar (pola Buffer) — amandemen mekanisme render ADR-076.
* **ADR-076** — Workspace context pindah ke cookie (hapus dynamic segment `[slug]`, route group `(app)`) + Settings dikonsolidasi jadi Organization + Account dengan entry point avatar tunggal — menggantikan Workspace Selector yang tidak pernah dibangun (KI-023).
* **ADR-075** — Amandemen ADR-071: sinkronisasi kutipan `migration.sql` bucket `avatars` (resolusi KI-018).
* **ADR-074** — Reduksi struktur role dari 4 jadi 3 (Account Owner, Admin, Creator) — resolusi KI-017.

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
