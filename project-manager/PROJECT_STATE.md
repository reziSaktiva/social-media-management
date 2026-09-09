# PROJECT STATE

## Snapshot

* **Phase / Milestone:** Phase 6 — Implementation · M8 — Development (Sprint 5) · Overall: M7 100%, M8 in progress
* **Active Mode:** Ready for Development — implementasi fitur produk sesuai Architecture & Engineering Baseline
* **Top Next Tasks:** **T-034 Publishing History + detail post** (rilis v0.2) sekarang **✅ Done** (2026-09-09) — seluruh 4/4 subtask tuntas: query riwayat, UI daftar riwayat + filter, halaman detail post, dan **T-034.4** (retry manual per-target, **ADR-103** melengkapi ADR-092 — scope single-target, bukan whole-post, untuk hindari duplikat konten). Lolos review Ridwan (0 temuan blocking) dan QA Najwa (259 test pass, verifikasi browser golden path + edge case semua PASS). 1 Known Issue baru non-blocking: **KI-052** (hydration warning `formatRelativeTime` di `HistoryList.tsx`). 2 Known Issue lama masih **Open**, belum berubah statusnya oleh penutupan T-034.4: **KI-049** (gap `failedAt`/`failureReason`), **KI-050** (gap meta author di halaman detail). **KI-051** (`Badge` shadcn belum ada varian success) sudah **Resolved** (2026-09-09, Mark UI Engineer) — sekaligus menutup penuh **KI-054** (Design Drift Drafts/History, poin 5 terakhir). Digabung (merge `staging`) dengan pekerjaan paralel: **T-039 Migrasi Routing & Settings (ADR-076) — ✅ Done** (2026-09-08) — subtask terakhir **T-039.4** (onboarding picker workspace) diimplementasikan, lolos review arsitektur Ridwan (0 temuan) + QA Najwa end-to-end browser (6/6 skenario PASS); **KI-023 Resolved**. Sebelumnya: **T-007.8 Members list gabungan Pending (ADR-101) — ✅ Done** (2026-09-07, side-quest di luar rantai utama) — lolos implementasi Prabowo Feature Engineer, review arsitektur Ridwan (1 temuan race condition di `revokeInvitation`, sudah diperbaiki), QA end-to-end Najwa (browser real, semua PASS, 0 bug). **T-026 Webhook handler Outstand — ✅ Done** (2026-09-07) dan **T-036 In-app notification + Supabase Realtime — ✅ Done** (2026-09-07) — King Rezi menjalankan `bun run db:deploy` untuk 3 migration T-026 yang sebelumnya belum ter-apply, Najwa QA Engineer retest 5 skenario webhook end-to-end nyata, semua PASS. **KI-048 Resolved**. ADR-099 (SECURITY DEFINER system-context lookup untuk webhook) dicatat sebagai preseden untuk T-027. Fokus berikutnya: **T-025 Real OutstandAdapter** (terhenti menunggu kredensial), **T-027 Job runner + Railway Cron**, dan **T-037** (Perkaya aturan coding, kontinu by design, `🟡 In Progress`) — salinan ID dari **Fokus sekarang** di [`TASKS.md`](TASKS.md), yang merupakan satu-satunya daftar fokus. Sebelumnya: **T-102 Cleanup & Verifikasi Akhir — ✅ Done** (rilis v0.7, ADR-097) menuntaskan migrasi Astryx→shadcn/ui 100%; **KI-045**, **KI-041** (ADR-098), **KI-035** sudah Resolved (2026-09-04); **KI-046** Resolved (Promoted to T-007.7, ADR-100, 2026-09-07); **KI-047**, **KI-053** (2026-09-07 — invite Copy Link rawan identity takeover kalau email penerima bukan target undangan & belum punya akun, akar masalah KI-001; direnumber dari KI-049 semula saat merge `staging` — nomor itu sudah dipakai lebih dulu oleh Known Issue lain, gap `failedAt`/`failureReason`, di cabang ini) dicatat sebagai gap baru/Open — **KI-053 tidak terkait/tidak berubah statusnya** oleh selesainya T-007.8, masih genuinely Open.
* **Blocker:** 2 blocker aktif (env var Outstand belum diisi + kode Real OutstandAdapter belum ditulis; env var Google OAuth belum diisi) — lihat section **Blockers** di bawah. Railway staging sudah live & terverifikasi (2026-08-14) sehingga blocker itu resolved; JOB_SECRET juga sudah diisi di Railway staging. Tidak memblokir M8 awal, tapi memblokir T-025→T-026→T-027.
* **Backlog task lengkap:** [`TASKS.md`](TASKS.md) — 85 task per release (v0.1 → v1.0, + v0.7 migrasi Astryx→shadcn/ui, ADR-097), detail di `tasks/`. Jangan cari detail task di file ini.
* Detail phase/mode/issue ada di section di bawah. Riwayat completed/ADR lengkap: lihat `COMPLETE_TASK.md` (⚠️ jangan dibaca AI kecuali diperintah)/`DECISIONS.md`.

---

## Metadata

| Field        | Value      |
| ------------ | ---------- |
| Version      | 1.0.78     |
| Status       | Active     |
| Last Updated | 2026-09-09 |

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
  T-095/T-096/T-097/T-098/T-099/T-100/T-101/**T-102** sudah `✅ Done` — rilis
  **v0.7 tuntas 100%** (8/8 task, 2026-09-04).
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

### KI-043 · `clearUnsavedNewPost()` tidak dipanggil di jalur Schedule/Publish Now

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Bug |
| Terkait | T-100 |

Ditemukan QA Najwa QA Engineer saat verifikasi T-100.2 (2026-09-03,
`apps/web/src/app/(app)/components/draft-editor/Modal.tsx`) — bukan
regresi T-100.2, sudah ada sejak versi lama file (diverifikasi via
`git log -p`), dan bukan blocker penutupan T-100.2.

`clearUnsavedNewPost()` hanya dipanggil di `handleSaveDraft`, tidak
dipanggil di `handleConfirmSchedule`/`handleConfirmPublishNow`. Akibatnya
localStorage "unsaved draft" tidak terhapus setelah Schedule/Publish Now
sukses (kalau user sempat trigger `persistUnsavedNewPost` sebelumnya) —
`ResumeDialog` bisa muncul lagi dengan caption basi di sesi New Post
berikutnya. Perlu ditindaklanjuti terpisah, di luar scope T-100 (dijadwal
kapan pun oleh King Rezi, tidak memblokir T-100.3/T-100.4).

### KI-044 · Tidak ada validasi mencegah Schedule ke waktu yang sudah lewat pada tanggal hari ini

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Bug |
| Terkait | T-100 |

Ditemukan QA Najwa QA Engineer saat verifikasi T-100.3 (2026-09-03,
`apps/web/src/app/(app)/components/draft-editor/Modal.tsx`) — bukan
regresi T-100.3, sudah ada sejak sebelum migrasi (Astryx `TimeInput` lama
juga tidak punya validasi ini), dan bukan blocker penutupan T-100.3.

Tidak ada validasi yang mencegah user men-Schedule post ke waktu yang
sudah lewat pada tanggal hari ini (mis. jadwalkan jam 08:00 padahal
sekarang sudah jam 11:48) — post berhasil masuk Queue tanpa
penolakan/warning apa pun. Perlu ditindaklanjuti terpisah, di luar scope
T-100 (dijadwal kapan pun oleh King Rezi, tidak memblokir T-100.4).

### KI-046 · `MemberStatus.Pending` tidak pernah di-assign di flow produksi manapun

| Field | Value |
|-------|-------|
| Status | Promoted to T-007.7 (2026-09-07, ADR-100) |
| Kategori | Tech-Debt / Gap |
| Terkait | T-007.7, ADR-080, ADR-100 |

Ditemukan Najwa QA Engineer saat QA badge "Pending" `MembersTable.tsx`
(bagian penutupan KI-041, ADR-098, 2026-09-04): `MemberStatus.Pending` (di
Prisma schema / `@social/shared`) ternyata tidak pernah di-assign di kode
produksi manapun — flow invite saat ini (accept invitation) selalu langsung
membuat member berstatus **Active**. Akibatnya badge "Pending" adalah dead
code secara fungsional — tidak bisa dicapai lewat alur user manapun saat
ini, hanya dipakai di unit test.

**Resolved (2026-09-07, ADR-100):** King Rezi memutuskan status ini bukan
dead code — direservasi untuk metode invite **"Kirim via Email"** (T-007.7,
masih blocked T-005). Desain alurnya sudah dikunci di ADR-100: baris
`workspace_members` dibuat langsung `Pending` saat invite dikirim via
email, lalu diupdate jadi `Active` saat user accept. Implementasi konkret
menunggu T-005 selesai — dipindah jadi bagian scope resmi **T-007.7**,
bukan lagi Known Issue berdiri sendiri.

### KI-053 · Invite via Copy Link — email tidak diverifikasi kepemilikan inbox, rawan identity takeover

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Security / Bug |
| Terkait | T-007.1, T-093, KI-001, ADR-080, ADR-096 |

Ditemukan King Rezi saat diskusi (2026-09-07): kalau invite lewat **Copy
Link** ditujukan ke email A tapi link-nya (sengaja atau tidak) terbuka oleh
email B, dan **email A belum pernah punya akun** (`isExistingUser: false`),
email B bisa langsung mengisi Nama + Password **pilihannya sendiri** di
form `/invite/[token]` ([AcceptInviteForm.tsx](../apps/web/src/app/(auth)/invite/[token]/components/AcceptInviteForm.tsx))
dan submit — form memang mengunci field email jadi read-only ke email A
(`AcceptInviteForm.tsx:127-128`), tapi ini cuma memastikan **string email**
yang dikirim ke `authClient.signUp.email()` sama dengan email A, **bukan**
membuktikan email B benar-benar memegang inbox email A.

Root cause: `requireEmailVerification: false` di Better Auth
([auth.ts:53](../apps/web/src/lib/better-auth/auth.ts:53), bagian dari
**KI-001** — provider email belum ditetapkan) — Better Auth tidak pernah
mengirim email konfirmasi untuk verifikasi kepemilikan inbox saat sign-up.
Guard `actorEmail === invitation.email` di
`WorkspaceService.acceptInvite` ([workspace.service.ts:615](../apps/web/src/domains/workspace/services/workspace.service.ts:615))
sudah benar secara logic (mencegah user lain yang sudah login pakai akun
berbeda ikut menerima invite ini), tapi tidak bisa mencegah skenario ini
karena sign-up baru sama sekali belum pernah diverifikasi oleh siapa pun.

**Dampak:** email B efektif membajak identitas "email A" — akun baru
dengan email A dan password buatan B berhasil dibuat, B langsung jadi
member workspace atas nama A. Kalau pemilik asli email A kemudian mencoba
daftar, Better Auth akan menolak ("email sudah terdaftar") — pemilik asli
terkunci keluar dari identitasnya sendiri.

**Catatan lingkup:** kalau email A **sudah punya akun** (`isExistingUser:
true`), skenario ini **aman** — email B harus tahu password akun A untuk
bisa sign-in, jadi tidak bisa dieksploitasi tanpa itu. Gap ini spesifik ke
kasus akun baru (belum pernah daftar).

Belum ada keputusan mitigasi (opsi yang mungkin: tunda Copy Link sampai
T-005/email verification selesai, atau tambahkan verifikasi email terpisah
khusus alur accept-invite). Tidak memblokir M8 saat ini, tapi risiko
keamanan nyata untuk Copy Link yang sudah dipakai di production.

### KI-048 · Draft Claude Design T-034 (Publish History) belum direview King Rezi — Resolved

| Field | Value |
|-------|-------|
| Status | Resolved (2026-09-08) |
| Kategori | Design Gap / Process |
| Terkait | T-034 |

Ditemukan/dicatat 2026-09-08 saat sesi kerja T-034 (Publishing History +
detail post): 2 screen baru — `templates/publish-history.html` (daftar
riwayat + filter Status/Akun) dan `templates/publish-history-detail.html`
(ringkasan post + "Hasil per Akun": link post asli untuk `Published`,
pesan error + tombol retry untuk `Error`) — sudah di-push ke project Claude
Design "Social Media Management". Draft awal ini belum direview/dikonfirmasi
King Rezi saat ditemukan.

**Deviasi proses (dicatat eksplisit, bukan pelanggaran diam-diam):**
pekerjaan Claude Design ini dikerjakan langsung oleh main agent (bukan
didelegasikan ke Neymar Product Designer) atas instruksi eksplisit King
Rezi di sesi ini — menyimpang dari mandat wajib Neymar di
`.claude/agents/neymar-product-designer.md`, tapi atas dasar instruksi
langsung King Rezi, bukan inisiatif AI melewati mandat tersebut.

**Penutupan (2026-09-08, sesi sama):** King Rezi mereview draft bareng di
chat (Artifact review dari kedua template memakai token desain asli) dan
mengonfirmasi 5 poin (App Prototype dipasang dulu, filter Status+Akun
cukup, grouping per tanggal pola Queue, tombol retry visual-only, link
"Lihat post asli" disabled kalau kosong). Gap App Prototype yang ditemukan
saat konfirmasi (tab History belum terdaftar di `SCREENS`/tab handler,
redirect Publish Now masih stand-in ke Calendar) langsung ditutup oleh
main agent — sudah di-push dan diverifikasi remote match persis. Draft
desain T-034.2/T-034.3 sekarang terkonfirmasi King Rezi dan App Prototype
bisa diklik penuh — **KI-048 Resolved**.

### KI-049 · `PublishingPost.failedAt`/`.failureReason` tidak pernah ditulis oleh jalur manapun

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt |
| Terkait | T-034, T-029 |

Ditemukan Ridwan Architecture Reviewer saat review T-034.1 (2026-09-08):
kolom `failedAt`/`failureReason` di model Prisma `PublishingPost` ada di
schema tapi tidak pernah ditulis oleh jalur manapun — `markPostFailed`
(dipakai `PublishNowUseCase`, lihat T-029) hanya meng-update kolom
`status`. Gap ini sudah didokumentasikan sebagai komentar kode di
`IPublishingRepository.listHistory` (`apps/web/src/domains/publishing/repositories/publishing.repository.ts`)
dan sengaja **tidak** dimasukkan ke `HistoryItemRecord` supaya tidak
menyesatkan UI History (T-034.2/T-034.3) dengan field yang selalu `null`
— pesan error final per akun tetap tersedia lewat
`HistoryItemTargetRecord.error` (diisi `updateTargetOutcome`, sumber data
yang benar-benar terisi). Non-blocking untuk T-034; direkomendasikan Ridwan
sebagai catatan follow-up eksplisit ke depan (belum ada task formal),
bukan urgent. Tidak memblokir M8.

### KI-050 · Meta "dibuat oleh siapa" dihilangkan dari halaman detail post History

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Design Gap / Gap |
| Terkait | T-034 |

Ditemukan saat implementasi T-034.3 (2026-09-08, halaman detail
`/publish/history/[postId]`): meta "dibuat oleh siapa" sengaja dihilangkan
dari desain awal Claude Design — `HistoryItemRecord` tidak membawa data
author/`authorId`, dan menambah field itu di luar scope T-034.2/T-034.3.
Perlu keputusan King Rezi ke depan apakah field ini memang wajib
ditampilkan (kalau ya, jadi task/gap terpisah, mirip pola KI-049 —
kemungkinan butuh field baru di schema/domain). Tidak memblokir M8.

### KI-051 · `Badge` shadcn belum punya varian "success" — Resolved

| Field | Value |
|-------|-------|
| Status | Resolved (2026-09-09) |
| Kategori | Tech-Debt / UI |
| Terkait | T-034, KI-041 (token `--success` sudah ada, komponen belum di-wire), KI-054 (poin 5) |

Ditemukan Ridwan Architecture Reviewer saat review T-034.2/T-034.3
(2026-09-08): komponen `Badge` shadcn belum punya varian "success" — UI
History memakai varian `default` sebagai pengganti untuk status
"Published". Token CSS `--success` sudah ada di `globals.css` sejak
ADR-098 (penutupan KI-041), tapi belum pernah di-wire ke komponen `Badge`
itu sendiri. Technical debt kecil, non-blocking, opsional — kalau mau
dijadikan task terpisah, Domain-nya `UI` (Mark UI Engineer). Tidak
memblokir M8.

**Penutupan (2026-09-09, Mark UI Engineer, branch
`fix/ki-054-draft-history-design-sync`):** varian `success` ditambahkan ke
`cva()` di `apps/web/src/components/ui/badge.tsx`, mengikuti pola tint yang
sama dengan `warning`/`destructive` yang sudah ada (`bg-success/10
text-success ... dark:bg-success/20 ...`), memakai token
`--success`/`--success-foreground` yang sudah ada sejak ADR-098. Varian
baru ini di-wire ke sumber kebenaran status: `status-badge.ts`
(`CONTENT_STATUS_BADGE_VARIANT[ContentStatus.Published]`, dipakai Calendar,
Drafts, dan modal draft-editor) dan `history-status.ts`
(`HISTORY_STATUS_BADGE_VARIANT`/`TARGET_STATUS_BADGE_VARIANT` untuk status
`Published`) — keduanya `"default"` → `"success"`. Komentar block usang di
kedua file yang menjelaskan "belum ada varian success" ikut diperbarui.
Diverifikasi `tsc --noEmit` pass, `eslint` pass, dan browser preview
(tidak ada regresi visual pada status lain, mis. Scheduled tetap
warning/kuning). Di luar scope, sengaja tidak diubah: status
`ReadyToSchedule`/`Scheduled` tetap `secondary`/`warning` — mockup minta
warna "info"/"purple" tersendiri, tapi itu butuh token warna baru yang
belum di-lock desain (dicatat DT-D02, bukan bagian KI-051). Penutupan ini
sekaligus menutup poin 5 **KI-054** (lihat di bawah).

### KI-052 · Hydration warning `formatRelativeTime` di `HistoryList.tsx`

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt / UI |
| Terkait | T-034 |

Ditemukan Najwa QA Engineer saat verifikasi browser T-034.4 (2026-09-09,
retry manual publishing): muncul hydration warning React terkait
`formatRelativeTime` di `apps/web/src/app/(app)/publish/history/components/HistoryList.tsx`
— kemungkinan mismatch hasil format waktu relatif antara render SSR dan
client (nilai waktu relatif bisa berbeda tipis tergantung kapan masing-masing
sisi dieksekusi). Non-blocking, di luar scope T-034.4 (fitur retry sendiri
berfungsi penuh, PASS semua skenario) — dicatat sebagai follow-up teknis,
belum ada task formal. Tidak memblokir M8.

### KI-054 · Layout `DraftsList`/`HistoryList` menyimpang dari mockup Claude Design — Resolved

| Field | Value |
|-------|-------|
| Status | Resolved (2026-09-09) — seluruh 5 poin sudah punya resolusi (fixed atau accepted deviation) |
| Kategori | Design Drift |
| Terkait | T-034, T-101 (Drafts), KI-051 (poin 5, Resolved), Claude Design `templates/publish-drafts.html` & `templates/publish-history.html` |

Dilaporkan King Rezi (2026-09-09): komponen yang sudah diimplementasikan di
halaman Publish → Drafts dan Publish → History dinilai berbeda cukup jauh
dari mockup Claude Design. Dibandingkan langsung (`DesignSync get_file`) —
gap paling signifikan ada di **History**, bukan Drafts:

1. **[FIXED 2026-09-09, branch `fix/ki-054-draft-history-design-sync`]
   Struktur baris History menyimpang dari mockup.** Mockup
   (`templates/publish-history.html`, `.history-card`/`.queue-row`) merender
   tiap entri sebagai **satu baris horizontal** dalam kartu terpisah sendiri
   (`<a class="card card-pad history-card">`): jam → nama akun (dot warna
   platform + teks) → caption+meta → chip status, semuanya sejajar dalam
   satu baris, dengan hover mengubah `border-color` kartu itu sendiri.
   Implementasi (`HistoryList.tsx` baris ~196-271) merender tiap entri
   sebagai blok **vertikal bertingkat** di dalam SATU `Card` bersama
   (`ItemGroup` + `divide-y`, pola yang sama dipakai `DraftsList`/`QueueList`):
   baris jam+badge, lalu baris ikon platform, lalu caption, lalu meta —
   4 baris bertumpuk, bukan 1 baris datar per mockup, dan tidak ada kartu
   terpisah per entri (hover cuma `hover:bg-muted` pada row, bukan border
   kartu individual).
   **Fixed:** `HistoryList.tsx` diubah — tiap entri sekarang `Item
   variant="outline"` terpisah (kartu individual, border+radius sendiri) di
   dalam `ItemGroup` dengan `gap-2` (bukan `divide-y`), satu baris horizontal
   jam → ikon+handle platform → caption+meta (truncate) → `Badge` status,
   hover mengubah border kartu (`hover:border-foreground/40` +
   `hover:bg-card!`) sesuai mockup. Diverifikasi `tsc --noEmit`, eslint, dan
   visual browser preview (dark mode). Temuan tambahan di file yang sama saat
   verifikasi (bukan bagian asli KI-054): teks handle akun sempat dipaksa
   `text-xs` (12px) padahal spec Design System (`.acc-name`, token
   `--text-body-size`) 14px (`text-sm`) — override dihapus, kembali ke
   default varian `muted` komponen `Text`.
2. **Representasi akun/platform berbeda — accepted deviation, tidak diubah
   (keputusan verbal King Rezi, 2026-09-09).** Mockup memakai dot warna kecil +
   nama akun sebagai teks polos (`.platform-dot` + `<span class="acc-name">`).
   Implementasi merender glyph ikon brand penuh (`PLATFORM_ICON[...].Icon`)
   + handle akun, untuk **setiap target** publish (bisa multi-platform per
   post) — perbedaan ini punya alasan produk (History mendukung multi-target
   per post, mockup cuma contoh 1 platform per baris), tapi visualnya jelas
   berbeda dari mockup manapun yang ada di Claude Design saat ini. King Rezi
   memutuskan tetap pakai ikon brand penuh untuk multi-platform — bukan
   deviation yang perlu diperbaiki, cukup dicatat di sini supaya tidak
   dianggap belum selesai di masa depan.
3. **Filter row** (`Select` Status + Akun) di `HistoryList.tsx` sudah cukup
   dekat dengan mockup (`.history-filter-row`, dua `<select>` rata kanan) —
   bagian ini TIDAK termasuk gap.
4. **Drafts** (`DraftsList.tsx` vs `templates/publish-drafts.html`) sebenarnya
   sudah cukup selaras strukturnya (Card + list baris + judul/subjudul kiri +
   chip status kanan) — gap di sini lebih ke warna chip status (lihat poin
   berikutnya), bukan layout.
5. **Warna chip status** (Draft/Ready to Schedule/Published/Error) di kedua
   halaman memakai palet abu-abu (`outline`/`secondary`/`default`/`destructive`
   shadcn `Badge`) padahal mockup memakai dot warna spesifik per status
   (`chip-draft` kuning, `chip-ready`/`chip-published` hijau, `chip-failed`
   merah) — ini **gap yang sama dengan KI-051** (`Badge` shadcn belum punya
   varian "success"/warna custom per status), jangan dobel-catat sebagai
   temuan baru, cukup link ke sana.

Belum ada task formal untuk memperbaiki gap ini. Poin 1 sudah **Fixed**
2026-09-09 (lihat detail di atas, branch `fix/ki-054-draft-history-design-sync`).
Poin 2 sudah **accepted deviation** (keputusan verbal King Rezi, tidak akan
diubah). Poin 3 & 4 sudah sesuai mockup dari awal, tidak ada perubahan.
Poin 5 (warna chip status) sekarang **Fixed** menyusul penutupan **KI-051**
(2026-09-09, sesi sama): varian `Badge` "success" sudah di-wire, status
"Published" di Drafts & History sekarang hijau sesuai mockup. Status
`Draft` sendiri tetap memakai varian `outline` (abu-abu netral) di kedua
halaman — ini **sudah sesuai mockup** (`chip-draft` di Design System juga
neutral/gray, bukan warna cerah), bukan gap tersisa. Status `Failed`/`Error`
sudah memakai `destructive` (merah) dari awal, juga sudah sesuai. Dengan
seluruh 5 poin sudah beres (fixed atau accepted deviation), **KI-054
dinaikkan dari Partially Resolved ke Resolved penuh.**

**Temuan susulan (2026-09-09, setelah status Resolved di atas) — sudah
diperbaiki, tidak membuka ulang status Resolved:** King Rezi menemukan 1 gap
visual tambahan khusus di `DraftsList.tsx` — tiap baris draft tampil sebagai
kotak individual bersudut membulat dengan celah antar baris (kartu-kartu
terpisah bertumpuk), bukan list rata menyatu dengan garis pemisah tipis
seperti mockup `templates/publish-drafts.html` dan pola `QueueList.tsx`.
Root cause: komponen dasar `Item` (`apps/web/src/components/ui/item.tsx`)
punya `rounded-2xl border` di base `cva`-nya yang selalu aktif apa pun
variant-nya (variant cuma mengubah warna border, bukan menghilangkan
radius/border). `DraftsList.tsx` memakai `Item variant="outline"` per baris
di dalam satu `ItemGroup` (`divide-y`) — kombinasi ini yang menghasilkan
efek kotak-kotak terpisah. **Fixed:** `DraftsList.tsx` baris ~57-61 — hapus
`variant="outline"`, tambahkan `rounded-none border-transparent` ke
className, sehingga tiap baris rata tanpa border/rounded individual, hanya
mengandalkan garis pemisah `divide-y` di `ItemGroup` (sama seperti
`QueueList.tsx`). Diverifikasi `tsc --noEmit`, eslint, dan browser preview
(computed style `borderRadius: 0px`, `borderColor: transparent`).

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
| **KI-003** | `OUTSTAND_API_KEY`/`OUTSTAND_WEBHOOK_SECRET` belum diisi **dan** kode Real OutstandAdapter belum ditulis sama sekali (bukan cuma env — factory sengaja throw kalau env terisi tapi kode belum ada) | T-025 → T-027 (rantai terbesar) |
| **KI-015** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` belum diisi (JOB_SECRET sudah resolved 2026-08-14 di Railway staging) | Google OAuth sign-in |

**Resolved 2026-09-07:** KI-048 (3 migration Prisma T-026 belum `prisma
migrate deploy` ke DB dev/live) — King Rezi menjalankan `bun run
db:deploy`, migration terverifikasi ter-apply (Najwa QA Engineer cross-check
via Supabase MCP), retest end-to-end nyata 5 skenario webhook semua PASS.
**T-026 dan T-036 keduanya ditutup `✅ Done`**, lihat `COMPLETE_TASK.md`.

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

* **KI-054 Resolved penuh + KI-051 Resolved — Design Drift Drafts/History tuntas 5/5 poin (2026-09-09)** — poin 1 (struktur baris History): `HistoryList.tsx` diubah dari blok vertikal 4-baris dalam satu `Card` bersama (`ItemGroup` + `divide-y`) menjadi tiap entri `Item variant="outline"` terpisah (kartu individual, border+radius sendiri) dalam `ItemGroup` dengan `gap-2`, satu baris horizontal jam → ikon+handle platform → caption+meta (truncate) → `Badge` status, hover mengubah border kartu sesuai mockup `templates/publish-history.html` (temuan tambahan: teks handle akun dikembalikan ke `text-sm` sesuai spec Design System, sempat dipaksa `text-xs`). Poin 2 (ikon brand penuh vs dot warna) accepted deviation (keputusan King Rezi). Poin 3 & 4 sudah sesuai mockup dari awal. Poin 5 (warna chip status) ditutup Mark UI Engineer via **KI-051**: varian `success` ditambahkan ke `Badge` shadcn (`badge.tsx`), di-wire ke `status-badge.ts` dan `history-status.ts` — status "Published" di Drafts, History, Calendar, dan modal draft-editor sekarang hijau sesuai mockup; status `Draft` (`outline`) dan `Failed` (`destructive`) sudah sesuai mockup dari awal, bukan gap. Diverifikasi `tsc --noEmit`, eslint, dan browser preview. **Temuan susulan (2026-09-09):** `DraftsList.tsx` tiap baris tampil sebagai kotak individual terpisah (bukan list rata) karena base `Item` (`item.tsx`) punya `rounded-2xl border` selalu aktif — fixed dengan hapus `variant="outline"`, tambah `rounded-none border-transparent`, mengikuti pola `QueueList.tsx`. Detail: KI-051 & KI-054 di section Known Issues, `COMPLETE_TASK.md`.
* **T-014 ditutup `✅ Done` — Disconnect account + dialog konfirmasi, 3/3 subtask (2026-09-09)** — T-014.1 diverifikasi lewat `DesignSync` (rancangan sudah ada di Claude Design App Prototype), T-014.2 `WorkspaceService.disconnectAccount` (Prabowo Feature Engineer, gate Owner/Admin reuse pola existing) dengan 2 keputusan non-trivial dikonfirmasi King Rezi — reset `reconnectRequired` saat disconnect, dan tolak eksplisit (`ConflictError`) disconnect akun yang sudah `disconnected` (bukan idempotent, defense-in-depth), T-014.3 UI `AlertDialog` shadcn di `ConnectedAccountsList.tsx` (Mark UI Engineer, reuse hook `useConfirmAction`). Lolos review arsitektur Ridwan (0 temuan) + verifikasi end-to-end browser. PR [#113](https://github.com/reziSaktiva/social-media-management/pull/113) dari `feature/t-014-disconnect-account` ke `staging`. Detail: `tasks/v01-foundation.md` § T-014.
* **T-034.4 selesai — T-034 (Publishing History + detail post) tuntas 4/4 subtask, `✅ Done` (2026-09-09, ADR-103)** — aksi retry manual untuk target publishing yang gagal. Scope retry (single-target, bukan whole-post) diputuskan King Rezi lewat `AskUserQuestion` untuk melengkapi ADR-092 (mencegah duplikat konten di akun yang sudah `published`). Elon Backend Engineer (kontrak `IOutstandAdapter.deletePost`), Prabowo Feature Engineer (use-case `retry-failed-target.use-case.ts`, kolom `PublishingPostTarget.retryOutstandPostId`, `RetryTargetButton.tsx`, wiring `HistoryDetail.tsx`), lolos review Ridwan (0 temuan blocking) dan QA Najwa (259 test pass, verifikasi browser golden path + edge case semua PASS). 1 Known Issue baru non-blocking: **KI-052** (hydration warning `formatRelativeTime` di `HistoryList.tsx`). Detail: `tasks/v02-publishing-mvp.md` § T-034, `DECISIONS.md` § ADR-103.
* **T-034.2/T-034.3 selesai — Publishing History UI daftar + detail post, KI-048 Resolved (2026-09-09)** — draft Claude Design direview bareng King Rezi di chat (5 poin dikonfirmasi), App Prototype diwire penuh (main agent), implementasi kode Prabowo Feature Engineer (`group-history-items.ts`, `HistoryList.tsx`, `HistoryDetail.tsx`, reuse komponen shadcn existing), lolos review arsitektur Ridwan (0 temuan blocking) dan QA Najwa (248 test pass, 1 bug `postId` non-UUID crash 500 ditemukan+diperbaiki di `getHistoryById`). **KI-048 Resolved.** 2 Known Issue baru: **KI-050** (gap meta author di halaman detail), **KI-051** (`Badge` shadcn belum ada varian success). Sisa T-034: **T-034.4** (retry manual). Detail: `tasks/v02-publishing-mvp.md` § T-034.
* **T-034.1 selesai — Publishing History query riwayat + status per target (2026-09-08)** — `IPublishingRepository.listHistory`/`getHistoryById` + `PublishingService.listHistory`/`getHistoryById` (`HISTORY_TERMINAL_STATUSES`: `Published`/`Failed`) + implementasi Prisma, dikerjakan Prabowo Feature Engineer, lolos review arsitektur Ridwan (0 temuan blocking). Tidak diblokir `Depends: T-026` (webhook) — Fake adapter (ADR-059) sudah mengisi outcome per target secara sinkron. T-034 naik `⏳ Not Started` → `🟡 In Progress`. Draft Claude Design untuk T-034.2/T-034.3 dibuat (**KI-048**, belum direview) dan gap non-blocking `failedAt`/`failureReason` dicatat (**KI-049**). Detail: `tasks/v02-publishing-mvp.md` § T-034.
---

## Recent Decisions (Ringkasan)

5 ADR terakhir. Daftar lengkap (indeks + link ke tiap ADR): lihat `DECISIONS.md`.

* **ADR-103** — Retry Manual Publishing — Scope Single-Target (bukan Whole-Post): melengkapi ADR-092 — karena `outstandPostId` bersifat post-level, retry manual satu target yang gagal hanya me-recreate target itu sendiri (kolom baru `PublishingPostTarget.retryOutstandPostId`), target lain yang sudah `published` tidak disentuh. King Rezi memutuskan lewat `AskUserQuestion`. Dengan ini **T-034 tuntas 4/4 subtask, `✅ Done`**. Nomor di-renumber dari ADR-102 semula saat merge `staging` (ADR-102 sudah dipakai lebih dulu untuk topik lain, default tema OS). Detail: `decisions/ADR-103-retry-manual-publishing-scope-single-target.md`.
* **ADR-102** — Default Tema Ikuti Preferensi Sistem Operasi (Amandemen ADR-055): default tema aplikasi (cookie `theme` belum pernah ditulis) mengikuti `prefers-color-scheme` OS, bukan hardcode Light — begitu user toggle eksplisit, cookie ditulis dan jadi preferensi permanen. Mekanisme: `<Script beforeInteractive>` di `layout.tsx` + koreksi `useLayoutEffect` di `Providers.tsx`. Ad-hoc di luar scope T-039.4. Detail: `decisions/ADR-102-default-tema-ikuti-preferensi-sistem-operasi-amandemen-adr-055.md`.
* **ADR-101** — Members List Menampilkan Undangan Pending via Gabungan Data (Amandemen ADR-100) — Berlaku Kedua Metode Invite: pendekatan teknis berubah dari "pre-create baris `workspace_members`" (ADR-100) menjadi gabungan data presentasi (`workspace_members` + `WorkspaceInvitation` pending belum expired) setelah ditemukan `WorkspaceMember.userId` bersifat `NOT NULL` — berlaku untuk Copy Link **dan** Kirim via Email sekaligus, tanpa migrasi skema. Task baru **T-007.8** ditambahkan (tidak bergantung T-005), sudah `✅ Done`. Detail: `decisions/ADR-101-members-list-gabungkan-invitation-pending-amandemen-adr-100.md`.
* **ADR-100** — `MemberStatus.Pending` Direservasi untuk Metode Invite "Kirim via Email" (T-007.7): resolusi **KI-046** — status `Pending` bukan dead code, direservasi untuk T-007.7 (blocked T-005). Baris `workspace_members` dibuat `Pending` saat invite dikirim via email, diupdate `Active` saat accept; metode Copy Link tidak berubah. Implementasi konkret menunggu T-005. Detail: `decisions/ADR-100-memberstatus-pending-direservasi-metode-invite-kirim-via-email.md`.
* **ADR-099** — SECURITY DEFINER System-Context Lookup untuk Webhook Outstand (T-026): route webhook `/api/webhooks/outstand` tidak punya Better Auth session/`userId`, tapi RLS mewajibkan `app.current_user_id` — 2 fungsi Postgres `SECURITY DEFINER` baru (`webhook_find_post_targets_by_outstand_post_id`, `webhook_find_account_owner_by_outstand_account_id`), scope sempit exact-match, `EXECUTE` hanya di-grant role `app_runtime`; operasi tulis tetap lewat `withCurrentUser` normal. Preseden untuk T-027 (job runner). Detail: `decisions/ADR-099-security-definer-system-context-lookup-webhook-outstand.md`.

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
