# PROJECT STATE

## Snapshot

* **Phase / Milestone:** Phase 6 — Implementation · M8 — Development (Sprint 5) · Overall: M7 100%, M8 in progress
* **Active Mode:** Ready for Development — implementasi fitur produk sesuai Architecture & Engineering Baseline
* **Top Next Tasks:** **T-025 Real OutstandAdapter** (blocked kredensial Outstand — rantai blocker terbesar tersisa) dan **T-037 Perkaya aturan coding** (kontinu by design, 🟡 In Progress) — salinan ID dari **Fokus sekarang** di [`TASKS.md`](TASKS.md), satu-satunya daftar fokus. Rilis terakhir tuntas: **v0.4 Engagement MVP 5/6 task** (2026-09-22, sisa T-055 Could Have tidak blocking) dan **v0.3 Analytics MVP 8/8 task** (2026-09-21). Riwayat detail per task: lihat **Completed (Ringkasan)** di bawah / `COMPLETE_TASK.md`.
* **Blocker:** 2 blocker aktif (env var Outstand belum diisi + kode Real OutstandAdapter belum ditulis; env var Google OAuth belum diisi) — lihat section **Blockers** di bawah. Railway staging sudah live & terverifikasi (2026-08-14) sehingga blocker itu resolved; JOB_SECRET juga sudah diisi di Railway staging. Tidak memblokir M8 awal. **T-026 dan T-027 sudah ✅ Done (2026-09-07, 2026-09-17) lewat `FakeOutstandAdapter`** — blocker `OUTSTAND_API_KEY` sekarang murni memblokir **T-025 (Real OutstandAdapter)** itu sendiri, tidak lagi merantai T-026/T-027.
* **Backlog task lengkap:** [`TASKS.md`](TASKS.md) — 86 task per release (v0.1 → v1.0, + v0.7 migrasi Astryx→shadcn/ui, ADR-097), detail di `tasks/`. Jangan cari detail task di file ini.
* Detail phase/mode/issue ada di section di bawah. Riwayat completed/ADR lengkap: lihat `COMPLETE_TASK.md` (⚠️ jangan dibaca AI kecuali diperintah)/`DECISIONS.md`.

---

## Metadata

| Field        | Value      |
| ------------ | ---------- |
| Version      | 1.0.90     |
| Status       | Active     |
| Last Updated | 2026-09-23 |

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
* Integrasi Outstand runtime asli (ADR-040) tetap bagian M8, belum selesai —
  menunggu kredensial (T-025, lihat **Blockers** di bawah). Migrasi UI
  Astryx→shadcn/ui (ADR-097, rilis v0.7) sudah tuntas 100% — riwayat lengkap
  di `COMPLETE_TASK.md`, bukan di sini.
* **Perencanaan task** kini berjenjang per release di [`TASKS.md`](TASKS.md) +
  `tasks/` (ADR-062).

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

Alignment dokumentasi dan schema/migration sudah selesai, tetapi retry internal, media upload Outstand, engagement sync/reply, dan reconnect flow masih task M8. `schedulePost` sendiri sudah bisa dipakai lewat `FakeOutstandAdapter` (ADR-059) — `getOutstandAdapter()` akan beralih otomatis ke real adapter begitu `OUTSTAND_API_KEY` diisi **dan** kode real adapter sudah ditulis (kalau env terisi tapi kode belum ada, factory throw error, bukan silent fallback ke Fake). Per 2026-08-13, T-041 (metric ingestion) juga sudah diselesaikan lewat pola Fake yang sama (ADR-079) — `fetchPostMetrics`/`fetchWorkspaceMetrics` mengembalikan data mock deterministik sampai kredensial asli tersedia. T-042 (Dashboard Home) juga sudah ✅ Done (2026-08-13, seluruh subtask), tapi datanya tetap dari `FakeOutstandAdapter` sampai KI-003 ini resolved. **T-026 (webhook handler, 2026-09-07) dan T-027 (job runner + Railway Cron, 2026-09-17) sudah ✅ Done** — keduanya berjalan penuh lewat `FakeOutstandAdapter` (ADR-108 meredesain `fetchPostOutcome` supaya tidak lagi bergantung state in-memory), tidak lagi bagian rantai yang terhambat KI-003 ini. Sisa scope KI-003 sekarang murni T-025 (Real OutstandAdapter itu sendiri).

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

### KI-064 · `application-layer.md` § Peta Dependency Antar Domain belum mencantumkan `publishing→analytics`

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt / Dokumentasi |
| Terkait | T-043, T-033.1 |

Ditemukan Ridwan Architecture Reviewer saat review putaran 2 T-043 (2026-09-18,
`tasks/v03-analytics-mvp.md`): kontrak `PostMetricsPort` (arah dependency
`publishing→analytics`) sudah dipakai sejak T-033.1 (2026-08-27, Popover
Calendar) dan dipakai lagi di T-043 (metrik History Detail), tapi
`application-layer.md` § Peta Dependency Antar Domain (baseline arsitektur)
tidak pernah mencantumkan panah ini di diagram BC-06 Analytics/BC-03
Publishing — hanya mencantumkan `BC-06 Analytics ──→ BC-02 Workspace`. Gap
dokumentasi lama, bukan diperkenalkan sesi T-043, baru ketahuan sekarang.
Diagram perlu ditambal menambahkan `BC-03 Publishing ──→ BC-06 Analytics
(metrik post per target akun, via port)`. Tidak memblokir M8, perubahan ini
murni koreksi dokumentasi baseline (bukan keputusan arsitektur baru), tapi
tetap wajib lewat baseline yang sama karena `application-layer.md` adalah
Static Reference.

### KI-065 · Kotak "Post asal" di Comments Inbox tidak menampilkan judul/thumbnail post asli

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Design Gap / Tech-Debt |
| Terkait | T-053, T-050 |

Ditemukan saat implementasi T-053 (Comments Inbox UI, 2026-09-22): kotak
"Post asal" di panel detail `/engage` hanya menampilkan label generik
("Komentar ini terhubung ke post terjadwal/terpublish") tanpa judul atau
thumbnail post asli. Root cause: `InboxItemDetail`/`EngagementInboxItemRecord`
(T-050) hanya membawa `postId` sebagai ID mentah, tanpa snapshot
caption/media post — menambah join lintas domain `engagement → publishing`
di luar scope UI-only task T-053. Bukan bug (perilaku sesuai kontrak data
T-050 saat ini, dikonfirmasi Najwa QA Engineer sebagai expected), tapi gap
terhadap mockup Claude Design yang mengasumsikan preview post asli tampil.
Perlu keputusan/task lanjutan King Rezi apakah field ini wajib ditampilkan
(kemungkinan butuh port/field baru, mirip pola KI-050). Tidak memblokir
M8.

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

### KI-058 · `ConnectedAccountsList.tsx` tidak menyembunyikan aksi Connect/Disconnect/Reconnect untuk role Creator

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Design Gap / RBAC UI |
| Terkait | T-014, T-015 |

Ditemukan Najwa QA Engineer saat verifikasi end-to-end T-015 (2026-09-11):
UI Connected Accounts settings (`ConnectedAccountsList.tsx`) tidak
menyembunyikan/menonaktifkan tombol Connect/Disconnect/Reconnect untuk role
**Creator** — RBAC di server sudah solid (`WorkspaceService` menolak dengan
benar, tidak ada mutasi tidak sah yang berhasil), tapi gap-nya murni di
UI/UX: Creator baru tahu aksinya ditolak setelah klik dan mendapat toast
error, bukan tombol yang hilang/disabled dari awal seperti pola RBAC UI di
halaman lain (Members, General Settings).

Gap ini sudah ada sejak **T-014** (Disconnect account), bukan regresi baru
dari sesi T-015 — baru ketahuan sekarang karena QA menyentuh area ini lagi
saat verifikasi Reconnect. King Rezi eksplisit memutuskan (`AskUserQuestion`)
ini dicatat sebagai Known Issue baru, **tidak diperbaiki di sesi T-015**.

### KI-060 · Account Selector tidak ter-restore saat reopen edit draft

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Bug — Draft Editor |
| Terkait | Draft Editor (`Modal.tsx`), ditemukan saat verifikasi manual browser T-024 (media upload) |

Ditemukan saat verifikasi manual end-to-end T-024 (2026-09-15, murni sesi
verifikasi, bukan implementasi — riwayat lengkap verifikasi ini dulu
tercatat sebagai KI-059, sudah Resolved dan diarsipkan di
`COMPLETE_TASK.md`): saat draft dibuka ulang untuk diedit,
**seluruh checkbox Account Selector kembali unchecked** meski draft
tersebut punya target akun tersimpan — caption dan media ter-restore
dengan benar, akun tidak. Root cause: efek `getDraftAction` di `Modal.tsx`
(baris ~296-314) hanya men-set `caption`/`status`/`mediaItems` dari draft
yang dimuat, tidak pernah men-set `selectedAccountIds`/`formatByAccount`.

Gap ini **bukan regresi T-024** — T-024 hanya menyentuh state `mediaItems`,
tidak menyentuh logic restore Account Selector, dan gap ini kemungkinan
sudah ada sejak awal implementasi Draft Editor. Dicatat sebagai Known Issue
baru, belum diperbaiki (di luar scope permintaan verifikasi T-024 di atas).

### KI-061 · Tidak ada warning UI saat media over-limit setelah ganti target akun/format

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | UX Gap — Draft Editor (ADR-107) |
| Terkait | Draft Editor (`Modal.tsx`), batas media per `ContentFormat` (ADR-107) |

Ditemukan lewat diskusi King Rezi (2026-09-15, murni analisis kode, bukan
implementasi): kalau user upload media dulu (mis. 5 gambar untuk format
`Post`, batas 10 — aman), lalu menambah akun target dengan format yang
lebih ketat (mis. Pinterest/`Pin`, batas 1 media), batas efektif otomatis
turun jadi 1 (`maxMediaCountForFormats`, ADR-107) — tapi **tidak ada
indikasi visual apa pun** bahwa 5 media yang sudah ada sekarang melebihi
batas dan harus dihapus. Yang terjadi hanya: teks "Maks. X media" di bawah
dropzone berubah angka (pasif), dan dropzone di-disable untuk upload baru
— tidak ada highlight/badge/pesan pada thumbnail yang sudah kelebihan.
User baru tahu ada masalah setelah klik Save as Draft/Schedule/Publish Now
dan mendapat error dari server (`assertMediaCountWithinLimit`, ADR-107):
*"Jumlah media (5) melebihi batas maksimum 1 untuk format yang sedang
dipilih."*

Root cause: tidak ada efek/watcher di `Modal.tsx` yang membandingkan
`mediaItems.length` terhadap `effectiveMaxMedia` setiap kali
`selectedAccountIds`/`formatByAccount` berubah (`toggleAccount`, baris
~420-430) — validasi hanya jalan di titik upload (`handleFilesSelected`)
dan di server saat submit. Dicatat sebagai Known Issue baru, belum
diperbaiki (perlu cek Claude Design dulu sebelum implementasi UI apa pun,
rule 17 AGENTS.md).

### KI-062 · `background-jobs.md` self-contradictory soal formula backoff

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt / Dokumentasi |
| Terkait | T-027 |

Ditemukan Ridwan Architecture Reviewer saat review T-027 (2026-09-17):
`product-discovery/05-architecture/background-jobs.md` § Retry Strategy
mencantumkan tabel backoff **5 menit / 15 menit / 60 menit** (konsisten
dengan BG-D04 dan implementasi kode T-027.3), tapi di dokumen yang sama
formula tertulis `delay = base_delay * 2^(attempts - 1)` dengan
`base_delay = 5 menit` — formula ini sebenarnya menghasilkan **5 / 10 / 20
menit**, tidak cocok dengan tabelnya sendiri. Implementasi kode
(`apps/web/src/lib/jobs/backoff.ts`) memakai angka tabel (5/15/60), jadi
kode sudah benar — dokumentasi baseline yang perlu dikoreksi (salah satu
dari tabel atau formula, bukan keduanya sekaligus tanpa dicek). Tidak
memblokir M8, murni gap dokumentasi.

### KI-063 · `PublishingPost.publishedAt` tidak pernah diisi oleh `markPostPublished`/`markPostFailed`

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt |
| Terkait | T-027, ADR-109, KI-049 (gap serupa di `failedAt`/`failureReason`) |

Ditemukan Najwa QA Engineer saat verifikasi T-027 (2026-09-17): kolom
`PublishingPost.publishedAt` ada di schema tapi tidak pernah ditulis oleh
`markPostPublished` (ADR-109, baru) maupun `markPostFailed` (pola lama,
sudah ada sejak sebelum T-027, bukan regresi baru). UI sudah punya fallback
(`item.publishedAt ?? item.updatedAt`) sehingga tidak berdampak visual,
tapi data historis `publishedAt` di DB tetap kosong untuk seluruh post yang
sudah tayang. Non-blocking, gap serupa pola **KI-049**
(`failedAt`/`failureReason` juga tidak pernah ditulis). Tidak memblokir M8.

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
| **KI-003** | `OUTSTAND_API_KEY`/`OUTSTAND_WEBHOOK_SECRET` belum diisi **dan** kode Real OutstandAdapter belum ditulis sama sekali (bukan cuma env — factory sengaja throw kalau env terisi tapi kode belum ada) | T-025 (rantai terbesar tersisa — T-026/T-027 sudah ✅ Done lewat `FakeOutstandAdapter`, ADR-059/ADR-108, tidak lagi ikut terhambat) |
| **KI-015** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` belum diisi (JOB_SECRET sudah resolved 2026-08-14 di Railway staging) | Google OAuth sign-in |
| **—**      | Migration `20260922110000_t051_filter_active_status_engagement_sync_lookup` **belum di-deploy** (`bun run db:deploy` pending King Rezi) — bukan kredensial eksternal, murni menunggu eksekusi manual King Rezi | T-051 job `engagement.sync` (JOB-03) — sampai migration ter-apply, fungsi SQL yang dipakai job ini masih versi lama dan job **gagal untuk SEMUA akun** (bukan cuma akun yang disconnect) |

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

* **Efisiensi subagent: pangkas duplikasi changelog + model lebih murah untuk Gibran (2026-09-23)** — `PROJECT_STATE.md` (-54%) dan `TASKS.md` (-88%) dipangkas dari narasi changelog historis yang menumpuk (duplikat `COMPLETE_TASK.md`), 6 KI `Resolved` dihapus dari daftar Known Issues, `gibran-project-manager.md` diberi `model: haiku`. Detail: `COMPLETE_TASK.md` (2026-09-23).
* **KI-066 follow-up — 5 perbaikan visual sidebar pasca-migrasi, ditemukan review manual King Rezi (2026-09-23)** — lebar 18rem, avatar rounded 6px, bg main content, `color-scheme` dark mode, Badge status jadi solid fill (**ADR-111**). Detail: `decisions/ADR-111-badge-status-variant-solid-fill-destructive-foreground.md`, `tasks/v07-astryx-shadcn-migration.md` § T-105.
* **T-105 Done (4/4 subtask) — Sidebar workspace/settings migrasi ke primitive `Sidebar` shadcn/ui, KI-066 Resolved (2026-09-23)** — mobile pakai `Sheet` (menggantikan `MobileTopBar.tsx`). Lolos Ridwan (1 temuan non-blocking, fixed) & Najwa QA (PASS penuh). Detail: `tasks/v07-astryx-shadcn-migration.md` § T-105.
* **T-050 + T-051 + T-052 Done — Engagement domain skeleton, Comment sync JOB-03, Manual refresh; v0.4 Engagement MVP tuntas 5/6 (2026-09-22)** — lolos review Ridwan (3 putaran, 0 temuan tersisa) & QA Najwa PASS penuh. **⚠️ Migration belum di-deploy** — lihat Blockers. Detail: `tasks/v04-engagement-mvp.md` § T-050–T-052.
* **T-053 + T-054 Done — Comments Inbox UI + Reply comment, v0.4 Engagement MVP (2026-09-22)** — inbox komentar lintas akun di `/engage` + reply langsung dari aplikasi. **KI-065 baru** (Open): thumbnail post asli belum tampil di detail panel. Lolos Ridwan (0 temuan) & Najwa QA (PASS). Detail: `tasks/v04-engagement-mvp.md` § T-053–T-054.
---

## Recent Decisions (Ringkasan)

5 ADR terakhir. Daftar lengkap (indeks + link ke tiap ADR): lihat `DECISIONS.md`.

* **ADR-111** — Badge Status Variant (`success`/`warning`/`destructive`) Jadi Solid Fill — Tambah Token `--destructive-foreground` (Amandemen ADR-098): King Rezi melaporkan warna badge (khususnya Channels sidebar, KI-066) tidak sesuai Claude Design — `badge.tsx` men-styling status jadi tinted 10-20% opacity, padahal Claude Design mendefinisikan solid fill (UXP-04: harus mencolok, tidak boleh baur dengan background). Nilai token sudah benar sejak ADR-098; diperbaiki cara render jadi solid + tambah token `--destructive-foreground` yang ternyata belum pernah ada. Bug terpisah ikut diperbaiki: badge "Active" Channels salah pakai `variant="secondary"`. Detail: `decisions/ADR-111-badge-status-variant-solid-fill-destructive-foreground.md`.
* **ADR-110** — Fake `fetchComments`/`replyToComment` — Engagement Sync + Reply Mengikuti Pola ADR-059: T-051/T-054 menambah 2 kapabilitas baru `IOutstandAdapter` untuk domain `engagement` lewat `FakeOutstandAdapter` (pola ADR-059). Dicatat retroaktif setelah Ridwan menemukan gap governance saat meninjau T-050/T-051/T-052 (implementasi sudah benar, hanya belum tercatat ADR). Detail: `decisions/ADR-110-fake-fetchcomments-replytocomment-engagement.md`.
* **ADR-109** — Method Baru `IPublishingRepository.markPostPublished` — Transisi Status Level-Post Melengkapi Gap T-026: T-027.5 menemukan `PublishingPost.status` tidak pernah bertransisi ke `Published` walau semua target sudah resolved sukses. Method baru `markPostPublished` (simetris `markPostFailed`, idempoten) dipanggil di `OutstandWebhookProcessor.resolvePostOutcome` (dipakai bersama webhook T-026 dan job T-027.5) saat semua target resolved dan tidak semua gagal. Bug-fix yang melengkapi T-026, bukan reopen task. Detail: `decisions/ADR-109-markpostpublished-post-level-status-transition.md`.
* **ADR-108** — Redesain `IOutstandAdapter.fetchPostOutcome` — Tambah `expectedOutstandAccountIds`, Hilangkan State In-Memory `FakeOutstandAdapter`: T-027.5 menemukan bug correctness — `FakeOutstandAdapter` mengandalkan `Map` in-memory level-modul yang pecah lintas Server Action↔Route Handler terpisah (dikonfirmasi nyata di production build). King Rezi memilih root-cause fix via `AskUserQuestion`: kontrak `fetchPostOutcome` menerima `expectedOutstandAccountIds` eksplisit dari caller, `FakeOutstandAdapter` jadi pure function tanpa state. Detail: `decisions/ADR-108-redesain-fetchpostoutcome-expected-account-ids.md`.
* **ADR-107** — Batas Maksimum Jumlah Media per `ContentFormat` (Carousel) — Amandemen ADR-039: T-024.4 memperkenalkan carousel (multi-media) di Draft Editor. King Rezi mengonfirmasi lewat `AskUserQuestion`: batas maks media per `ContentFormat` — `Post` 10 (carousel IG/FB), `Reel`/`Story`/`Pin` masing-masing 1 (native single-media). Karena `PublishingPost.mediaIds` bersifat SATU set untuk seluruh post (bukan per-target), batas efektif untuk seluruh post = **MINIMUM** dari batas semua format yang dipilih di antara akun target aktif. Ditegakkan di dua tempat wajib sinkron (server `content-format-matrix.ts` + client mirror `Modal.tsx`), pola sama matriks ADR-039. Detail: `decisions/ADR-107-batas-maksimum-jumlah-media-per-content-format.md`.
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
