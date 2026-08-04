# v0.1 — Foundation

> Bagian dari backlog berjenjang. Indeks + legend status: [`../TASKS.md`](../TASKS.md).

**Tujuan rilis:** Membangun fondasi aplikasi.
**Baseline rilis:** `product-discovery/02-product/release-roadmap.md` → v0.1

---

## Project Setup

### T-001 · Monorepo, tooling, dan CI

`✅ Done` · **ADR** ADR-001, ADR-002, ADR-026, ADR-032, ADR-034, ADR-035

Bun + Next.js 16 + Astryx, workspace `apps/web` + `packages/shared`, ESLint/Prettier, Lefthook + lint-staged, Vitest, GitHub Actions gates.

### T-002 · Prisma schema + migrasi awal

`✅ Done` · **ADR** ADR-014, ADR-027, ADR-031, ADR-033

22 model dengan domain prefix, 4 migrasi. Kode: `apps/web/prisma/schema.prisma`.

> ⚠️ Schema jauh mendahului kode — 15 dari 22 model belum punya repository/service. Ini disengaja (schema-first), bukan utang.

---

## Authentication

### T-003 · Better Auth core config

`✅ Done` · **ADR** ADR-024, ADR-030

`prismaAdapter`, email/password, Google social provider, session 7 hari, auth guard di `proxy.ts`. Kode: `apps/web/src/lib/better-auth/`.

### T-004 · Auth screens (login / register / forgot / reset)

`✅ Done` · **ADR** ADR-024

Empat halaman + form fungsional memanggil `authClient`. Kode: `apps/web/src/app/(auth)/`.

> ⚠️ Uji interaksi form penuh di browser lewat tunnel ngrok masih terhambat — lihat T-017.

### T-005 · Email verification flow

| Field         | Value                                                                 |
| ------------- | --------------------------------------------------------------------- |
| **Status**    | 🚫 Blocked                                                             |
| **Domain**    | identity                                                              |
| **ADR**       | —                                                                     |
| **Depends**   | T-003 ✅                                                               |
| **Blocker**   | Transactional email provider belum ditetapkan (AS-D04)                |
| **Baca dulu** | `06-engineering/auth-strategy.md` (AS-D04) · `05-architecture/auth-architecture.md` |

Aktifkan verifikasi email + password reset yang benar-benar mengirim email. Saat ini `sendResetPassword` hanya `console.log` link dan `requireEmailVerification` dinonaktifkan.

- [ ] **T-005.1** Pilih provider (kandidat: Resend, Postmark, AWS SES, SMTP Supabase) → butuh ADR baru
- [ ] **T-005.2** Konfigurasi provider + env var di `environment-management.md`
- [ ] **T-005.3** Implementasi `sendResetPassword` + `sendVerificationEmail` nyata
- [ ] **T-005.4** Halaman `verify-email` + state "menunggu verifikasi"
- [ ] **T-005.5** Aktifkan `requireEmailVerification: true`

---

## Workspace & Members

### T-006 · Workspace creation + onboarding

`✅ Done` · **ADR** ADR-018

`WorkspaceService.createWorkspace` (slugify + retry slug), halaman `/onboarding`, resolve default workspace di root. Kode: `apps/web/src/domains/workspace/`.

### T-007 · Members management (invite / remove / update role)

| Field         | Value                                                              |
| ------------- | ------------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                      |
| **Domain**    | workspace                                                          |
| **ADR**       | ADR-012 (roles), ADR-049 (konfirmasi Remove Member & Update Role)  |
| **Depends**   | T-006 ✅, T-005 (invite butuh email)                                |
| **Baca dulu** | `02-product/roles-permissions.md` · `05-architecture/application-layer.md` |

Screen Workspace Settings → Members. Disepakati **desain minimal dulu**: cukup daftar anggota + Remove Member, tanpa manajemen anggota lengkap.

- [ ] **T-007.1** `WorkspaceService.inviteMember` + `removeMember` + `updateMemberRole` (RBAC Owner/Admin)
- [ ] **T-007.2** Repository method + migrasi tabel invitation (jika perlu)
- [ ] **T-007.3** Server Actions + validasi RBAC di application layer
- [ ] **T-007.4** UI daftar anggota di `/settings/members` (Astryx Table)
- [ ] **T-007.5** Dialog konfirmasi Remove Member + Update Member Role (ADR-049 Tier 2)

### T-008 · Workspace Settings — General + Danger Zone

| Field         | Value                                                     |
| ------------- | --------------------------------------------------------- |
| **Status**    | ⏳ Not Started                                             |
| **Domain**    | workspace                                                 |
| **ADR**       | ADR-049, ADR-050                                          |
| **Depends**   | T-006 ✅, T-007 (transfer butuh daftar anggota)             |
| **Baca dulu** | `05-architecture/application-layer.md` (method sudah lengkap) |

Screen di luar 8 KSP — disepakati **desain minimal**: cukup "Danger Zone" untuk Transfer Ownership + Delete Workspace. Sesi desain (Neymar) belum dimulai.

- [ ] **T-008.1** Sesi desain Claude Design: Workspace Settings → General + Danger Zone
- [ ] **T-008.2** `deleteWorkspace` (RBAC Owner) + dialog konfirmasi Tier tertinggi
- [ ] **T-008.3** `transferOwnership` + `acceptOwnershipTransfer` (proses dua langkah, ADR-050)
- [ ] **T-008.4** UI Danger Zone + rename workspace

---

## Navigation & App Shell

Turunan `04-ux/navigation-patterns.md` (NP-D01 Persistent Sidebar) dan `04-ux/information-architecture.md`.

### T-009 · App Shell + sidebar navigation

`✅ Done` · **ADR** ADR-041, ADR-046

`AppShell` Astryx + `WorkspaceSideNav` (5 nav item, footer notif/theme/profile dropdown + logout). Kode: `apps/web/src/app/[slug]/`.

### T-010 · Light/Dark mode toggle

`✅ Done` · **ADR** ADR-055 (override "neutral theme selama M8" di ADR-041)

Toggle di sidebar footer + theme provider, persistensi lintas reload via cookie
`theme` (non-httpOnly, `path=/`, `max-age` 1 tahun, `SameSite=Lax`) yang dibaca
RSC di `apps/web/src/app/layout.tsx` sebelum render pertama sehingga tidak ada
flash tema salah. Helper + fallback: `apps/web/src/lib/theme/theme-cookie.ts`.
Sisi desain sudah selaras — toggle ada di `components/navigation.html` Claude
Design, sama seperti yang sudah lebih dulu ada di `templates/`.

Verifikasi: pemeriksaan otomatis (`typecheck`/`lint`/`test`) dan implementasi
server-side (baca cookie di RSC sebelum render) sudah diverifikasi; alur UI
(klik toggle di sidebar footer → cookie tertulis) belum diuji lewat browser
karena butuh login — perlu dicek King Rezi saat login.

### T-011 · Sidebar CTA "+ New Post" (pinned)

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | 🟡 In Progress                                               |
| **Domain**    | UI                                                           |
| **ADR**       | ADR-053                                                      |
| **Depends**   | T-009 ✅ · T-020 ✅ (Draft Editor modal, v0.2)                  |
| **Baca dulu** | `04-ux/navigation-patterns.md` (NP-D01) · Claude Design → `components/navigation.html` |

CTA primary full-width di bawah Workspace Selector, di atas navigation items — membuka Draft Editor modal dari section manapun. **Sudah diimplementasikan di Claude Design, belum di kode.**

- [x] **T-011.1** Render CTA di `WorkspaceSideNav` pada posisi yang sudah ditetapkan ADR-053: **di bawah Workspace Selector, di atas navigation items**, primary + full-width (varian Astryx-nya cek di Claude Design) — dipasang di slot `topContent` milik Astryx `SideNav` (`Button` primary, `width="100%"`); belum ada handler klik (menyusul di T-011.2)
- [x] **T-011.2** Hubungkan ke `DraftEditorProvider` supaya bisa dibuka dari section manapun (bukan hanya `/publish`) — folder `_draft-editor/` dinaikkan dari `publish/` ke `[slug]/`, `DraftEditorProvider` + `DraftEditorModal` dipasang di `[slug]/layout.tsx`
- [ ] **T-011.3** Verifikasi redirect terminal action tetap benar dari section non-publish (lihat T-031) — implementasi selesai (`finishTerminalAction`: Save as Draft → Drafts, Schedule → Queue, editor ditutup lebih dulu); aturan destinasi sudah tertutup 8 unit test (`terminal-destination.test.ts`); **sisa verifikasi browser menunggu login King Rezi** — bahwa editor benar-benar tertutup dan layar tujuan tampil — jadi belum dicentang

### T-012 · Sidebar section "Channels"

| Field         | Value                                                                  |
| ------------- | ---------------------------------------------------------------------- |
| **Status**    | ⏳ Not Started                                                          |
| **Domain**    | workspace · UI                                                         |
| **ADR**       | ADR-058 (+ addendum drag-handle **shift-on-hover**, mengoverride keputusan awal "no-shift") |
| **Depends**   | T-009 ✅ · `listConnectedAccounts` ✅ (dari T-028, v0.2) · T-012.2 butuh domain publishing (v0.2) |
| **Baca dulu** | `04-ux/navigation-patterns.md` · Claude Design → `components/navigation.html` · `06-engineering/dependency-strategy.md` |

Quick-glance daftar akun terhubung di sidebar: avatar bulat + badge logo brand overlay, nama akun, status badge, scheduled count ↔ quick-compose "+" (no-shift/fixed-slot).

- [ ] **T-012.1** Skema tabel reorder personal per user (tabel baru + migrasi)
- [ ] **T-012.2** Query scheduled-posts count lintas domain (Publishing → Workspace, via public API domain)
- [ ] **T-012.3** Konfirmasi `react-icons` (subset **`react-icons/fa6`**) sebagai dependency runtime `apps/web` di `dependency-strategy.md`
- [ ] **T-012.4** Render section + avatar bulat + badge logo brand `react-icons/fa6` overlay + status badge
- [ ] **T-012.5** Scheduled count ↔ quick-compose "+" dengan fixed-slot (no-shift)
- [ ] **T-012.6** Drag-handle shift-on-hover — seluruh isi baris ikut bergeser

---

## Social Account Connection

### T-013 · Connect account via Outstand OAuth redirect

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                |
| **Domain**    | workspace · integration                                      |
| **ADR**       | ADR-021, ADR-037 (platform), ADR-040                         |
| **Depends**   | T-006 ✅                                                      |
| **Baca dulu** | `05-architecture/integration-layer.md`                        |

OAuth flow dikelola Outstand; access token tidak disimpan di DB internal. Saat ini connected account **hanya bisa didapat lewat seed manual** (`apps/web/prisma/seed-connected-accounts.ts`) — ini blocker rantai untuk banyak fitur lain.

- [ ] **T-013.1** `OutstandAdapter.connectAccount` — inisiasi redirect flow (butuh **T-025**, v0.2 ⏳)
- [ ] **T-013.2** Route Handler callback + persist `WorkspaceConnectedAccount`
- [ ] **T-013.3** UI `/settings/connected-accounts` — daftar + tombol Connect per platform
- [ ] **T-013.4** Operasional X: kredensial BYOK dikonfigurasi manual Project Owner di dashboard Outstand — **aplikasi tidak membuat form atau secret store X**

### T-014 · Disconnect account + dialog konfirmasi

| Field         | Value                                            |
| ------------- | ------------------------------------------------ |
| **Status**    | ⏳ Not Started                                    |
| **Domain**    | workspace                                        |
| **ADR**       | ADR-048, ADR-049                                 |
| **Depends**   | T-013                                            |
| **Baca dulu** | `04-ux/key-screen-patterns.md` (KSP-08-F07)      |

RBAC Owner/Admin — tidak ada perubahan RBAC, tinggal tambah gate konfirmasi sebelum memanggil service.

- [ ] **T-014.1** Dialog konfirmasi di `settings-connected-accounts.html` (App Prototype Claude Design)
- [ ] **T-014.2** `disconnectAccount` di kode nyata + RBAC gate
- [ ] **T-014.3** UI dialog konfirmasi (KSP-08-F07)

### T-015 · Reconnect flow saat token expired

| Field         | Value                                                |
| ------------- | ---------------------------------------------------- |
| **Status**    | ⏳ Not Started                                        |
| **Domain**    | workspace · integration                              |
| **ADR**       | ADR-040                                              |
| **Depends**   | T-013 · **T-026 (v0.2, ⏳)** webhook `account.token_expired` |
| **Baca dulu** | `05-architecture/integration-layer.md`                |

- [ ] **T-015.1** Tandai status akun expired saat webhook `account.token_expired` masuk
- [ ] **T-015.2** State visual "perlu reconnect" di Channels (T-012) + Connected Accounts
- [ ] **T-015.3** Aksi reconnect (ulangi redirect flow tanpa kehilangan riwayat post)

---

## User Settings

### T-016 · Account & user settings screens

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                |
| **Domain**    | identity                                                     |
| **ADR**       | ADR-046 (routing convention)                                 |
| **Depends**   | T-003 ✅, T-009 ✅                                             |
| **Baca dulu** | `04-ux/information-architecture.md`                           |

Semua route `/account/*` dan `/settings/*` masih placeholder "Scaffold — implementasi fitur di M8", dan layout-nya masih shell kosong.

- [ ] **T-016.1** Layout `account/` + `settings/` (sidebar/nav internal)
- [ ] **T-016.2** `/account/profile` — edit nama, avatar
- [ ] **T-016.3** `/account/preferences`
- [ ] **T-016.4** `/account/notifications` — preferensi notifikasi (butuh **T-036**, v0.2 ⏳)
- [ ] **T-016.5** Dialog konfirmasi Logout (ADR-049 Tier 2)

---

## Security & Platform Hygiene

### T-017 · RLS SQL policies

| Field         | Value                                              |
| ------------- | -------------------------------------------------- |
| **Status**    | ⏳ Not Started                                      |
| **Domain**    | platform                                           |
| **ADR**       | ADR-015, ADR-033                                   |
| **Depends**   | T-002 ✅                                            |
| **Baca dulu** | `06-engineering/database-orm.md` (DO-D06) · `05-architecture/database-strategy.md` |

Belum digenerate di migrasi awal — ditambahkan saat jalur server yang men-set `app.current_user_id` diimplementasi.

- [ ] **T-017.1** Implementasi jalur server set `app.current_user_id` per request
- [ ] **T-017.2** Generate RLS policy per tabel domain
- [ ] **T-017.3** Test negatif: akses lintas workspace harus ditolak di level DB

### T-018 · Investigasi hydration gagal lewat tunnel ngrok

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                |
| **Domain**    | platform · DX                                                |
| **ADR**       | —                                                            |
| **Depends**   | —                                                            |
| **Baca dulu** | `06-engineering/dx-tooling.md`                                |

Saat halaman auth diakses lewat tunnel ngrok (dipakai untuk `BETTER_AUTH_URL`), **seluruh** halaman tidak ter-hydrate — tidak ada React fiber di elemen manapun meski `window.next` termuat tanpa error console; klik submit jatuh ke native HTML form-submit. Dugaan: isu HMR/WebSocket Turbopack lewat ngrok. Backend/API sendiri terverifikasi benar via raw `fetch()`.

- [ ] **T-018.1** Konfirmasi apakah reproduksi juga terjadi pada production build (bukan hanya dev/Turbopack)
- [ ] **T-018.2** Tentukan solusi: konfigurasi ngrok/allowedDevOrigins, atau ganti mekanisme tunnel
- [ ] **T-018.3** Dokumentasikan cara uji browser lewat tunnel di `dx-tooling.md`

> Memblokir uji interaksi form penuh di browser lewat ngrok, bukan memblokir fitur.

### T-019 · Skema API mobile `/api/v1` + Better Auth Bearer plugin

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                |
| **Domain**    | platform · identity                                          |
| **ADR**       | ADR-043                                                      |
| **Depends**   | T-003 ✅                                                      |
| **Baca dulu** | `05-architecture/application-layer.md` · `06-engineering/auth-strategy.md` |

**Dikerjakan lebih awal secara sengaja — mendahului M8 web berjalan jauh.** Yang disiapkan sekarang hanya **skema route + konfigurasi auth**, bukan endpoint mobile aktualnya (endpoint aktual dikerjakan setelah MVP web selesai, dan bukan bagian MVP — lihat `mvp-definition.md` → Out of Scope "Public API"/"Mobile Application").

Alasan urgensinya: kalau jalur Bearer token baru dipasang setelah kode web matang, konfigurasi auth harus di-retrofit ke atas sesuatu yang sudah jalan — persis yang ADR-043 ingin dihindari.

- [ ] **T-019.1** Siapkan struktur folder `apps/web/src/app/api/v1/...` (skema route, belum ada endpoint bisnis)
- [ ] **T-019.2** Aktifkan Better Auth Bearer plugin + set `trustedOrigins`
- [ ] **T-019.3** Konfigurasi `rateLimit.customRules` untuk jalur API
- [ ] **T-019.4** Pastikan auth guard `proxy.ts` tidak mem-redirect request Bearer ke `/login` (saat ini hanya `/api/auth`, `/api/jobs`, `/api/health` yang di-bypass)

---

## Catatan Rilis

* Nomor kosong v0.1 sudah terpakai semua (T-019 diisi task API mobile). Task v0.1 baru berikutnya memakai nomor global berikutnya yang belum pernah dipakai — jangan menggeser ID yang sudah ada.
* **Definisi "Foundation selesai":** semua task di rilis ini `✅ Done` **kecuali** yang secara sadar ditunda dengan alasan tercatat — dan **kecuali empat task yang menunggu v0.2** (lihat di bawah).
* **Task v0.1 yang tidak bisa ditutup sebelum v0.2 berjalan** (dependency lintas rilis, disengaja dan diketahui):
  * **T-013** Connect account — subtask T-013.1 butuh T-025 (Real OutstandAdapter, v0.2).
  * **T-015** Reconnect flow — butuh T-026 (webhook `account.token_expired`, v0.2).
  * **T-016** Account settings — subtask T-016.4 butuh T-036 (notification, v0.2).
  * **T-012** Sidebar Channels — subtask T-012.2 butuh query scheduled-posts count dari domain publishing (v0.2), meski `listConnectedAccounts` sendiri sudah ada.

  Konsekuensinya: v0.1 dan v0.2 **tidak sepenuhnya sekuensial** — sisa v0.1 di atas selesai berbarengan atau setelah v0.2. Kalau di kemudian hari pemisahan ini terasa menyesatkan, pilihan yang lebih bersih adalah memindahkan Connect Account + Channels/CTA ke v0.2 lewat ADR baru (indeks release di `TASKS.md` adalah turunan `release-roadmap.md`, jadi perubahan ruang lingkup rilis wajib lewat ADR).
