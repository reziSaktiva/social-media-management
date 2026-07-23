# Architecture Overview — High-Level Architecture

## Metadata

| Field        | Value                                           |
| ------------ | ----------------------------------------------- |
| Version      | 1.1.0                                           |
| Status       | Active                                          |
| Last Updated | 2026-07-23                                      |
| Audience     | Blueprint visual (Figma) + orientasi arsitektur |

---

# Purpose

Dokumen ini adalah **ringkasan arsitektur tingkat tinggi** untuk produk Social Media Management. Tujuannya:

* Menjadi **blueprint visual** yang mudah digambar ulang di Figma (multi-frame).
* Memberi gambaran satu layar tentang **siapa berinteraksi dengan apa** (context) dan **bagaimana sistem disusun di dalam** (layers + domains).
* Menjadi pintu masuk sebelum membaca detail di `../product-discovery/05-architecture/`.

**Bukan Source of Truth arsitektur.** Detail domain, database, integrasi, jobs, realtime, dan auth tetap di `product-discovery/05-architecture/` (Baseline v1.0, ADR-025) dan keputusan engineering di `product-discovery/06-engineering/` (Baseline v1.0, ADR-036).

---

# Cara Menggunakan di Figma

Buat **2 frame** terpisah (satu konsep = satu frame):

| Frame | Nama disarankan                                | Isi                                              |
| ----- | ---------------------------------------------- | ------------------------------------------------ |
| 1     | `Architecture — System Context & Containers`   | Aktor, sistem eksternal, container deployable    |
| 2     | `Architecture — Internal Layers & Domains`     | Layer stack Modular Monolith + bounded contexts  |

**Konvensi visual yang disarankan:**

| Elemen                    | Bentuk di Figma                    | Contoh label                      |
| ------------------------- | ---------------------------------- | --------------------------------- |
| Actor (person)            | Lingkaran / ikon user              | Marketing Team, Manager           |
| Software system (eksternal) | Kotak tebal, border solid        | Outstand API, Google OAuth        |
| Container (punya kita)    | Kotak dengan subtitle technology   | `web` · Next.js / Bun             |
| Data store                | Silinder atau kotak dengan icon DB | PostgreSQL, Storage               |
| Domain module             | Kotak di dalam layer Domain        | BC-03 Publishing                  |
| Flow sync                 | Panah solid                        | Request / Response                |
| Flow async                | Panah putus-putus                  | Webhook, Cron, Job                |

Jangan menaruh status progress (% / checklist) di canvas Figma — status hidup hanya di `PROJECT_STATE.md`.

---

# Frame 1 — System Context & Containers

## 1.1 System Context (C4 Level 1)

Menjawab: *siapa yang memakai sistem, dan sistem apa saja yang berbatasan dengannya?*

```text
                    ┌─────────────────────┐
                    │  Marketing Team     │
                    │  (Primary User)     │
                    │  Owner / Admin /    │
                    │  Manager / Creator  │
                    └──────────┬──────────┘
                               │
                               │ HTTPS (browser)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│           Social Media Management Platform                   │
│                                                              │
│  Platform web untuk draft, schedule, publish, engagement,    │
│  analytics, AI caption, dan Start Page — satu workspace.     │
│                                                              │
└──────────┬────────────────────────┬────────────────┬─────────┘
           │                        │                │
           │ API / Webhook          │ OAuth          │ Data / Realtime
           ▼                        ▼                ▼
┌────────────────────┐   ┌─────────────────┐   ┌──────────────────┐
│  Outstand API      │   │  Google OAuth   │   │  Supabase Cloud  │
│  Social integration│   │  Login provider │   │  PostgreSQL      │
│  Publish · Comments│   │                 │   │  Storage         │
│  Analytics · Accts │   │                 │   │  Realtime        │
└─────────┬──────────┘   └─────────────────┘   └──────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────┐
│  Instagram · Facebook · X/Twitter · LinkedIn · TikTok ·      │
│  YouTube · Threads · Pinterest                               │
│  (via Outstand — bukan integrasi langsung dari app kita)     │
└──────────────────────────────────────────────────────────────┘
```

### Ringkasan relasi Frame 1.1

| Dari            | Ke           | Relasi                                                      |
| --------------- | ------------ | ----------------------------------------------------------- |
| Marketing Team  | Platform     | Mengelola konten & kolaborasi tim di satu dashboard         |
| Platform        | Outstand API | Publish, upload working copy media, sync komentar/analytics, OAuth connected accounts |
| Outstand API    | Platform     | Webhook `post.published`, `post.error`, `account.token_expired` |
| Platform        | Google OAuth | Login sosial (selain email/password)                        |
| Platform        | Supabase     | Persistensi data, original media, channel notifikasi in-app |

Engagement MVP hanya mencakup **komentar dan reply** melalui sinkronisasi 30
menit serta manual refresh. Tidak ada webhook komentar/DM dan Direct Message
tidak termasuk MVP (ADR-040).

---

## 1.2 Container Diagram (C4 Level 2)

Menjawab: *container apa yang kita deploy, dan bagaimana mereka saling bicara?*

```text
┌─ ACTORS ─────────────────────────────────────────────────────┐
│  Browser (Marketing Team)                                    │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─ RAILWAY · Southeast Asia (Singapore) ───────────────────────┐
│                                                              │
│  ┌──────────────────────────┐   ┌─────────────────────────┐  │
│  │  Container: web          │   │  Container: cron        │  │
│  │  Next.js + Bun           │◄──│  Railway Cron           │  │
│  │                          │   │  Trigger terjadwal      │  │
│  │  · UI (RSC)              │   │                         │  │
│  │  · Server Actions        │   │  POST /api/jobs/run     │  │
│  │  · Route Handlers        │   │  (tidak memegang        │  │
│  │  · Middleware            │   │   business logic)       │  │
│  │  · Domain modules        │   └─────────────────────────┘  │
│  │  · OutstandAdapter (ACL) │                                │
│  │  · Better Auth           │                                │
│  │  · Prisma Client         │                                │
│  └────────────┬─────────────┘                                │
└───────────────┼──────────────────────────────────────────────┘
                │
    ┌───────────┼────────────────────────┐
    │           │                        │
    ▼           ▼                        ▼
┌────────┐ ┌──────────┐          ┌──────────────┐
│Supabase│ │Supabase  │          │ Outstand API │
│Postgres│ │Storage   │          │ (external)   │
│+ RLS   │ │original  │          │Media API     │
│+ jobs  │ │media     │          │webhook → web │
└───┬────┘ └──────────┘          └──────┬───────┘
    │                                   │
    │ Realtime                          │ HTTPS
    ▼                                   ▼
┌────────┐                      Social networks
│Browser │◄── notify ── Realtime     (via Outstand)
└────────┘
```

### Container responsibilities

| Container / System  | Tanggung jawab                                              | Technology                          |
| ------------------- | ------------------------------------------------------------- | ----------------------------------- |
| `web`               | UI, API route, domain logic, auth, ACL ke Outstand            | Next.js, Bun, Better Auth, Prisma   |
| `cron`              | Pemicu retry internal, engagement sync 30 menit, analytics sync, dan job internal lain | Railway Cron → `POST /api/jobs/run` |
| Supabase PostgreSQL | Data bisnis + queue job + RLS multi-tenant (`workspace_id`)   | Cloud · `ap-southeast-1`            |
| Supabase Storage    | Original media milik aplikasi                                 | Supabase Storage                    |
| Supabase Realtime   | Channel notifikasi in-app                                     | Supabase Realtime                   |
| Outstand API        | Integrasi sosial, working copy media, publish, komentar/reply, analytics | External SaaS                       |
| Google OAuth        | Identity provider opsional                                    | External                            |

Untuk X/Twitter, Project Owner mengonfigurasi kredensial BYOK secara manual di
dashboard Outstand. Aplikasi tidak menerima atau menyimpan Client ID/Client
Secret X (ADR-040).

### Environment topology (opsional di frame yang sama / anotasi)

| Environment | Branch deploy    | Supabase                              |
| ----------- | ---------------- | ------------------------------------- |
| Production  | `main`           | Project terpisah                      |
| Staging     | `staging`        | Project terpisah                      |
| Local       | developer machine| Project Cloud `social-media-local`    |

Dua service Railway (`web` + `cron`) ada di **production dan staging**.

---

# Frame 2 — Internal Layers & Domains

## 2.1 Layer Stack (Modular Monolith)

Menjawab: *request masuk lewat mana, dan layer mana yang boleh menyentuh apa?*

```text
┌─────────────────────────────────────────────────────────────┐
│  ENTRY POINTS                                               │
│  Next.js App Router                                         │
│  Server Components · Server Actions · Route Handlers · MW   │
└────────────────────────────┬────────────────────────────────┘
                             │ hanya memanggil Application Service
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  APPLICATION SERVICE LAYER                                  │
│  Satu service per Bounded Context                           │
│  Orchestration · Authorization (RBAC) · Use-case coord.     │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  DOMAIN LOGIC LAYER                                         │
│  Entities · Value Objects · Domain Rules                    │
│  Pure business logic — tanpa dependency infrastructure      │
└────────────────────────────┬────────────────────────────────┘
                             │ via Repository interface
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  REPOSITORY LAYER                                           │
│  Interface di domain module · implementasi Prisma           │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE                                             │
│  Prisma → Supabase PostgreSQL                               │
│  Supabase client → Realtime + Storage                       │
│  Better Auth · OutstandAdapter (ACL) · Job runner           │
└─────────────────────────────────────────────────────────────┘
```

### Aturan layer (untuk label di Figma)

1. Entry Points **tidak** mengandung business logic.
2. Entry Points hanya memanggil **Application Service**.
3. Domain Logic **tidak** mengimpor Prisma, Supabase client, atau HTTP client Outstand.
4. Cross-domain: service-to-service via public API module — **bukan** import implementasi lintas folder domain.
5. Shared types hanya lewat `packages/shared` (ID, enum, value object) — tanpa business logic.

---

## 2.2 Domain Modules (Bounded Contexts)

Menjawab: *modul bisnis apa yang hidup di dalam monolith?*

Letakkan sebagai grid di dalam area Domain Logic / Application Service (satu kartu per BC).

```text
┌─ CORE DOMAINS (MVP) ────────────────────────────────────────┐
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────────┐ │
│  │ BC-01    │  │ BC-02    │  │ BC-03 Publishing           │ │
│  │ Identity │  │Workspace │  │ Post · Queue · Target      │ │
│  │Better Auth│ │ Members  │  │ Draft · Format · Schedule  │ │
│  └──────────┘  │ Accounts │  └────────────────────────────┘ │
│                │ Brand    │                                 │
│                └──────────┘                                 │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │ BC-04    │  │ BC-05    │  │ BC-06    │  │ BC-07      │ │
│  │ AI       │  │Engage-   │  │Analytics │  │ Start Page │ │
│  │Assistant │  │ ment     │  │ Snapshot │  │ Links      │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─ SUPPORTING DOMAINS ────────────────────────────────────────┐
│  ┌──────────┐  ┌────────────┐  ┌──────────────────────────┐ │
│  │ BC-08    │  │ BC-09      │  │ BC-10 Billing            │ │
│  │ Media    │  │Notification│  │ (dimodelkan; Post-MVP)   │ │
│  └──────────┘  └────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─ CROSS-CUTTING (bukan BC tersendiri) ───────────────────────┐
│  OutstandAdapter (ACL) · Background Jobs · Webhooks · Audit │
│  packages/shared (types only)                               │
└─────────────────────────────────────────────────────────────┘
```

### Mapping singkat BC → Application Service

| BC               | Service               |
| ---------------- | --------------------- |
| BC-01 Identity   | `IdentityService`     |
| BC-02 Workspace  | `WorkspaceService`    |
| BC-03 Publishing | `PublishingService`   |
| BC-04 AI Assistant | `AIAssistantService` |
| BC-05 Engagement | `EngagementService`   |
| BC-06 Analytics  | `AnalyticsService`    |
| BC-07 Start Page | `StartPageService`    |
| BC-08 Media      | `MediaService`        |
| BC-09 Notification | `NotificationService` |
| BC-10 Billing    | Post-MVP — belum di-bootstrap sebagai domain folder |

---

## 2.3 Key Runtime Flows (opsional sebagai anotasi / mini-frame)

Empat alur paling penting untuk digambar sebagai panah tipis di Frame 2 atau frame kecil terpisah:

### A. Publish terjadwal

```text
UI → Server Action → PublishingService → DB
                         ↓
Supabase original media → Outstand Media API upload + confirm
                         ↓
       Outstand working-copy URL → create/schedule post
                         ↓
       post.published / post.error webhook
                         ↓
 durable receipt → ACK 2xx → internal job → update PostTarget
```

### B. Webhook inbound

```text
Outstand → Route Handler /api/webhooks/outstand
        → verify HMAC atas raw body
        → simpan receipt idempoten di outstand_webhook_events
        → ACK 2xx
        → internal job/retry
        → Application Service (Publishing / Workspace)
        → DB (+ Notification)
```

Event MVP hanya `post.published`, `post.error`, dan
`account.token_expired`. Nama event vendor diterjemahkan oleh
`OutstandAdapter`; tidak ada webhook komentar atau DM.

### C. Notifikasi in-app

```text
Domain event / job → NotificationService → insert notifications
                  → Supabase Realtime → Browser subscription (RLS)
```

### D. Engagement komentar/reply

```text
Railway Cron (30 menit) / Manual Refresh
  → EngagementService → OutstandAdapter
  → pull komentar → simpan/update internal
  → reply user via OutstandAdapter
  → NotificationService (engagement_new dari hasil sync)
```

---

# Tech Stack Snapshot

Ringkasan untuk legend / sidebar di Figma (selaras `PROJECT_OVERVIEW.md`):

| Layer                       | Choice                                              |
| --------------------------- | --------------------------------------------------- |
| Repo                        | Hybrid Monorepo — `apps/web`, `packages/shared`     |
| Runtime                     | Bun                                                 |
| Framework                   | Next.js (App Router)                                |
| Architecture                | Modular Monolith + DDD                              |
| Auth                        | Better Auth (email/password + Google)               |
| ORM                         | Prisma                                              |
| Database / Storage / Realtime | Supabase Cloud                                    |
| Jobs                        | PostgreSQL job queue + Railway Cron                 |
| Social integration          | Outstand API (via ACL)                              |
| Deploy                      | Railway (SEA) — `web` + `cron`                      |
| CI                          | GitHub Actions                                      |

---

# Source of Truth (Detail)

| Topik              | Dokumen                                                          |
| ------------------ | ---------------------------------------------------------------- |
| Domain & BC        | `../product-discovery/05-architecture/domain-model.md`           |
| Database & RLS     | `../product-discovery/05-architecture/database-strategy.md`      |
| Layer & services   | `../product-discovery/05-architecture/application-layer.md`      |
| Outstand / webhook | `../product-discovery/05-architecture/integration-layer.md`      |
| Jobs               | `../product-discovery/05-architecture/background-jobs.md`        |
| Realtime           | `../product-discovery/05-architecture/realtime-strategy.md`      |
| Auth architecture  | `../product-discovery/05-architecture/auth-architecture.md`      |
| Monorepo layout    | `../product-discovery/06-engineering/monorepo-setup.md`          |
| Deploy topology    | `../product-discovery/06-engineering/deployment-infrastructure.md` |
| Keputusan          | `DECISIONS.md` (ADR-001 s/d ADR-040)                             |

Jika diagram Figma bertentangan dengan dokumen di atas, **yang menang adalah dokumen product-discovery + ADR** — perbarui overview / Figma setelahnya.

---

# Related Documents

* `PROJECT_OVERVIEW.md`
* `PROJECT_STATE.md`
* `DECISIONS.md`
* `../product-discovery/05-architecture/README.md`
* `../product-discovery/06-engineering/README.md`
