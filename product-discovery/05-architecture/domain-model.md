# Domain Model & Bounded Context

Dokumen ini mendefinisikan **Domain Model** dan **Bounded Context** untuk produk **Social Media Management**.

Domain Model adalah representasi konseptual sistem — mendefinisikan apa yang ada dalam sistem, bagaimana domain-domain itu dibagi, dan bagaimana mereka saling berinteraksi tanpa saling bergantung pada implementasi.

Dokumen ini menjadi fondasi seluruh dokumen architecture berikutnya dan berfungsi sebagai acuan naming canonical untuk seluruh entitas di Database Strategy, Application Layer, dan Engineering Planning.

---

# Tujuan

* Menetapkan Bounded Context yang mencerminkan modul produk dari Product Baseline.
* Mendefinisikan Core Entities dan agregat utama per bounded context.
* Memetakan relasi antar bounded context melalui Context Map.
* Menetapkan Shared Types yang digunakan lintas context via `packages/shared`.
* Mendokumentasikan aturan domain boundary yang wajib diikuti seluruh implementasi.

---

# Domain Overview

## Klasifikasi Bounded Context

| ID | Bounded Context | Klasifikasi | MVP Scope |
|----|----------------|-------------|-----------|
| BC-01 | Identity | Core Domain | ✅ MVP |
| BC-02 | Workspace | Core Domain | ✅ MVP |
| BC-03 | Publishing | Core Domain | ✅ MVP |
| BC-04 | AI Assistant | Core Domain | ✅ MVP |
| BC-05 | Engagement | Core Domain | ✅ MVP |
| BC-06 | Analytics | Core Domain | ✅ MVP |
| BC-07 | Start Page | Core Domain | ✅ MVP |
| BC-08 | Media | Supporting Domain | ✅ MVP |
| BC-09 | Notification | Supporting Domain | ✅ MVP |
| BC-10 | Billing | Supporting Domain | Post-MVP |

**Klasifikasi:**
- **Core Domain** — bounded context yang merepresentasikan nilai bisnis inti produk.
- **Supporting Domain** — bounded context yang mendukung operasional core domain tetapi bukan diferensiator utama.

## Diagram Bounded Context

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    CORE DOMAINS                                           │
│                                                                           │
│  ┌─────────────┐   ┌──────────────────────────────────────────────────┐  │
│  │             │   │  BC-03 Publishing                                 │  │
│  │ BC-01       │   │  ┌─────────┐  ┌────────┐  ┌──────────────────┐  │  │
│  │ Identity    │   │  │  Post   │  │ Queue  │  │ Publishing       │  │  │
│  │             │   │  │ Draft   │  │ Slot   │  │ Target           │  │  │
│  │ User        │   │  │ Schedule│  │        │  │ (per account)    │  │  │
│  │ Session     │   │  │ Publish │  └────────┘  └──────────────────┘  │  │
│  │             │   │  └─────────┘                                     │  │
│  └──────┬──────┘   └──────────────────────┬───────────────────────────┘  │
│         │                                  │                               │
│  ┌──────▼──────────────────────────────────▼────────────────────────┐    │
│  │  BC-02 Workspace                                                   │    │
│  │  Workspace · Member · ConnectedAccount · BrandSettings             │    │
│  └─────────────────────────────────────────────────────────────────-─┘    │
│                     │           │           │           │                  │
│  ┌──────────────────▼──┐  ┌────▼──────┐  ┌▼─────────┐ ┌▼───────────┐   │
│  │ BC-04 AI Assistant  │  │ BC-05     │  │ BC-06    │ │ BC-07      │   │
│  │ AIRequest           │  │ Engagement│  │Analytics │ │ Start Page │   │
│  │ AIResult            │  │ InboxItem │  │ Metrics  │ │ StartPage  │   │
│  │                     │  │ Reply     │  │ Snapshot │ │ PageLink   │   │
│  └─────────────────────┘  └───────────┘  └──────────┘ └────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                    SUPPORTING DOMAINS                                     │
│                                                                           │
│  ┌─────────────────┐   ┌───────────────────┐   ┌─────────────────────┐  │
│  │ BC-08 Media     │   │ BC-09 Notification │   │ BC-10 Billing       │  │
│  │ MediaItem       │   │ Notification       │   │ Subscription        │  │
│  │                 │   │                    │   │ Invoice             │  │
│  └─────────────────┘   └───────────────────┘   └─────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SYSTEM                                        │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │  Outstand API — Social Media Integration Provider                 │    │
│  │  (Anti-Corruption Layer didefinisikan di integration-layer.md)    │    │
│  └──────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

# Bounded Contexts

---

## BC-01 — Identity

### Responsibility

Mengelola identitas pengguna, autentikasi, dan sesi. Identity adalah titik masuk sistem — setiap interaksi dimulai dari verifikasi identitas pengguna.

Identity dikelola melalui **Better Auth** (keputusan pra-architecture). Implementasi internal tidak dibuat dari nol.

### Core Entities

| Entitas | Tipe | Deskripsi |
|---------|------|-----------|
| `User` | Aggregate Root | Pengguna terdaftar pada platform |
| `Session` | Entity | Sesi aktif pengguna (managed by Better Auth) |
| `OAuthAccount` | Entity | Akun OAuth yang terhubung ke User (Better Auth managed) |

### Key Attributes

**User**
- `id: UserId` — identifier unik, dikonsumsi seluruh bounded context lain
- `email: string` — alamat email unik
- `name: string` — nama tampilan
- `avatarUrl: string?` — avatar pengguna
- `createdAt: Date`

**Session** dan **OAuthAccount** dikelola sepenuhnya oleh Better Auth — tidak ada logika domain kustom.

### Catatan

- `UserId` adalah satu-satunya data Identity yang dikonsumsi domain lain, selalu melalui `packages/shared`.
- Domain lain **tidak** boleh import implementasi Identity untuk mengambil data User — gunakan `UserId` sebagai referensi dan query User terpisah jika diperlukan.

---

## BC-02 — Workspace

### Responsibility

Mengelola struktur organisasi yang menggunakan platform: workspace, keanggotaan tim, roles & permissions, akun media sosial yang terhubung, dan brand settings.

Workspace adalah **root context** — seluruh data domain lain terikat ke `WorkspaceId`. RLS di database level menggunakan `workspace_id` sebagai batas isolasi (keputusan pra-architecture).

### Core Entities

| Entitas | Tipe | Deskripsi |
|---------|------|-----------|
| `Workspace` | Aggregate Root | Unit organisasi pengguna platform |
| `Member` | Entity | Anggota workspace dengan role tertentu |
| `ConnectedAccount` | Entity | Akun media sosial yang terhubung ke workspace |
| `BrandSettings` | Value Object | Pengaturan brand workspace |

### Key Attributes

**Workspace**
- `id: WorkspaceId`
- `name: string`
- `slug: string` — URL identifier unik
- `ownerId: UserId` — referensi ke Identity BC
- `plan: WorkspacePlan` — `free | pro | (post-MVP: team)`
- `createdAt: Date`

**Member**
- `id: MemberId`
- `workspaceId: WorkspaceId`
- `userId: UserId` — referensi ke Identity BC
- `role: MemberRole` — `owner | admin | manager | creator`
- `invitedAt: Date`
- `joinedAt: Date?`
- `status: MemberStatus` — `pending | active | removed`

**ConnectedAccount**
- `id: ConnectedAccountId`
- `workspaceId: WorkspaceId`
- `platform: SocialPlatform` — `instagram | facebook | twitter | linkedin | tiktok | youtube | threads | pinterest`
- `outstandAccountId: string` — ID dari Outstand API (external reference)
- `handle: string` — nama akun (@handle atau nama page)
- `status: ConnectedAccountStatus` — `active | disconnected | error`
- `connectedAt: Date`

**BrandSettings** (Value Object, embedded di Workspace)
- `name: string?` — nama brand
- `tone: string?` — panduan tone of voice
- `guidelines: string?` — catatan brand guidelines

### Catatan

- `ConnectedAccount` adalah jembatan antara domain internal dan Outstand API. `outstandAccountId` adalah external reference yang tidak berubah setelah koneksi.
- `MemberRole` dan `MemberStatus` dipublish ke `packages/shared` agar domain lain dapat membaca role tanpa import implementasi Workspace.

---

## BC-03 — Publishing

### Responsibility

Mengelola seluruh siklus hidup konten — dari pembuatan draft, review, penjadwalan, hingga publikasi. Publishing adalah **core domain utama** yang menjadi fondasi product-market fit (I-04: Publishing Trust).

Publishing bertanggung jawab atas status konten kanonikal: `Draft → In Review → Ready to Schedule → Scheduled → Published / Failed`.

### Core Entities

| Entitas | Tipe | Deskripsi |
|---------|------|-----------|
| `Post` | Aggregate Root | Unit konten yang akan atau sudah dipublikasikan |
| `PostTarget` | Entity | Target publikasi spesifik per connected account |
| `QueueSlot` | Entity | Slot antrian untuk konten terjadwal |

### Key Attributes

**Post**
- `id: PostId`
- `workspaceId: WorkspaceId`
- `authorId: UserId` — referensi ke Identity BC
- `status: ContentStatus` — enum kanonikal dari `packages/shared`
- `caption: string`
- `mediaIds: MediaId[]` — referensi ke Media BC (ID saja)
- `targets: PostTarget[]` — daftar target publikasi
- `scheduledAt: Date?` — waktu tayang yang diinginkan
- `publishedAt: Date?` — waktu berhasil dipublikasikan
- `failedAt: Date?`
- `failureReason: string?`
- `createdAt: Date`
- `updatedAt: Date`

**PostTarget**
- `id: PostTargetId`
- `postId: PostId`
- `connectedAccountId: ConnectedAccountId` — referensi ke Workspace BC
- `platform: SocialPlatform`
- `contentFormat: ContentFormat` — `post | reel | story | pin` (enum di `packages/shared`; ADR-039)
- `platformOptions: PlatformPublishOptions?` — field khusus platform (mis. Pinterest: title, destination link, board)
- `outstandJobId: string?` — ID job dari Outstand API setelah post dijadwalkan
- `status: PostTargetStatus` — `pending | scheduled | published | failed`
- `publishedUrl: string?` — URL post yang sudah dipublikasikan
- `error: string?`

**ContentFormat per platform (MVP — ADR-039)**

Format dipilih **per `PostTarget`** (bukan satu format global untuk seluruh post), agar multi-account tetap bisa beda tipe per jaringan.

| Platform | Format yang diizinkan di MVP | Default |
| -------- | ---------------------------- | ------- |
| Instagram | `post`, `reel`, `story` | `post` |
| Facebook | `post`, `reel`, `story` | `post` |
| TikTok | `post` (video/feed TikTok; tanpa selector Reel/Story di UI) | `post` |
| Pinterest | `pin` | `pin` |
| Twitter / X | `post` | `post` |
| LinkedIn | `post` | `post` |
| YouTube | `post` | `post` |
| Threads | `post` | `post` |

`platformOptions` (bentuk konseptual — disimpan sebagai JSON di DB, **bukan** enum shared; tidak mengandung logika bisnis):

```typescript
// Contoh payload Pinterest (MVP)
type PlatformPublishOptions = {
  pinTitle?: string;
  destinationUrl?: string;
  boardId?: string;
};
```

Field diisi hanya jika platform membutuhkannya. Mapping ke API Outstand tetap di `OutstandAdapter`.

**Default `contentFormat` saat target dibuat:** ditentukan Application Service per platform (Pinterest → `pin`; lainnya → `post` jika diizinkan). Default kolom DB `post` hanyalah fallback teknis migrasi — **bukan** izin untuk menyimpan `post` pada Pinterest.

**QueueSlot**
- `id: QueueSlotId`
- `workspaceId: WorkspaceId`
- `connectedAccountId: ConnectedAccountId`
- `scheduledAt: Date` — waktu slot dalam queue
- `postId: PostId?` — null jika slot kosong
- `order: number` — urutan dalam queue

### Aturan Domain

1. Transisi status `Post` mengikuti aturan yang didefinisikan di `roles-permissions.md` — tidak boleh ada transisi yang tidak sah.
2. `Post` dapat memiliki multiple `PostTarget` (multi-account posting).
3. `Post` hanya menyimpan referensi `MediaId[]` — tidak embed data media. Detail media diambil dari Media BC secara terpisah.
4. `outstandJobId` pada `PostTarget` hanya ada setelah konten dikirim ke Outstand API untuk dijadwalkan — dikelola oleh Integration Layer.
5. `contentFormat` pada `PostTarget` wajib valid untuk `platform` tersebut (matriks ADR-039). Application Service menolak create/update/schedule target jika format tidak diizinkan atau media tidak memenuhi syarat format (mis. Story/Reel membutuhkan media yang sesuai).
6. Field khusus platform (Pinterest pin metadata) disimpan di `platformOptions` pada `PostTarget` — bukan di `Post` agar multi-target tetap independen.
7. Default bisnis format: Pinterest = `pin`; platform lain = `post` (kecuali user memilih Reel/Story di IG/FB). Jangan mengandalkan default kolom DB saja saat menulis target baru.

---

## BC-04 — AI Assistant

### Responsibility

Mengelola permintaan AI untuk pembuatan dan perbaikan caption. AI Assistant dirancang sebagai kemampuan **in-workflow** — menempel pada konteks draft post, bukan sebagai destinasi terpisah (I-06: AI menempel pada draft job).

### Core Entities

| Entitas | Tipe | Deskripsi |
|---------|------|-----------|
| `AIRequest` | Aggregate Root | Permintaan AI untuk generate/improve caption |
| `AIResult` | Entity | Hasil yang dihasilkan oleh AI |

### Key Attributes

**AIRequest**
- `id: AIRequestId`
- `workspaceId: WorkspaceId`
- `userId: UserId`
- `postId: PostId?` — optional, jika permintaan terikat ke post tertentu
- `type: AIRequestType` — `generate | improve | rewrite | variation`
- `prompt: string` — input dari pengguna atau sistem
- `context: string?` — teks caption yang sudah ada (untuk improve/rewrite)
- `createdAt: Date`

**AIResult**
- `id: AIResultId`
- `requestId: AIRequestId`
- `content: string` — hasil teks yang dihasilkan
- `variantIndex: number` — urutan varian (untuk variation request)
- `createdAt: Date`

### Catatan

- AI Assistant tidak menyimpan state konten — hanya menyimpan request dan result sebagai log.
- Pengguna mengambil hasil dari `AIResult` dan memilih untuk menerapkannya ke `Post.caption` di Publishing BC secara terpisah.
- Provider AI (misalnya OpenAI) adalah external dependency yang diakses melalui service layer — tidak dikodekan langsung di domain.

---

## BC-05 — Engagement

### Responsibility

Mengelola interaksi dengan audiens dari akun media sosial yang terhubung — komentar, pesan, dan inbox terpadu. Engagement adalah **retention layer** setelah Publishing (I-05).

### Core Entities

| Entitas | Tipe | Deskripsi |
|---------|------|-----------|
| `InboxItem` | Aggregate Root | Item interaksi dari audiens yang masuk ke inbox |
| `Reply` | Entity | Balasan yang dikirimkan dari platform |

### Key Attributes

**InboxItem**
- `id: InboxItemId`
- `workspaceId: WorkspaceId`
- `connectedAccountId: ConnectedAccountId`
- `platform: SocialPlatform`
- `type: EngagementType` — `comment | direct_message | mention`
- `externalId: string` — ID item di platform media sosial (dari Outstand webhook)
- `authorHandle: string` — username pengirim
- `content: string` — isi interaksi
- `status: InboxItemStatus` — `unread | read | replied | archived`
- `postId: PostId?` — jika komentar terikat ke post tertentu (referensi ke Publishing BC)
- `receivedAt: Date`
- `readAt: Date?`

**Reply**
- `id: ReplyId`
- `inboxItemId: InboxItemId`
- `userId: UserId`
- `content: string`
- `outstandReplyId: string?` — ID dari Outstand setelah reply terkirim
- `sentAt: Date`
- `status: ReplyStatus` — `pending | sent | failed`

### Catatan

- `InboxItem` diisi oleh webhook dari Outstand API — detail mekanisme di `integration-layer.md`.
- `postId` pada `InboxItem` adalah referensi soft — Engagement BC tidak import implementasi Publishing.

---

## BC-06 — Analytics

### Responsibility

Mengelola data performa konten dan ringkasan analytics workspace. Analytics adalah **retention layer** yang memberikan visibility kepada buyer (Maya) dan context kepada daily user (Raka).

### Core Entities

| Entitas | Tipe | Deskripsi |
|---------|------|-----------|
| `PostMetrics` | Aggregate Root | Metrik performa satu post di satu platform |
| `WorkspaceSnapshot` | Entity | Ringkasan analytics workspace untuk periode tertentu |

### Key Attributes

**PostMetrics**
- `id: PostMetricsId`
- `postId: PostId` — referensi ke Publishing BC
- `connectedAccountId: ConnectedAccountId`
- `platform: SocialPlatform`
- `impressions: number`
- `reach: number`
- `likes: number`
- `comments: number`
- `shares: number`
- `clicks: number?`
- `engagementRate: number` — dihitung: (likes + comments + shares) / reach
- `fetchedAt: Date` — kapan data ini terakhir diambil dari Outstand

**WorkspaceSnapshot**
- `id: WorkspaceSnapshotId`
- `workspaceId: WorkspaceId`
- `period: SnapshotPeriod` — `weekly | monthly`
- `periodStart: Date`
- `periodEnd: Date`
- `totalPosts: number`
- `totalReach: number`
- `totalEngagements: number`
- `avgEngagementRate: number`
- `topPostId: PostId?`
- `createdAt: Date`

### Catatan

- `PostMetrics` di-fetch dari Outstand API — frekuensi fetch didefinisikan di `background-jobs.md`.
- `WorkspaceSnapshot` dapat dibuat secara periodik oleh background job berdasarkan data `PostMetrics`.
- Analytics BC membaca `PostId` dan `ConnectedAccountId` sebagai referensi, tidak pernah bergantung pada implementasi Publishing atau Workspace.

---

## BC-07 — Start Page

### Responsibility

Mengelola halaman publik workspace yang berisi daftar tautan dan profil brand. Start Page adalah **supporting capability** yang memanfaatkan workspace identity (I-05 positioning: Start Page adalah capability pendukung, bukan pusat journey mingguan).

### Core Entities

| Entitas | Tipe | Deskripsi |
|---------|------|-----------|
| `StartPage` | Aggregate Root | Halaman publik yang dapat dibagikan |
| `PageLink` | Entity | Tautan individual yang tampil di halaman |

### Key Attributes

**StartPage**
- `id: StartPageId`
- `workspaceId: WorkspaceId`
- `slug: string` — URL identifier publik (misal: `/page/nama-brand`)
- `title: string` — judul halaman
- `bio: string?` — deskripsi singkat
- `avatarUrl: string?`
- `theme: PageTheme` — `default | minimal | bold | ...`
- `isPublished: boolean`
- `viewCount: number` — basic analytics
- `updatedAt: Date`

**PageLink**
- `id: PageLinkId`
- `startPageId: StartPageId`
- `label: string`
- `url: string`
- `position: number` — urutan tampil
- `isActive: boolean`
- `clickCount: number` — basic analytics
- `createdAt: Date`

---

## BC-08 — Media

### Responsibility

Mengelola file media yang diunggah oleh pengguna untuk digunakan dalam konten. Media Library adalah supporting domain yang menyediakan aset bagi Publishing.

### Core Entities

| Entitas | Tipe | Deskripsi |
|---------|------|-----------|
| `MediaItem` | Aggregate Root | File media yang diunggah ke workspace |

### Key Attributes

**MediaItem**
- `id: MediaId`
- `workspaceId: WorkspaceId`
- `uploaderId: UserId`
- `filename: string`
- `mimeType: string`
- `size: number` — bytes
- `url: string` — URL dari Supabase Storage
- `storagePath: string` — path internal di Supabase Storage bucket
- `type: MediaType` — `image | video | gif`
- `width: number?`
- `height: number?`
- `duration: number?` — untuk video, dalam detik
- `createdAt: Date`

### Catatan

- Media file disimpan di **Supabase Storage** (keputusan pra-architecture).
- Publishing BC hanya menyimpan `MediaId[]` — tidak meng-embed data media.
- Saat merender Post, Application Layer mengambil `MediaItem` dari Media BC berdasarkan `MediaId[]`.

---

## BC-09 — Notification

### Responsibility

Mengelola notifikasi in-app untuk pengguna. Notification adalah supporting domain yang menerima trigger dari domain lain dan mengirim pesan ke pengguna.

### Core Entities

| Entitas | Tipe | Deskripsi |
|---------|------|-----------|
| `Notification` | Aggregate Root | Satu item notifikasi untuk satu pengguna |

### Key Attributes

**Notification**
- `id: NotificationId`
- `workspaceId: WorkspaceId`
- `userId: UserId` — penerima notifikasi
- `type: NotificationType` — `post_published | post_failed | new_inbox_item | member_invited | ...`
- `title: string`
- `body: string`
- `isRead: boolean`
- `relatedEntityType: string?` — `post | inbox_item | member | ...`
- `relatedEntityId: string?` — ID entitas terkait
- `createdAt: Date`
- `readAt: Date?`

### Catatan

- Real-time delivery menggunakan **Supabase Realtime** — detail di `realtime-strategy.md`.
- Notification BC tidak memiliki logika bisnis domain — ia hanya consumer yang menulis notifikasi berdasarkan events dari domain lain.

---

## BC-10 — Billing

### Responsibility

Mengelola langganan dan pembayaran workspace. Billing adalah post-MVP domain — didefinisikan di sini untuk kelengkapan domain model tetapi tidak diimplementasi di MVP.

### Core Entities

| Entitas | Tipe | Deskripsi |
|---------|------|-----------|
| `Subscription` | Aggregate Root | Langganan aktif workspace |
| `Invoice` | Entity | Tagihan per periode |

### Key Attributes

**Subscription**
- `id: SubscriptionId`
- `workspaceId: WorkspaceId`
- `plan: WorkspacePlan` — `free | pro`
- `status: SubscriptionStatus` — `active | past_due | canceled | trialing`
- `currentPeriodStart: Date`
- `currentPeriodEnd: Date`
- `canceledAt: Date?`

**Invoice**
- `id: InvoiceId`
- `subscriptionId: SubscriptionId`
- `amount: number`
- `currency: string`
- `status: InvoiceStatus` — `draft | open | paid | void`
- `issuedAt: Date`
- `paidAt: Date?`

### Catatan

- Payment provider (Stripe atau setara) adalah external dependency. Detail di fase Engineering Planning.
- MVP menggunakan `plan: free` untuk semua workspace — Billing BC dibangun post-MVP.

---

# Context Map

Context Map mendokumentasikan bagaimana bounded context saling berinteraksi. Dalam Pragmatic Boundary, relasi antar context dilakukan **hanya melalui ID references dan shared types dari `packages/shared`** — tidak ada import implementasi lintas domain.

## Diagram Context Map

```
                    ┌─────────────┐
                    │  BC-01      │
                    │  Identity   │
                    └──────┬──────┘
                    UserId │ (shared type)
                           ▼
                    ┌─────────────┐
                    │  BC-02      │◄─── WorkspacePlan ──── BC-10 Billing
                    │  Workspace  │
                    └──────┬──────┘
         WorkspaceId +     │ ConnectedAccountId
         (shared types)    │ (shared types)
           ┌───────────────┼───────────────────────────┐
           │               │               │            │
     ┌─────▼─────┐  ┌──────▼──────┐ ┌─────▼─────┐ ┌───▼────────┐
     │ BC-03     │  │ BC-05       │ │ BC-06     │ │ BC-07      │
     │Publishing │  │ Engagement  │ │ Analytics │ │ Start Page │
     └─────┬─────┘  └─────────────┘ └─────┬─────┘ └────────────┘
      PostId│                         PostId│
      (shared)                        (soft ref)
           │
     ┌─────▼─────┐
     │ BC-04     │◄──── PostId (optional) ──── Publishing
     │ AI        │
     │ Assistant │
     └───────────┘

     MediaId (shared type)
     ─────────────────────
     BC-03 Publishing → BC-08 Media (ID reference only)

     Notification triggers (via service calls, not direct import):
     BC-03, BC-05 → BC-09 Notification

     External System:
     BC-03 Publishing ──── Outstand API ────► PostTarget.outstandJobId
     BC-05 Engagement ◄─── Outstand Webhook ─ InboxItem (incoming)
     BC-06 Analytics ◄──── Outstand API ───── PostMetrics (fetch)
```

## Tabel Relasi Antar Context

| Source BC | Target BC | Jenis Relasi | Data yang Dikonsumsi |
|-----------|-----------|-------------|----------------------|
| Workspace | Identity | Downstream | `UserId` (referensi Member) |
| Publishing | Workspace | Downstream | `WorkspaceId`, `ConnectedAccountId` |
| Publishing | Media | Downstream | `MediaId[]` (referensi attachment) |
| AI Assistant | Publishing | Downstream (soft) | `PostId` (optional context) |
| Engagement | Workspace | Downstream | `WorkspaceId`, `ConnectedAccountId` |
| Engagement | Publishing | Downstream (soft) | `PostId` (komentar terkait post) |
| Analytics | Publishing | Downstream (soft) | `PostId` (metrics per post) |
| Analytics | Workspace | Downstream | `WorkspaceId` |
| Start Page | Workspace | Downstream | `WorkspaceId` |
| Notification | Workspace | Downstream | `WorkspaceId`, `UserId` |
| Billing | Workspace | Downstream | `WorkspaceId` |

**Jenis Relasi:**
- **Downstream** — context mengkonsumsi data dari context lain melalui ID reference.
- **Downstream (soft)** — referensi ID yang tidak enforce foreign key — boleh null/hilang.

---

# Shared Types — `packages/shared`

`packages/shared` adalah package di Hybrid Monorepo yang mempublish tipe-tipe yang digunakan lintas bounded context. Tidak boleh ada logika bisnis atau implementasi di `packages/shared` — **hanya type definitions**.

## ID Types

Setiap bounded context mempublish branded ID-nya ke `packages/shared` agar cross-context reference tetap type-safe.

```typescript
// ID types — opaque branded types
type UserId = string & { readonly _brand: 'UserId' };
type WorkspaceId = string & { readonly _brand: 'WorkspaceId' };
type MemberId = string & { readonly _brand: 'MemberId' };
type ConnectedAccountId = string & { readonly _brand: 'ConnectedAccountId' };
type PostId = string & { readonly _brand: 'PostId' };
type PostTargetId = string & { readonly _brand: 'PostTargetId' };
type QueueSlotId = string & { readonly _brand: 'QueueSlotId' };
type MediaId = string & { readonly _brand: 'MediaId' };
type InboxItemId = string & { readonly _brand: 'InboxItemId' };
type ReplyId = string & { readonly _brand: 'ReplyId' };
type AIRequestId = string & { readonly _brand: 'AIRequestId' };
type AIResultId = string & { readonly _brand: 'AIResultId' };
type PostMetricsId = string & { readonly _brand: 'PostMetricsId' };
type WorkspaceSnapshotId = string & { readonly _brand: 'WorkspaceSnapshotId' };
type StartPageId = string & { readonly _brand: 'StartPageId' };
type PageLinkId = string & { readonly _brand: 'PageLinkId' };
type NotificationId = string & { readonly _brand: 'NotificationId' };
type SubscriptionId = string & { readonly _brand: 'SubscriptionId' };
```

## Enums

Enum kanonikal yang digunakan lebih dari satu bounded context:

```typescript
// Content status — satu-satunya acuan status kanonikal
// Sumber: product-discovery/02-product/roles-permissions.md
enum ContentStatus {
  Draft = 'draft',
  InReview = 'in_review',
  ReadyToSchedule = 'ready_to_schedule',
  Scheduled = 'scheduled',
  Published = 'published',
  Failed = 'failed',
}

// Member role
enum MemberRole {
  Owner = 'owner',
  Admin = 'admin',
  Manager = 'manager',
  Creator = 'creator',
}

// Social media platform
enum SocialPlatform {
  Instagram = 'instagram',
  Facebook = 'facebook',
  Twitter = 'twitter',
  LinkedIn = 'linkedin',
  TikTok = 'tiktok',
  YouTube = 'youtube',
  Threads = 'threads',
  Pinterest = 'pinterest',
}

// Workspace plan
enum WorkspacePlan {
  Free = 'free',
  Pro = 'pro',
}

// Content format per publish target (ADR-039)
enum ContentFormat {
  Post = 'post',
  Reel = 'reel',
  Story = 'story',
  Pin = 'pin',
}
```

## Value Objects

Value object sederhana yang digunakan lintas context:

```typescript
// Date range — digunakan oleh Analytics dan Publishing
interface DateRange {
  start: Date;
  end: Date;
}

// Pagination params — digunakan oleh seluruh list query
interface PaginationParams {
  page: number;
  limit: number;
}
```

---

# Domain Boundary Rules

Aturan berikut wajib diikuti di seluruh implementasi. Aturan ini adalah turunan langsung dari keputusan **Pragmatic Boundary** (keputusan pra-architecture).

## Aturan Utama

**BR-01 — Tidak Boleh Import Implementasi Lintas Domain**

Sebuah bounded context dilarang mengimport file implementasi dari bounded context lain.

```
// ❌ DILARANG
import { Post } from '../publishing/entities/post';

// ✅ BENAR — hanya ID reference via shared types
import { PostId } from '@social/shared';
```

**BR-02 — Referensi Lintas Domain Hanya Melalui ID**

Ketika satu domain perlu mereferensikan entitas dari domain lain, gunakan ID-nya saja. Jika diperlukan data lengkap, Application Layer yang bertanggung jawab mengambil data dari kedua domain.

**BR-03 — Shared Types Hanya di `packages/shared`**

Tipe yang digunakan lebih dari satu domain wajib didefinisikan di `packages/shared`. Tidak boleh ada "shared type" yang didefinisikan di salah satu domain dan di-import domain lain.

**BR-04 — Public API via `index.ts`**

Setiap domain mengekspos public API-nya hanya melalui file `index.ts` (barrel export). File internal domain tidak boleh diimport langsung dari luar.

```
// ✅ BENAR — import dari barrel
import { createPost } from '@social/publishing';

// ❌ DILARANG — import dari file internal
import { createPost } from '@social/publishing/src/services/post-service';
```

**BR-05 — Tidak Ada Shared Database Table Lintas Domain**

Setiap domain memiliki tabel databasenya sendiri. Relasi antar tabel dari domain berbeda menggunakan foreign key referensi ID — tidak ada join yang menembus boundary domain pada level query domain.

Pengecualian: Application Layer boleh melakukan join antar tabel dari domain berbeda untuk keperluan read model / view.

**BR-06 — Event / Service Interface untuk Komunikasi Async**

Jika satu domain perlu memicu aksi di domain lain (misalnya: Publishing selesai → kirim Notification), komunikasi dilakukan melalui service interface yang didefinisikan di Application Layer — bukan direct call ke domain implementasi.

Detail mekanisme ini didefinisikan di `application-layer.md`.

## Struktur Folder (Referensi)

```
apps/
└── web/
    └── src/
        └── domains/
            ├── identity/
            │   └── index.ts        ← public API
            ├── workspace/
            │   └── index.ts
            ├── publishing/
            │   └── index.ts
            ├── ai-assistant/
            │   └── index.ts
            ├── engagement/
            │   └── index.ts
            ├── analytics/
            │   └── index.ts
            ├── start-page/
            │   └── index.ts
            ├── media/
            │   └── index.ts
            └── notification/
                └── index.ts
packages/
└── shared/
    ├── src/
    │   ├── ids.ts          ← branded ID types
    │   ├── enums.ts        ← shared enums
    │   └── value-objects.ts
    └── index.ts
```

Detail struktur monorepo lengkap didefinisikan di `product-discovery/06-engineering/`.

---

# Traceability ke Product Baseline

Tabel berikut memetakan Bounded Context ke modul yang didefinisikan di Product Baseline v1.0 (`feature-modules.md`).

| Bounded Context | Product Module | Klasifikasi Module |
|----------------|----------------|-------------------|
| BC-01 Identity | Authentication | Supporting Module |
| BC-02 Workspace | Workspace | Core Module |
| BC-02 Workspace | User Profile (partial) | Supporting Module |
| BC-03 Publishing | Publishing | Core Module |
| BC-04 AI Assistant | AI Assistant | Core Module |
| BC-05 Engagement | Engagement | Core Module |
| BC-06 Analytics | Analytics | Core Module |
| BC-07 Start Page | Start Page | Core Module |
| BC-08 Media | Media Library | Supporting Module |
| BC-09 Notification | Notifications | Supporting Module |
| BC-10 Billing | Billing | Supporting Module |
| — | Settings | Supporting Module (distributed: Workspace + User Profile BC) |

**Catatan:**
- Module **Settings** dari Product Baseline tidak menjadi bounded context tersendiri — setting workspace dikelola di BC-02 Workspace, setting user dikelola di BC-01 Identity/User Profile.
- Module **Infrastructure** (API Integrations, Webhooks, Audit Logs, Background Jobs) adalah cross-cutting concerns yang tidak menjadi bounded context — dibahas di dokumen arsitektur berikutnya.

---

# Traceability ke User Insights

| Insight | Bounded Context yang Terdampak | Implikasi Domain |
|---------|-------------------------------|-----------------|
| I-01 — Workflow Consolidation | BC-03 Publishing, BC-05 Engagement, BC-06 Analytics | Ketiga BC harus dapat "membaca" dari satu workspace context tanpa context switch |
| I-04 — Publishing Trust | BC-03 Publishing | `Post` dan `PostTarget` harus memodelkan status dengan granularitas tinggi — `outstandJobId` dan `PostTargetStatus` per account |
| I-06 — AI in-workflow | BC-04 AI Assistant | `AIRequest.postId` adalah optional field yang memungkinkan AI bekerja dalam konteks post tertentu |
| I-08 — Lightweight Collaboration | BC-03 Publishing | `ContentStatus` memodelkan handoff ringan (`In Review`, `Ready to Schedule`) tanpa membangun approval workflow berlapis |

---

# Decision Log

| ID | Keputusan | Alasan | Alternatif |
|----|-----------|--------|-----------|
| DM-D01 | Menggunakan 10 bounded context sesuai dengan modul Product Baseline | Mencerminkan domain bisnis nyata, bukan abstraksi teknis | Sedikit BC besar (lebih mudah awal, sulit berkembang) |
| DM-D02 | BC-10 Billing didefinisikan tetapi **out of scope MVP** | Billing perlu dimodelkan sekarang agar tidak merusak domain saat ditambahkan nanti | Mengabaikan Billing sampai diperlukan |
| DM-D03 | Settings tidak menjadi BC tersendiri — didistribusikan ke Workspace dan Identity | "Settings" adalah capability UI bukan domain bisnis — entitasnya sudah ada di BC yang relevan | BC Settings tersendiri (menambah indirection tidak perlu) |
| DM-D04 | `ContentStatus` enum didefinisikan di `packages/shared` bukan di Publishing BC | Status konten dikonsumsi oleh Engagement, Analytics, dan Notification — harus shared | Definisikan di Publishing dan re-export (menambah coupling) |
| DM-D05 | `ConnectedAccount` berada di Workspace BC bukan Publishing BC | Account adalah workspace-level resource, bukan publication-level resource; Publishing hanya referensi `ConnectedAccountId` | ConnectedAccount di Publishing BC (membuat Publishing terlalu besar) |
| DM-D06 | Tidak ada "Activity Feed" BC — activity tercatat di Notification BC | Activity Feed (Should Have di MVP) dapat dimodel sebagai `NotificationType` yang di-query; tidak memerlukan BC baru pada MVP | BC Activity tersendiri (post-MVP jika diperlukan) |
| DM-D07 | `ContentFormat` di `PostTarget` (+ `platformOptions`), enum di `packages/shared` | Format bergantung platform & multi-account; Outstand override tetap di ACL (ADR-039) | Format hanya di `Post` global, atau hardcode field Outstand di domain |

---

# Related Documents

* `README.md` — scope dan workflow folder 05-architecture
* `database-strategy.md` — strategi schema database berdasarkan domain model ini *(dokumen berikutnya)*
* `application-layer.md` — interaksi Next.js App Router dengan domain services
* `integration-layer.md` — Outstand API dan webhook architecture
* `background-jobs.md` — background job untuk Publishing dan Analytics
* `realtime-strategy.md` — Supabase Realtime untuk Notification
* `auth-architecture.md` — Better Auth dan otorisasi berbasis MemberRole
* `../02-product/feature-modules.md` — Product Baseline: modul produk
* `../02-product/mvp-definition.md` — Product Baseline: MVP scope
* `../02-product/roles-permissions.md` — Product Baseline: roles dan content status kanonikal
* `../03-user/insights.md` — User Discovery: insights I-01, I-04, I-06, I-08
* `../04-ux/key-screen-patterns.md` — UX Baseline: screen patterns sebagai referensi entitas
* `../../project-manager/DECISIONS.md` — ADR-004 (Modular Monolith + DDD), pra-architecture decisions
