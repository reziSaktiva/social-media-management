# PROJECT STATE

## Snapshot

* **Phase / Milestone:** Phase 6 — Implementation · M8 — Development (Sprint 5) · Overall: M7 100%, M8 in progress
* **Active Mode:** Ready for Development — implementasi fitur produk sesuai Architecture & Engineering Baseline
* **Top Next Tasks:**
  1. Sidebar "Channels" (ADR-058) — implementasi kode menyusul
  2. Sidebar CTA "+ New Post" (ADR-053) — implementasi kode menyusul
  3. Publish Now (ADR-047) — implementasi menyusul
* **Blocker:** Tidak ada blocker aktif. Known issue teratas: dependency Transactional Email Provider belum ditetapkan (tidak memblokir M8 awal).
* Detail penuh ada di section di bawah. Riwayat completed/ADR lengkap: lihat `COMPLETE_TASK.md` (⚠️ jangan dibaca AI kecuali diperintah)/`DECISIONS.md`.

---

## Metadata

| Field        | Value      |
| ------------ | ---------- |
| Version      | 1.0.35     |
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
  selesai.
* Alignment dokumentasi ADR-041 selesai: Engineering Baseline, Project
  Overview, AGENTS, dan AI Context sudah memakai Astryx permanen, neutral theme
  M8, Tailwind layout-only, wrapper selektif, serta exact pin Beta. Instalasi
  dan smoke test Next.js 16 juga sudah selesai.
* Fokus M8 saat ini: Auth Flows, Workspace Onboarding, App Shell, Draft
  Editor (kini modal fullscreen, ADR-052), persistensi nyata "Save as
  Draft"/"Edit Draft", Drafts List data asli, dan persistensi nyata
  "Schedule" via Fake OutstandAdapter (ADR-059) sudah selesai; lanjut ke
  integrasi Outstand runtime asli (ADR-040) begitu kredensial tersedia.

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

* Template `design-tokens.md` sudah disiapkan (status Draft / TBD); nilai final
  berkembang iteratif co-equal dengan Claude Design (ADR-056) — tidak ada lagi
  gerbang "designer masuk", project ini tidak akan merekrut designer eksternal
  (ADR-057, amandemen ADR-038 & ADR-041).

---

## Next Tasks

* **Sidebar "Channels" (ADR-058) — implementasi kode menyusul:** tambahkan
  section Channels di `WorkspaceSideNav`/`AppShell` (`apps/web`) sesuai
  desain final di Claude Design (avatar bulat + badge logo brand
  react-icons/fa6 overlay, nama akun, status badge, scheduled count ↔
  quick-compose "+" tetap no-shift/fixed-slot, drag-handle
  **shift-on-hover** — seluruh isi baris ikut bergeser, addendum ADR-058
  yang mengoverride keputusan awal "no-shift"). Prasyarat: service
  `listConnectedAccounts` **sudah ada** (dibuat sebagai bagian ADR-059,
  `WorkspaceService.listConnectedAccounts`, query real
  `WorkspaceConnectedAccount`) — sisa prasyarat yang belum terpenuhi:
  skema tabel reorder personal per user (baru), query scheduled-posts
  count lintas domain, dan konfirmasi `react-icons` sebagai dependency
  runtime `apps/web` (`dependency-strategy.md`).
  **Catatan terbuka:** posisi pixel tombol "+" di Claude Design saat ini
  (`top: 1px; left: -1px` di atas `.channel-add`) sudah dikonfirmasi King
  Rezi sendiri sebagai "kurang pas" — bukan source of truth pixel-perfect;
  King Rezi akan menyesuaikan sendiri saat implementasi kode ini
  berjalan, jangan disalin apa adanya sebagai nilai final.
* **M8 — Development:** auth flows UI, workspace onboarding, App Shell, Draft Editor (kini modal, ADR-052), persistensi "Save as Draft"/"Edit Draft", Drafts List data asli, dan persistensi nyata "Schedule" via Fake OutstandAdapter (ADR-059) selesai; lanjut ke integrasi Outstand runtime asli (ADR-040) begitu kredensial tersedia.
* **Sidebar CTA "+ New Post" (ADR-053) — implementasi kode menyusul:**
  tambahkan CTA pinned di `WorkspaceSideNav`/`AppShell` (`apps/web`), di
  bawah Workspace Selector dan di atas navigation items, membuka Draft
  Editor (modal, ADR-052) dari section manapun. Sudah diimplementasikan
  di Claude Design, belum di kode.
* **Redirect Draft Editor ke sub-screen tujuan (ADR-054) — implementasi
  kode menyusul:** Save as Draft → Drafts sudah sejalan dengan alur
  existing; perlu dipastikan tetap konsisten begitu CTA sidebar (ADR-053)
  aktif dari section manapun. Redirect Schedule → Queue dan Publish Now →
  History/Calendar baru relevan setelah persistensi "Schedule" dan
  implementasi Publish Now (ADR-047) berjalan — bukan task terpisah baru,
  cukup diselaraskan saat kedua task tersebut dikerjakan.
* **Light/Dark Mode Toggle (ADR-055) — push `components/navigation.html` yang
  tertunda:** file hasil edit sudah disiapkan lengkap di scratchpad
  (dibuat sesi Neymar), tinggal di-push ke Claude Design saat tool
  `DesignSync` aktif kembali (sempat nonaktif saat sesi kerja desain).
* **Light/Dark Mode Toggle (ADR-055) — persistensi lintas reload, sudah
  diputuskan (2026-07-31):** pakai **Cookie** (bukan localStorage), supaya
  server (RSC/Middleware) bisa baca preferensi sebelum render pertama —
  konsisten dengan pola session cookie Better Auth yang sudah ada. Belum
  diimplementasikan di kode — menyusul.
* **Publish Now (ADR-047) — implementasi menyusul, belum ada di kode maupun App Prototype:** `PublishingService.publishNow()` (RBAC Owner/Admin/Manager, validasi `ContentFormat` ADR-039, panggil `OutstandAdapter`) + tombol "Publish Now" di Draft Editor (KSP-05-F12) berdampingan dengan Schedule + dialog Confirmation Summary variannya (UXP-04); App Prototype Claude Design juga perlu ditambahkan tombolnya (role switcher yang sudah ada tinggal dipakai untuk membatasi visibility Creator).
* **Disconnect Confirmation (ADR-048) — implementasi menyusul:** dialog konfirmasi (KSP-08-F07) di `settings-connected-accounts.html` App Prototype + `disconnectAccount` di kode nyata (RBAC Owner/Admin, belum ada perubahan RBAC — tinggal tambah gate konfirmasi sebelum memanggil service).
* **Remove Member, Transfer Ownership, Delete Workspace — pendekatan desain sudah diputuskan (2026-07-31):** tier konfirmasi sudah ada (ADR-049) dan method service `deleteWorkspace`/`transferOwnership`/`acceptOwnershipTransfer` sudah lengkap di `application-layer.md` (ADR-050). Screen Workspace Settings → Members/General (di luar 8 KSP) belum pernah dirancang — disepakati **desain minimal dulu**: cukup bagian "Danger Zone" untuk Transfer Ownership + Delete Workspace (General) dan Remove Member (Members), tanpa fitur manajemen anggota lengkap. Sesi desain (Neymar) belum dimulai.
* **Implementasi Safety Check Tier 2 yang tersisa (ADR-049):** Cancel Schedule, Delete Post, Delete Media, Update Member Role, Logout — semua sudah diklasifikasikan wajib dialog konfirmasi tapi belum ada satu pun yang diimplementasikan di kode atau App Prototype.
* **Outstand runtime (ADR-040):** implementasikan `OutstandAdapter`, webhook
  `post.published` / `post.error` / `account.token_expired` dengan
  durable-before-ACK, job retry internal, media upload working copy, serta
  engagement comment/reply sync 30 menit + manual refresh.
* **Operasional X:** Project Owner mengonfigurasi kredensial BYOK X secara
  manual di dashboard Outstand; aplikasi tidak membuat form atau secret store X.
* **API mobile (ADR-043):** siapkan skema `apps/web/app/api/v1/...` dan
  konfigurasi Better Auth Bearer plugin (`trustedOrigins`,
  `rateLimit.customRules`) mendahului M8 web berjalan jauh. Endpoint mobile
  aktual (WorkspaceService → PublishingService → EngagementService →
  NotificationService) dikerjakan setelah MVP web selesai — bukan sekarang.
* **Design tokens — evolusi iteratif (ADR-056 amendemen ADR-038; ADR-057:
  tidak ada designer eksternal):** `design-tokens.md` dan Design System
  Claude Design sekarang co-equal, boleh berubah dari kedua sisi kapan saja
  (bukan lagi "isi sekali setelah desain di-approve"). AI wajib reminder
  proaktif setiap ada perubahan UI/UX di salah satu sisi. Gerbang "menunggu
  designer masuk" dihapus permanen — King Rezi sendiri berperan sebagai
  desainer via Claude Design (ADR-057). Status → Locked tetap jadi penanda
  final saat nilai sudah
  stabil, baru dimirror ke Astryx theme + Tailwind token bridge (ADR-041).
* (Opsional) Perkaya aturan coding di `context/ctx-development.md` saat konvensi baru muncul dari praktik M8.
* (Opsional) initial git commit — menunggu instruksi eksplisit.
* (Opsional) pilih transactional email provider (AS-D04) saat butuh verification / password reset.

---

## Known Issues

* **Dependency terbuka — Transactional Email Provider.** Password reset & email verification (Better Auth) membutuhkan email provider yang belum ditetapkan (kandidat: Resend, Postmark, AWS SES, SMTP Supabase). Dicatat di `auth-strategy.md` (AS-D04). `requireEmailVerification` dinonaktifkan sementara di skeleton. Tidak memblokir M8 awal.
* **Belum ada commit awal.** Repo sudah `git init` (branch `main`); working tree belum di-commit — commit awal menunggu instruksi eksplisit.
* **RLS SQL policies** belum digenerate di migrasi awal — ditambahkan saat jalur server set `app.current_user_id` diimplementasi (DO-D06).
* **Runtime ADR-040 belum diimplementasikan.** Alignment dokumentasi dan
  schema/migration sudah selesai, tetapi handler webhook, durable ingestion,
  retry internal, media upload Outstand, engagement sync/reply, dan reconnect
  flow masih task M8. `schedulePost` sendiri sudah bisa dipakai lewat
  `FakeOutstandAdapter` (ADR-059) — `getOutstandAdapter()` akan beralih
  otomatis ke real adapter begitu `OUTSTAND_API_KEY` diisi **dan** kode real
  adapter sudah ditulis (kalau env terisi tapi kode belum ada, factory throw
  error, bukan silent fallback ke Fake).
* **Astryx masih Beta.** Kompatibilitas dasar Next.js 16 sudah dibuktikan lewat
  smoke test dan production build, tetapi risiko perubahan API tetap dikelola
  dengan exact pin, tanpa canary/swizzle, wrapper selektif, update manual, dan
  verifikasi ulang saat upgrade.
* **Hydration gagal saat diakses lewat tunnel ngrok.** Saat uji halaman auth
  lewat tunnel ngrok yang dipakai untuk `BETTER_AUTH_URL`, seluruh halaman
  (bukan spesifik komponen auth) tidak ter-hydrate — tidak ada React fiber
  di elemen manapun meski `window.next` termuat tanpa error console; klik
  submit jatuh ke native HTML form-submit. Kemungkinan besar isu HMR/
  WebSocket Turbopack lewat ngrok. Belum diselidiki lebih lanjut (di luar
  scope auth flows UI); backend/API sendiri terverifikasi benar via raw
  `fetch()`. Perlu ditelusuri sebelum uji interaksi form penuh di browser
  lewat ngrok bisa diandalkan.
* **Light/Dark Mode Toggle (ADR-055) — `components/navigation.html` belum
  ter-push ke Claude Design.** File hasil edit sudah lengkap di scratchpad,
  terblokir karena tool `DesignSync` sempat nonaktif di sesi kerja desain.
  Tidak memblokir kode `apps/web` (sudah selesai dan lolos QA/review) —
  hanya dokumen referensi komponen di Claude Design yang tertinggal.
* **Light/Dark Mode Toggle (ADR-055) — persistensi tema lintas reload belum
  diputuskan.** Saat ini tema selalu reset ke Light setiap full reload
  (sengaja, bukan bug). Keputusan localStorage/cookie ditunda.

---

## Blockers

Tidak ada blocker saat ini.

---

## Completed (Ringkasan)

Berikut ~5 item terakhir yang diselesaikan. Riwayat lengkap (sejak M0): lihat `COMPLETE_TASK.md` — ⚠️ jangan dibaca AI kecuali diperintah eksplisit King Rezi.

* **ADR-058** — Sidebar "Channels" (quick-glance daftar akun terhubung): selesai di Claude Design, implementasi kode `apps/web` menyusul.
* **Claude Design** — bug fix Content Format Selector hilang di New Post + penambahan akun mock TikTok & Pinterest (catch-up ADR-037/ADR-039).
* **ADR-059** — Fake OutstandAdapter: persistensi nyata "Schedule" selesai (kode + QA + review arsitektur Ridwan, tanpa temuan baru).
* **ADR-060** — Dokumentasi Efficiency Restructuring: `DECISIONS.md` (3.564→69 baris) dipecah jadi file per-ADR + indeks, `PROJECT_STATE.md` (928→~260 baris) dapat Snapshot + heading rapi + trim duplikasi, skill navigator jadi cascade 3 tingkat.
* **ADR-061** — Konsolidasi `CHANGELOG.md` + arsip jadi satu file `COMPLETE_TASK.md`, dengan peringatan keras: AI dilarang membaca isinya kecuali diperintah eksplisit.

---

## Recent Decisions (Ringkasan)

5 ADR terakhir. Daftar lengkap (indeks + link ke tiap ADR): lihat `DECISIONS.md`.

* **ADR-061** — Konsolidasi CHANGELOG jadi `COMPLETE_TASK.md` tunggal + larangan baca proaktif AI (amandemen ADR-060).
* **ADR-060** — Dokumentasi Efficiency Restructuring: `DECISIONS.md` dipecah per-file + indeks, `PROJECT_STATE.md` dapat Snapshot + trim, skill navigator jadi cascade 3 tingkat.
* **ADR-059** — Fake OutstandAdapter — persistensi nyata "Schedule" tanpa kredensial Outstand asli.
* **ADR-058** — Sidebar mendapat section "Channels" (quick-glance daftar akun terhubung).
* **ADR-057** — Tidak ada designer eksternal; peran desainer permanen digantikan Claude Design/King Rezi (amandemen ADR-038, ADR-041).

---

## Related Documents

* PROJECT_OVERVIEW.md
* ARCHITECTURE_OVERVIEW.md
* PROJECT_RULES.md
* DECISIONS.md
* ../product-discovery/06-engineering/
* ../product-discovery/05-architecture/
* ../product-discovery/04-ux/
