# DECISIONS

Dokumen ini mencatat seluruh keputusan penting yang memengaruhi arah bisnis, produk, UX, maupun arsitektur project.

Tujuan dokumen ini adalah menjaga konsistensi pengembangan dan mendokumentasikan alasan di balik setiap keputusan.

---

## Decision ADR-001

### Title

Repository Strategy

### Status

Accepted

### Date

2026-07-13

### Decision

Project menggunakan **Hybrid Monorepo** sebagai strategi repository.

### Reason

* Mendukung pengembangan sebagai solo developer.
* Memudahkan berbagi package di masa depan.
* Tetap sederhana untuk MVP.
* Mudah dipisahkan menjadi beberapa aplikasi apabila diperlukan.

### Alternatives Considered

* Single Repository
* Multi Repository

---

## Decision ADR-002

### Title

JavaScript Runtime

### Status

Accepted

### Date

2026-07-13

### Decision

Project menggunakan **Bun** sebagai JavaScript runtime dan package manager.

### Reason

* Instalasi dependency lebih cepat.
* Startup lebih cepat.
* Workflow lebih sederhana.
* Cocok untuk project baru.

### Alternatives Considered

* pnpm
* npm

---

## Decision ADR-003

### Title

Framework

### Status

Accepted

### Date

2026-07-13

### Decision

Project menggunakan **Next.js** sebagai framework utama.

### Reason

* Mendukung Marketing Website dan Dashboard dalam satu aplikasi.
* Mendukung Server Components.
* SEO yang baik.
* Routing modern.
* Mudah dikembangkan.

### Alternatives Considered

* React + Vite

---

## Decision ADR-004

### Title

Architecture

### Status

Accepted

### Date

2026-07-13

### Decision

Project menggunakan **Modular Monolith** dengan pendekatan **Domain-Driven Design (DDD)**.

### Reason

* Memiliki boundary domain yang jelas.
* Mudah dipelihara.
* Cocok untuk solo developer.
* Mudah berkembang menjadi sistem yang lebih besar.

### Alternatives Considered

* Layered Architecture
* Microservices

---

## Decision ADR-005

### Title

Social Media Integration

### Status

Accepted

### Date

2026-07-13

### Decision

Project menggunakan **Outstand API** sebagai penyedia integrasi media sosial.

### Reason

* Tidak perlu membangun OAuth sendiri.
* Tidak perlu mengelola token platform media sosial.
* Fokus pada pengembangan produk dan pengalaman pengguna.

### Alternatives Considered

* Integrasi langsung ke masing-masing Social Media API

---

## Decision ADR-006

### Title

Target Market Prioritization

### Status

Accepted

### Date

2026-07-13

### Decision

Project memprioritaskan **Marketing Team** sebagai target utama, dengan **Startup** dan **Digital Agency** sebagai target sekunder.

### Reason

* Kebutuhan kolaborasi konten paling kuat ada pada tim.
* Nilai produk lebih jelas untuk workflow lintas peran.
* Segmentasi ini lebih selaras dengan arah fitur MVP yang kolaboratif.

### Alternatives Considered

* Individu/creator sebagai target utama
* SMB umum tanpa fokus tim

---

## Decision ADR-007

### Title

Business Discovery Baseline v1.0

### Status

Accepted

### Date

2026-07-13

### Decision

Seluruh dokumen pada `product-discovery/01-business/` ditetapkan sebagai **Baseline v1.0** setelah Business Review dinyatakan lolos.

Baseline ini menjadi acuan wajib untuk fase berikutnya:

* `product-discovery/02-product/`
* `product-discovery/03-user/`
* `product-discovery/04-ux/`
* `product-discovery/05-architecture/`

### Reason

* Menjamin konsistensi keputusan lintas fase discovery.
* Mencegah kontradiksi bisnis saat masuk ke definisi produk dan UX.
* Menetapkan fondasi keputusan yang stabil sebelum perencanaan teknis lebih lanjut.

### Alternatives Considered

* Langsung melanjutkan ke fase berikutnya tanpa baseline formal

---

## Decision ADR-008

### Title

Product Discovery Baseline v1.0

### Status

Accepted

### Date

2026-07-14

### Decision

Seluruh dokumen pada `product-discovery/02-product/` ditetapkan sebagai **Baseline v1.0** setelah Product Review dinyatakan lolos.

Baseline ini menjadi acuan wajib untuk fase berikutnya:

* `product-discovery/03-user/`
* `product-discovery/04-ux/`
* `product-discovery/05-architecture/`

### Reason

* Menjaga konsistensi antara ruang lingkup produk, MVP, prioritas fitur, dan roadmap.
* Menetapkan titik referensi stabil sebelum masuk ke definisi pengguna.
* Mengurangi risiko perubahan lintas fase yang tidak terdokumentasi.

### Alternatives Considered

* Melanjutkan ke tahap user discovery tanpa baseline formal product

---

## Decision ADR-009

### Title

User Discovery Baseline v1.0

### Status

Accepted

### Date

2026-07-14

### Decision

Seluruh dokumen pada `product-discovery/03-user/` ditetapkan sebagai **Baseline v1.0** setelah User Discovery Review dinyatakan lolos.

Baseline ini menjadi acuan wajib untuk fase berikutnya:

* `product-discovery/04-ux/`
* `product-discovery/05-architecture/`

### Reason

* Semua 10 asumsi Business dan Product Baseline terevaluasi — seluruhnya berstatus Supported atau Supported (scoped).
* Tidak ada perubahan pada Target Market, Problem Statement, Product Scope, atau MVP yang diperlukan.
* Insight utama (I-01 hingga I-08) mengonfirmasi arah baseline dan siap digunakan sebagai input UX Discovery.
* Current-state journey (8 stage) dan persona prioritas (Raka P0, Maya P0) telah terdokumentasi dengan jelas.
* Pemisahan buyer (Maya) dan daily user (Raka/Sinta) konsisten di seluruh dokumen.

### Alternatives Considered

* Melanjutkan ke UX Discovery tanpa baseline formal user

---

## Decision ADR-010

### Title

Engineering Planning sebagai Fase Baru di Product Discovery

### Status

Accepted

### Date

2026-07-14

### Decision

Menambahkan folder `product-discovery/06-engineering/` sebagai fase baru dalam proses product discovery, yang mendokumentasikan seluruh keputusan teknis sebelum implementasi kode dimulai.

Fase ini mencakup:

* Monorepo structure dan workspace setup
* Deployment platform dan infrastructure (Railway, dsb.)
* Authentication strategy (Better Auth, dsb.)
* ORM dan database access layer (Prisma, dsb.)
* CI/CD pipeline dan workflow
* Environment management (local, staging, production)
* Package dan dependency strategy
* Developer experience tooling

Fase ini menjadi milestone baru: **M6 — Engineering Planning**, ditempatkan setelah M5 — System Architecture dan sebelum M7 — Repository & Bootstrap.

Milestone sebelumnya disesuaikan:

| Sebelum | Sesudah |
| ------- | ------- |
| M6 — Repository & Bootstrap | M7 — Repository & Bootstrap |
| M7 — Development | M8 — Development |
| M8 — Testing & Release | M9 — Testing & Release |

### Reason

* Keputusan teknis (auth library, ORM, deployment platform, CI/CD) berdampak besar terhadap arsitektur dan harus terdokumentasi sebelum implementasi.
* Mendokumentasikan keputusan teknis sebagai ADR mencegah inkonsistensi saat development dimulai.
* Engineering Planning menjadi jembatan antara System Architecture (konseptual) dan Repository & Bootstrap (implementasi awal).
* Selaras dengan prinsip project: Documentation First.

### Alternatives Considered

* Memasukkan keputusan teknis langsung ke dalam 05-architecture (tidak dipilih — scope arsitektur dan engineering berbeda)
* Mendokumentasikan keputusan teknis saat development berlangsung (tidak dipilih — melanggar Documentation First)

---

## Decision ADR-011

### Title

Pemisahan `product-discovery/` dari `project-manager/`

### Status

Accepted

### Date

2026-07-14

### Decision

Folder `product-discovery/` dipindahkan keluar dari `project-manager/` dan menjadi folder top-level, sejajar (sibling) dengan `project-manager/`.

Struktur repository sekarang:

```text
social-media-management/
├── project-manager/     → proses kerja, keputusan, status project
└── product-discovery/   → pengetahuan produk (business s/d engineering)
```

Pembagian tanggung jawab masing-masing folder:

* **`project-manager/`** — didedikasikan untuk mendokumentasikan cara kerja: aturan project (`PROJECT_RULES.md`), status dan progress (`PROJECT_STATE.md`), keputusan (`DECISIONS.md`), riwayat perubahan (`CHANGELOG.md`), log diskusi (`CONVERSATIONS.md`), dan bank ide (`BRAINSTORM.md`).
* **`product-discovery/`** — menjadi **Source of Truth produk**: seluruh pengetahuan tentang apa yang dibangun (business, product, user, UX, architecture, engineering).

Seluruh referensi path antar dokumen yang sebelumnya berasumsi `product-discovery/` berada di dalam `project-manager/` telah diperbarui menyesuaikan struktur baru ini.

### Reason

* `product-discovery/` bukan bagian dari proses kerja AI/Developer, melainkan pengetahuan produk itu sendiri — secara konseptual berbeda tingkat dari `project-manager/`.
* Memisahkan keduanya membuat batas tanggung jawab lebih jelas: `project-manager/` = "bagaimana kita bekerja", `product-discovery/` = "apa yang kita bangun".
* Mencegah kebingungan ketika project-manager berkembang menjadi tooling AI/proses yang lebih kompleks di kemudian hari, tanpa harus menyeret dokumentasi produk ikut berpindah.

### Alternatives Considered

* Mempertahankan `product-discovery/` di dalam `project-manager/` (tidak dipilih — mencampur dua tanggung jawab berbeda: proses kerja vs pengetahuan produk)

---

## Decision ADR-012

### Title

Addendum Product Baseline — Roles & Permissions

### Status

Accepted

### Date

2026-07-15

### Decision

Menambahkan dokumen `product-discovery/02-product/roles-permissions.md` sebagai **addendum dari Product Baseline v1.0** (ADR-008).

Dokumen ini mendefinisikan:

* 4 roles: **Owner**, **Admin**, **Manager**, **Creator** — beserta hak akses per area fitur.
* **Set status konten kanonikal**: `Draft`, `In Review`, `Ready to Schedule`, `Scheduled`, `Published`, `Failed`.
* Aturan transisi status konten per role.
* Mapping roles ke persona User Discovery Baseline (Raka, Maya, Sinta, Dimas, Lara).

### Reason

* Roles & Permissions adalah bagian dari modul Workspace (`feature-modules.md`) yang belum terdefinisi secara eksplisit di Product Baseline v1.0.
* Set status konten kanonikal dibutuhkan sebelum UX Planning Review dapat diselesaikan — terutama untuk memperbaiki inkonsistensi REVIEW-01 (status lintas dokumen UX).
* Tanpa definisi roles yang jelas, aturan transisi status konten tidak dapat ditentukan secara konsisten.
* Mendefinisikan roles di fase Product (bukan Architecture) memastikan keputusan ini tersedia sebagai input UX dan Architecture.

### Alternatives Considered

* Mendefinisikan roles langsung di fase Architecture (tidak dipilih — roles adalah keputusan produk, bukan keputusan teknis semata)
* Mendefinisikan roles sebagai bagian inline dari dokumen UX (tidak dipilih — roles perlu menjadi dokumen tersendiri agar dapat dirujuk lintas fase)

---

## Decision ADR-013

### Title

UX Planning Baseline v1.0

### Status

Accepted

### Date

2026-07-15

### Decision

Seluruh dokumen pada `product-discovery/04-ux/` ditetapkan sebagai **Baseline v1.0** setelah UX Planning Review dinyatakan lolos dan seluruh inkonsistensi (REVIEW-01 s/d REVIEW-04) telah diperbaiki.

Dokumen yang termasuk dalam baseline ini:

* `ux-principles.md` — 6 prinsip UX yang dapat ditelusuri ke insight pengguna
* `information-architecture.md` — struktur navigasi dan hierarki layar
* `user-flows.md` — 5 solution flows untuk pekerjaan inti pengguna
* `navigation-patterns.md` — model navigasi utama dan pola perpindahan layar
* `key-screen-patterns.md` — pola fungsi kritis pada 8 layar utama

Baseline ini menjadi acuan wajib untuk fase berikutnya:

* `product-discovery/05-architecture/`
* `product-discovery/06-engineering/`

### Reason

* Seluruh 4 item UX Planning Review (REVIEW-01 s/d REVIEW-04) telah diperbaiki dan tidak ada inkonsistensi tersisa.
* Set status konten kanonikal telah diselaraskan lintas seluruh dokumen UX (REVIEW-01 Fixed).
* Seluruh keputusan UX (KSP-D01 s/d KSP-D11, NP-D01 s/d NP-D09) telah terdokumentasi di Decision Log masing-masing dokumen.
* Key screen patterns untuk 8 layar utama telah terdefinisi dan siap dijadikan input architecture discovery.
* Tidak ada keputusan UX yang bertentangan dengan Product Baseline v1.0.

### Alternatives Considered

* Melanjutkan ke System Architecture tanpa baseline formal UX (tidak dipilih — melanggar Documentation First dan menghilangkan traceability keputusan UX ke architecture)

---

## Decision ADR-014

### Title

Database Schema Organization — Single Schema dengan Domain Prefix

### Status

Accepted

### Date

2026-07-15

### Decision

Semua tabel database berada di satu schema `public` PostgreSQL. Domain dipisahkan menggunakan **prefix pada nama tabel** dengan konvensi `{domain_prefix}_{entity_plural}` dalam `snake_case`.

Contoh: `publishing_posts`, `workspace_members`, `engagement_inbox_items`.

### Reason

* Single schema adalah standar dan default di Supabase — tidak ada konfigurasi tambahan yang diperlukan.
* RLS policies lebih straightforward tanpa perlu mengurus `search_path` lintas schema.
* Domain prefix cukup untuk memberikan konteks dan mengelompokkan tabel secara visual di tooling database.
* Lebih sederhana untuk MVP tanpa kehilangan kemampuan track domain boundary.

### Alternatives Considered

* Per-domain PostgreSQL schema (`publishing.posts`, `workspace.members`) — isolasi lebih bersih di level database, tapi butuh konfigurasi `search_path`, RLS lebih kompleks, dan tidak ada kebutuhan nyata untuk level isolasi ini di MVP.

---

## Decision ADR-015

### Title

Database Strategy Baseline — Database Strategy v1.0

### Status

Accepted

### Date

2026-07-15

### Decision

`product-discovery/05-architecture/database-strategy.md` ditetapkan sebagai **Database Strategy Baseline** yang mencakup:

* Multi-tenancy: RLS dengan `workspace_id` sebagai unit isolasi.
* ID Generation: UUID v4 via `gen_random_uuid()`.
* Schema: Single schema `public` dengan domain prefix (ADR-014).
* Identity: BC-01 dikelola Better Auth dengan prefix `identity_`.
* RLS Approach: Application-enforced auth sebagai lapisan utama; RLS sebagai defense-in-depth.
* Soft Delete: Hard delete by default; `deleted_at` hanya pada `publishing_posts`.
* 22 tabel terdefinisi untuk 10 bounded context (2 tabel post-MVP untuk BC-10 Billing).

### Reason

* Seluruh entitas dari Domain Model (`domain-model.md`) telah dipetakan ke tabel database.
* Semua keputusan database strategy yang diperlukan sebagai input Engineering Planning telah terdokumentasi.
* Konsisten dengan keputusan pra-architecture (Supabase PostgreSQL, RLS, Better Auth, Supabase Storage).

### Alternatives Considered

* ULID sebagai ID strategy — sortable dan URL-friendly, tapi butuh library tambahan; UUID v4 sudah native di PostgreSQL/Supabase dan cukup untuk MVP.
* Soft delete semua tabel — konsistensi lebih baik, tapi menambah kompleksitas query di semua domain; hard delete lebih pragmatis untuk MVP.

---

## Decision ADR-016

### Title

Application Layer — Next.js Entry Point Strategy

### Status

Accepted

### Date

2026-07-15

### Decision

Next.js entry points dibagi berdasarkan asal request:
- **Server Actions** untuk semua mutations yang dipicu dari UI (form, button).
- **Route Handlers** untuk request dari sistem eksternal (webhook Outstand) dan endpoint API.
- **Server Components** untuk semua data fetching pada render halaman.
- **Middleware** untuk auth guard dan workspace context resolution.

### Reason

* Separation of concern yang jelas — Server Actions optimal untuk form-based UI mutations, Route Handlers optimal untuk integrasi eksternal.
* Server Actions mendukung progressive enhancement dan error handling terstruktur ke client.
* Route Handlers adalah satu-satunya cara menerima webhook dari Outstand.

### Alternatives Considered

* Route Handlers saja — kehilangan keuntungan Server Actions untuk UI mutations.
* Server Actions saja — tidak bisa handle webhook dari sistem eksternal.

---

## Decision ADR-017

### Title

Application Layer — Repository Pattern

### Status

Accepted — Amended by ADR-031 (2026-07-17)

### Date

2026-07-15

### Decision

Setiap domain module menggunakan **Repository Pattern eksplisit**:
- Interface repository didefinisikan di dalam domain module.
- Implementasi menggunakan **Prisma** (ORM formal — ADR-031). Versi awal keputusan menyebut Supabase client; diganti oleh ADR-031.
- Satu repository per Aggregate Root.
- Application Service hanya berinteraksi dengan database melalui repository — tidak langsung akses Prisma client atau Supabase client.
- Supabase client tetap dipakai di luar repository CRUD untuk **Realtime** dan **Storage** (lihat ADR-031).

### Reason

* Selaras dengan DDD dan Modular Monolith architecture.
* Domain logic dapat di-unit-test tanpa setup database.
* Batas dependency antar layer menjadi eksplisit dan mudah ditelusuri.

### Alternatives Considered

* Langsung akses Supabase client di Application Service — lebih simple, tapi coupling tinggi dan sulit di-test.

---

## Decision ADR-018

### Title

Application Layer — Cross-Domain Communication

### Status

Accepted

### Date

2026-07-15

### Decision

Komunikasi antar domain menggunakan **service-to-service call langsung** dengan aturan:
- Hanya import dari `index.ts` (public API) domain lain — tidak boleh import dari file internal.
- Tidak ada circular dependency antar domain.
- Hanya passing ID (WorkspaceId, UserId, dll.), bukan full entity lintas domain.

### Reason

* Sederhana dan pragmatis untuk MVP yang dikerjakan solo developer.
* Dependency antar domain bersifat eksplisit dan dapat ditelusuri di compile time.
* Tidak memerlukan event bus atau message broker yang menambah kompleksitas infra.

### Alternatives Considered

* Domain Events (publish-subscribe) — lebih decoupled, tapi kompleksitas tinggi untuk MVP.
* Shared Read Model — query langsung ke DB lintas context — melanggar domain boundary.

---

## Decision ADR-019

### Title

Integration Layer — Anti-Corruption Layer via OutstandAdapter

### Status

Accepted

### Date

2026-07-15

### Decision

Seluruh interaksi dengan Outstand API dilakukan eksklusif melalui modul `OutstandAdapter` sebagai **Anti-Corruption Layer (ACL)**:
- Domain internal tidak pernah mengimport tipe atau struktur data Outstand secara langsung.
- `OutstandAdapter` bertanggung jawab atas HTTP call, parsing response, dan translasi error ke `IntegrationError`.
- Jika Outstand mengubah API contract, hanya `OutstandAdapter` yang perlu diperbarui.

### Reason

* Isolasi domain internal dari perubahan breaking Outstand API.
* Selaras dengan DDD Anti-Corruption Layer pattern untuk external system.
* Memudahkan penggantian provider integrasi di masa depan tanpa mengubah domain logic.

### Alternatives Considered

* Panggil Outstand API langsung dari Application Service — coupling tinggi, domain terikat pada struktur data Outstand.

---

## Decision ADR-020

### Title

Integration Layer — Webhook Handling via Route Handler + HMAC Signature Verification

### Status

Accepted

### Date

2026-07-15

### Decision

Webhook dari Outstand diterima melalui **Route Handler** di `/api/webhooks/outstand` dengan:
- Verifikasi HMAC-SHA256 signature sebelum setiap pemrosesan event.
- Respons `200 OK` dikembalikan segera sebelum pemrosesan selesai (async processing).
- Idempotency check via `outstandJobId` / `outstandItemId` sebelum memproses event.
- Event yang gagal diproses dicatat untuk retry via background job.

### Reason

* Route Handler adalah satu-satunya entry point yang dapat menerima request dari sistem eksternal (ADR-016).
* Signature verification mencegah pemrosesan event palsu dari sumber tidak sah.
* Respons segera mencegah timeout pada sisi Outstand dan retry berlebihan.
* Idempotency diperlukan karena Outstand dapat mengirim event yang sama lebih dari sekali.

### Alternatives Considered

* Proses webhook secara synchronous — risiko timeout jika pemrosesan lambat.
* Tanpa signature verification — risiko keamanan.

---

## Decision ADR-021

### Title

Integration Layer — ConnectedAccount OAuth via Outstand Redirect Flow

### Status

Accepted

### Date

2026-07-15

### Decision

Koneksi akun social media ke workspace menggunakan **OAuth flow yang dikelola Outstand**:
- OAuth access token **tidak disimpan** di database internal — dikelola sepenuhnya oleh Outstand.
- Hanya `outstandAccountId` yang disimpan sebagai external reference permanen di `ConnectedAccount`.
- OAuth callback ditangani oleh Route Handler di `/api/integrations/outstand/callback`.
- `state` parameter digunakan untuk CSRF protection.

### Reason

* Menghindari tanggung jawab menyimpan dan me-refresh OAuth token platform social media.
* Outstand mengelola token rotation dan scope permission — mengurangi kompleksitas sistem internal.
* Selaras dengan posisi Outstand sebagai integration provider yang menabstraksi platform-specific OAuth.

### Alternatives Considered

* Simpan OAuth token di database internal — harus mengelola token refresh, revocation, dan enkripsi.
* OAuth langsung ke platform social media (tanpa Outstand) — melanggar ADR-005 dan meningkatkan kompleksitas drastis.

---

## Decision ADR-022

### Title

Background Job Strategy — PostgreSQL Job Queue + Railway Cron

### Status

Accepted

### Date

2026-07-15

### Decision

Background job menggunakan **PostgreSQL-backed job queue** via tabel `background_jobs` dengan eksekusi dipicu oleh **Railway Cron** yang memanggil Route Handler `/api/jobs/run`.

Job types yang didefinisikan:
- `outstand.webhook.retry` — retry webhook gagal (max 3 kali, exponential backoff)
- `notification.post_status` — buat notifikasi saat post published/failed
- `engagement.sync` — sync engagement dari Outstand (periodik, setiap 30 menit)
- `analytics.sync` — sync analytics dari Outstand (periodik, setiap 24 jam)

Locking menggunakan `SELECT FOR UPDATE SKIP LOCKED` untuk mencegah race condition.

### Reason

* Tidak perlu menambah infrastruktur baru — Supabase PostgreSQL sudah tersedia.
* Railway sudah digunakan sebagai deployment platform; Railway Cron adalah fitur built-in.
* `SELECT FOR UPDATE SKIP LOCKED` adalah fitur native PostgreSQL — atomic, tanpa Redis atau distributed lock.
* Pragmatis untuk MVP volume; dapat di-upgrade ke managed queue (Trigger.dev, Inngest) post-MVP jika dibutuhkan.

### Alternatives Considered

* **Trigger.dev / Inngest** (managed background job service) — lebih powerful, tapi menambah external service dependency untuk MVP.
* **Supabase Edge Functions + pg_cron** — cocok untuk scheduled jobs, tapi Edge Functions memiliki batasan cold start dan runtime.
* **BullMQ + Redis** — perlu managed Redis instance tambahan; overkill untuk MVP volume.

---

## Decision ADR-023

### Title

Real-time Strategy — Supabase Realtime untuk Notifikasi + Manual Refresh

### Status

Accepted

### Date

2026-07-15

### Decision

Sistem menggunakan **Supabase Realtime** hanya untuk tabel `notifications` (event `INSERT`, filter per `user_id`). Semua data lain (content calendar, engagement list, analytics) menggunakan **manual refresh** atau **optimistic update** setelah aksi user.

Scope real-time MVP:
- Notifikasi in-app (badge count, toast) via Supabase Realtime subscription.
- Content calendar dan engagement inbox: manual refresh dipicu user atau hint dari notifikasi.
- Analytics: manual refresh on demand.
- Presence dan collaborative editing: Post-MVP.

### Reason

* Real-time hanya untuk notifikasi — scope minimal yang memberikan nilai UX terbesar (awareness tim tanpa polling agresif).
* Supabase Realtime sudah built-in dalam Supabase stack yang digunakan — tidak perlu infrastruktur WebSocket terpisah.
* Content calendar tidak memerlukan real-time — perubahan status sudah dikomunikasikan via notifikasi.
* Mengurangi kompleksitas client-side subscription lifecycle untuk MVP.

### Alternatives Considered

* Real-time subscription untuk seluruh data (post, calendar, engagement) — terlalu kompleks untuk MVP, menambah subscription overhead.
* Polling interval (misal setiap 30 detik) — lebih sederhana dari Realtime, tapi konsumsi bandwidth dan load database lebih tinggi.
* Server-Sent Events (SSE) — alternatif Realtime yang lebih sederhana, tapi tidak terintegrasi native dengan Supabase RLS.

---

## Decision ADR-024

### Title

Auth Architecture — Better Auth + HTTP-only Cookie + Application-layer RBAC

### Status

Accepted

### Date

2026-07-15

### Decision

Sistem menggunakan **Better Auth** untuk lifecycle autentikasi (registrasi, login, session). Session disimpan di **HTTP-only cookie**. Workspace context di-resolve oleh **Next.js Middleware** dari URL slug dan diinject via custom request headers. Authorization menggunakan **RBAC di Application Service layer** dengan RLS sebagai defense-in-depth.

Komponen utama:
- Auth method MVP: Email + Password + Google OAuth.
- Session cookie: HTTP-only, Secure, SameSite=lax, expiry 7 hari.
- Workspace context headers: `x-workspace-id`, `x-workspace-role` diinject Middleware.
- Authorization check: `assertPermission(role, operation)` di Application Service sebelum domain logic.
- RLS: safety net jika Application Service melewatkan pengecekan.

### Reason

* Better Auth menghindari implementasi auth dari nol — sudah ditetapkan sebagai keputusan pra-architecture.
* HTTP-only cookie mencegah XSS attack; tidak dapat diakses JavaScript di browser.
* Workspace context via Middleware lebih akurat dari menyimpan di session (URL adalah sumber kebenaran workspace aktif).
* Custom request headers tidak dapat dimanipulasi client — hanya Middleware server-side yang menulisnya.
* Authorization di Application Service selaras dengan DDD — business rule ada di domain layer, bukan di Entry Point.

### Alternatives Considered

* JWT stateless (tanpa session di database) — lebih scalable, tapi revocation lebih kompleks; HTTP-only session cookie cukup untuk MVP.
* Menyimpan workspaceId di session token — bisa stale jika user berpindah workspace; URL-based lebih reliable.
* Authorization di Middleware — terlalu awal untuk business logic; Application Service lebih tepat sebagai enforcement layer.
* Clerk / Auth0 (third-party auth service) — managed, tapi biaya dan lock-in; Better Auth self-hosted lebih sesuai.

---

## Decision ADR-025

### Title

System Architecture Baseline v1.0 — product-discovery/05-architecture/

### Status

Accepted

### Date

2026-07-15

### Decision

Seluruh 7 dokumen pada folder `product-discovery/05-architecture/` ditetapkan sebagai **System Architecture Baseline v1.0**:

* `domain-model.md` — 10 bounded context, context map, shared types, domain boundary rules.
* `database-strategy.md` — multi-tenancy via RLS, 22 tabel untuk 10 BC, storage, index, dan soft delete strategy.
* `application-layer.md` — 4-layer stack, Server Actions untuk UI mutations, Route Handlers untuk webhook/external, Repository Pattern, cross-domain communication via public module API.
* `integration-layer.md` — Anti-Corruption Layer via OutstandAdapter, ConnectedAccount OAuth flow, webhook handling via HMAC, engagement sync, analytics sync.
* `background-jobs.md` — PostgreSQL job queue + Railway Cron sebagai trigger, 4 job types, retry strategy.
* `realtime-strategy.md` — Supabase Realtime untuk notifikasi in-app, manual refresh untuk data konten, notification type registry, RLS subscription rules.
* `auth-architecture.md` — Better Auth, HTTP-only session cookie, Middleware workspace context resolution, RBAC di Application Service, RLS defense-in-depth.

Dokumen-dokumen ini telah melalui Architecture Review (8 inkonsistensi ditemukan dan diperbaiki: ARCH-REVIEW-01 s/d ARCH-REVIEW-08) dan dinyatakan konsisten satu sama lain.

### Reason

* Seluruh 7 topik M5 — System Architecture telah selesai didokumentasikan.
* Architecture Review telah dilakukan dan semua inkonsistensi telah diselesaikan.
* Baseline diperlukan sebagai titik referensi tetap sebelum Engineering Planning (M6) dimulai.
* Sesuai Definition of Done M5: seluruh dokumen selesai, ADR tercatat, tidak ada blocker.

### Alternatives Considered

* Tidak menetapkan baseline formal — berisiko inkonsistensi saat Engineering Planning memodifikasi arsitektur tanpa anchor point yang jelas.
* Menunggu Engineering Planning selesai dulu — tidak diperlukan; System Architecture sudah cukup matang dan lengkap sebagai input M6.

---

## Decision ADR-026

### Title

Monorepo Workspace Layout — apps/web, packages/shared, domain modules di src/domains/

### Status

Accepted

### Date

2026-07-15

### Decision

Monorepo menggunakan layout berikut:

* **`apps/web`** — satu-satunya aplikasi MVP (Next.js, `@social/web`).
* **`packages/shared`** — shared types lintas domain (`@social/shared`): branded IDs, enums, value objects.
* **Domain modules di `src/domains/`** dalam apps/web — bukan workspace package terpisah.
* **Repository implementations di `src/lib/repositories/`** — dipisahkan dari domain folder.
* **App Router routing menggunakan `[slug]`** sebagai workspace dynamic segment.

Workspace dikonfigurasi via Bun Workspaces di root `package.json` dengan `"workspaces": ["apps/*", "packages/*"]`.

Detail lengkap: `product-discovery/06-engineering/monorepo-setup.md`.

### Reason

* Satu app (`apps/web`) sesuai Modular Monolith — tidak ada alasan memisahkan domain sebelum ada kebutuhan nyata.
* Domain modules di `src/domains/` (bukan package terpisah) mengurangi indirection tanpa kehilangan modularitas di fase MVP.
* Repository di `src/lib/` menjaga domain tetap pure — hanya tahu interface, bukan implementasi infrastruktur.
* `[slug]` di routing selaras dengan keputusan Middleware workspace context resolution (ADR-024, auth-architecture.md).
* `@social/shared` hanya untuk types yang genuinely cross-domain — mencegah shared menjadi junk drawer.

### Alternatives Considered

* Domain sebagai workspace packages (`packages/publishing`, `packages/workspace`, dst.) — premature separation untuk MVP single-app; menambah build complexity tanpa benefit nyata.
* Repository implementation di dalam domain folder — mencampur domain logic dengan infrastruktur; melanggar dependency direction.
* Query param `?workspace=slug` untuk workspace routing — kurang bersih, tidak selaras dengan URL-as-source-of-truth dari auth architecture.

---

## Decision ADR-027

### Title

Amandemen ADR-014 — Pengecualian Penamaan untuk Tabel Aggregate Root

### Status

Accepted

### Date

2026-07-15

### Decision

Menambahkan pengecualian pada konvensi penamaan tabel yang ditetapkan di ADR-014.

Konvensi dasar tetap `{domain_prefix}_{entity_plural}` (`snake_case`). **Pengecualian:** tabel utama (aggregate root) sebuah domain yang namanya identik dengan domain prefix boleh menggunakan nama pendek tanpa prefix untuk menghindari redundansi.

Tabel yang menggunakan pengecualian ini:

* `workspace_workspaces` → **`workspaces`**
* `notification_notifications` → **`notifications`**

Tabel lain tetap mengikuti konvensi berprefix (`workspace_members`, `publishing_posts`, `engagement_inbox_items`, dll.).

### Reason

* Nama seperti `workspace_workspaces` dan `notification_notifications` bersifat redundan dan mengurangi keterbacaan tanpa memberi nilai tambah.
* Pengecualian hanya berlaku untuk aggregate root yang namanya sama dengan domain — kasus yang jarang dan tidak menimbulkan ambiguitas.
* Selaras dengan perubahan yang sudah diterapkan pada `database-strategy.md` dan `realtime-strategy.md` (sesi ke-29).

### Alternatives Considered

* Mempertahankan konvensi ketat tanpa pengecualian (semua tabel berprefix) — konsisten secara mekanis, tapi menghasilkan nama redundan yang tidak nyaman dibaca.

---

## Decision ADR-028

### Title

Deployment Region — Singapore / Southeast Asia (Railway + Supabase Co-located)

### Status

Accepted

### Date

2026-07-17

### Decision

Seluruh infrastruktur di-host di region **Singapore / Southeast Asia**:

* **Railway** — region Southeast Asia (Singapore).
* **Supabase** — region `ap-southeast-1` (Singapore).

Railway (compute) dan Supabase (data) di-**co-located** di region yang sama untuk meminimalkan round-trip antara aplikasi dan database. Keputusan ini berlaku untuk seluruh environment (production dan staging).

Detail lengkap: `product-discovery/06-engineering/deployment-infrastructure.md` (DI-D01).

### Reason

* Target market utama adalah **Marketing Team di Indonesia** — region SEA memberikan latency terendah ke user.
* Co-location Railway↔Supabase meminimalkan latency query, RLS, dan storage signed URL yang berada di jalur kritis UX.
* Panggilan ke Outstand API sebagian besar bersifat background/asinkron, sehingga latency ke provider tidak berada di jalur kritis.

### Alternatives Considered

* Region US (us-east/us-west) — ekosistem paling matang, tetapi latency tinggi ke user Indonesia.
* Region campur (mis. Supabase SG + Railway US) — menambah round-trip app↔DB pada setiap request, merugikan latency.

---

## Decision ADR-029

### Title

Environment Topology — Production + Staging dengan Supabase Project Terisolasi

### Status

Accepted

### Date

2026-07-17

### Decision

MVP menggunakan **dua environment persisten**:

* **Production** — melayani user nyata, di-deploy dari branch `main`.
* **Staging** — mirror struktural production untuk uji pra-rilis, di-deploy dari branch `staging`.

Setiap environment memiliki **project Supabase terpisah** (`social-media-prod`, `social-media-staging`) untuk isolasi data dan kredensial penuh. Setiap Railway environment berisi dua service: `web` (Next.js) dan `cron` (trigger background jobs via Railway Cron, selaras ADR-022).

Preview environment per-PR (ephemeral) tidak digunakan pada MVP.

Detail lengkap: `product-discovery/06-engineering/deployment-infrastructure.md` (DI-D02, DI-D03, DI-D04, DI-D05).

### Reason

* Staging sebagai mirror memungkinkan uji perubahan (termasuk migration) tanpa menyentuh data produksi.
* Project Supabase terpisah menjamin isolasi data dan mencegah staging membaca/menulis data prod.
* Dua tier persisten cukup untuk skala MVP tanpa overhead infra preview per-PR.

### Alternatives Considered

* Production-only — paling murah, tetapi tidak ada tempat uji aman sebelum rilis.
* Production + Staging + Preview per-PR — paling robust, tetapi kompleksitas dan biaya berlebih untuk fase MVP.
* Satu project Supabase dipakai bersama antar environment — lebih murah, tetapi berisiko staging menyentuh data produksi.

---

## Decision ADR-030

### Title

Auth Implementation — Better Auth Config + Supabase JWT Integration untuk Realtime

### Status

Accepted

### Date

2026-07-17

### Decision

Detail implementasi autentikasi (M6) yang menkonkretkan ADR-024:

* **Better Auth** menyimpan data auth di Supabase PostgreSQL yang sama (prefix `identity_`), diakses via Prisma adapter + `DATABASE_URL` (lihat ADR-031).
* **Database session** (token opaque di cookie) — bukan JWT stateless-only — agar sesi dapat direvokasi.
* **Dual-context RLS:** akses data server-side memakai Prisma + session variable `app.current_user_id` (DB-D05, ADR-031); jalur Supabase Realtime memakai **JWT Supabase-compatible** yang diterbitkan Better Auth (HS256, di-sign dengan `SUPABASE_JWT_SECRET`, `sub = userId`) agar `auth.uid()` valid.
* **OAuth client & redirect URI terpisah** per environment.
* Password reset & email verification bergantung pada transactional email provider yang **belum ditetapkan** (dependency terbuka).

Detail lengkap: `product-discovery/06-engineering/auth-strategy.md` (AS-D01 s/d AS-D05).

### Reason

* Menyediakan `auth.uid()` untuk RLS Realtime tanpa memindahkan seluruh auth ke Supabase Auth (yang bertentangan dengan ADR-024).
* Database session memungkinkan revokasi (logout, hapus device) — lebih aman dari JWT stateless.
* Menjaga service role key tetap di server; JWT client hanya untuk otorisasi channel Realtime.
* Kredensial OAuth terpisah per environment mencegah salah routing callback.

### Alternatives Considered

* Pindah ke Supabase Auth agar `auth.uid()` otomatis tersedia — bertentangan dengan ADR-024 (Better Auth).
* JWT stateless-only untuk session — tidak dapat direvokasi sebelum expiry.
* Polling manual untuk notifikasi alih-alih Realtime — menghapus manfaat real-time in-app notification (ADR-023).
* Menetapkan email provider sekarang — keputusan prematur di luar scope auth core.

---

## Decision ADR-031

### Title

Database Access — Prisma sebagai ORM Formal (Amandemen ADR-017)

### Status

Accepted

### Date

2026-07-17

### Decision

**Prisma** ditetapkan sebagai **ORM formal** untuk akses data domain:

* Repository implementations memakai **Prisma Client** (bukan Supabase JS client untuk CRUD).
* **Prisma Migrate** adalah tooling migrasi skema primer (menggantikan Supabase CLI sebagai sumber migrasi domain di catatan M5).
* **Supabase client** tetap dipakai hanya untuk **Supabase Realtime** (notifikasi in-app) dan **Supabase Storage** (media) — di luar repository CRUD.
* Better Auth terhubung ke PostgreSQL melalui **Prisma adapter** / driver yang selaras dengan Prisma schema (tabel prefix `identity_`).
* Connection pooling memakai **Supabase Supavisor** (pooled URL untuk runtime aplikasi; direct URL untuk migrasi).

Detail lengkap: `product-discovery/06-engineering/database-orm.md` (DO-D01 s/d DO-D06).

Keputusan ini **mengamandemen ADR-017** pada bagian implementasi repository.

### Reason

* Mengembalikan keputusan stack yang sempat tercatat di Technical Overview (`ORM | Prisma`) dan prinsip portabilitas (akses DB lewat ORM; Supabase sebagai platform managed).
* Type-safe query + migration workflow yang jelas untuk Modular Monolith + DDD.
* Memisahkan tanggung jawab: Prisma untuk persistence domain; Supabase client untuk fitur platform (Realtime, Storage) yang tidak digantikan ORM.

### Alternatives Considered

* Supabase client saja (tanpa ORM) — paling selaras teks awal ADR-017, tetapi melemahkan type-safety query dan portabilitas ORM yang sudah diinginkan sejak pra-architecture.
* Hybrid Drizzle + Supabase client — type-safe dan ringan, tetapi bukan pilihan yang sempat ditetapkan sebelumnya (Prisma).
* Prisma untuk semua termasuk Realtime/Storage — tidak feasible; Realtime dan Storage adalah API platform Supabase.

---

## Decision ADR-032

### Title

CI/CD Pipeline — GitHub Actions Gates + Railway Deploy + Migrate on Release

### Status

Accepted

### Date

2026-07-17

### Decision

Pipeline CI/CD MVP:

* **CI tooling:** GitHub Actions (`.github/workflows/`).
* **Quality gates pada PR** ke `staging` / `main`: install (frozen lockfile) → Prisma generate/validate → typecheck → lint → test. Merge diblokir jika gates gagal.
* **Promosi kode:** `feature/*` → `staging` → `main` (verifikasi di staging sebelum production).
* **CD:** tetap **Railway auto-deploy** dari branch (`staging`→staging, `main`→production) — selaras DI-D05; GitHub Actions tidak melakukan deploy aplikasi.
* **Migrasi:** `prisma migrate deploy` dijalankan di **Railway release/pre-start** per environment memakai `DIRECT_URL` environment tersebut — bukan dari job Pull Request.

Detail lengkap: `product-discovery/06-engineering/cicd-pipeline.md` (CI-D01 s/d CI-D06).

### Reason

* Memisahkan tanggung jawab: GitHub Actions menjaga kualitas sebelum merge; Railway menjalankan artefak di environment yang benar.
* Staging sebagai gerbang uji (ADR-029) sebelum production.
* Migrate terikat deploy environment yang sama dengan kode — mengurangi drift skema vs aplikasi.
* Secret DB produksi tidak perlu masuk ke runner PR CI.

### Alternatives Considered

* CI+CD penuh di GitHub Actions (deploy via Railway API) — menduplikasi kontrol deploy yang sudah ada di Railway.
* Hanya mengandalkan build Railway tanpa PR gates — kode rusak bisa langsung masuk branch environment.
* Menjalankan `migrate deploy` dari job PR — risiko menulis DB dari branch yang belum di-merge; secret DB di GitHub lebih dini dari yang perlu.
* Preview environment per-PR — ditolak di ADR-029.

---

## Decision ADR-033

### Title

Environment Management — Supabase Cloud-First, Native Secrets, Dedicated Local Project

### Status

Accepted

### Date

2026-07-17

### Decision

* **Platform DB MVP:** seluruh tier (local, staging, production) memakai **Supabase Cloud**. Migrasi ke self-host dievaluasi kemudian setelah skema dan operasi cloud stabil — membutuhkan ADR terpisah.
* **Local:** project Supabase Cloud terpisah `social-media-local`; aplikasi Next.js di mesin developer via `.env.local`. Tidak memakai staging/prod sebagai DB local.
* **Secret management:** native only — Railway Variables (staging/prod), Supabase dashboard, `.env.local` (gitignored). Tanpa Doppler/Infisical/Vault di MVP.
* **Repo:** commit `.env.example` saja; secret tidak masuk Git; secret produksi tidak disimpan di PR CI (selaras CI-D06).

Detail lengkap: `product-discovery/06-engineering/environment-management.md` (EM-D01 s/d EM-D06).

### Reason

* Cloud-first mengurangi beban operasional solo developer saat skema masih berubah.
* Project local terpisah menjaga isolasi kredensial/data (selaras semangat ADR-029) tanpa memaksa Docker/Supabase CLI di fase ini.
* Native secrets cukup untuk skala solo MVP.

### Alternatives Considered

* Supabase CLI / Docker local sejak hari pertama — lebih dekat prod-self-host, tetapi menambah friction setup awal.
* Memakai staging sebagai DB local — risiko merusak data pra-rilis.
* Doppler/Infisical — bermanfaat saat kolaborator bertambah; overhead untuk solo MVP.
* Self-host Supabase sejak M7 — ops prematur sebelum skema stabil.

---

## Decision ADR-034

### Title

DX Tooling — ESLint + Prettier, Lefthook + lint-staged, Vitest

### Status

Accepted

### Date

2026-07-17

### Decision

* **Lint/format:** ESLint + Prettier (dengan `eslint-config-prettier`), konfigurasi monorepo di root.
* **Pre-commit:** Lefthook + lint-staged — lint/format pada file staged saja; bukan full test suite.
* **Test runner:** Vitest, dipanggil via `bun run test` (gate CI-D02).
* **Scripts root:** kontrak seragam `typecheck`, `lint`, `format`, `test`, `db:generate`, `db:migrate`, `db:deploy` selaras CI dan local setup.

Detail lengkap: `product-discovery/06-engineering/dx-tooling.md` (DX-D01 s/d DX-D05).

### Reason

* ESLint + Prettier punya ekosistem plugin Next/React paling matang dan sudah menjadi acuan implisit di dokumen M6 sebelumnya.
* Lefthook ringan dan cocok alur Bun; memberi feedback sebelum CI tanpa menjalankan suite penuh.
* Vitest menyediakan mock/coverage yang lebih kaya untuk domain tests di Modular Monolith.

### Alternatives Considered

* Biome — all-in-one dan cepat; dikesampingkan demi ekosistem ESLint/Prettier yang dipilih eksplisit.
* Oxlint + Prettier — lint cepat, tetapi ekosistem rule Next kurang lengkap dibanding ESLint.
* Husky + lint-staged — valid, lebih banyak boilerplate.
* Tanpa pre-commit (hanya CI) — feedback lebih lambat.
* Bun test — lebih native, ekosistem assertion/mock lebih tipis untuk kebutuhan domain testing.

---

## Decision ADR-035

### Title

Dependency Strategy — caret ranges, manual updates, root lockfile rules

### Status

Accepted

### Date

2026-07-17

### Decision

* **Version ranges eksternal:** caret (`^x.y.z`) di `package.json`; resolusi tepat dikunci `bun.lockb`.
* **Update dependency:** manual (`bun update` / bump saat perlu); tanpa Renovate/Dependabot di MVP.
* **Lockfile:** satu `bun.lockb` di root, wajib di-commit; CI memakai `bun install --frozen-lockfile`.
* **Penempatan:** root = tooling monorepo; `apps/web` = runtime; `packages/shared` = tanpa runtime dependencies.
* **Shared packages:** MVP hanya `@social/shared`; package baru di `packages/` hanya dengan alasan kuat.
* **Tanpa Bun Catalog** di MVP.

Detail lengkap: `product-discovery/06-engineering/dependency-strategy.md` (DS-D01 s/d DS-D06).

### Reason

* Caret + lockfile memberi reproduksibilitas tanpa noise exact-pin untuk solo MVP.
* Update manual cocok skala solo; otomasi bisa ditambah nanti jika frekuensi update jadi beban.
* Penempatan dependency menegaskan boundary Hybrid Monorepo (ADR-026) dan mencegah shared menjadi junk drawer (MS-D04).

### Alternatives Considered

* Exact pin semua dependency — audit ketat, terlalu banyak PR bump untuk fase ini.
* Bun Catalog — berguna multi-package; overkill untuk `apps/web` + `@social/shared`.
* Dependabot / Renovate — valid pasca-MVP atau saat kolaborator bertambah.

---

## Decision ADR-036

### Title

Engineering Planning Baseline v1.0

### Status

Accepted

### Date

2026-07-17

### Decision

Seluruh 8 dokumen pada folder `product-discovery/06-engineering/` ditetapkan sebagai **Engineering Planning Baseline v1.0**:

* `monorepo-setup.md` — Hybrid Monorepo, Bun Workspaces, App Router (termasuk `/api/auth/*` dan `/api/jobs/run`), 9 domain modules MVP, import rules.
* `deployment-infrastructure.md` — Railway + Supabase SEA (Singapore), Production + Staging, service `web` + `cron`, rollback (ADR-028, ADR-029).
* `auth-strategy.md` — Better Auth config, providers, session cookie env-aware, JWT Supabase-compatible untuk Realtime (ADR-030).
* `database-orm.md` — Prisma ORM, batas Supabase client (Realtime/Storage), Prisma Migrate, Supavisor pooling (ADR-031).
* `cicd-pipeline.md` — GitHub Actions quality gates, promosi feature→staging→main, Railway CD, migrate on release (ADR-032).
* `environment-management.md` — katalog env vars, secret native, project Cloud `social-media-local` / staging / prod (ADR-033).
* `dx-tooling.md` — ESLint + Prettier, Lefthook + lint-staged, Vitest, script workspace (ADR-034).
* `dependency-strategy.md` — caret ranges, `bun.lockb` root, penempatan dep, aturan `@social/shared` (ADR-035).

Dokumen-dokumen ini telah melalui Engineering Planning Review (6 inkonsistensi ditemukan dan diperbaiki: ENG-REVIEW-01 s/d ENG-REVIEW-06) dan dinyatakan konsisten satu sama lain serta dengan System Architecture Baseline v1.0 (ADR-025).

**Addendum:** `design-tokens.md` ditambahkan kemudian sebagai SoT visual tokens (ADR-038) — template siap; nilai diisi setelah design approve.

Baseline ini menjadi acuan wajib untuk:

* M7 — Repository & Bootstrap
* M8 — Development

### Reason

* Seluruh 8 topik M6 — Engineering Planning telah selesai didokumentasikan.
* Engineering Planning Review telah dilakukan dan semua inkonsistensi telah diselesaikan.
* Keputusan signifikan M6 memiliki ADR (ADR-026, ADR-028 s/d ADR-035).
* Exit criteria M6 terpenuhi; tidak ada blocker. Dependency terbuka AS-D04 (transactional email) dicatat sebagai Known Issue dan tidak memblokir bootstrap.
* Baseline diperlukan sebagai titik referensi tetap sebelum inisialisasi repository dan kode.

### Alternatives Considered

* Tidak menetapkan baseline formal — berisiko bootstrap M7 tanpa anchor keputusan teknis yang jelas.
* Menunda baseline sampai email provider (AS-D04) dipilih — tidak diperlukan; auth core dan infrastruktur sudah cukup untuk memulai Repository & Bootstrap.

---

## Decision ADR-037

### Title

Perluasan daftar SocialPlatform: Threads & Pinterest

### Status

Accepted

### Date

2026-07-21

### Decision

Daftar platform media sosial yang didukung aplikasi **diperluas secara aditif** (platform lama tetap):

1. Instagram
2. Facebook
3. Twitter / X
4. LinkedIn
5. TikTok
6. YouTube
7. Threads *(baru)*
8. Pinterest *(baru)*

Enum kanonikal `SocialPlatform` di `packages/shared` dan Shared Types di Architecture Baseline (`domain-model.md`) diupdate agar mencakup `threads` dan `pinterest`. Referensi daftar platform di Integration Layer, Architecture Overview, dan UX (user-flows / key-screen-patterns) diselaraskan.

### Reason

* Product owner menetapkan Threads dan Pinterest sebagai platform yang tersedia di app, tanpa menghapus Twitter/X dan LinkedIn yang sudah ada di baseline.
* Shared enum harus menjadi Source of Truth tunggal agar Publishing, Connected Accounts, Analytics, dan UI selector tidak diverge.
* Perubahan bersifat aditif — tidak memperkecil scope platform yang sudah didokumentasikan.

### Alternatives Considered

* Mengganti daftar lama (hapus Twitter/X & LinkedIn, ganti dengan Threads & Pinterest) — ditolak; product owner memilih opsi *tambah saja*.
* Mencatat hanya di CONVERSATIONS tanpa update enum/baseline — ditolak; risiko implementasi M8 memakai daftar yang usang.

---

## Decision ADR-038

### Title

Design Tokens — lokasi SoT & alur lock setelah design siap

### Status

Accepted

### Date

2026-07-21

### Decision

1. **Source of Truth visual tokens** untuk implementasi UI adalah  
   `product-discovery/06-engineering/design-tokens.md`  
   (font, brand/secondary, neutral, content status, feedback, spacing/radius, tema).
2. Dokumen tersebut merupakan **addendum Engineering Baseline** (melengkapi ADR-036): template disiapkan sekarang; **nilai token diisi setelah design di-approve Project Manager**.
3. Folder `design/` tetap ruang operasional handoff designer — **bukan** SoT token. UX Baseline (`product-discovery/04-ux/`) tetap SoT alur & struktur layar — **bukan** tempat hex/font.
4. Setelah nilai di-lock: status dokumen → Locked; mirror ke CSS variables / Tailwind theme di `apps/web`; catat di CHANGELOG (+ ADR amandemen nilai bila dampak brand/tema luas).

### Reason

* PM membutuhkan satu tempat jelas untuk mengisi styling setelah design beres, tanpa mengandalkan screenshot atau brief `design/` sebagai acuan engineering.
* Menempatkan tokens di Engineering mendekatkan SoT ke implementasi (Tailwind / shadcn) dan menjaga `04-ux/` fokus pada pola fungsi.
* Addendum lebih aman daripada mengarang SoT di folder yang secara preferensi kerja tidak masuk tracking development (`design/`).

### Alternatives Considered

* SoT di `product-discovery/04-ux/visual-style.md` — ditolak; UX Baseline sengaja tidak mengunci visual.
* SoT hanya di `design/DESIGN_OVERVIEW.md` — ditolak; `design/` bukan acuan Project OS untuk engineering.
* Token hanya di kode tanpa dokumen — ditolak; PM sulit mereview/lock sebelum implementasi.

---

## Decision ADR-039

### Title

Content Format (Post / Reel / Story / Pin) masuk MVP Publishing

### Status

Accepted

### Date

2026-07-21

### Decision

1. MVP **wajib** mendukung pemilihan format publikasi per akun tujuan (`PostTarget`), bukan satu tipe generik “post” saja.
2. Matriks MVP:
   * **Instagram & Facebook:** `post` · `reel` · `story`
   * **TikTok:** `post` (tanpa selector Reel/Story di UI — selaras kemampuan/UX Outstand)
   * **Pinterest:** `pin` (+ metadata: title, destination link, board)
   * **Twitter/X, LinkedIn, YouTube, Threads:** `post` (default)
3. Source of Truth enum: `ContentFormat` di `packages/shared`. Field domain: `PostTarget.contentFormat` + optional `platformOptions`.
4. Outstand memfasilitasi format ini di API/produk mereka; ACL (`OutstandAdapter`) memetakan `ContentFormat` → override Outstand. Domain tidak mengimpor kontrak Outstand mentah.
5. UX: Content Format Selector di Draft Editor (KSP-05), **per akun** yang dipilih.

### Reason

* Product owner menetapkan fitur ini **harusnya ada di MVP** setelah membandingkan UI Create Post Outstand (FB/IG menampilkan Post·Reel·Story; TikTok/Pinterest berbeda).
* Tanpa format di model & UI, app kita tidak setara kemampuan provider integrasi dan kebutuhan publishing harian Marketing Team.
* Menyimpan format per `PostTarget` mendukung multi-account posting tanpa memaksa satu format untuk semua jaringan.

### Alternatives Considered

* MVP hanya feed `post`; Story/Reel post-MVP — ditolak oleh PM (opsi 1: MVP sekarang).
* Satu format global per `Post` — ditolak; bentrok multi-platform & multi-account.
* Meniru UI Buffer 1:1 tanpa matriks Outstand — ditolak; TikTok/Pinterest tidak memakai radio Post/Reel/Story yang sama.

---

## Decision ADR-040

### Title

Penyelarasan Kontrak Resmi Outstand

### Status

Accepted

### Date

2026-07-23

### Decision

Baseline Product, UX, Architecture, dan Engineering diselaraskan dengan kontrak
resmi Outstand yang berlaku pada 2026-07-23:

1. **Webhook resmi yang digunakan MVP** adalah `post.published`, `post.error`,
   dan `account.token_expired`. `post.error` dipetakan oleh
   `OutstandAdapter` ke status domain `failed`; `account.token_expired`
   dipetakan ke status akun `error` dan kebutuhan reconnect. Nama event vendor
   tidak menjadi tipe domain.
2. **Webhook ingestion bersifat durable-before-ACK:** Route Handler
   memverifikasi HMAC atas raw body, menyimpan receipt idempoten ke
   `outstand_webhook_events`, lalu mengembalikan respons `2xx`. Pemrosesan
   domain dan retry dilakukan secara internal melalui PostgreSQL job queue.
   Retry delivery milik Outstand dan retry pemrosesan internal adalah dua
   mekanisme berbeda.
3. **Engagement MVP dibatasi ke komentar dan reply.** Data diambil melalui
   periodic pull setiap 30 menit serta manual refresh. Direct Message, mention,
   dan webhook engagement tidak termasuk MVP. Notifikasi `engagement_new`
   dibuat dari hasil sinkronisasi internal.
4. **Media publishing memakai Outstand Media API.** Original media tetap
   menjadi milik aplikasi di Supabase Storage. Saat diperlukan untuk publishing,
   aplikasi meminta upload URL Outstand, melakukan `PUT`, mengonfirmasi upload,
   lalu memakai URL working copy Outstand untuk membuat atau menjadwalkan post.
5. **X/Twitter tetap platform MVP tetapi wajib BYOK.** Project Owner
   mengonfigurasi kredensial X secara manual di dashboard Outstand. Aplikasi
   tidak menerima atau menyimpan Client ID/Client Secret X.
6. Tipe notifikasi internal seperti `post_failed` tetap dipertahankan. ACL
   bertanggung jawab menerjemahkan event eksternal ke bahasa domain.

Keputusan ini mengamendemen:

* ADR-005 — batas kemampuan Outstand dan prasyarat X BYOK.
* ADR-008 — scope Engagement MVP menjadi komentar/reply saja.
* ADR-013 — flow dan screen Engagement memakai pull + manual refresh.
* ADR-019 — kontrak `OutstandAdapter` mencakup event mapping, media upload,
  comment sync, dan reply.
* ADR-020 — webhook dipersistenkan sebelum ACK; daftar event resmi diperbarui.
* ADR-022 — `outstand.webhook.retry` digantikan
  `outstand.webhook.process` untuk pemrosesan/retry internal dan
  `engagement.sync` menjadi sumber utama Engagement.
* ADR-023 — notifikasi engagement berasal dari hasil sync, bukan webhook.
* ADR-025 — System Architecture Baseline diperbarui secara aditif.
* ADR-036 — Engineering Baseline diperbarui untuk schema, migrasi, dan
  prasyarat operasional Outstand.

### Reason

* Dokumentasi resmi Outstand hanya mencantumkan webhook `post.published`,
  `post.error`, `account.token_expired`, `import.completed`, dan
  `import.failed`; webhook komentar/DM yang diasumsikan baseline tidak ada.
* API resmi menyediakan baca/balas komentar, tetapi tidak menyediakan unified
  Direct Message API yang diperlukan scope lama.
* Outstand mengharuskan media di-upload dan dikonfirmasi sebelum URL hasil
  upload dipakai untuk post; signed URL Supabase langsung bukan kontrak
  publishing yang didukung.
* Menyimpan receipt sebelum ACK mencegah kehilangan event jika proses internal
  gagal setelah Outstand menerima respons sukses.
* X memerlukan kredensial developer milik customer; konfigurasi manual di
  dashboard Outstand paling sederhana dan tidak memperluas tanggung jawab
  aplikasi atas secret platform.

### Alternatives Considered

* Mempertahankan asumsi baseline lama sampai implementasi — ditolak karena
  akan menghasilkan kontrak ACL dan schema yang salah.
* Mempertahankan DM sebagai MVP dengan integrasi platform langsung — ditolak
  karena melanggar ADR-005 dan memperbesar scope integrasi.
* Mengirim signed URL Supabase langsung ke Outstand — ditolak karena bukan
  alur media resmi Outstand.
* ACK sebelum durable persistence — ditolak karena berisiko kehilangan event.
* Mengelola kredensial X melalui aplikasi — ditolak untuk MVP; dashboard
  Outstand lebih sederhana dan membatasi exposure secret.

---

## Decision ADR-041

### Title

UI Component System — Astryx sebagai Fondasi Permanen dan Design-Later Workflow

### Status

Accepted

### Date

2026-07-23

### Decision

1. **Astryx menggantikan shadcn/ui** sebagai UI component system project.
   Astryx menjadi fondasi komponen permanen, termasuk setelah designer masuk.
2. Selama implementasi feature M8, aplikasi memakai komponen dan
   **neutral theme bawaan Astryx**. Designer tersedia setelah feature project
   selesai untuk menetapkan visual direction dan nilai design tokens final.
   Hasil design diterapkan melalui Astryx theme, token bridge, dan wrapper
   selektif tanpa mengganti fondasi komponen.
3. **Tailwind CSS tetap dipertahankan**, tetapi dibatasi untuk layout, wrapper,
   spacing, grid, flex, dan responsive page composition. Astryx memiliki
   komponen, interaction behavior, accessibility, dan visual component theme.
4. Project memakai **wrapper selektif**, bukan wrapper menyeluruh. Wrapper
   dibuat hanya untuk komponen kritis, komponen yang dipakai luas, default
   aplikasi yang konsisten, atau adaptasi behavior produk.
5. Risiko Astryx Beta diterima dengan guardrail:
   * gunakan stable release dengan exact version; initial adoption memakai
     `@astryxdesign/core` dan theme versi `0.1.8`;
   * core dan theme di-upgrade sebagai satu unit;
   * jangan memakai canary release;
   * update dilakukan manual dan diverifikasi di staging;
   * hindari `swizzle` dan authoring StyleX pada tahap awal; dan
   * jalankan typecheck, lint, test, serta production build pada setiap upgrade.
6. Sebelum dipakai untuk implementasi feature secara luas, integrasi Astryx
   harus melewati smoke test Button, Dialog, form controls, Table, dark mode,
   Tailwind cascade layer, dan Next.js 16 production build.
7. Keputusan ini:
   * **mengamendemen ADR-035** dengan pengecualian exact version khusus paket
     Astryx selama masih Beta;
   * **mengamendemen ADR-038** pada urutan kerja: implementasi feature tidak
     menunggu design final; template design tokens tetap Draft/TBD sampai
     designer masuk setelah feature selesai; dan
   * menjadi addendum **ADR-036 Engineering Planning Baseline**, yang harus
     diselaraskan ke dokumen Engineering dan AI Context terkait sebelum
     implementasi UI feature.

### Reason

* Designer belum tersedia selama implementasi feature, sehingga project
  membutuhkan UI foundation yang dapat langsung dipakai tanpa mengarang visual
  design final.
* Astryx menyediakan komponen React accessible, typed, themeable, dark mode,
  template, serta tooling agent-ready yang sesuai workflow solo developer.
* Verifikasi 2026-07-23 mengonfirmasi lisensi MIT, dukungan React 19,
  precompiled CSS, jalur resmi Next.js + Tailwind CSS v4, serta CLI yang dapat
  dijalankan dengan Bun.
* Mempertahankan fondasi yang sama sebelum dan setelah designer masuk mencegah
  pembuangan implementasi interaction, accessibility, dan component structure.
* Tailwind tetap berguna untuk page composition, sedangkan pembatasan ownership
  styling mencegah konflik antara utility CSS dan internal component theme.
* Exact pin dan smoke test diperlukan karena Astryx masih Beta dan contoh resmi
  yang diverifikasi belum secara eksplisit menargetkan Next.js 16.

### Alternatives Considered

* Tetap memakai shadcn/ui — ditolak; Project Owner memilih Astryx sebagai
  fondasi permanen sebelum implementasi layar M8 berkembang.
* Menunda seluruh UI sampai designer tersedia — ditolak; akan memblokir
  implementasi dan validasi feature.
* Memakai Astryx hanya sebagai prototype sementara — ditolak; menghasilkan
  risiko rebuild komponen setelah designer masuk.
* Menghapus Tailwind dan memakai StyleX sepenuhnya — ditolak; menambah setup dan
  migrasi tanpa manfaat yang cukup untuk MVP.
* Wrapper untuk seluruh komponen Astryx — ditolak; menambah abstraksi dan beban
  maintenance tanpa kebutuhan nyata.
* Menggunakan Astryx langsung tanpa wrapper sama sekali — ditolak; komponen
  kritis tetap membutuhkan boundary untuk default dan adaptasi produk.

---

## Decision ADR-042

### Title

Claude Design Menggantikan Figma sebagai Design Handoff Tool

### Status

Accepted

### Date

2026-07-24

### Decision

1. **Claude Design** (project `Social Media Management`, projectId
   `84aded99-bb23-49b1-be9f-dd8f21c6873e`, diakses lewat tool `DesignSync`
   bawaan Claude Code — bukan MCP terpisah) menggantikan referensi Figma
   sebagai design handoff tool di `design-tokens.md` dan `design/README.md`.
2. `product-discovery/04-ux/` **tetap** Source of Truth untuk alur, IA, dan
   fungsi layar. Claude Design hanya menampung representasi visual
   (foundations, components, dan 8 layar KSP-01–08) yang diturunkan dari
   baseline tersebut — bukan pengganti UX Baseline, selaras aturan
   `ctx-design.md` butir 1.
3. Sinkronisasi antara `product-discovery/` dan project Claude Design bersifat
   **manual, on-request** — dijalankan oleh agent lewat `DesignSync` saat
   diminta eksplisit oleh Project Owner. Tidak ada trigger otomatis
   (webhook/polling) yang menjalankan sinkronisasi sendiri; ini batas teknis
   yang disadari, bukan kelalaian.
4. `design-tokens.md` Langkah 1 ("Review & approve di Figma") diamendemen
   menjadi "Review & approve di project Claude Design 'Social Media
   Management'". Langkah 2–5 (isi tabel token, ubah status ke Locked, catat
   ADR, mirror ke Astryx theme + Tailwind token bridge) tidak berubah.
5. Bila desain di Claude Design bertentangan dengan UX Baseline (`04-ux/`)
   yang sudah dikunci, **baseline + ADR yang menang** — perubahan harus lewat
   diskusi dan update baseline, bukan otomatis diikuti.
6. **Ruang lingkup:** keputusan ini hanya mengganti Figma sebagai *design
   handoff tool* (token, komponen, layar UI — konteks `design-tokens.md` dan
   `design/`). Sebutan "Figma" di `project-manager/ARCHITECTURE_OVERVIEW.md`,
   `project-manager/README.md`, dan skill `project-os-navigator/SKILL.md`
   merujuk hal berbeda (kanvas untuk menggambar ulang diagram arsitektur
   sebagai orientasi) dan **tidak terdampak** ADR ini.

### Reason

* Project tidak memiliki lisensi/akses Figma; Claude Design tersedia langsung
  lewat login claude.ai tanpa setup tambahan dan terintegrasi dengan workflow
  Claude Code yang sudah dipakai project ini.
* Menjaga jumlah tools tetap minim — satu design tool operasional (Claude
  Design) dibanding menambah Figma sebagai dependency baru untuk solo
  developer.
* Sinkronisasi otomatis dua arah tidak tersedia secara teknis (tidak ada
  webhook/trigger yang menjalankan Claude Code sendiri); manual on-request
  adalah opsi yang jujur secara kemampuan dan cukup untuk kebutuhan project
  saat ini.

### Alternatives Considered

* Tetap referensi Figma di `design-tokens.md` — ditolak; project tidak punya
  akses/lisensi Figma dan tidak ada kebutuhan mendesak untuk itu.
* Checklist wajib cek Claude Design di setiap sesi kerja UI (mirip workflow
  Astryx CLI di `AGENTS.md`) — ditolak untuk saat ini; menambah friction pada
  task UI kecil tanpa manfaat sepadan selama fase awal M8.
* Sync otomatis (webhook atau polling terjadwal) — ditolak; tidak ada
  infrastruktur untuk itu saat ini, dan kompleksitas tambahan tidak sepadan
  untuk workflow solo developer.

---

## Decision ADR-043

### Title

API Mobile-Ready via Route Handler `/api/v1` + Better Auth Bearer Plugin

### Status

Accepted

### Date

2026-07-24

### Decision

1. **Tidak ada backend terpisah** (Hono, Express, atau layanan API mandiri
   lain). Next.js App Router tetap satu-satunya runtime API, selaras
   Modular Monolith (ADR-025) dan AL-D01–AL-D04 di `application-layer.md`.
2. Mobile client (iOS/Android, direncanakan setelah MVP web selesai sesuai
   `future-roadmap.md`) diekspos lewat **Route Handler versioned**:
   `apps/web/app/api/v1/...`. Route Handler ini adalah entry point tipis
   kedua di atas Application Service yang sama dipakai Server Actions untuk
   web — tidak ada duplikasi business logic.
3. **Prioritas domain yang diekspos** mengikuti roadmap "Mobile Publishing,
   Mobile Inbox": `WorkspaceService` (fondasi context) → `PublishingService`
   → `EngagementService` → `NotificationService`. Domain lain menyusul sesuai
   kebutuhan mobile berikutnya.
4. **Auth mobile** memakai **Better Auth Bearer plugin** —
   `Authorization: Bearer <token>` menggantikan cookie session untuk request
   dari mobile client. Satu instance Better Auth dan satu tabel session tetap
   dipakai bersama web (AS-D02 tidak berubah — tetap database session,
   revocable).
5. **Workspace context untuk mobile** wajib eksplisit di path atau header
   tiap request (mis. `/api/v1/workspaces/:workspaceId/...`) — mobile tidak
   punya cookie "active workspace" seperti Middleware web.
6. **Versioning**: breaking change wajib naik ke `/api/v2`; kontrak `/api/v1`
   yang sudah dipakai mobile app tidak boleh diubah secara breaking begitu
   dirilis.
7. **Syarat keamanan wajib** sebelum endpoint mobile pertama dirilis:
   - Token disimpan di secure storage device (Keychain/Keystore), tidak di
     storage polos tanpa enkripsi — requirement lintas tim ke pengembang
     mobile.
   - `trustedOrigins` mendaftarkan custom scheme mobile secara eksplisit
     (mis. `exp://192.168.*.*:*/*` untuk Expo), bukan wildcard longgar.
   - Rate limit `customRules` per endpoint auth (sign-in, sign-up) diperketat
     dari default umum, karena `/api/v1` memperluas attack surface yang
     sebelumnya lebih tersembunyi di balik Server Actions.
   - Keputusan eksplisit soal durasi session mobile (tetap 7 hari atau lebih
     pendek + refresh) sebelum implementasi dimulai.
8. **CORS** tidak diaktifkan untuk kebutuhan Bearer mobile (CORS adalah
   mekanisme browser, tidak relevan untuk native HTTP client) — direvisit
   terpisah jika kelak ada public API berbasis browser/pihak ketiga.
9. **Timing implementasi**: fondasi (skema `/api/v1`, konfigurasi Bearer
   plugin) disiapkan sebelum M8 development web berjalan jauh, agar endpoint
   web (Server Actions) tidak perlu refactor besar nanti. Endpoint mobile
   aktual tetap dikerjakan setelah MVP web selesai, bukan sekarang.

### Reason

* Mobile app sudah tercatat sebagai future roadmap (`future-roadmap.md`),
  tapi arsitektur API saat ini (Server Actions + Route Handler khusus
  webhook) belum pernah dievaluasi untuk reusability lintas client.
* Server Actions secara teknis tidak bisa diandalkan sebagai kontrak API
  publik — ID action berubah tiap build, tidak didesain dipanggil dari luar
  Next.js.
* Application Service sebagai satu-satunya pemilik business logic (AL-D02)
  membuat penambahan Route Handler mobile menjadi entry point tambahan yang
  murah, bukan proyek arsitektur ulang — sehingga tidak butuh BE terpisah.
* Better Auth Bearer plugin mempertahankan satu sistem auth (satu secret,
  satu tabel session, satu tempat revoke) alih-alih membangun sistem auth
  kedua khusus mobile.
* Menyiapkan fondasi versioning dan auth sekarang (bukan saat mobile mulai
  dikerjakan) mencegah refactor besar pada kontrak Server Actions/Route
  Handler yang sudah dipakai web.

### Alternatives Considered

* Backend terpisah (Hono/Express sebagai API service mandiri) — ditolak;
  menambah service, deployment, dan duplikasi business logic tanpa manfaat
  yang sepadan mengingat Application Service sudah framework-agnostic secara
  desain.
* Mobile app memanggil Server Actions langsung — ditolak; tidak stabil lintas
  build, bukan kontrak API yang didukung resmi Next.js untuk client eksternal.
* Better Auth API Key plugin sebagai pengganti Bearer — ditolak untuk login
  interaktif mobile; API Key lebih cocok untuk programmatic/machine access
  (tetap dicatat sebagai Post-MVP terpisah di `auth-architecture.md`), bukan
  autentikasi user yang login di app.
* Tunda seluruh keputusan sampai mobile benar-benar mulai dikerjakan —
  ditolak; berisiko memaksa perubahan breaking pada kontrak Server
  Actions/Route Handler yang sudah stabil dipakai web MVP.

## Decision ADR-044

### Title

Amandemen `environment-management.md` — `NEXT_PUBLIC_SUPABASE_ANON_KEY` →
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### Status

Accepted

### Date

2026-07-24

### Decision

Nama env var client-side Supabase diubah dari `NEXT_PUBLIC_SUPABASE_ANON_KEY`
menjadi `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` di seluruh dokumentasi dan
kode (`environment-management.md`, `apps/web/.env.example`,
`apps/web/src/lib/env.ts`, `apps/web/src/lib/supabase/client.ts`). Nilainya
tetap dipakai sebagai argumen kedua `createClient()` dari `@supabase/supabase-js`
(browser client Realtime/Storage saja, DO-D02) — tidak ada perubahan
behavior, hanya penyesuaian nama variable.

### Reason

* Supabase memperkenalkan sistem API key baru (`sb_publishable_...` /
  `sb_secret_...`) yang menggantikan istilah `anon` / `service_role` secara
  bertahap; project baru (dibuat setelah rollout ini) menampilkan
  "Publishable key" sebagai default di dashboard, bukan lagi "anon key".
* Project Supabase Cloud `social-media-local` (dibuat 2026-07-24, M8
  bootstrap) sudah memakai sistem baru ini, sehingga mengikuti nama var lama
  akan membingungkan saat isi `.env.local` — Project Owner tidak menemukan
  field "anon key" di dashboard.
* `service_role` key legacy tetap dipakai apa adanya (masih ada di tab
  "Legacy API Keys"); amandemen ini hanya menyentuh key publik client-side.

### Alternatives Considered

* Pertahankan nama `NEXT_PUBLIC_SUPABASE_ANON_KEY` dan minta Project Owner
  mengisi value dari "Legacy API Keys" tab — ditolak; legacy anon/service_role
  keys dijadwalkan Supabase untuk deprecated akhir 2026, tidak ideal
  membangun fondasi M8 di atas sistem yang akan dihapus.
* Dukung kedua nama var sekaligus (fallback) — ditolak; menambah percabangan
  yang tidak perlu untuk kasus yang bisa diselesaikan dengan rename
  langsung, bertentangan dengan prinsip "no backwards-compat shim" project
  ini.

---

## Decision ADR-045

### Title

Hapus Folder `design/` — Belum Ada Designer Aktif

### Status

Accepted

### Date

2026-07-28

### Decision

1. Folder `design/` (`README.md`, `DESIGN_OVERVIEW.md`, `DESIGN_BRIEF.md`,
   `DESIGN_ONEPAGER.html`, 2 PDF handoff, `_build-brief-pdf.mjs`) **dihapus**
   dari repo. Folder ini dulu disiapkan sebagai paket handoff operasional
   untuk tim designer (ADR-042), tapi belum ada designer yang bergabung di
   project — paket tersebut menganggur tanpa dipakai siapa pun.
2. Pointer project **Claude Design** (project `Social Media Management`,
   projectId `84aded99-bb23-49b1-be9f-dd8f21c6873e`, akses claude.ai/design,
   sync manual/on-request lewat tool `DesignSync`) **dipindah** ke
   `context/ctx-design.md` — bukan dihapus. Project Claude Design itu sendiri
   (live di claude.ai/design) **tidak terdampak**; yang dihapus hanya cermin
   teksnya di repo.
3. **Tidak mengubah** keputusan inti ADR-038 (SoT design tokens tetap
   `product-discovery/06-engineering/design-tokens.md`) maupun ADR-042
   (Claude Design tetap design handoff tool, `04-ux/` tetap SoT alur/UX).
   ADR ini hanya mencabut keberadaan folder `design/` sebagai lokasi
   penyimpanan paket handoff — bagian ADR-038 poin 3 dan ADR-042 poin 1 & 6
   yang menyebut `design/README.md` sebagai lokasi pointer dianggap
   **superseded** oleh ADR ini; keputusan lain di kedua ADR tersebut tetap
   berlaku.
4. Saat designer benar-benar bergabung, paket handoff disusun ulang dari
   `product-discovery/04-ux/` + `design-tokens.md` (bukan dari histori file
   yang sudah dihapus) — lihat `context/ctx-design.md`.
5. Referensi ke `design/` di dokumen lain (`AGENTS.md`, `context/README.md`,
   `context/ctx-technical-context.md`, `project-manager/PROJECT_OVERVIEW.md`,
   `PROJECT_STATE.md`, `README.md`, `DEVELOPER_WORKFLOW.md`,
   `.agents/skills/project-os-navigator/SKILL.md`,
   `product-discovery/README.md`, `product-discovery/06-engineering/README.md`,
   `product-discovery/06-engineering/design-tokens.md`,
   `product-discovery/04-ux/README.md`) diperbarui mengikuti keputusan ini.
   Entri lama di dokumen append-only (`DECISIONS.md`, `CHANGELOG.md`,
   `CONVERSATIONS.md`) yang menyebut `design/` **tidak diubah** — tetap sah
   sebagai catatan historis pada saat ditulis.

### Reason

* `design/` terbukti tidak pernah dibaca AI untuk mengerjakan UI (SoT UI
  yang benar-benar dipakai: `04-ux/` untuk alur, `design-tokens.md` untuk
  token, Astryx CLI lokal untuk komponen — lihat `ctx-design.md`). Folder
  ini murni untuk designer manusia yang belum ada.
* Menyimpan paket handoff yang tidak dipakai menambah beban sinkronisasi
  (4 inkonsistensi ditemukan saat audit dokumentasi 2026-07-28) tanpa
  manfaat nyata selama tidak ada designer aktif.
* Pointer project Claude Design tetap bernilai (project live tetap ada,
  dan akan dibutuhkan lagi saat designer join atau token di-lock) — sehingga
  dipindah, bukan dihapus begitu saja.

### Alternatives Considered

* Hapus total termasuk pointer Claude Design — ditolak; project Claude
  Design masih live dan project ID/akses akan dibutuhkan lagi nanti, jadi
  menghapusnya tanpa jejak berarti harus dicari ulang dari awal.
* Pertahankan `design/` apa adanya, cukup perbaiki 4 inkonsistensi yang
  ditemukan — ditolak; folder tetap menganggur dan berisiko drift lagi di
  audit berikutnya selama tidak ada designer yang benar-benar memakainya.
* Rename folder jadi `design/` → arsip terpisah (mis. `.archive/design/`)
  daripada hapus — ditolak; menambah lokasi baru untuk dirawat tanpa
  menyelesaikan akar masalah (tidak ada yang memakai).

---

## Decision ADR-046

### Title

Routing Convention — Default View Section Render di Root Path (Hapus `/home`, `/publish/calendar`, `/engage/inbox`, `/settings/general`)

### Status

Accepted

### Date

2026-07-28

### Decision

1. Section yang punya **satu default/single view** merender langsung di
   `page.tsx` pada root path section itu sendiri — bukan di named child
   segment terpisah. Konkretnya:
   * `/{slug}` (root workspace) langsung merender **Home** — segment
     `/{slug}/home` **dihapus**. `app/page.tsx` (root redirect) mengarah ke
     `/${slug}` (bukan lagi `/${slug}/home`).
   * `/{slug}/publish` langsung merender **Calendar** (default tab per
     IA-D04/NP-D06) — segment `/publish/calendar` **dihapus**. Detail route
     `calendar/[postId]` pindah menjadi `/publish/[postId]`. **Superseded**
     untuk Publish oleh amandemen final 2026-07-29 di bawah — lihat
     "Amandemen Final (2026-07-29)".
   * `/{slug}/engage` langsung merender **Inbox** (satu-satunya layar Engage
     per `navigation-patterns.md`) — segment `/engage/inbox` **dihapus**.
   * `/{slug}/settings` langsung merender **General** (tab pertama Settings)
     — segment `/settings/general` **dihapus**.
2. Sub-screen **non-default** tetap punya segment eksplisit seperti
   sekarang: `/publish/queue`, `/publish/drafts`, `/publish/history`,
   `/settings/connected-accounts`, `/settings/members`, `/settings/roles`,
   `/settings/billing`. Tidak berubah.
3. Path lama (`/home`, `/publish/calendar`, `/engage/inbox`,
   `/settings/general`) **tidak** dipertahankan sebagai redirect
   kompatibilitas — fitur ini masih tahap M8 Development, belum pernah
   dirilis ke user eksternal, dan audit codebase + dokumentasi (grep
   menyeluruh) mengonfirmasi belum ada internal link yang hardcode ke
   path-path tersebut. Tidak ada broken-link risk nyata.
4. Aturan umum baru untuk routing App Router project ini: **segment yang
   hanya berfungsi sebagai container (punya `layout.tsx` tapi tanpa
   `page.tsx` sendiri, atau tanpa keduanya) tidak boleh dibiarkan begitu
   saja** — setiap section wajib punya `page.tsx` di root path-nya sendiri,
   baik berupa default view (kasus di atas) maupun konten asli section
   tersebut.

### Reason

* Konsisten dengan pola navigasi profesional yang sudah dipraktikkan luas
  (GitHub repo → tab **Code** default tanpa segment URL; Vercel/Notion →
  root workspace langsung render konten, bukan `/workspace/home`) —
  dibanding pola sebelumnya yang membuat root section jadi 404 kalau
  diakses langsung.
* Menutup celah 404 sistemik yang ditemukan sekaligus di 4 titik:
  `/{slug}`, `/{slug}/publish`, `/{slug}/engage`, `/{slug}/settings` —
  semuanya cuma punya `layout.tsx` (atau bahkan tidak punya apa-apa) di root
  tanpa `page.tsx`/redirect, sehingga langsung 404 saat diakses.
* IA-D04/NP-D06 sudah menetapkan Calendar sebagai default Publish secara
  **tetap** (dijustifikasi khusus untuk persona Raka & Maya), bukan
  sesuatu yang direncanakan berubah per role/preferensi — jadi tidak ada
  kehilangan fleksibilitas nyata dari mem-fix default view langsung di
  root path section.
* URL jadi lebih pendek dan bersih — selaras dengan keinginan menghindari
  path yang tidak perlu panjang seperti `/{slug}/home`.

### Alternatives Considered

* **Redirect ke default child** (root section melempar redirect ke
  `/publish/calendar`, dst., URL berubah di address bar) — ditolak;
  menambah satu HTTP roundtrip dan tetap mengubah URL bar, padahal tujuan
  awal justru menyederhanakan URL.
* **Shared component, dua URL** (root section dan child route sama-sama
  render komponen yang sama, tanpa redirect) — ditolak; menciptakan dua
  "canonical URL" untuk konten identik, berisiko membingungkan untuk
  internal linking dan analytics di kemudian hari.
* **Biarkan sebagai container 404** sampai ada in-page tab-switcher yang
  dibangun — ditolak; root section tetap 404 kalau diakses langsung tanpa
  melalui klik sidebar dulu, dan tidak ada dokumen yang pernah menugaskan
  siapa yang harus menutup gap ini.

### Catatan Tambahan (2026-07-28, interim — lihat Amandemen Final di bawah)

Implementasi live menemukan masalah yang tidak diantisipasi poin Decision
di atas: karena `publish/` juga punya sibling route dinamis
(`publish/[postId]`, dipakai Draft Editor dari Calendar/Queue/Drafts/
History), menghapus folder statis `calendar/` membuat `/publish/calendar`
(path lama) **tertangkap oleh `[postId]`** — bukan 404, tapi merender
placeholder Draft Editor dengan `postId = "calendar"`. Home, Engage,
Settings tidak punya masalah ini karena tidak ada sibling route dinamis di
level root mereka.

Sebagai penanganan sementara (saat itu), khusus bagian Publish dari
ADR-046 di-revert: `calendar/` (+ `calendar/[postId]`) dihidupkan lagi
sebagai folder statis, dan `publish/page.tsx` redirect ke
`/publish/calendar` — bukan merender Calendar langsung di root seperti
poin Decision #1 di atas. Poin Decision #1 untuk Home, Engage, Settings
**tidak berubah** dan tetap berlaku penuh.

### Amandemen Final (2026-07-29) — Publish Dikecualikan Permanen dari Root-Render

**Keputusan final:** state interim di atas **diformalkan sebagai final**,
bukan sekadar sementara. `/{slug}/publish` **tetap** redirect ke
`/{slug}/publish/calendar`; `calendar/` (+ `calendar/[postId]`) **tetap**
jadi folder statis permanen. Poin Decision #1 baris Publish (render
langsung di root, `[postId]` pindah ke `/publish/[postId]`) **tidak
pernah dijalankan** dan tidak akan dijalankan.

**Alasan:**

* Publish adalah **satu-satunya** section dengan sibling route dinamis
  (`[postId]`) langsung di level root section — Home, Engage, Settings
  tidak punya kasus ini. Memaksakan pola root-render di sini berarti
  memindahkan `[postId]` ke path lain atau mengubahnya jadi intercepting
  route, keduanya menambah kompleksitas nyata untuk manfaat yang kecil
  (menghilangkan satu HTTP redirect).
* Redirect permanen sudah terverifikasi live (ngrok tunnel, akun test Raka
  Pratama) tanpa masalah — tidak ada broken link, sidebar highlight benar,
  typecheck/lint/test hijau.
* Konsistensi murni dengan Home/Engage/Settings bukan tujuan itu sendiri;
  ADR-046 tujuan utamanya menutup celah 404 sistemik — itu sudah tercapai
  untuk Publish lewat redirect yang jelas (bukan 404, bukan mismatch
  `[postId]`).

**Alternatif yang dipertimbangkan (ditolak):**

* **Root-render + rename `[postId]` ke path lain** (mis.
  `/publish/post/[postId]`) — ditolak; menambah kerja rename + update
  semua link ke detail post, untuk manfaat kosmetik (satu redirect lebih
  sedikit) yang tidak sepadan.
* **Root-render + `[postId]` jadi intercepting/parallel route (modal)** —
  ditolak untuk saat ini; effort paling besar (mengubah UX post detail
  dari full page ke modal), di luar scope keputusan routing murni.

**Dampak:** `/publish` adalah pengecualian **permanen** dan terdokumentasi
dari pola ADR-046 poin #1, bukan penyimpangan sementara yang menunggu
keputusan lanjutan. Tidak ada task lanjutan yang menggantung untuk topik
ini.

---

## Decision ADR-047

### Title

Publish Now — Fitur Resmi Publish Langsung Tanpa Jadwal

### Status

Accepted

### Date

2026-07-29

### Context

Audit konsistensi dokumentasi (dipicu saat memperbarui App Prototype Claude
Design) menemukan `application-layer.md` sudah menyebut method
`publishNow` ("Publish langsung tanpa jadwal") di tabel `PublishingService`
— tetapi UX Baseline (`key-screen-patterns.md` KSP-05) dan
`roles-permissions.md` (tabel transisi status) sama sekali tidak memiliki
konsep ini. KSP-05 hanya mendefinisikan "Schedule Action" (KSP-05-F09), dan
tabel transisi status hanya mengenal `Scheduled → Published` sebagai
transisi otomatis sistem — tidak ada jalur `Draft → Published` langsung.

### Decision

1. **Publish Now diangkat menjadi fitur UX resmi**, bukan sekadar method
   arsitektur yang menggantung tanpa desain UI:
   * `key-screen-patterns.md` — KSP-05 mendapat function ID baru
     **KSP-05-F12 (Publish Now Action)**: eksekusi publish langsung tanpa
     jadwal, tombol tersedia berdampingan dengan Schedule Action di action
     bar Draft Editor.
   * `mvp-definition.md` — bullet baru di bagian Publishing Must Have.
   * `information-architecture.md` — Publish Now ditambahkan ke hierarki
     layar Draft Editor dan tabel pemetaan fitur MVP.
2. **Akses Publish Now dibatasi identik dengan Schedule**: Owner, Admin,
   Manager — **bukan** tingkat akses baru yang lebih ketat, dan **bukan**
   dibuka lebih lebar dari Schedule. Creator tidak melihat/tidak bisa
   memicu aksi ini.
   * `roles-permissions.md` — baris baru di tabel transisi status:
     `Draft → Published (Publish Now, skip jadwal)`: Owner ✅, Admin ✅,
     Manager ✅, Creator ❌, Sistem —. Baris ringkasan "Jadwalkan/publish
     konten" diberi catatan eksplisit bahwa ini mencakup Publish Now.
3. `application-layer.md` — baris `publishNow` diperjelas: merujuk
   KSP-05-F12, RBAC sama dengan `schedulePosts`, dan tetap wajib validasi
   matriks `ContentFormat` per target (ADR-039) sebelum memanggil Outstand.
4. UI wajib menampilkan **konfirmasi eksplisit** sebelum eksekusi Publish
   Now (selaras **UXP-04** — *"Konfirmasi akun dan jadwal harus jelas dan
   tidak bisa diabaikan sebelum publish"*) — karena aksi ini langsung
   tayang tanpa jeda koreksi seperti `cancelSchedule` pada Schedule biasa.
   UXP-06 (Status Jelas, Proses Ringan) justru prinsip yang membenarkan
   aksi *lain* yang reversibel (Save as Draft, Kirim untuk Review) **tidak**
   memerlukan konfirmasi tambahan — bukan dasar syarat konfirmasi di sini.

### Reason

* Pola akses yang **sudah ada** di `roles-permissions.md` selalu
  menyatukan Schedule dan Publish dalam satu tingkat akses yang sama
  (baris ringkasan "Jadwalkan/publish konten"; transisi
  `Ready to Schedule → Scheduled` dan `Draft → Scheduled (skip review)`
  sama-sama Owner/Admin/Manager, Creator ❌) — menyamakan Publish Now ke
  tingkat akses ini konsisten dengan pola yang sudah berlaku, bukan aturan
  baru yang asing.
* Membiarkan `publishNow` hanya disebut di layer arsitektur tanpa desain
  UX resmi berisiko diimplementasikan tanpa RBAC yang jelas, atau
  terlewat sepenuhnya karena tidak ada di KSP manapun.

### Alternatives Considered

* **Hapus `publishNow` dari `application-layer.md`** (turunkan arsitektur
  ke level UX yang sudah ada, publish langsung cukup lewat Schedule
  Picker dengan waktu = sekarang) — awalnya direkomendasikan sebagai opsi
  paling minim perubahan, **ditolak** oleh user: Publish Now dianggap
  cukup bernilai untuk diangkat jadi fitur resmi dengan tombol
  tersendiri, bukan disamarkan sebagai kasus khusus Schedule.
* **Akses lebih ketat — hanya Owner dan Admin** (mengecualikan Manager,
  dengan alasan Publish Now lebih berisiko/tanpa jeda koreksi dibanding
  Schedule) — **ditolak**; akan menciptakan tingkat akses baru untuk aksi
  konten yang belum pernah ada sebelumnya di `roles-permissions.md`
  (semua aksi konten selama ini konsisten Owner/Admin/Manager vs
  Creator). Konsistensi dengan pola yang ada dinilai lebih penting
  daripada mitigasi risiko tambahan untuk kasus ini.

### Impact

* Dokumentasi baseline (`mvp-definition.md`, `key-screen-patterns.md`,
  `information-architecture.md`, `roles-permissions.md`,
  `application-layer.md`) sudah diselaraskan pada tanggal keputusan ini.
* **Implementasi belum berjalan** — baik di kode (`PublishingService`
  belum punya `publishNow` nyata, baru nama method di dokumen arsitektur)
  maupun di App Prototype Claude Design (Draft Editor baru punya
  Save as Draft + Schedule). Keduanya adalah task lanjutan terpisah,
  bukan bagian dari ADR ini.

---

## Decision ADR-048

### Title

Disconnect Account — Wajib Melalui Dialog Konfirmasi

### Status

Accepted

### Date

2026-07-29

### Context

Audit menyeluruh atas seluruh aksi produk (dipicu diskusi Safety Check /
Double Confirmation untuk Publish Now, ADR-047) menemukan bahwa
**Disconnect Account** (KSP-08-F05) sama sekali tidak punya spesifikasi
konfirmasi di `key-screen-patterns.md` — hanya "pengguna dapat melepas
koneksi akun". Ini berbeda dari kasus Remove Member/Transfer
Ownership/Delete Workspace (yang screen-nya sendiri belum pernah
dirancang) karena Disconnect Account **sudah** punya screen resmi
(KSP-08, salah satu dari 8 KSP) dan sudah diimplementasikan di App
Prototype Claude Design (`settings-connected-accounts.html`) — jadi gap
ini langsung actionable tanpa perlu merancang layar baru.

### Decision

1. Disconnect Account **wajib** menampilkan dialog konfirmasi sebelum
   eksekusi — fungsi baru **KSP-08-F07 (Disconnect Confirmation)**.
2. Dialog ini **bukan** varian dari Confirmation Summary (KSP-05-F06,
   dipakai Schedule/Publish Now) — cukup peringatan singkat + dua tombol
   (`Batal` / `Putuskan Koneksi`), karena Disconnect bukan aksi
   mempublikasikan konten dan tidak perlu ringkasan multi-field.
3. Isi dialog wajib mengingatkan konsekuensi yang sudah didokumentasikan
   di KSP-D09: post yang sudah terjadwal untuk akun ini **tetap di
   antrean**, tidak otomatis dibatalkan.
4. Tidak ada perubahan RBAC — akses Disconnect tetap Owner/Admin saja,
   sesuai `roles-permissions.md` yang sudah ada ("Tambah/hapus connected
   accounts").
5. `key-screen-patterns.md` — pola baru "Pola: Disconnect Flow" + baris
   Decision Log KSP-D14.

### Reason

* UXP-04 (Publishing Trust) berlaku juga di sini secara tidak langsung:
  memutus akun yang punya post terjadwal aktif adalah aksi yang bisa
  mengejutkan pengguna kalau dieksekusi tanpa peringatan — walau bukan
  aksi publish itu sendiri.
* Disconnect Account adalah satu-satunya dari 4 aksi berisiko yang
  ditemukan saat audit (bersama Remove Member, Transfer Ownership, Delete
  Workspace) yang sudah punya screen nyata — jadi bisa diselesaikan
  sekarang tanpa menunggu desain layar Workspace Settings lain yang lebih
  besar scope-nya.

### Alternatives Considered

* **Pakai pola Confirmation Summary yang sama seperti Schedule/Publish
  Now** — ditolak; Disconnect tidak punya data multi-field (caption,
  akun, waktu) untuk diringkas — dialog peringatan sederhana sudah cukup
  dan tidak menambah friksi yang tidak perlu (UXP-03).
* **Tidak menambah apa pun, biarkan sebagai gap terdokumentasi** —
  ditolak; user secara eksplisit meminta gap ini diperbaiki begitu
  ditemukan saat audit, bukan sekadar dicatat.

### Impact

* `key-screen-patterns.md`, `roles-permissions.md` sudah diselaraskan.
* Remove Member, Transfer Ownership, dan Delete Workspace **sengaja tidak
  disentuh** oleh ADR ini — screen-nya belum pernah dirancang, ditunda ke
  inisiatif terpisah (lihat diskusi sesi 2026-07-29).
* Implementasi App Prototype (dialog Disconnect Confirmation di
  `settings-connected-accounts.html` + `AppPrototype.dc.html`) dan kode
  nyata belum berjalan — task lanjutan terpisah.

---

## Decision ADR-049

### Title

Safety Check / Double Confirmation — Kebijakan Lintas Produk

### Status

Accepted

### Date

2026-07-29

### Context

Setelah ADR-047 (Publish Now) dan ADR-048 (Disconnect Account), user
meminta audit menyeluruh: dari seluruh aksi yang ada di baseline
(publish, draft, akun, member, workspace, logout), mana saja yang
**seharusnya** wajib melalui Safety Check / Double Confirmation —
bukan cuma yang kebetulan sudah punya, tapi berdasarkan penilaian risiko
yang konsisten. Sebelum ini, ada 1 pola konfirmasi (Confirmation Summary)
dipakai untuk 2 aksi (Schedule, Publish Now) + 1 pola baru (Disconnect
Confirmation) — tanpa kerangka eksplisit yang bisa dipakai menilai
belasan aksi lain.

### Decision

1. **Kriteria wajib konfirmasi** ditetapkan sebagai kerangka resmi:
   * **Irreversibel/mahal dibatalkan** — tidak ada jalur "undo" yang wajar.
   * **Blast radius besar** — dampak melampaui data milik pengguna sendiri
     (tim, workspace, atau komitmen publik).
2. **Dua tingkatan (tier)**:
   * **Tier 1** (konfirmasi diperkuat, mis. ketik nama untuk konfirmasi):
     Transfer Ownership, Delete/Hapus Workspace.
   * **Tier 2** (dialog standar, pola sama dengan Disconnect Confirmation):
     Delete Post, Delete Media, Remove Member, Update Member Role, Cancel
     Schedule, **Logout**.
   * **Tidak wajib**: Save as Draft, Kirim ke Review, Mark as Done, Reply
     komentar, Connect Account, Reconnect, Remove Link (Start Page).
3. Diklasifikasikan dan didokumentasikan sebagai pola lintas layar baru
   di `key-screen-patterns.md` (bukan UXP baru — lihat Alternatives),
   dengan cross-reference di `navigation-patterns.md` (NP-D10, Logout),
   `roles-permissions.md`, dan `application-layer.md`.

### Reason

* Kerangka reversibilitas + blast radius konsisten dengan cara Publish
  Now (ADR-047) dan Disconnect Account (ADR-048) sudah dinilai
  sebelumnya — bukan kriteria baru yang asing, melainkan generalisasi
  dari pola yang sudah dipakai dua kali.
* Tanpa kerangka eksplisit, keputusan "aksi X butuh konfirmasi atau
  tidak" akan diputuskan ad-hoc per kasus (seperti yang terjadi pada
  Publish Now dan Disconnect Account) — menciptakan risiko inkonsistensi
  di layar-layar yang belum dirancang.
* UXP-03 (Simplisitas) secara eksplisit jadi penyeimbang: aksi
  reversibel/frekuensi tinggi (Reply komentar, Save as Draft) sengaja
  **tidak** diberi konfirmasi tambahan — mencegah kerangka ini
  disalahgunakan untuk menambah friksi di semua tempat.

### Alternatives Considered

* **Logout tidak perlu konfirmasi** (rekomendasi awal — reversibel penuh,
  aksi paling sering dipakai di seluruh app, tanpa risiko kehilangan
  data) — **ditolak oleh user**: Logout dipindah ke Tier 2. Alasan
  eksplisit user tidak dicatat secara rinci; kemungkinan besar melindungi
  dari interupsi pekerjaan yang belum tersimpan saat logout tidak
  sengaja diklik.
* **Tambahkan sebagai UXP-08 baru** (bukan pola lintas layar di
  `key-screen-patterns.md`) — ditolak; `ux-principles.md` secara
  eksplisit membatasi diri ke 7 prinsip yang masing-masing tertelusur ke
  insight User Discovery (I-01–I-08) sebagai Exit Criteria — Safety Check
  adalah penerapan kebijakan, bukan insight pengguna baru. Sebagai
  gantinya ditambahkan sebagai bullet implikasi desain di bawah UXP-04.
* **Bangun langsung method service `deleteWorkspace`/`transferOwnership`
  di `application-layer.md`** — ditolak untuk sesi ini; kedua method ini
  belum ada sama sekali dan screen pemicunya (Workspace Settings →
  General) belum dirancang — menambahkannya sekarang berarti menebak
  kontrak API tanpa desain layar, di luar scope audit dokumentasi.

### Impact

* `key-screen-patterns.md` — bagian baru "Pola Lintas Layar — Safety
  Check / Double Confirmation" (kriteria, tier, klasifikasi lengkap 17
  aksi, catatan implementasi).
* `navigation-patterns.md` — NP-D10 baru (Logout wajib Tier 2).
* `roles-permissions.md`, `application-layer.md` — cross-reference tier
  ditambahkan ke baris yang relevan (Hapus Workspace, Transfer Ownership,
  Remove Member, Update Role, Cancel Schedule, Delete Post, Delete
  Media).
* `application-layer.md` mencatat eksplisit bahwa `deleteWorkspace` dan
  `transferOwnership` **belum punya method service** — gap arsitektur
  terpisah dari ADR ini, ditunda sampai screen Workspace Settings →
  General dirancang.
* **Implementasi belum berjalan** di kode maupun App Prototype untuk
  seluruh aksi Tier 1/Tier 2 yang baru diklasifikasikan di sini (kecuali
  Schedule, Publish Now, Disconnect Account yang sudah ada sebelumnya).

---

## Decision ADR-050

### Title

Transfer Ownership & Delete Workspace — Method Service dan Alur Transfer

### Status

Accepted

### Date

2026-07-29

### Context

ADR-049 menemukan `deleteWorkspace` dan `transferOwnership` — dua aksi
Tier 1 — sama sekali tidak punya method service di `application-layer.md`,
dan sengaja tidak ditambahkan saat itu karena screen pemicunya (Workspace
Settings → General) belum dirancang. User meminta gap ini diperbaiki.
Menelusuri lebih lanjut, `deleteWorkspace` ternyata tidak punya ambiguitas
berarti (skema DB sudah `ON DELETE CASCADE` di setiap tabel `workspace_id`
— perilaku cascade sudah implisit jelas). Tapi `transferOwnership` punya
satu fork nyata yang belum pernah diputuskan di dokumen manapun:
`roles-permissions.md` hanya menyebut *"Ownership bisa ditransfer ke
Admin lain"* tanpa menjelaskan apakah prosesnya langsung (Owner memilih,
selesai) atau butuh persetujuan Admin target.

### Decision

1. **Transfer Ownership adalah proses dua langkah** (bukan swap
   langsung):
   * `transferOwnership(targetMemberId)` — Owner memicu, RBAC Owner
     saja, target harus Admin aktif. Mengisi `Workspace.
     pendingOwnerTransferTo`, mengirim notifikasi
     `ownership_transfer_requested` ke target. **Tidak** langsung
     menukar role.
   * `acceptOwnershipTransfer()` — Admin target menerima. RBAC: hanya
     user yang cocok dengan `pendingOwnerTransferTo`. Role Owner lama
     dan Admin target bertukar dalam satu transaksi;
     `pendingOwnerTransferTo` dikosongkan; notifikasi
     `ownership_transfer_resolved` ke Owner lama.
   * Kedua method wajib konfirmasi **Tier 1** (ADR-049) sebelum
     dipicu/diterima — pola "ketik nama workspace untuk konfirmasi".
2. **`deleteWorkspace`** ditambahkan sebagai method sederhana: Owner
   saja, wajib konfirmasi Tier 1, cascade mengikuti constraint DB yang
   sudah ada — tidak ada logika tambahan yang perlu didesain.
3. Model data: `Workspace.pendingOwnerTransferTo: UserId?`
   (`domain-model.md` DM-D11) + kolom `pending_owner_transfer_to`
   (`database-strategy.md`) + dua `NotificationType` baru
   (`ownership_transfer_requested`, `ownership_transfer_resolved`,
   `domain-model.md`).

### Reason

* Transfer kepemilikan berarti memindahkan tanggung jawab penuh
  (termasuk billing) ke orang lain — memaksakannya secara sepihak tanpa
  persetujuan berisiko membebani Admin yang belum siap/tidak setuju.
  Pola ini konsisten dengan `inviteMember` + `acceptInvite` yang sudah
  ada di dokumen yang sama (undang dulu, baru aktif setelah diterima) —
  bukan pola baru yang asing bagi arsitektur ini.
* `deleteWorkspace` tidak butuh keputusan tambahan karena kontraknya
  sudah sepenuhnya implisit dari skema DB (`DB-D03`, `ON DELETE CASCADE`)
  — menambahkan method-nya sekarang tidak berarti menebak apa pun.

### Alternatives Considered

* **Transfer langsung tanpa persetujuan** (Owner pilih Admin, konfirmasi
  Tier 1, role langsung bertukar) — sempat direkomendasikan sebagai opsi
  paling sederhana (konsisten dengan Update Member Role yang juga
  langsung), **ditolak oleh user** demi keamanan tambahan: Admin target
  harus punya kesempatan menolak sebelum menanggung kepemilikan penuh.
* **Tunda dulu sampai screen Workspace Settings dirancang** (keputusan
  ADR-049 sebelumnya) — dibatalkan atas permintaan user; method service
  bisa didefinisikan di level arsitektur tanpa menunggu UI, mengikuti
  pola method lain di `WorkspaceService` yang juga tidak semuanya
  punya KSP screen (mis. `inviteMember`, `removeMember`).

### Impact

* `application-layer.md` — 3 method baru di `WorkspaceService`.
* `domain-model.md` — field baru `pendingOwnerTransferTo`, 2
  `NotificationType` baru, DM-D11.
* `database-strategy.md` — kolom baru `pending_owner_transfer_to`.
* `roles-permissions.md` — klarifikasi alur dua langkah.
* **UI/screen Workspace Settings → General masih belum dirancang** —
  method service ini siap dipakai begitu screen-nya ada; ADR ini
  menyelesaikan kontrak arsitektur, bukan implementasi UI.
