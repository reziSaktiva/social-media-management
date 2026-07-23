# Deployment & Infrastructure

Dokumen ini mendefinisikan **platform deployment, region, topologi environment, dan strategi infrastruktur** untuk produk Social Media Management.

Dokumen ini adalah implementasi konkret dari keputusan pra-architecture (Railway sebagai deployment platform, Supabase sebagai database/storage/realtime) dan menetapkan detail operasional yang belum diputuskan: region hosting, jumlah tier environment, dan strategi Supabase project per environment.

---

# Tujuan

* Menetapkan platform dan region hosting secara definitif sebelum Repository & Bootstrap (M7).
* Mendefinisikan topologi environment (production, staging) dan tanggung jawab masing-masing.
* Menetapkan strategi Supabase project per environment.
* Mendefinisikan arsitektur service di Railway (web app + cron).
* Menetapkan build & deploy pipeline yang selaras dengan monorepo Bun Workspaces.
* Menetapkan strategi domain, TLS, scaling, dan rollback untuk MVP.

---

# Keputusan Pra-Architecture

Keputusan berikut sudah ditetapkan sebelum dokumen ini dibuat dan menjadi fondasi:

| Topik | Keputusan | Sumber |
|-------|-----------|--------|
| App Hosting | Railway | keputusan pra-architecture (ADR-025 ringkasan) |
| Database Platform | Supabase PostgreSQL Cloud | `database-strategy.md` (ADR-015) |
| Storage | Supabase Storage | `database-strategy.md` |
| Realtime | Supabase Realtime (notifikasi in-app) | `realtime-strategy.md` (ADR-023) |
| Background Jobs | PostgreSQL job queue + Railway Cron sebagai trigger | `background-jobs.md` (ADR-022) |
| Runtime | Bun | ADR-002 |
| Framework | Next.js (App Router) | ADR-003 |
| Monorepo | Hybrid Monorepo — `apps/web` sebagai satu deployment unit | ADR-001, ADR-026 |

---

# Keputusan Deployment (Ditetapkan di Dokumen Ini)

| ID | Topik | Keputusan |
|----|-------|-----------|
| DI-D01 | Region | **Singapore / Southeast Asia** — Railway dan Supabase co-located di region SEA untuk latency terendah ke target market (Marketing Team Indonesia) |
| DI-D02 | Environment Topology | **Production + Staging** — dua environment persisten; staging mirror production untuk uji pra-rilis |
| DI-D03 | Supabase per Environment | **Project Supabase terpisah** per environment (production & staging) — isolasi data penuh |
| DI-D04 | Service Architecture | Dua Railway service per environment: **`web`** (Next.js) dan **`cron`** (trigger background jobs) |
| DI-D05 | Deploy Trigger | Deploy otomatis dari Git — branch `main` → production, branch `staging` → staging |
| DI-D06 | Rollback | Redeploy dari deployment sebelumnya (Railway immutable deployments) + Supabase migration reversible |

---

# Platform Overview

Infrastruktur MVP terdiri dari dua provider dengan tanggung jawab terpisah:

```
┌────────────────────────────────────────────────────────────┐
│                        RAILWAY (SEA)                          │
│                                                               │
│   ┌──────────────────┐          ┌──────────────────┐         │
│   │   web service    │          │   cron service   │         │
│   │   (Next.js/Bun)  │          │  (Railway Cron)  │         │
│   │                  │          │                  │         │
│   │  - App Router    │          │  memanggil       │         │
│   │  - Server Actions│          │  POST /api/jobs/ │         │
│   │  - Route Handlers│          │  run (web) sesuai│         │
│   │  - Middleware    │          │  jadwal          │         │
│   └────────┬─────────┘          └────────┬─────────┘         │
└────────────┼─────────────────────────────┼──────────────────┘
             │                              │
             ▼                              ▼
┌────────────────────────────────────────────────────────────┐
│                    SUPABASE (SEA, ap-southeast-1)             │
│                                                               │
│   PostgreSQL  ·  Storage (bucket media)  ·  Realtime          │
└────────────────────────────────────────────────────────────┘
```

**Pembagian tanggung jawab:**
- **Railway** — menjalankan aplikasi Next.js dan penjadwal cron. Compute layer.
- **Supabase** — menyediakan PostgreSQL (data), Storage (media), dan Realtime (notifikasi). Managed data layer.

Outstand API (integrasi social media) adalah dependency eksternal yang diakses dari `web` service via OutstandAdapter (`integration-layer.md`), tidak di-deploy sendiri.

---

# Region & Latency

## Pilihan Region (DI-D01)

| Komponen | Region |
|----------|--------|
| Railway | Southeast Asia (Singapore) |
| Supabase | `ap-southeast-1` (Singapore) |

**Alasan:**
- Target market utama adalah **Marketing Team di Indonesia** — region SEA memberikan latency terendah.
- Railway dan Supabase **co-located** di Singapore — meminimalkan round-trip antara compute layer dan database (query, RLS, storage signed URL).
- Outstand API adalah panggilan asinkron/background untuk sebagian besar operasi (publishing, sync), sehingga latency ke provider tidak berada di jalur kritis UX.

**Konsekuensi:** seluruh environment (production dan staging) menggunakan region yang sama untuk menjaga paritas.

---

# Environment Topology

## Dua Tier Persisten (DI-D02)

| Aspek | Production | Staging |
|-------|-----------|---------|
| Tujuan | Melayani user nyata | Uji pra-rilis, QA, demo internal |
| Git branch | `main` | `staging` |
| Railway environment | `production` | `staging` |
| Supabase project | Project terpisah (prod) | Project terpisah (staging) |
| Domain | domain produksi (custom) | subdomain staging (mis. `staging.<domain>`) |
| Data | Data user nyata | Data dummy / sanitized — tidak boleh berisi data produksi |
| Outstand | API/webhook credential produksi; X BYOK prod dikonfigurasi manual di dashboard Outstand | API/webhook credential staging; X BYOK staging/test dikonfigurasi terpisah jika tersedia |
| Akses | Publik | Terbatas (tim internal) |

**Prinsip:**
- Staging adalah **mirror struktural** production — konfigurasi, migration, dan versi identik; hanya data dan kredensial yang berbeda.
- Perubahan wajib melewati staging sebelum promote ke production.
- Preview environment per-PR (ephemeral) **tidak** digunakan pada MVP untuk menekan kompleksitas dan biaya — dapat ditambahkan post-MVP jika volume kontribusi meningkat.

---

# Supabase Project per Environment (DI-D03)

Setiap environment memiliki **project Supabase terpisah**:

```
Supabase Org
├── social-media-prod       ← dipakai Railway environment "production"
└── social-media-staging    ← dipakai Railway environment "staging"
```

**Alasan:**
- Isolasi data penuh — tidak ada risiko staging membaca/menulis data produksi.
- Migration dapat diuji di project staging sebelum diterapkan ke produksi.
- Kredensial (service role key, JWT secret, connection string) terpisah dan tidak saling bocor.

**Konsekuensi:**
- Migration harus dijalankan pada kedua project (staging dulu, lalu production) — lihat `database-orm.md` untuk migration workflow.
- Setiap environment memegang set env vars Supabase sendiri (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, dll.) — lihat `environment-management.md`.

---

# Railway Service Architecture (DI-D04)

Setiap Railway environment berisi dua service:

## 1. `web` Service — Next.js Application

| Aspek | Konfigurasi |
|-------|-------------|
| Runtime | Bun |
| Root directory | monorepo root (build memerlukan akses workspace) |
| Install | `bun install` (di root — satu lockfile untuk seluruh monorepo) |
| Build | `bun run build` → membangun `apps/web` (Next.js) |
| Start | `bun run --cwd apps/web start` |
| Port | Railway meng-inject `PORT` — Next.js listen pada `$PORT` |
| Health check | `GET /api/health` (Route Handler, sudah ada di monorepo-setup) |

Service ini menjalankan seluruh entry points: App Router (UI), Server Actions (mutations), Route Handlers (webhook Outstand, job runner, health), dan Middleware (auth guard + workspace context).

## 2. `cron` Service — Background Job Trigger

Selaras dengan ADR-022 (`background-jobs.md`): Railway Cron bertindak sebagai **trigger**, bukan eksekutor. Ia memanggil endpoint job runner di `web` service secara periodik.

| Aspek | Konfigurasi |
|-------|-------------|
| Mekanisme | Railway Cron schedule |
| Aksi | `POST /api/jobs/run` ke `web` service |
| Proteksi | Header `X-Job-Secret` dibandingkan env var (`auth-architecture.md`) |
| Frekuensi | Sesuai kebutuhan job queue (mis. tiap 1 menit) — detail di `background-jobs.md` |

`web` service kemudian menarik job dari tabel `background_jobs` menggunakan `SELECT FOR UPDATE SKIP LOCKED` dan mengeksekusinya. Logika ini tidak berubah dari arsitektur — dokumen ini hanya menetapkan bahwa trigger di-deploy sebagai Railway Cron.

JOB-03 comments sync dijadwalkan setiap 30 menit dan juga dapat dipicu manual melalui Application Service. JOB-01 hanya memproses durable receipt internal; retry delivery webhook tetap mekanisme Outstand yang berakhir setelah ACK `2xx`.

---

# Build & Deploy Pipeline

## Deploy Trigger (DI-D05)

```
git push origin staging   ──►  Railway (staging env)  ──►  build & deploy web + cron
git push origin main       ──►  Railway (production env) ──►  build & deploy web + cron
```

- Deploy dipicu otomatis oleh push ke branch yang dipetakan ke masing-masing environment.
- Gate kualitas (typecheck, lint, test, prisma validate) dijalankan di **GitHub Actions** sebelum merge — lihat `cicd-pipeline.md` (ADR-032). Railway hanya membangun setelah kode masuk ke branch environment; `prisma migrate deploy` di release/pre-start.

## Build Notes untuk Monorepo Bun

- `bun install` dijalankan di **root** monorepo karena lockfile (`bun.lockb`) dan workspace protocol (`@social/shared`) berada di root.
- Build hanya menghasilkan artefak untuk `apps/web` — `packages/shared` di-resolve sebagai source workspace (tidak perlu build terpisah pada MVP).
- Next.js output mode dan konfigurasi build detail ditetapkan saat Repository & Bootstrap (M7); dokumen ini menetapkan command dan runtime-nya.

---

# Domain, Networking & TLS

| Aspek | Keputusan MVP |
|-------|---------------|
| Domain produksi | Custom domain di-attach ke Railway `web` service (production) |
| Domain staging | Subdomain terpisah (mis. `staging.<domain>`) atau domain `*.up.railway.app` default |
| TLS | Otomatis via Railway (Let's Encrypt) — HTTPS wajib di semua environment |
| Cookie `Secure` | `true` di production & staging (keduanya HTTPS) — selaras `auth-strategy.md` |

Nama domain final ditentukan saat go-live; dokumen ini menetapkan bahwa production menggunakan custom domain dan staging menggunakan subdomain terpisah agar cookie/CORS terisolasi.

---

# Scaling Strategy (MVP)

| Aspek | Keputusan MVP |
|-------|---------------|
| Horizontal scaling | Tidak pada MVP — single instance per service |
| Vertical scaling | Naikkan resource Railway service jika dibutuhkan |
| Statelessness | `web` service stateless — session di cookie + DB, tidak ada in-memory state |
| Database scaling | Dikelola Supabase (managed) — connection pooling via Supabase (lihat `database-orm.md`) |
| Bottleneck utama | Koneksi database — dimitigasi dengan connection pooling, bukan menambah instance |

Karena `web` service stateless, horizontal scaling dapat ditambahkan post-MVP tanpa perubahan arsitektur. Job runner aman terhadap concurrency melalui `SKIP LOCKED` (ADR-022), sehingga menjalankan lebih dari satu instance tidak menyebabkan double-processing.

---

# Rollback Strategy (DI-D06)

| Layer | Mekanisme Rollback |
|-------|--------------------|
| Aplikasi (Railway) | Redeploy deployment sebelumnya — Railway menyimpan riwayat deployment immutable |
| Database (Supabase) | Migration reversible; setiap migration punya down/rollback — lihat `database-orm.md` |
| Config/Secrets | Env vars di-versioning per environment; perubahan dicatat — lihat `environment-management.md` |

**Prinsip:** rollback aplikasi harus aman terhadap skema database. Perubahan skema yang breaking diterapkan dengan pola **expand-and-contract** (tambah kolom/tabel dulu, hapus setelah kode lama tidak dipakai) agar rollback aplikasi tidak bertabrakan dengan skema baru.

---

# Secrets & Environment Variables (Ringkasan)

Setiap environment memegang set env vars sendiri di Railway. Kategori utama:

| Kategori | Contoh |
|----------|--------|
| Supabase | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `DATABASE_URL` |
| Auth | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Integrasi | `OUTSTAND_API_KEY`, `OUTSTAND_WEBHOOK_SECRET` |
| Jobs | `JOB_SECRET` (X-Job-Secret) |

Detail lengkap penamaan, sumber, dan pengelolaan secret didefinisikan di `environment-management.md`. Dokumen ini hanya menetapkan bahwa **secret tidak dibagikan lintas environment** — konsekuensi langsung dari DI-D03.

**Prasyarat operasional X/Twitter:** Project Owner mengisi BYOK X langsung di dashboard Outstand untuk environment terkait. Tidak ada Railway Variable untuk X Client ID/Client Secret dan tidak ada secret X yang melewati aplikasi.

**Jalur media:** service `web` membaca original dari Supabase Storage, meminta upload URL Outstand, melakukan `PUT`, lalu confirm. Egress Supabase→Railway/Outstand dan timeout upload perlu dipantau; URL working copy Outstand dipakai saat schedule.

---

# Decision Log

| ID | Keputusan | Alasan | Alternatif |
|----|-----------|--------|-----------|
| DI-D01 | Region Singapore / Southeast Asia untuk Railway + Supabase | Latency terendah ke target market Indonesia; co-location compute↔DB | US (ekosistem matang tapi latency tinggi ke ID); region campur (menambah round-trip app↔DB) |
| DI-D02 | Production + Staging (dua tier persisten) | Staging sebagai mirror untuk uji pra-rilis tanpa menyentuh data produksi | Production-only (tidak ada tempat uji aman); +preview per-PR (kompleksitas & biaya berlebih untuk MVP) |
| DI-D03 | Project Supabase terpisah per environment | Isolasi data penuh, migration bisa diuji di staging dulu, kredensial terpisah | Satu project Supabase bersama (risiko staging menyentuh data prod) |
| DI-D04 | Dua Railway service per environment: `web` + `cron` | Memisahkan trigger cron dari app; selaras ADR-022 (Railway Cron sebagai trigger) | Cron di dalam proses web (kurang eksplisit, sulit dijadwalkan independen) |
| DI-D05 | Deploy otomatis dari branch (`main`→prod, `staging`→staging) | Alur deploy sederhana dan deterministik; gate kualitas di CI sebelum merge | Manual deploy (rawan human error); deploy dari tag (menambah overhead rilis untuk MVP) |
| DI-D06 | Rollback via redeploy Railway + migration reversible + expand-and-contract | Rollback aman terhadap skema DB; tidak ada state yang hilang | Rollback hanya di app (bisa bentrok dengan skema baru) |
| DI-D07 | JOB-03 dijadwalkan 30 menit; JOB-01 hanya processing internal | Menjalankan source utama Engagement dan memisahkan dua jenis retry |
| DI-D08 | X BYOK dikonfigurasi manual per environment di dashboard Outstand | Aplikasi tidak menjadi custodian secret platform X |
| DI-D09 | ADR-040 | DI-D07–D08 dan jalur media working copy mengamandemen baseline operasional |

---

# Related Documents

* `README.md` — scope dan workflow Engineering Planning
* `monorepo-setup.md` — struktur build (`apps/web`, Bun Workspaces)
* `auth-strategy.md` — konfigurasi cookie `Secure`, `BETTER_AUTH_URL` per environment
* `database-orm.md` — migration workflow lintas Supabase project
* `environment-management.md` — detail env vars & secret per environment (ADR-033)
* `cicd-pipeline.md` — GitHub Actions gates, migrate on release (ADR-032)
* `../../product-discovery/05-architecture/background-jobs.md` — Railway Cron sebagai trigger job (ADR-022)
* `../../product-discovery/05-architecture/database-strategy.md` — Supabase PostgreSQL, Storage
* `../../project-manager/DECISIONS.md` — ADR-028, ADR-029
