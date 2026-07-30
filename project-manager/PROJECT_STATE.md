# PROJECT STATE

## Metadata

| Field        | Value      |
| ------------ | ---------- |
| Version      | 1.0.29     |
| Status       | Active     |
| Last Updated | 2026-07-30 |

---

# Current Status

| Item              | Value                            |
| ----------------- | -------------------------------- |
| Current Phase     | Phase 6 — Implementation      |
| Current Milestone | M8 — Development               |
| Current Sprint    | Sprint 5                         |
| Overall Progress  | M7 100% · M8 in progress         |
| Project Status    | M8 berjalan — Publishing MVP (mock) |

---

# Current Focus

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
  Draft"/"Edit Draft", dan Drafts List data asli sudah selesai; lanjut ke
  persistensi "Schedule" + integrasi Outstand (ADR-040).

---

# Active Conversation Mode

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

# Milestone Progress

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

# Completed

* **AI Context — opsi A:** scaffold `context/` (`README.md` + 8 `ctx-*.md`) sebagai indeks + aturan operasional; Product/User di `ctx-business`, UX di `ctx-design`, coding rules di `ctx-development`, pola fitur di `ctx-implementation`. Update `AGENTS.md` + root `README.md`.
* Membuat `AGENTS.md` di root — pintu masuk AI agent; merujuk Project OS, skills, aturan keras M8, dan struktur `context/`.
* Memasang official agent skills di `.agents/skills/` + `skills-lock.json`
  (Prisma, Better Auth, Vercel React, Supabase). Skill UI lama sudah dihapus
  setelah Astryx ditetapkan sebagai fondasi.
* Membuat `project-manager/ARCHITECTURE_OVERVIEW.md` — High-Level Architecture Overview sebagai blueprint Figma (System Context & Containers + Internal Layers & Domains).
* Menentukan arah project.
* Memilih Hybrid Monorepo sebagai strategi repository.
* Memilih Bun sebagai JavaScript runtime.
* Memilih Next.js sebagai framework utama.
* Menentukan penggunaan Domain-Driven Design (DDD).
* Menentukan penggunaan Modular Monolith Architecture.
* Menentukan Outstand sebagai external integration provider.
* Menetapkan Target Market:
  Marketing Team (utama), Startup dan Digital Agency (sekunder).
* Membuat dokumentasi dasar Project OS.
* Menyelesaikan dokumentasi `product-discovery/01-business/`.
* Menyelesaikan Business Review untuk `product-discovery/01-business/`.
* Menetapkan `product-discovery/01-business/` sebagai Baseline v1.0 (ADR-007).
* Menyelesaikan dokumentasi `product-discovery/02-product/`.
* Menyelesaikan Product Review lintas dokumen pada `product-discovery/02-product/`.
* Menambahkan `product-discovery/02-product/future-roadmap.md` untuk melengkapi artefak Product Planning.
* Menetapkan `product-discovery/02-product/` sebagai Baseline v1.0 (ADR-008).
* Menyelesaikan dokumentasi `product-discovery/03-user/` (9 dokumen).
* Menyelesaikan User Discovery Review untuk `product-discovery/03-user/`.
* Menetapkan `product-discovery/03-user/` sebagai Baseline v1.0 (ADR-009).
* Menyelesaikan M1 — Discovery.
* Menyelesaikan dokumentasi `product-discovery/04-ux/information-architecture.md`.
* Menyelesaikan dokumentasi `product-discovery/04-ux/user-flows.md`.
* Menyelesaikan dokumentasi `product-discovery/04-ux/navigation-patterns.md`.
* Menyelesaikan dokumentasi `product-discovery/04-ux/key-screen-patterns.md`.
* Membuat `product-discovery/02-product/roles-permissions.md` — definisi 4 roles (Owner, Admin, Manager, Creator), set status konten kanonikal, dan aturan transisi per role.
* Mencatat ADR-012 di `DECISIONS.md` — addendum Product Baseline untuk dokumen roles-permissions.
* Menyelesaikan UX Planning Review — semua 4 inkonsistensi (REVIEW-01 s/d REVIEW-04) telah diperbaiki.
* Menetapkan `product-discovery/04-ux/` sebagai UX Planning Baseline v1.0 (ADR-013).
* Menyelesaikan M4 — UX Planning.
* Menyelesaikan dokumentasi `product-discovery/05-architecture/domain-model.md` — 10 bounded context, context map, shared types, dan domain boundary rules.
* Menyelesaikan dokumentasi `product-discovery/05-architecture/database-strategy.md` — multi-tenancy RLS, 22 tabel untuk 10 BC, storage strategy, index strategy, dan soft delete strategy.
* Menyelesaikan dokumentasi `product-discovery/05-architecture/application-layer.md` — 4-layer stack, Next.js entry point patterns, service contracts per BC, repository pattern, cross-domain communication, dan error handling strategy.
* Menyelesaikan dokumentasi `product-discovery/05-architecture/integration-layer.md` — Anti-Corruption Layer (OutstandAdapter), ConnectedAccount OAuth flow, publishing flow, webhook handling, engagement sync, analytics sync, dan error handling strategy.
* Menyelesaikan dokumentasi `product-discovery/05-architecture/background-jobs.md` — PostgreSQL job queue, Railway Cron, 4 job types (webhook retry, post notification, engagement sync, analytics sync), dan retry strategy.
* Menyelesaikan dokumentasi `product-discovery/05-architecture/realtime-strategy.md` — Supabase Realtime untuk notifikasi in-app, manual refresh patterns, notification type registry, dan RLS subscription rules.
* Menyelesaikan dokumentasi `product-discovery/05-architecture/auth-architecture.md` — Better Auth, HTTP-only session cookie, Middleware workspace context resolution, RBAC di Application Service, dan RLS defense-in-depth.
* Menyelesaikan Architecture Review `product-discovery/05-architecture/` — 8 inkonsistensi ditemukan dan diperbaiki (ARCH-REVIEW-01 s/d ARCH-REVIEW-08), meliputi: nama tabel notification, klarifikasi RLS dual-context, penambahan `background_jobs` ke database-strategy, media signed URL, eliminasi circular dependency AI↔Publishing, perbaikan JOB-03, referensi `webhook_event_log`, dan konsistensi retry count.
* Menetapkan `product-discovery/05-architecture/` sebagai System Architecture Baseline v1.0 (ADR-025).
* Menyelesaikan M5 — System Architecture.
* Menyelesaikan dokumentasi `product-discovery/06-engineering/deployment-infrastructure.md` — region Singapore/SEA, topologi Production + Staging, Supabase project terpisah per environment, arsitektur service Railway (web + cron), build/deploy pipeline, scaling, dan rollback strategy (ADR-028, ADR-029).
* Menyelesaikan dokumentasi `product-discovery/06-engineering/auth-strategy.md` — konfigurasi Better Auth, provider (email/password + Google OAuth), session cookie, integrasi Supabase JWT dual-context untuk Realtime, dan konfigurasi per environment (ADR-030).
* Menyelesaikan dokumentasi `product-discovery/06-engineering/database-orm.md` — Prisma sebagai ORM formal, batas Supabase client (Realtime/Storage), Prisma Migrate, Supavisor pooling, Better Auth Prisma adapter (ADR-031).
* Menyelesaikan dokumentasi `product-discovery/06-engineering/cicd-pipeline.md` — GitHub Actions quality gates, promosi feature→staging→main, Railway CD, migrate on release (ADR-032).
* Menyelesaikan dokumentasi `product-discovery/06-engineering/environment-management.md` — katalog env vars, secret native (Railway + `.env.local`), project Cloud `social-media-local` / staging / prod, rencana cloud→self-host (ADR-033).
* Menyelesaikan dokumentasi `product-discovery/06-engineering/dx-tooling.md` — ESLint + Prettier, Lefthook + Vitest, script workspace & local setup (ADR-034).
* Menyelesaikan dokumentasi `product-discovery/06-engineering/dependency-strategy.md` — caret ranges, lockfile root, penempatan dep, aturan shared package, update manual (ADR-035).
* Menyelesaikan seluruh 8 dokumen M6 Engineering Planning.
* Menyelesaikan Engineering Planning Review — 6 inkonsistensi ditemukan dan diperbaiki (ENG-REVIEW-01 s/d ENG-REVIEW-06).
* Menetapkan `product-discovery/06-engineering/` sebagai Engineering Planning Baseline v1.0 (ADR-036).
* Menyelesaikan M6 — Engineering Planning.
* **M7 slice B — Monorepo inti:** root Bun Workspaces, `apps/web` (Next.js App Router + 9 domain modules + route placeholders), `packages/shared` (branded IDs, enums, value objects), root `README.md` / `.gitignore` / `tsconfig.json`; `bun run typecheck` & `bun run build` hijau.
* Menetapkan lokasi env M7: `apps/web/.env.example` + `apps/web/.env.local` (EM-D04 dikunci di `environment-management.md`).
* **M7 DX tooling:** ESLint + Prettier (root), Lefthook + lint-staged (`prepare`), Vitest di root + smoke test `@social/shared`; script root sesuai DX-D04; `git init` di root (branch `main`); verifikasi `lint` / `format:check` / `test` / `typecheck` hijau.
* DX-D06 / DX-D07 dikunci di `dx-tooling.md` (Vitest config di root; Lefthook via `prepare`).
* **M7 Prisma + Auth + env + CI (selesai):**
  * `apps/web/prisma/schema.prisma` — identity_* (Better Auth) + tabel domain MVP + `background_jobs`; migrasi awal `20260717100000_init`.
  * Prisma Client singleton (`src/lib/prisma/client.ts`); Prisma **7.x** — migrate via `prisma.config.ts` (`DIRECT_URL`), runtime via `@prisma/adapter-pg` (`DATABASE_URL`) (DO-D04).
  * Better Auth skeleton (`src/lib/better-auth/auth.ts`) + route `/api/auth/[...all]`; JWT Realtime helper (AS-D03); Supabase client stubs (Realtime/Storage only).
  * Env fail-fast (`src/lib/env.ts`) + `apps/web/.env.example` (EM-D04/EM-D05).
  * `.github/workflows/ci.yml` — gates CI-D02 (install → prisma generate/validate → typecheck → lint → test).
* **ADR-040 alignment selesai:** kontrak resmi Outstand sudah diselaraskan pada
  Product/UX/Architecture/Engineering dan schema/migration. Ini menyelesaikan
  alignment, bukan implementasi runtime.
* **ADR-041 implementasi fondasi UI selesai:** Astryx Core, Neutral Theme, CLI,
  dan StyleX dipasang dengan exact pin `0.1.8` / `0.19.0`; provider global,
  CSS cascade Tailwind, token bridge, dan halaman smoke terintegrasi. Button,
  Dialog, TextInput, Table, light/dark mode, CLI doctor, typecheck, lint, test,
  browser interaction, serta Next.js 16 production build sudah terverifikasi.
* **ADR-042 — Claude Design menggantikan Figma:** project `Social Media
  Management` dibuat di Claude Design (token neutral interim, foundations,
  components, 8 layar KSP-01–08). Workflow di `ctx-design.md`. Sinkronisasi
  manual/on-request via tool `DesignSync`. Pointer project sekarang di
  `context/ctx-design.md` — folder `design/` sudah dihapus (ADR-045).
* **ADR-045 — Hapus folder `design/`:** paket handoff designer (`README.md`,
  `DESIGN_OVERVIEW.md`, `DESIGN_BRIEF.md`, `DESIGN_ONEPAGER.html`, 2 PDF,
  `_build-brief-pdf.mjs`) dihapus dari repo karena belum ada designer aktif
  yang memakainya. Pointer project Claude Design dipindah ke
  `context/ctx-design.md`. Tidak mengubah SoT token (`design-tokens.md`,
  ADR-038) maupun status Claude Design sebagai handoff tool (ADR-042) — hanya
  mencabut keberadaan folder `design/` itu sendiri. ~14 dokumen lain yang
  merujuk `design/` diperbarui mengikuti keputusan ini.
* **ADR-043 — API mobile-ready alignment selesai:** `application-layer.md`
  (Route Handler v1 — Mobile Client, AL-D08) dan `auth-strategy.md` (Bearer
  plugin, AS-D06) sudah diselaraskan; `auth-architecture.md` diperjelas
  (AU-D11). Ini menyelesaikan alignment dokumentasi, bukan implementasi
  runtime endpoint `/api/v1`.
* **Migrasi Next.js 16 middleware → Proxy selesai:** `apps/web/src/middleware.ts`
  di-rename menjadi `src/proxy.ts` (fungsi `middleware` → `proxy`), sesuai
  https://nextjs.org/docs/messages/middleware-to-proxy. Behavior tidak
  berubah — auth guard + workspace context injection tetap sama. Referensi
  path di `monorepo-setup.md`, `database-orm.md`, `auth-strategy.md` sudah
  disesuaikan. Warning deprecation di `bun run dev` sudah hilang.
* **M8 bootstrap — Supabase Cloud + DB migrate selesai:** project Supabase
  Cloud `social-media-local` dibuat (region SEA), `apps/web/.env.local` diisi,
  `bun run db:migrate` diterapkan — 4 migrasi (`init`, `add_content_format`,
  `align_outstand_contract`, dan satu migrasi baru untuk menyamakan index
  `engagement_inbox_items` yang ter-truncate Postgres) sukses; `prisma migrate
  status` konfirmasi database up to date.
* **ADR-044 — rename env var Supabase publishable key:**
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` di
  `environment-management.md`, `.env.example`, `env.ts`, dan
  `lib/supabase/client.ts`, mengikuti sistem API key baru Supabase (anon key
  legacy dijadwalkan deprecated).
* **M8 — Auth Flows UI selesai (Login, Register, Forgot/Reset Password):**
  4 layar di `apps/web/src/app/(auth)/` (login, register, forgot-password,
  reset-password baru) mengikuti referensi Claude Design (ADR-042 supplement
  Auth Flow) dan workflow Astryx CLI wajib. Better Auth React client
  (`lib/better-auth/client.ts`), `googleOAuthEnabled()` (tombol Google
  disembunyikan otomatis bila env kosong), dan `sendResetPassword` stub
  (log tautan reset ke console, testable lokal tanpa provider email AS-D04).
  Typecheck/lint hijau; sign-up diverifikasi end-to-end via API. Verify-email
  disengaja tidak dibangun dulu karena `requireEmailVerification` masih
  nonaktif (AS-D04 belum ada provider).
* **M8 — Workspace Onboarding selesai:** Onboarding Flow (First Login) dari
  `auth-architecture.md` diimplementasikan end-to-end — `proxy.ts` (session
  cookie guard via `getSessionCookie`, tanpa DB call), root `page.tsx`
  (redirect `/login` / `/{slug}/home` / `/onboarding`), dan `/onboarding`
  (form 1 field nama workspace + Server Action `createWorkspaceAction`).
  `WorkspaceService` (BC-02) pertama kali diimplementasikan
  (`createWorkspace` — validasi nama, slug auto-generate + retry suffix saat
  bentrok, transaksi Prisma Workspace+WorkspaceMember Owner;
  `getDefaultWorkspaceSlugForUser` untuk orkestrasi redirect) + repository
  Prisma di `src/lib/repositories/workspace/` (MS-D05). Hierarki
  `ApplicationError` (`application-layer.md`) diimplementasikan di
  `src/lib/utils/errors.ts`. `MemberStatus` ditambahkan ke `packages/shared`.
  Diverifikasi: typecheck/lint/test hijau, alur end-to-end lewat curl
  (login → redirect `/onboarding` → create workspace di database Supabase
  Cloud nyata → redirect `/{slug}/home`), dan proxy guard (unauthenticated →
  `/login`, halaman auth publik tetap 200). Invite-teammate & connect-account
  **tidak** termasuk scope ini — sudah ada Server Action & route Settings
  terpisah.
* **M8 — Workspace App Shell selesai:** layout `[slug]` diganti dari
  placeholder kosong menjadi `AppShell` + `SideNav` persisten (Home/Publish/
  Engage/Analyze/Start Page) sesuai `navigation-patterns.md`. Sidebar header
  menampilkan nama workspace aktif (`WorkspaceService.getWorkspaceBySlug` +
  `IWorkspaceRepository.findBySlug` baru), footer berisi user dropdown dengan
  Profile dan Logout (`authClient.signOut`) — menutup gap sebelumnya belum ada
  jalan logout dari UI.
* **M8 — Draft Editor (mock data) selesai:** `/publish/drafts/new` (KSP-05)
  diimplementasikan — Caption Editor, Account Selector, Content Format
  Selector per akun sesuai matriks ADR-039 (IG/FB: Post/Reel/Story;
  Pinterest: Pin + title/link; platform lain: Post), Schedule Picker, dan
  Confirmation Summary dialog sebelum scheduling. Connected accounts masih
  mock data — `OUTSTAND_API_KEY`/`OUTSTAND_WEBHOOK_SECRET` belum tersedia,
  sehingga Save as Draft / Schedule hanya menampilkan notice mock, belum
  persist ke database. Halaman placeholder Drafts kini link ke editor ini
  via CTA New Post. Persistensi nyata + integrasi `OutstandAdapter` adalah
  follow-up ADR-040.
* Dev config: `next.config.ts` — `allowedDevOrigins` menambahkan hostname
  tunnel ngrok untuk uji lokal (nilai efemeral, perlu diupdate manual saat
  domain tunnel berubah).
* **M8 — Publishing MVP: persistensi nyata "Save as Draft" selesai:**
  `PublishingService.saveDraft()` (domain layer, diuji unit dengan fake
  repository) + `publishingRepository.createDraft()` (implementasi Prisma
  untuk `IPublishingRepository`, pola sama dengan `lib/repositories/
  workspace`) + `saveDraftAction` di `/publish/drafts/new` yang me-resolve
  session + workspace by slug lalu memanggil `PublishingService`. Tombol
  "Save as Draft" di Draft Editor kini persist ke database nyata (bukan
  mock notice) — diverifikasi via browser (ngrok tunnel) dan cek langsung
  row di Supabase. "Schedule" tetap mock sampai `OutstandAdapter`/kredensial
  Outstand siap (di luar scope ini).
* **ADR-046 — implementasi routing (Home/Engage/Settings & Publish, semua
  final):** `[slug]/home` → `[slug]`, `engage/inbox` → `engage`,
  `settings/general` → `settings` — ketiganya render langsung di root,
  final. Redirect target di `app/page.tsx`, `onboarding/actions.ts`,
  `onboarding/page.tsx` diupdate dari `/${slug}/home` → `/${slug}`.
  `WorkspaceSideNav` — href Home ke root workspace, `isSelected` Home pakai
  exact match (bukan `startsWith`, karena semua route lain juga diawali
  `/${slug}`). Publish sempat ikut pola yang sama (`publish/calendar` →
  `publish`), tapi ditemukan `/publish/calendar` tertangkap salah oleh
  `publish/[postId]` — di-revert jadi `publish/page.tsx` redirect ke
  `/publish/calendar` (`calendar/` dihidupkan lagi). Diverifikasi live via
  ngrok tunnel (akun test Raka Pratama): `/insvire`, `/insvire/publish`
  (redirect ke `/insvire/publish/calendar`), `/insvire/engage`,
  `/insvire/settings` semua bekerja tanpa 404; `/insvire/engage/inbox` dan
  `/insvire/settings/general` (path lama) terkonfirmasi 404 bersih.
  typecheck/lint/test hijau di setiap tahap.
* **ADR-046 Amandemen Final (2026-07-29) — bentuk final `/publish`
  diputuskan:** state interim di atas diformalkan sebagai keputusan
  **permanen**, bukan sekadar sementara. `/{slug}/publish` tetap redirect
  ke `/{slug}/publish/calendar`; `calendar/` (+ `calendar/[postId]`) tetap
  jadi folder statis. Publish dikecualikan permanen dari pola root-render
  ADR-046 karena satu-satunya section dengan sibling route dinamis
  (`[postId]`) di level root. Dua alternatif dipertimbangkan dan ditolak:
  root-render + rename `[postId]` ke path lain, dan root-render +
  `[postId]` sebagai intercepting/parallel route (modal) — keduanya
  menambah kompleksitas tanpa manfaat sepadan. Tidak ada perubahan kode;
  hanya dokumentasi (`DECISIONS.md`, `monorepo-setup.md`,
  `application-layer.md`) yang disinkronkan. Tidak ada task lanjutan yang
  menggantung untuk topik ini.
* **App Prototype Claude Design — fix navigasi back Draft Editor +
  role switcher:** ditemukan tombol "Kembali ke Calendar" di Draft Editor
  selalu paksa balik ke Calendar walau dibuka dari Queue/Drafts —
  bertentangan `navigation-patterns.md` (NP-D02). Diperbaiki jadi
  stack-aware (balik ke asal sebenarnya) + label ikut menyesuaikan. Role
  switcher baru (Owner/Admin/Manager/Creator, dipetakan ke persona
  Dimas/Maya/Raka/Sinta) ditambahkan di toolbar prototype, mendemokan
  pembatasan akses per role dari `roles-permissions.md` di 4 layar: Draft
  Editor (Schedule vs Kirim untuk Review), Engage (lock untuk Creator),
  Connected Accounts (read-only untuk Manager/Creator), Analyze Dashboard
  (detail disembunyikan untuk Creator). Owner dan Admin saat ini identik
  secara visual di prototype (beda asli ada di layar Settings lain yang
  belum jadi bagian 8 KSP screen).
* **ADR-047 — Publish Now diangkat jadi fitur UX resmi:** audit
  konsistensi (dipicu saat kerja App Prototype) menemukan
  `application-layer.md` sudah menyebut method `publishNow` tapi UX
  Baseline (`key-screen-patterns.md`) dan `roles-permissions.md` sama
  sekali tidak mengenal konsep ini. Diputuskan: Publish Now jadi fitur
  resmi (KSP-05-F12, bullet baru di `mvp-definition.md`), akses dibatasi
  **identik** dengan Schedule (Owner/Admin/Manager, bukan Creator) —
  konsisten dengan pola akses konten yang sudah ada, bukan tingkat akses
  baru. Baris transisi `Draft → Published (Publish Now)` ditambahkan ke
  tabel transisi status. Dokumentasi baseline sudah diselaraskan;
  **implementasi kode dan App Prototype belum berjalan** — lihat Next
  Tasks.
* **Audit Safety Check / Double Confirmation seluruh aksi produk:**
  dipicu diskusi Publish Now, ditemukan cuma 1 pola konfirmasi
  terdokumentasi (Confirmation Summary, Schedule/Publish Now) dari
  belasan aksi yang ada. Ditemukan juga kalimat usang di
  `key-screen-patterns.md` yang mengklaim Schedule sebagai "satu-satunya
  momen" konfirmasi — sudah diperbaiki jadi "satu-satunya pola" mengingat
  sekarang dipakai 2 aksi.
* **ADR-048 — Disconnect Account wajib dialog konfirmasi:** dari audit di
  atas, Disconnect Account (KSP-08-F05) ternyata sama sekali tidak punya
  spesifikasi konfirmasi walau screen-nya sudah ada (beda dari Remove
  Member/Transfer Ownership/Delete Workspace yang screen-nya belum
  pernah dirancang). Fungsi baru KSP-08-F07 (Disconnect Confirmation) +
  "Pola: Disconnect Flow" + KSP-D14 ditambahkan — dialog peringatan
  ringkas (bukan Confirmation Summary), mengingatkan post terjadwal tetap
  di antrean (KSP-D09). Tidak ada perubahan RBAC. Implementasi App
  Prototype dan kode belum berjalan.
* **ADR-049 — Safety Check / Double Confirmation, kebijakan lintas
  produk:** kerangka resmi (kriteria: irreversibel/mahal dibatalkan +
  blast radius besar) + 2 tier (Tier 1: konfirmasi diperkuat — Transfer
  Ownership, Delete Workspace; Tier 2: dialog standar — Delete Post,
  Delete Media, Remove Member, Update Member Role, Cancel Schedule,
  **Logout**). Diklasifikasikan sebagai pola lintas layar baru di
  `key-screen-patterns.md`, bukan UXP baru (ux-principles.md membatasi
  diri ke 7 prinsip bertelusur insight). Logout dipindah user ke Tier 2
  (beda dari rekomendasi awal). Ditemukan juga: `deleteWorkspace` dan
  `transferOwnership` **belum punya method service sama sekali** di
  `application-layer.md` — gap terpisah (diselesaikan di ADR-050 di
  bawah). Implementasi belum berjalan untuk seluruh aksi yang baru
  diklasifikasikan (kecuali 3 yang sudah ada: Schedule, Publish Now,
  Disconnect Account).
* **ADR-050 — Transfer Ownership & Delete Workspace, method service
  ditambahkan:** `deleteWorkspace` (Owner saja, cascade sesuai constraint
  DB yang sudah ada, konfirmasi Tier 1) ditambahkan langsung tanpa
  ambiguitas. `transferOwnership` ternyata punya fork nyata yang belum
  pernah diputuskan (langsung vs butuh persetujuan target) — user
  memilih **dua langkah**: `transferOwnership` (Owner memicu, set
  `pendingOwnerTransferTo`, kirim notifikasi) + `acceptOwnershipTransfer`
  (Admin target menerima, baru role bertukar), mirip pola
  `inviteMember`/`acceptInvite` yang sudah ada. Field baru
  `Workspace.pendingOwnerTransferTo` (`domain-model.md` DM-D11,
  `database-strategy.md`), 2 `NotificationType` baru. Method service
  sekarang lengkap — **UI/screen Workspace Settings → General masih
  belum dirancang**, jadi implementasi tetap menunggu.
* **Astryx agent docs resmi menggantikan workflow manual:** ditemukan
  section "Workflow Astryx wajib" di `AGENTS.md` adalah tulisan manual
  (dibuat saat ADR-041), bukan output CLI resmi. Digenerate ulang via
  `astryx init --features agents --agent claude` → `apps/web/.claude/
  CLAUDE.md` (component index 153 komponen, workflow `build → template →
  component`, aturan styling/token, semua ditarik dari CLI v0.1.8
  ter-pin, regenerate in-place setelah upgrade). `AGENTS.md` (rule #12 +
  section workflow + mapping table) dan `DEVELOPER_WORKFLOW.md`
  diperbarui untuk menunjuk ke file ini.
* **MCP server Astryx (`xds`) ditambahkan:** `.mcp.json` baru di root,
  menunjuk ke `https://astryx.atmeta.com/mcp` — expose `search`/`get` untuk
  lookup komponen tanpa shell out ke CLI. `AGENTS.md` diberi catatan:
  MCP untuk exploration, CLI lokal v0.1.8 tetap jadi sumber final karena
  server MCP menunjuk versi live yang bisa beda dari yang ter-pin.
* **ADR-051 — Claude Design: kebijakan fidelitas Astryx (foundations +
  component library) selesai:** `foundations/` (color, type, layout) dan
  `components/` (buttons, cards, dialog, forms, navigation, status-chips,
  table) di project Claude Design ditulis ulang total — setiap warna,
  radius, shadow, spacing, ukuran, dan tipografi sekarang disalin langsung
  dari `@astryxdesign/core@0.1.8` + `@astryxdesign/theme-neutral@0.1.8`
  (bukan CSS buatan tangan), diverifikasi via `bunx astryx docs <topic>`
  dan swizzle sementara (dihapus segera setelah dibaca). Tiap file
  component library mencantumkan anotasi komponen+props Astryx asli yang
  direplikasi. Accent berubah dari placeholder rekaan (#48517A) ke accent
  neutral theme asli (#262626, near-black; tetap placeholder brand per
  ADR-038/041). 6 status konten dipetakan ke varian `Badge` asli
  (neutral/warning/info/purple/success/error). `AppShell` dipetakan ke
  `variant="section"` untuk mempertahankan arah hairline-divider yang
  sudah ada. Diverifikasi visual via browser (server statis sementara,
  dihapus setelah verifikasi) sebelum push ke Claude Design via
  `DesignSync`.
* **ADR-051 lanjutan — migrasi `templates/` selesai:** 13 layar (8 KSP + 5
  Auth) dan App Prototype ditulis ulang mengikuti token Astryx asli
  langsung (tanpa alias). Ditemukan `thumbnail.html` sempat rusak sejak
  push pertama ADR-051 — mereferensikan `--status-failed-bg`/
  `--status-published-bg` yang sudah dihapus dari sistem token baru —
  sudah diperbaiki ke `--color-error`/`--color-success`. Ditemukan juga
  alias singkatan `--text-xs/-sm/-lg` (bukan nama token Astryx asli)
  masih dipakai aktif di banyak file — diganti ke nama asli
  (`--font-size-sm`/`--font-size-lg`) di seluruh project, baru kemudian
  seluruh blok "Legacy aliases" di `styles.css` dihapus total — tidak ada
  lagi nama token buatan sendiri di project ini.
* **Claude Design — 3 gap Critical Function vs 04-ux baseline
  diperbaiki:** ditemukan saat audit sinkronisasi (lihat entri di atas),
  langsung diimplementasikan di Claude Design atas permintaan user.
  **KSP-01-F05** — item Today's Schedule/Recent Activity di-wire ke
  Draft Editor/Calendar, Engagement Snapshot ke Engage, Analytics
  Snapshot ke Analyze (class semantik baru `.home-schedule`/
  `.home-activity`/`.home-engagement`/`.home-analytics` + handler baru
  di `AppPrototype.dc.html`). **KSP-03-F05** — tombol reorder ↑/↓ di
  tiap `queue-row` (`publish-queue.html`), menukar posisi DOM dengan
  baris tetangga saat diklik. **KSP-06-F02** — 3 select filter (Akun/
  Platform/Status) ditambahkan di `engage-inbox.html` dengan
  `data-platform`/`data-status` per thread, filtering client-side via
  `applyEngageFilter()` di App Prototype (termasuk empty-state "Tidak
  ada interaksi untuk filter ini" sesuai State Handling KSP-06).
* **Design-sync: kode `apps/web` disamakan dengan Claude Design (arah
  kebalikan ADR-051) selesai:** Draft Editor (Card wrapper section form
  dihapus, `FileInput` dropzone asli menggantikan tombol disabled, Schedule
  Date+Time sejajar, action bar full-width via `StackItem`), Publish tabbar
  baru (`publish-tabbar.tsx`, shared di `publish/layout.tsx`, tidak
  menyentuh logic 3 placeholder tab lain), Drafts List (page-head + Card
  wrap), Sidebar (`IconButton` notifikasi ke `/account/notifications`).
  Auth screens (Login/Register/Forgot/Reset) diperiksa detail — sudah
  selaras, tidak ada perubahan kode. Murni visual/structural — Publish Now
  dan AI Caption Assist sengaja tidak ditambahkan (tunggu ADR-047 & AI
  Assistant domain). Diverifikasi typecheck/lint hijau + browser end-to-end
  lewat tunnel ngrok (tabbar, FileInput disabled state, "Save as Draft"
  tetap persist tanpa regresi, notifikasi navigasi benar).
* **ADR-052 Tahap 3 — implementasi kode Draft Editor sebagai modal
  selesai:** New Post & Edit Draft kini `Dialog variant="fullscreen"` +
  `Layout` (header/content/footer, pola `DialogFullscreenDialog` Astryx) di
  `apps/web/src/app/[slug]/publish/_draft-editor/` (`context.tsx` — React
  Context `DraftEditorProvider`/`useDraftEditor`, `modal.tsx`, `actions.ts`,
  `status-badge.ts`), dipasang di `publish/layout.tsx` supaya modal
  tampil di atas Calendar/Queue/Drafts manapun tanpa navigasi URL (NP-D11).
  Route lama dihapus total: `drafts/new/`, `[postId]/` di
  `calendar`/`queue`/`drafts` — **tidak** termasuk `history/[postId]`
  (di luar scope, sesuai ADR-052). Domain `publishing` diperluas:
  `listDrafts`, `getDraftById`, `updateDraft` (+ `updatedAt` di
  `PublishingPostRecord`) — Drafts List (`/publish/drafts`) sekarang
  menampilkan data asli dari database (bukan `EmptyState` statis lagi),
  tiap row klik membuka Edit Draft dengan caption ter-isi dari server.
  Resume Unfinished Post (KSP-05-F13, localStorage, New Post saja)
  berfungsi nyata. **Penyimpangan sengaja dari mockup Claude Design:**
  tombol "Publish Now" di footer **tidak** ikut diimplementasikan — ADR-047
  mendokumentasikannya sebagai task terpisah yang belum disetujui untuk
  dikerjakan; footer tetap 2 tombol (Save as Draft, Schedule) sama seperti
  sebelumnya. Toggle Fullscreen/Standard di Claude Design juga sengaja
  tidak ikut ke kode (murni alat banding internal, bukan bagian keputusan
  final — default Fullscreen sudah dikunci). Diverifikasi end-to-end via
  browser lewat tunnel ngrok (akun test Raka Pratama): New Post → Save as
  Draft → close → draft muncul di list → klik row → Edit Draft dengan data
  server → edit + save → update di tempat (tidak duplikat) → Resume
  Unfinished Post dialog muncul benar saat New Post kosong sebelumnya
  ditutup tanpa disimpan. `bun run typecheck`/`lint`/`test` (26 test)
  hijau. Ditemukan & diperbaiki di tengah verifikasi: Drafts List tidak
  ter-refresh otomatis setelah modal ditutup (Server Component page tidak
  tahu ada perubahan) — ditambahkan `router.refresh()` setelah Save as
  Draft berhasil.

---

# In Progress

* **Publishing MVP — sisa persistensi nyata:** "Save as Draft" sudah persist
  ke database; task berikutnya adalah menyambungkan "Schedule" ke database
  nyata (status transition draft → scheduled) dan integrasi `OutstandAdapter`
  (ADR-040).
* Template `design-tokens.md` sudah disiapkan (status Draft / TBD); nilai final
  diisi setelah feature selesai dan designer masuk (ADR-041 mengamendemen urutan
  kerja ADR-038).

---

# Next Tasks

* **M8 — Development:** auth flows UI, workspace onboarding, App Shell, Draft Editor (kini modal, ADR-052), persistensi "Save as Draft"/"Edit Draft", dan Drafts List data asli selesai; lanjut ke persistensi "Schedule" + integrasi Outstand sesuai baseline + `context/`.
* **Publishing MVP — sisa persistensi nyata:** sambungkan "Schedule" di Draft Editor (modal New Post/Edit Draft) ke database — status transition draft → scheduled — menggantikan mock notice saat ini.
* **Publish Now (ADR-047) — implementasi menyusul, belum ada di kode maupun App Prototype:** `PublishingService.publishNow()` (RBAC Owner/Admin/Manager, validasi `ContentFormat` ADR-039, panggil `OutstandAdapter`) + tombol "Publish Now" di Draft Editor (KSP-05-F12) berdampingan dengan Schedule + dialog Confirmation Summary variannya (UXP-04); App Prototype Claude Design juga perlu ditambahkan tombolnya (role switcher yang sudah ada tinggal dipakai untuk membatasi visibility Creator).
* **Disconnect Confirmation (ADR-048) — implementasi menyusul:** dialog konfirmasi (KSP-08-F07) di `settings-connected-accounts.html` App Prototype + `disconnectAccount` di kode nyata (RBAC Owner/Admin, belum ada perubahan RBAC — tinggal tambah gate konfirmasi sebelum memanggil service).
* **(Ditunda, scope terpisah) Remove Member, Transfer Ownership, Delete Workspace:** tier konfirmasi sudah diputuskan (ADR-049) dan method service `deleteWorkspace`/`transferOwnership`/`acceptOwnershipTransfer` sudah lengkap di `application-layer.md` (ADR-050) — yang masih kurang cuma **screen Workspace Settings → Members/General** (di luar 8 KSP), belum pernah dirancang. Perlu sesi terpisah untuk merancang layar sebelum implementasi kode/App Prototype bisa mulai.
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
* **Setelah feature selesai dan design UI di-approve:** isi nilai di
  `product-discovery/06-engineering/design-tokens.md` (ganti `TBD`), ubah status
  → Locked, lalu mirror ke Astryx theme + Tailwind token bridge (ADR-038,
  ADR-041).
* (Opsional) Perkaya aturan coding di `context/ctx-development.md` saat konvensi baru muncul dari praktik M8.
* (Opsional) initial git commit — menunggu instruksi eksplisit.
* (Opsional) pilih transactional email provider (AS-D04) saat butuh verification / password reset.

---

# Known Issues

* **Dependency terbuka — Transactional Email Provider.** Password reset & email verification (Better Auth) membutuhkan email provider yang belum ditetapkan (kandidat: Resend, Postmark, AWS SES, SMTP Supabase). Dicatat di `auth-strategy.md` (AS-D04). `requireEmailVerification` dinonaktifkan sementara di skeleton. Tidak memblokir M8 awal.
* **Belum ada commit awal.** Repo sudah `git init` (branch `main`); working tree belum di-commit — commit awal menunggu instruksi eksplisit.
* **RLS SQL policies** belum digenerate di migrasi awal — ditambahkan saat jalur server set `app.current_user_id` diimplementasi (DO-D06).
* **Runtime ADR-040 belum diimplementasikan.** Alignment dokumentasi dan
  schema/migration sudah selesai, tetapi handler webhook, durable ingestion,
  retry internal, media upload Outstand, engagement sync/reply, dan reconnect
  flow masih task M8.
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

---

# Blockers

Tidak ada blocker saat ini.

---

# Recent Decisions

* ADR-052 addendum — Governance: skill `.claude/skills/claude-design-scope-discipline/SKILL.md` dibuat dari insiden retrospektif (AI diam-diam mengubah default Fullscreen→Standard saat menambah toggle pembanding, sudah dikoreksi saat itu juga, sekarang dijadikan aturan pencegahan permanen). Ditempatkan sebagai skill khusus + `ctx-design.md` (bukan `PROJECT_RULES.md` yang lebih luas dari kebutuhan) karena hanya Claude Code yang punya akses `DesignSync`; `AGENTS.md` dapat satu baris pointer sebagai entry point wajib (2026-07-30).
* ADR-052 — Draft Editor (New Post & Edit Draft) jadi modal overlay
  fullscreen, mengoverride NP-D02: motivasi kecepatan alur kerja, trade-off
  kehilangan konteks Calendar/Queue diterima sadar oleh user. Route lama
  dihapus total (modal-only), Context state biasa (bukan intercepting
  route). Resume unsaved state (localStorage) **hanya untuk New Post**,
  tidak untuk Edit Draft. Urutan kerja: dokumentasi (selesai) → Design
  System → implementasi kode (2026-07-30).
* ADR-051 — Claude Design: kebijakan fidelitas Astryx (foundations +
  component library + templates, selesai penuh): setiap nilai visual di
  seluruh project (13 file foundations/component library + 13 layar +
  App Prototype) disalin dari `@astryxdesign/core@0.1.8` +
  `@astryxdesign/theme-neutral@0.1.8` asli (bukan buatan tangan),
  dianotasikan ke komponen+props Astryx yang direplikasi. Accent berubah
  ke accent neutral theme asli (near-black). Status konten dipetakan ke
  varian `Badge` asli. `AppShell variant="section"` dipilih untuk
  mempertahankan arah hairline-divider. Blok "Legacy aliases" di
  `styles.css` sudah dihapus total — tidak ada lagi nama token buatan
  sendiri. `thumbnail.html` yang sempat rusak (referensi token yang sudah
  dihapus) sudah diperbaiki (2026-07-29).
* ADR-050 — Transfer Ownership & Delete Workspace, method service
  ditambahkan: `deleteWorkspace` (Owner, cascade DB, Tier 1) sederhana
  tanpa ambiguitas. `transferOwnership` jadi proses **dua langkah** —
  Owner memicu, Admin target harus `acceptOwnershipTransfer` sebelum
  role bertukar (mirip `inviteMember`/`acceptInvite`) — user menolak opsi
  "langsung tanpa persetujuan" demi keamanan tambahan. Field baru
  `Workspace.pendingOwnerTransferTo` + 2 NotificationType baru. UI/screen
  masih belum dirancang — ADR ini menyelesaikan kontrak arsitektur saja
  (2026-07-29).
* ADR-049 — Safety Check / Double Confirmation, kebijakan lintas produk:
  kriteria (irreversibel/mahal dibatalkan + blast radius besar), 2 tier
  (Tier 1: Transfer Ownership, Delete Workspace; Tier 2: Delete
  Post/Media, Remove Member, Update Role, Cancel Schedule, Logout).
  Didokumentasikan sebagai pola lintas layar di `key-screen-patterns.md`,
  bukan UXP baru. Logout dipindah ke Tier 2 atas keputusan user (beda
  dari rekomendasi awal). `deleteWorkspace`/`transferOwnership` ditemukan
  belum punya method service — gap terpisah (2026-07-29).
* ADR-048 — Disconnect Account wajib dialog konfirmasi: fungsi baru
  KSP-08-F07 (Disconnect Confirmation) — peringatan ringkas sebelum
  eksekusi, mengingatkan post terjadwal tetap di antrean (KSP-D09).
  Ditemukan saat audit Safety Check/Double Confirmation seluruh aksi
  produk (dipicu diskusi Publish Now). Tidak ada perubahan RBAC. Remove
  Member/Transfer Ownership/Delete Workspace sengaja tidak disentuh —
  screen-nya belum pernah dirancang, ditunda ke inisiatif terpisah
  (2026-07-29).
* ADR-047 — Publish Now diangkat jadi fitur UX resmi: `Draft → Published`
  langsung tanpa jadwal, akses dibatasi identik dengan Schedule
  (Owner/Admin/Manager, bukan Creator) — konsisten dengan pola akses
  konten yang sudah ada di `roles-permissions.md`, bukan tingkat akses
  baru. KSP-05 dapat function ID baru (KSP-05-F12). Ditemukan saat audit
  konsistensi App Prototype: `application-layer.md` sudah menyebut method
  `publishNow` tanpa desain UX resmi. Dokumentasi baseline diselaraskan;
  implementasi kode + App Prototype masih task terpisah (2026-07-29).
* ADR-046 Amandemen Final — bentuk final `/publish` diputuskan: redirect
  **permanen** ke `/publish/calendar` (`calendar/` tetap folder statis
  permanen). Publish dikecualikan permanen dari pola root-render ADR-046
  karena satu-satunya section dengan sibling route dinamis (`[postId]`) di
  root — root-render di sana akan menangkap path lama secara salah.
  Alternatif root-render + rename `[postId]`, dan root-render +
  intercepting route, ditolak (kompleksitas tidak sepadan). Tidak ada
  perubahan kode, hanya memformalkan interim jadi final (2026-07-29).
* ADR-046 — Routing convention: default/single view section (Home,
  Publish→Calendar, Engage→Inbox, Settings→General) render langsung di
  `page.tsx` root path section, bukan named child segment. Menghapus
  `/home`, `/publish/calendar`, `/engage/inbox`, `/settings/general` dari
  routing structure. Menutup celah 404 sistemik yang ditemukan di root
  workspace + 3 section sekaligus. Dokumentasi (`monorepo-setup.md`,
  `application-layer.md`) sudah diselaraskan; **implementasi kode selesai**
  di branch `feat/adr-046-routing-default-view` dan diverifikasi live lewat
  ngrok tunnel (2026-07-28). Publish kemudian dikecualikan permanen — lihat
  ADR-046 Amandemen Final (2026-07-29) di atas.
* ADR-045 — Hapus folder `design/` (belum ada designer aktif); pointer
  project Claude Design dipindah ke `context/ctx-design.md`. Tidak mengubah
  ADR-038 (SoT token) maupun ADR-042 (Claude Design sebagai handoff tool) —
  hanya mencabut keberadaan folder itu sendiri (2026-07-28).
* ADR-044 — Rename env var client-side Supabase:
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
  mengikuti sistem API key baru Supabase (publishable/secret key
  menggantikan anon/service_role secara bertahap); tidak ada perubahan
  behavior (2026-07-24).
* ADR-043 — API mobile-ready via Route Handler `/api/v1` (Next.js App
  Router) di atas Application Service yang sama dengan web; tidak ada
  backend terpisah. Better Auth Bearer plugin untuk auth mobile
  (menggantikan cookie session), workspace context eksplisit per
  path/header, versioning `/api/v1`→`/api/v2` untuk breaking change, dan 4
  syarat keamanan wajib (secure device storage, `trustedOrigins` custom
  scheme, keputusan session expiry mobile, `rateLimit.customRules` per
  endpoint). Fondasi disiapkan sebelum M8 berjalan jauh; endpoint mobile
  aktual dikerjakan setelah MVP web selesai (2026-07-24).
* ADR-042 — Claude Design menggantikan Figma sebagai design handoff tool;
  project `Social Media Management` (`84aded99-bb23-49b1-be9f-dd8f21c6873e`)
  berisi token neutral, foundations, components, dan 8 layar KSP; sinkronisasi
  dengan `product-discovery/` bersifat manual/on-request, bukan otomatis
  (2026-07-24).
* ADR-041 — Astryx menggantikan shadcn/ui sebagai fondasi komponen permanen;
  neutral theme dipakai selama feature development, Tailwind dibatasi ke
  layout, wrapper selektif, designer masuk setelah feature selesai, dan risiko
  Beta diterima dengan exact pin + smoke test (2026-07-23).
* ADR-040 — kontrak resmi Outstand: webhook
  `post.published`/`post.error`/`account.token_expired`,
  durable-before-ACK + retry internal, Engagement komentar/reply via sync 30
  menit + manual refresh tanpa DM/webhook engagement, Supabase original +
  Outstand media working copy, dan X BYOK manual di dashboard Outstand
  (2026-07-23).
* ADR-039 — Content Format (Post/Reel/Story/Pin) masuk MVP Publishing; format per `PostTarget`; matriks platform + Outstand ACL (2026-07-21).
* ADR-038 + ADR-041 — SoT design tokens tetap di
  `product-discovery/06-engineering/design-tokens.md`; neutral theme Astryx
  dipakai selama M8 dan nilai final diisi setelah feature selesai serta designer
  masuk; folder `design/` sudah dihapus (ADR-045), tidak pernah jadi SoT token.
* ADR-037 — Perluasan aditif `SocialPlatform`: Threads & Pinterest ditambah; Twitter/X & LinkedIn tetap. Daftar resmi: Instagram, Facebook, Twitter/X, LinkedIn, TikTok, YouTube, Threads, Pinterest (2026-07-21).
* AI Context — opsi A: pertahankan 8 `ctx-*.md`; Product+User di `ctx-business`; UX di `ctx-design`; coding rules di `ctx-development` + pola fitur di `ctx-implementation` (2026-07-17).
* M7 — Prisma **7.x**: URL di `prisma.config.ts` (`DIRECT_URL`) + runtime adapter (`DATABASE_URL`); semantik DO-D04 tetap (2026-07-17).
* M7 — DX-D06/DX-D07: Vitest di root; Lefthook via `prepare` (2026-07-17).
* M7 — Lokasi env file: `apps/web/` (EM-D04 dikunci; Architecture README tidak mengatur lokasi env).
* ADR-025 — System Architecture Baseline v1.0 ditetapkan: product-discovery/05-architecture/ (2026-07-15).
* ADR-026 — Monorepo Workspace Layout: apps/web, packages/shared, domain modules di src/domains/ (2026-07-15).
* ADR-027 — Amandemen ADR-014: pengecualian penamaan tabel aggregate root (`workspaces`, `notifications`) (2026-07-15).
* ADR-028 — Deployment Region: Singapore/SEA, Railway + Supabase co-located (2026-07-17).
* ADR-029 — Environment Topology: Production + Staging dengan Supabase project terisolasi (2026-07-17).
* ADR-030 — Auth Implementation: Better Auth config + Supabase JWT integration untuk Realtime (2026-07-17).
* ADR-031 — Database Access: Prisma sebagai ORM formal; amandemen ADR-017 (2026-07-17).
* ADR-032 — CI/CD: GitHub Actions gates + Railway deploy + migrate on release (2026-07-17).
* ADR-033 — Environment Management: Supabase Cloud-first, native secrets, project `social-media-local` (2026-07-17).
* ADR-034 — DX Tooling: ESLint + Prettier, Lefthook + lint-staged, Vitest (2026-07-17).
* ADR-035 — Dependency Strategy: caret ranges, manual updates, root lockfile rules (2026-07-17).
* ADR-036 — Engineering Planning Baseline v1.0 ditetapkan: product-discovery/06-engineering/ (2026-07-17).

Lihat `DECISIONS.md` untuk daftar selengkapnya.

---

# Related Documents

* PROJECT_OVERVIEW.md
* ARCHITECTURE_OVERVIEW.md
* PROJECT_RULES.md
* DECISIONS.md
* ../product-discovery/06-engineering/
* ../product-discovery/05-architecture/
* ../product-discovery/04-ux/
