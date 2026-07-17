# Application Layer

Dokumen ini mendefinisikan **Application Layer** untuk produk **Social Media Management** — bagaimana Next.js App Router berinteraksi dengan domain logic, service layer, dan repository layer dalam arsitektur Modular Monolith + DDD.

Dokumen ini menjadi acuan struktur layer sistem dan aturan interaksi antar layer. Implementasi detail (kode, ORM, folder structure eksak) didokumentasikan di Engineering Planning (M6).

---

# Tujuan

* Mendefinisikan layer stack sistem dan tanggung jawab masing-masing layer.
* Menentukan pola entry point Next.js: kapan pakai Server Components, Server Actions, dan Route Handlers.
* Menetapkan kontrak Application Service per Bounded Context.
* Mendefinisikan Repository Pattern yang digunakan di seluruh domain.
* Menetapkan aturan komunikasi lintas domain.
* Mendokumentasikan strategi error handling di tingkat arsitektur.

---

# Layer Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENTRY POINTS                                  │
│  (Next.js App Router — Server Components, Server Actions,        │
│   Route Handlers, Middleware)                                    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                    APPLICATION SERVICE LAYER                     │
│  (Satu service per Bounded Context — orchestrasi, otorisasi,     │
│   koordinasi domain logic + repository)                          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                    DOMAIN LOGIC LAYER                            │
│  (Entities, Value Objects, Domain Rules — pure business logic,   │
│   tidak ada dependency ke infrastructure)                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                    REPOSITORY LAYER                              │
│  (Interface didefinisikan di domain module; implementasi          │
│   menggunakan Prisma Client)                                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                    INFRASTRUCTURE                                │
│  (Supabase PostgreSQL, Supabase Storage, Better Auth)            │
└─────────────────────────────────────────────────────────────────┘
```

---

# Layer Responsibilities

## Entry Points — Next.js App Router

Layer terluar yang menerima request dari browser atau sistem eksternal. Tidak boleh mengandung business logic.

| Entry Point | Tanggung Jawab | Contoh Penggunaan |
|-------------|----------------|-------------------|
| **Server Component** | Fetch data untuk render halaman; tidak ada side effect | Load daftar post, load analytics snapshot |
| **Server Action** | Handle mutations yang dipicu dari UI (form, button klik) | Buat draft, jadwalkan post, update profil |
| **Route Handler** | Handle request dari sistem eksternal atau API client | Webhook Outstand, health check endpoint |
| **Middleware** | Guard autentikasi, injeksi workspace context ke request | Verifikasi session, redirect jika belum login |

**Aturan:**
- Entry Points hanya boleh memanggil **Application Service** — tidak boleh langsung ke repository atau domain logic.
- Entry Points bertanggung jawab atas serialisasi/deserialisasi data (request → DTO → service input).
- Error dari Application Service ditangkap di Entry Point dan diterjemahkan menjadi response yang sesuai.

---

## Application Service Layer

Jantung dari setiap Bounded Context. Service layer mengatur alur operasi: validasi input, otorisasi, eksekusi domain logic, dan interaksi dengan repository.

**Satu service per Bounded Context:**

| Bounded Context | Application Service |
|----------------|---------------------|
| BC-01 Identity | `IdentityService` |
| BC-02 Workspace | `WorkspaceService` |
| BC-03 Publishing | `PublishingService` |
| BC-04 AI Assistant | `AIAssistantService` |
| BC-05 Engagement | `EngagementService` |
| BC-06 Analytics | `AnalyticsService` |
| BC-07 Start Page | `StartPageService` |
| BC-08 Media | `MediaService` |
| BC-09 Notification | `NotificationService` |

**Tanggung jawab Application Service:**
1. Menerima input dari Entry Point (sudah tervalidasi format di Entry Point).
2. Menjalankan **authorization check** — apakah user memiliki permission untuk operasi ini.
3. Memanggil domain logic untuk memvalidasi dan mengeksekusi business rule.
4. Berinteraksi dengan repository untuk read/write data.
5. Memanggil service domain lain jika diperlukan (via service-to-service call).
6. Melempar domain error jika operasi tidak valid.

**Aturan:**
- Application Service **tidak boleh** langsung mengeksekusi query SQL atau mengakses Prisma / Supabase client — semua akses data domain melalui repository.
- Application Service **tidak boleh** mengandung rendering logic atau HTTP concerns.
- Setiap service hanya boleh mengakses repository milik bounded context-nya sendiri.

---

## Domain Logic Layer

Layer yang mengandung **pure business logic** — tidak bergantung pada framework, database, atau infrastruktur apapun.

**Komponen Domain Logic:**
- **Entities** — objek dengan identitas (Post, Workspace, Member, dll.)
- **Value Objects** — objek tanpa identitas, immutable (BrandSettings, PostStatus, dll.)
- **Domain Rules** — validasi dan constraint bisnis (misal: hanya Owner yang bisa hapus workspace, Post tidak bisa dijadwalkan ke masa lalu)

**Aturan:**
- Domain logic **tidak boleh** import dari infrastruktur, framework, atau service layer.
- Domain logic boleh di-unit-test tanpa setup database atau server.
- Shared types antar domain (UserId, WorkspaceId, dll.) diambil dari `packages/shared`.

---

## Repository Layer

Lapisan abstraksi antara domain logic dan database. Interface repository didefinisikan di dalam domain module; implementasinya menggunakan **Prisma Client** (ADR-031). Supabase client dipakai terpisah untuk Realtime dan Storage.

**Pola yang digunakan:**

```
[Interface — didefinisikan di domain]
IPostRepository
  ├── findById(id: PostId): Promise<Post | null>
  ├── findByWorkspace(workspaceId: WorkspaceId, filter): Promise<Post[]>
  ├── save(post: Post): Promise<void>
  └── delete(id: PostId): Promise<void>

[Implementasi — menggunakan Prisma Client]
PrismaPostRepository implements IPostRepository
```

**Satu repository per Aggregate Root:**

| Aggregate Root | Repository Interface |
|----------------|---------------------|
| `Post` | `IPostRepository` |
| `QueueSlot` | `IQueueSlotRepository` |
| `Workspace` | `IWorkspaceRepository` |
| `Member` | `IMemberRepository` |
| `ConnectedAccount` | `IConnectedAccountRepository` |
| `AIRequest` | `IAIRequestRepository` |
| `InboxItem` | `IInboxItemRepository` |
| `PostMetrics` | `IPostMetricsRepository` |
| `WorkspaceSnapshot` | `IWorkspaceSnapshotRepository` |
| `StartPage` | `IStartPageRepository` |
| `MediaItem` | `IMediaItemRepository` |
| `Notification` | `INotificationRepository` |

**Aturan:**
- Repository interface hanya boleh diketahui oleh Application Service domain yang sama.
- Repository implementasi boleh menggunakan Prisma Client secara langsung (bukan Supabase JS untuk CRUD).
- Repository bertanggung jawab atas mapping antara database row dan domain entity.

---

# Next.js Entry Point Patterns

## Server Components — Data Fetching

Digunakan untuk semua operasi **baca** yang diperlukan untuk render halaman.

```
Page Component (Server)
  └── memanggil ApplicationService.findXxx(...)
       └── memanggil Repository.findXxx(...)
            └── Prisma Client query
```

**Kapan digunakan:**
- Load daftar post untuk halaman Calendar.
- Load analytics snapshot untuk halaman Analytics.
- Load data profil workspace.
- Load media library.

**Aturan:**
- Server Component tidak boleh menyimpan state atau menerima event dari browser.
- Data fetching di Server Component tidak melalui `fetch()` ke endpoint internal — langsung panggil Application Service.

---

## Server Actions — UI Mutations

Digunakan untuk semua operasi **tulis** yang dipicu dari interaksi user di UI.

```
Client Component (triggers action)
  └── memanggil Server Action
       └── memanggil ApplicationService.doXxx(...)
            ├── authorization check
            ├── domain logic
            └── Repository.save(...)
```

**Kapan digunakan:**
- Membuat atau mengedit draft post.
- Menjadwalkan atau membatalkan post.
- Mengelola anggota workspace (invite, remove, ubah role).
- Reply engagement inbox.
- Generate AI caption.
- Upload media.

**Aturan:**
- Server Action harus melakukan validasi format input sebelum memanggil service (gunakan schema validation — library ditentukan di Engineering Planning).
- Server Action bertanggung jawab menangkap domain error dan mengembalikan structured error response ke client.
- Server Action tidak boleh bypass authorization — authorization dilakukan di Application Service.

---

## Route Handlers — External & API

Digunakan untuk request dari **sistem eksternal** atau kebutuhan yang tidak bisa dilayani Server Actions.

```
External System / Browser Fetch
  └── Route Handler (apps/web/app/api/...)
       └── memanggil ApplicationService.handleXxx(...)
            └── ...
```

**Kapan digunakan:**
- Webhook Outstand (notifikasi status posting, data engagement/analytics baru).
- Health check endpoint.
- File download endpoint (jika diperlukan).

**Aturan:**
- Webhook Route Handler harus memvalidasi signature request sebelum memproses payload.
- Route Handler tidak boleh langsung mengakses database — wajib melalui Application Service.
- Route Handler bukan pengganti Server Actions untuk mutasi dari UI.

---

## Middleware — Auth Guard & Workspace Context

Middleware berjalan sebelum setiap request ke halaman dashboard. Tanggung jawabnya:

1. Verifikasi session aktif via Better Auth.
2. Ekstrak `userId` dari session.
3. Resolusi `workspaceId` aktif dari URL atau cookie.
4. Redirect ke halaman login jika session tidak valid.
5. Redirect ke workspace selector jika workspace tidak ditemukan.

**Catatan:** Middleware tidak memanggil Application Service — hanya melakukan verifikasi session dan resolusi context. Otorisasi granular (role-based permission) dilakukan di Application Service.

---

# Cross-Domain Communication

Ketika satu domain membutuhkan data atau trigger operasi di domain lain, mekanismenya adalah **service-to-service call langsung**.

## Aturan Service-to-Service Call

1. **Hanya import dari public API modul** — setiap domain mengekspos `index.ts` sebagai satu-satunya pintu masuk. Tidak boleh import dari file internal domain lain.
2. **Tidak ada circular dependency** — jika BC-A memanggil BC-B, maka BC-B tidak boleh memanggil BC-A.
3. **Hanya passing ID, bukan entity** — saat memanggil service domain lain, kirim ID (WorkspaceId, UserId, dll.) bukan full entity object lintas domain.

## Peta Dependency Antar Domain

```
BC-01 Identity
    ↑ (dikonsumsi oleh semua BC via UserId)

BC-02 Workspace
    ↑ (dikonsumsi oleh BC-03, BC-04, BC-05, BC-06, BC-07, BC-08, BC-09)

BC-03 Publishing ──→ BC-02 Workspace (verifikasi ConnectedAccount)
                ──→ BC-08 Media (attach MediaItem ke post)

BC-04 AI Assistant ──→ BC-02 Workspace (brand settings sebagai context)
                   (postId dari BC-03 hanya sebagai optional context data — bukan service call)

BC-05 Engagement ──→ BC-02 Workspace (filter per ConnectedAccount)

BC-06 Analytics ──→ BC-02 Workspace (filter per ConnectedAccount)

BC-07 Start Page ──→ BC-02 Workspace (terikat ke workspace)

BC-08 Media ──→ BC-02 Workspace (semua media terikat ke workspace)

BC-09 Notification ──→ semua BC (dikonsumsi oleh BC lain untuk kirim notifikasi)
```

**Dependency yang dilarang (circular):**
- BC-02 tidak boleh memanggil BC-03, BC-04, BC-05, BC-06, BC-07, BC-08
- BC-04 AI Assistant tidak boleh memanggil BC-03 Publishing — `postId` hanya context data, bukan service call. Hasil AI diterapkan ke draft melalui aksi terpisah oleh user via `PublishingService.updateDraft`, bukan oleh `AIAssistantService`.
- BC-08 tidak boleh memanggil BC-03

---

# Error Handling Strategy

## Hierarki Error

```
ApplicationError (base)
├── AuthorizationError      — user tidak punya permission
├── NotFoundError           — resource tidak ditemukan
├── ValidationError         — input tidak valid / domain rule dilanggar
├── ConflictError           — operasi konflik dengan state yang ada
└── ExternalServiceError    — error dari Outstand API atau layanan eksternal
```

## Alur Error

```
Application Service
  └── melempar domain error (AuthorizationError, ValidationError, dll.)
       └── ditangkap di Entry Point
            ├── Server Action → dikembalikan sebagai structured error response ke client
            ├── Route Handler → dikembalikan sebagai JSON error response dengan HTTP status sesuai
            └── Server Component → di-render sebagai error state halaman
```

**Mapping domain error ke HTTP status (Route Handlers):**

| Domain Error | HTTP Status |
|-------------|------------|
| `AuthorizationError` | 403 Forbidden |
| `NotFoundError` | 404 Not Found |
| `ValidationError` | 422 Unprocessable Entity |
| `ConflictError` | 409 Conflict |
| `ExternalServiceError` | 502 Bad Gateway |

**Catatan:** Error handling detail (error class implementation, logging, monitoring) ditentukan di Engineering Planning.

---

# Request Flow — Contoh Operasi

## Contoh 1: Jadwalkan Post (Happy Path)

```
User klik "Schedule" di UI
  │
  ├─ [Client Component] memanggil Server Action schedulePost(postId, scheduledAt)
  │
  ├─ [Server Action]
  │    ├─ Validasi format input (postId valid UUID, scheduledAt ISO date)
  │    └─ Panggil PublishingService.schedulePost(userId, postId, scheduledAt)
  │
  ├─ [PublishingService]
  │    ├─ Ambil Post via IPostRepository.findById(postId)
  │    ├─ Verifikasi userId adalah member workspace post ini (WorkspaceService.getMember)
  │    ├─ Verifikasi role member >= Manager (domain rule)
  │    ├─ Jalankan domain rule: scheduledAt tidak boleh di masa lalu
  │    ├─ Jalankan domain rule: post harus memiliki minimal satu PublishingTarget
  │    ├─ Update Post.status = "scheduled", Post.scheduledAt = scheduledAt
  │    └─ Simpan via IPostRepository.save(post)
  │
  └─ [Server Action] Kembalikan { success: true } ke Client Component
```

## Contoh 2: Webhook Outstand — Post Published

```
Outstand API kirim POST /api/webhooks/outstand
  │
  ├─ [Route Handler]
  │    ├─ Validasi webhook signature
  │    └─ Panggil PublishingService.handlePublishCallback(payload)
  │
  ├─ [PublishingService]
  │    ├─ Cari Post via outstandJobId
  │    ├─ Update Post.status = "published"
  │    ├─ Simpan via IPostRepository.save(post)
  │    └─ Panggil NotificationService.notify(workspaceId, { type: "post_published", ... })
  │
  └─ [Route Handler] Kembalikan 200 OK ke Outstand
```

## Contoh 3: Load Halaman Calendar

```
User navigasi ke /[workspace]/publish/calendar
  │
  ├─ [Middleware]
  │    ├─ Verifikasi session (Better Auth)
  │    └─ Resolve workspaceId dari URL slug
  │
  ├─ [Server Component CalendarPage]
  │    └─ Panggil PublishingService.getScheduledPosts(workspaceId, dateRange)
  │
  ├─ [PublishingService]
  │    └─ Panggil IPostRepository.findByWorkspace(workspaceId, { status: "scheduled", dateRange })
  │
  └─ [Server Component] Render kalender dengan data post
```

---

# Application Service Contracts

Berikut adalah kontrak tingkat tinggi (method signature arsitektural) per service. Detail parameter dan return type ditentukan di Engineering Planning.

## WorkspaceService

| Method | Trigger | Keterangan |
|--------|---------|-----------|
| `createWorkspace` | Server Action | Buat workspace baru, otomatis tambah Owner |
| `getWorkspace` | Server Component | Load data workspace + brand settings |
| `updateWorkspace` | Server Action | Update nama, slug, atau brand settings |
| `inviteMember` | Server Action | Kirim undangan ke email |
| `acceptInvite` | Server Action | Terima undangan, aktivasi membership |
| `removeMember` | Server Action | Hapus member dari workspace |
| `updateMemberRole` | Server Action | Ubah role member |
| `getMember` | Internal (dipanggil service lain) | Ambil data member + role untuk auth check |
| `connectAccount` | Server Action | Hubungkan akun media sosial via Outstand |
| `disconnectAccount` | Server Action | Putus koneksi akun media sosial |

## PublishingService

| Method | Trigger | Keterangan |
|--------|---------|-----------|
| `createDraft` | Server Action | Buat draft post baru |
| `updateDraft` | Server Action | Edit konten draft |
| `schedulePosts` | Server Action | Jadwalkan satu atau beberapa post |
| `cancelSchedule` | Server Action | Batalkan jadwal, kembali ke draft |
| `publishNow` | Server Action | Publish langsung tanpa jadwal |
| `deletePost` | Server Action | Soft delete post |
| `getScheduledPosts` | Server Component | Load post untuk Calendar view |
| `getDraftPosts` | Server Component | Load post untuk Draft list |
| `handlePublishCallback` | Route Handler (webhook) | Update status setelah Outstand callback |
| `getQueueSlots` | Server Component | Load slot antrian |
| `setQueueSlots` | Server Action | Konfigurasi slot antrian harian |

## AIAssistantService

| Method | Trigger | Keterangan |
|--------|---------|-----------|
| `generateCaption` | Server Action | Generate caption dari prompt + brand settings |
| `getAIRequestHistory` | Server Component | Load riwayat AI request untuk draft |

## EngagementService

| Method | Trigger | Keterangan |
|--------|---------|-----------|
| `getInboxItems` | Server Component | Load engagement inbox |
| `markAsRead` | Server Action | Tandai item sebagai sudah dibaca |
| `replyToItem` | Server Action | Kirim reply via Outstand |
| `syncInbox` | Route Handler (webhook) | Terima data engagement baru dari Outstand |

## AnalyticsService

| Method | Trigger | Keterangan |
|--------|---------|-----------|
| `getWorkspaceSnapshot` | Server Component | Load ringkasan analytics workspace |
| `getPostMetrics` | Server Component | Load metrik per post |
| `syncMetrics` | Route Handler (webhook) | Terima update metrik dari Outstand |

## MediaService

| Method | Trigger | Keterangan |
|--------|---------|-----------|
| `uploadMedia` | Server Action | Upload file ke Supabase Storage + simpan metadata |
| `getMediaLibrary` | Server Component | Load daftar media workspace |
| `deleteMedia` | Server Action | Hapus file dan metadata |

## NotificationService

| Method | Trigger | Keterangan |
|--------|---------|-----------|
| `notify` | Internal (dipanggil service lain) | Buat notifikasi baru |
| `getNotifications` | Server Component | Load notifikasi user dalam workspace |
| `markAllRead` | Server Action | Tandai semua notifikasi sebagai dibaca |

## StartPageService

| Method | Trigger | Keterangan |
|--------|---------|-----------|
| `getStartPage` | Server Component | Load start page workspace |
| `updateStartPage` | Server Action | Update konten dan pengaturan start page |
| `addLink` | Server Action | Tambah link ke start page |
| `removeLink` | Server Action | Hapus link dari start page |
| `reorderLinks` | Server Action | Ubah urutan link |

---

# Catatan MVP

Untuk MVP, tidak semua service method di atas diimplementasikan. Prioritas implementasi mengacu pada `product-discovery/02-product/mvp-definition.md`. Application Layer ini mendefinisikan kontrak lengkap sistem — Engineering Planning akan menetapkan subset yang masuk MVP.

---

# Decision Log

| ID | Keputusan | Alasan | Alternatif |
|----|-----------|--------|-----------|
| AL-D01 | Server Actions untuk UI mutations, Route Handlers untuk external/webhook | Separation of concern yang jelas; Server Actions optimal untuk form-based UI, Route Handlers optimal untuk integrasi eksternal | Route Handlers saja (kehilangan progressive enhancement); Server Actions saja (tidak bisa handle webhook) |
| AL-D02 | Repository Pattern eksplisit — interface di domain, implementasi via Prisma Client (ADR-031) | Selaras dengan DDD; type-safe persistence; test domain logic tanpa database; batas dependency jelas | Akses Prisma/Supabase langsung di service (coupling tinggi, sulit di-test); Supabase client untuk CRUD (digantikan ADR-031) |
| AL-D03 | Service-to-service call via public API modul (`index.ts`) | Sederhana untuk MVP solo developer; tidak memerlukan event bus; dependency explicit dan mudah ditelusuri | Domain Events (lebih decoupled tapi kompleksitas tinggi untuk MVP); Shared Read Model (query langsung ke DB lintas context — melanggar boundary) |
| AL-D04 | 4-layer stack: Entry Points → Application Service → Domain Logic → Repository | Selaras Modular Monolith + DDD; setiap layer punya tanggung jawab yang jelas; testable per layer | 2-layer (Entry Point + DB) — terlalu flat, tidak scalable; full CQRS — terlalu kompleks untuk MVP |

---

# Related Documents

* `domain-model.md` — bounded context dan entitas yang dikonsumsi Application Layer ini
* `database-strategy.md` — tabel database yang diakses repository
* `integration-layer.md` — Outstand API yang dipanggil dari Route Handlers dan Application Services
* `background-jobs.md` — background jobs yang juga mengakses Application Services
* `realtime-strategy.md` — notifikasi yang dipicu via NotificationService
* `auth-architecture.md` — Better Auth dan otorisasi granular dalam Application Service
* `../02-product/mvp-definition.md` — scope MVP yang menentukan method mana yang diimplementasikan
* `../02-product/roles-permissions.md` — role dan permission yang menjadi constraint authorization
* `../../project-manager/DECISIONS.md` — ADR-001 s/d ADR-015, AL-D01 s/d AL-D04
