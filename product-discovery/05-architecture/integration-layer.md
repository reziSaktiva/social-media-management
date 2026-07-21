# Integration Layer

Dokumen ini mendefinisikan **Integration Layer** untuk produk **Social Media Management** — arsitektur integrasi dengan Outstand API sebagai social media integration provider, meliputi Anti-Corruption Layer, ConnectedAccount management, publishing flow, webhook handling, engagement sync, analytics sync, dan strategi error handling.

Dokumen ini menjadi acuan desain integrasi eksternal dan tidak mencakup implementasi kode. Detail implementasi (HTTP client, retry library, folder structure) didokumentasikan di Engineering Planning (M6).

---

# Tujuan

* Mendefinisikan posisi Outstand API dalam arsitektur sistem.
* Menetapkan Anti-Corruption Layer (ACL) sebagai batas antara domain internal dan sistem eksternal.
* Mendokumentasikan alur ConnectedAccount management via OAuth Outstand.
* Mendefinisikan alur publishing ke social media melalui Outstand API.
* Menetapkan pola webhook handling untuk event dari Outstand.
* Mendokumentasikan strategi sinkronisasi data engagement dan analytics.
* Mendefinisikan error handling strategy untuk kegagalan integrasi.

---

# Keputusan Pra-Architecture

Keputusan berikut sudah ditetapkan sebelum dokumen ini dibuat dan menjadi fondasi Integration Layer:

| Topik | Keputusan | Sumber |
|-------|-----------|--------|
| Social Media Integration Provider | Outstand API | ADR-005 |
| Entry Point untuk webhook | Route Handler | ADR-016 |
| Cross-domain communication | Service-to-service call via public module API | ADR-018 |

---

# Posisi Outstand dalam Arsitektur

Outstand API adalah **external system** — berada di luar batas domain internal. Seluruh interaksi dengan Outstand dilakukan secara eksklusif melalui **Anti-Corruption Layer** sehingga domain internal tidak pernah bergantung langsung pada struktur data atau kontrak API Outstand.

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTERNAL SYSTEM                               │
│                                                                  │
│  Publishing BC ──────────────────────────────►                  │
│  Workspace BC  ──────────────────────────────►                  │
│  Engagement BC ──────────────────────────────►  OutstandAdapter │
│  Analytics BC  ──────────────────────────────►  (ACL)           │
│                                                      │           │
└──────────────────────────────────────────────────────┼──────────┘
                                                        │
                                               Outstand HTTP API
                                                        │
┌──────────────────────────────────────────────────────┼──────────┐
│                    EXTERNAL SYSTEM                    │           │
│                                                       ▼           │
│  Instagram · Facebook · Twitter · LinkedIn · TikTok · YouTube    │
│                  · Threads · Pinterest                           │
└─────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEBHOOK FLOW (Inbound)                        │
│                                                                  │
│  Outstand ──► Route Handler `/api/webhooks/outstand`             │
│                   └──► WebhookProcessor                          │
│                             └──► ApplicationService (domain)     │
└─────────────────────────────────────────────────────────────────┘
```

---

# Anti-Corruption Layer

## Prinsip

Anti-Corruption Layer (ACL) adalah layer terjemahan yang:

1. Mengisolasi domain internal dari perubahan breaking pada Outstand API.
2. Menerjemahkan konsep Outstand ke konsep domain internal (dan sebaliknya).
3. Menjadi satu-satunya titik yang mengetahui struktur data Outstand.

**Aturan ACL:**
- Domain internal **tidak boleh** mengimport tipe atau struktur data Outstand secara langsung.
- Seluruh response dari Outstand API diparse dan divalidasi di dalam `OutstandAdapter` sebelum dikembalikan ke domain.
- Jika Outstand mengubah response format, hanya `OutstandAdapter` yang perlu diperbarui — tidak ada perubahan di domain.

## OutstandAdapter

`OutstandAdapter` adalah modul khusus yang mengimplementasikan seluruh komunikasi dengan Outstand API.

```
OutstandAdapter (Anti-Corruption Layer)
  ├── connectAccount(params) → ConnectedAccountData
  ├── disconnectAccount(outstandAccountId) → void
  ├── schedulePost(params) → OutstandJobResult
  │     // params mencakup: outstandAccountId, caption, mediaUrls, scheduledAt,
  │     // contentFormat, platformOptions? — dipetakan ke override Outstand di ACL
  ├── cancelScheduledPost(outstandJobId) → void
  ├── fetchEngagementItems(outstandAccountId, cursor?) → EngagementPage
  ├── replyToEngagementItem(outstandItemId, text) → void
  ├── fetchPostMetrics(outstandJobId) → PostMetricsData
  └── fetchWorkspaceMetrics(outstandAccountId, period) → WorkspaceMetricsData
```

**Tanggung Jawab OutstandAdapter:**
- Menyusun HTTP request ke Outstand API (auth header, base URL, timeout).
- Memparse dan memvalidasi response Outstand.
- Menerjemahkan error Outstand ke `IntegrationError` yang dikenali domain.
- Menyembunyikan pagination, retry, dan detail protokol dari pemanggil.

**Bukan tanggung jawab OutstandAdapter:**
- Business logic (validasi otorisasi, domain rules).
- Persistensi data ke database.
- Notifikasi ke user.

---

# ConnectedAccount Management

## Alur Connect Account

Menghubungkan akun media sosial ke workspace dilakukan melalui OAuth flow yang dikelola oleh Outstand.

```
┌─────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌──────────────┐
│  User   │    │  Next.js Server  │    │  Outstand API   │    │ Social Media │
│ Browser │    │  (Route Handler) │    │                 │    │  Platform    │
└────┬────┘    └────────┬─────────┘    └────────┬────────┘    └──────┬───────┘
     │                  │                        │                    │
     │  Click "Connect" │                        │                    │
     │─────────────────►│                        │                    │
     │                  │  Request OAuth URL     │                    │
     │                  │───────────────────────►│                    │
     │                  │  Return OAuth URL      │                    │
     │                  │◄───────────────────────│                    │
     │  Redirect to     │                        │                    │
     │  Outstand OAuth  │                        │                    │
     │◄─────────────────│                        │                    │
     │                  │                        │  OAuth consent     │
     │──────────────────────────────────────────►│───────────────────►│
     │                  │                        │  OAuth callback    │
     │                  │                        │◄───────────────────│
     │  Redirect to     │                        │                    │
     │  /callback URL   │                        │                    │
     │─────────────────►│                        │                    │
     │                  │  Verify + get account  │                    │
     │                  │───────────────────────►│                    │
     │                  │  Return account data   │                    │
     │                  │◄───────────────────────│                    │
     │                  │  Create ConnectedAccount│                   │
     │                  │  (WorkspaceService)    │                    │
     │  Account connected│                       │                    │
     │◄─────────────────│                        │                    │
```

**Entry Point:** Route Handler di `/api/integrations/outstand/callback`

**Langkah-langkah:**
1. User klik "Connect Account" di Settings → Workspace Service meminta OAuth URL dari `OutstandAdapter`.
2. User diarahkan ke Outstand OAuth URL — Outstand menangani OAuth dengan platform.
3. Setelah consent, Outstand mengarahkan ke `/api/integrations/outstand/callback` dengan `code` dan `state`.
4. Route Handler memverifikasi `state` (CSRF protection) dan memanggil `WorkspaceService.completeAccountConnection(code)`.
5. `WorkspaceService` memanggil `OutstandAdapter.connectAccount(code)` untuk menukar code dengan data akun.
6. `WorkspaceService` membuat entitas `ConnectedAccount` dan menyimpan ke repository.

**Data yang disimpan pada `ConnectedAccount`:**
- `outstandAccountId` — ID dari Outstand (external reference permanen).
- `platform` — platform yang terhubung (`instagram`, `facebook`, dst.).
- `handle` — nama akun atau halaman.
- `status` — `active`.

**Catatan:**
- Access token OAuth **tidak disimpan** di database internal. Token dikelola sepenuhnya oleh Outstand.
- Revoke token dilakukan melalui Outstand API, bukan secara langsung ke platform.

## Alur Disconnect Account

1. User memilih "Disconnect" di Settings.
2. `WorkspaceService` memanggil `OutstandAdapter.disconnectAccount(outstandAccountId)`.
3. `WorkspaceService` mengubah `ConnectedAccount.status` menjadi `disconnected`.
4. Post yang sudah dijadwalkan ke akun ini ditandai `failed` di Publishing BC.

---

# Publishing Flow

## Alur Jadwalkan Post ke Outstand

Publishing ke social media dilakukan melalui Outstand API — sistem internal tidak berinteraksi langsung dengan API platform social media.

```
┌──────────────────┐    ┌──────────────────────┐    ┌─────────────────┐
│  PublishingService│    │  OutstandAdapter (ACL)│    │  Outstand API   │
└────────┬─────────┘    └──────────┬───────────┘    └────────┬────────┘
         │                          │                          │
         │  schedulePost(params)    │                          │
         │─────────────────────────►│                          │
         │                          │  POST /jobs/schedule     │
         │                          │─────────────────────────►│
         │                          │  Return { jobId, ... }   │
         │                          │◄─────────────────────────│
         │  Return OutstandJobResult │                          │
         │◄─────────────────────────│                          │
         │                          │                          │
         │  Save outstandJobId       │                          │
         │  on PostTarget           │                          │
```

**Trigger:** Status `Post` bertransisi ke `Scheduled` (setelah review approved atau user langsung schedule).

**Langkah-langkah:**
1. `PublishingService` memvalidasi bahwa semua `PostTarget` memiliki `ConnectedAccount` yang `active`.
2. `PublishingService` memvalidasi `contentFormat` tiap `PostTarget` terhadap matriks platform (ADR-039) serta kelengkapan media / `platformOptions` (mis. Pinterest pin).
3. Per `PostTarget`, `PublishingService` memanggil `OutstandAdapter.schedulePost(params)` dengan:
   - `outstandAccountId` dari `ConnectedAccount`.
   - Caption, media URLs, dan waktu tayang.
   - `contentFormat` + `platformOptions` — diterjemahkan ACL ke override Outstand (Story/Reel/Pin, dll.).
4. Outstand mengembalikan `outstandJobId`.
5. `PublishingService` menyimpan `outstandJobId` pada `PostTarget` dan mengubah `PostTarget.status` ke `scheduled`.

**Catatan:**
- Media diupload ke Supabase Storage sebelum dijadwalkan. Bucket `media` bersifat private — saat menjadwalkan ke Outstand, **signed URL sementara** (TTL sekitar 24 jam) di-generate dari `storage_path` dan dikirim ke Outstand. Outstand mengambil media dari signed URL tersebut sebelum TTL habis.
- Jika salah satu `PostTarget` gagal dijadwalkan, `PostTarget` tersebut ditandai `failed`. `PostTarget` lain pada post yang sama tidak terpengaruh.
- **Content format (ADR-039):** Outstand memfasilitasi Post / Reel / Story (dan opsi platform lain seperti Pinterest board). Domain menyimpan `ContentFormat` per target; hanya `OutstandAdapter` yang mengetahui bentuk field API Outstand (mis. flag Story / routing Reel / metadata Pin).

## Alur Batalkan Post

1. User membatalkan jadwal dari UI → `PublishingService.cancelScheduledPost(postId)`.
2. Per `PostTarget` dengan status `scheduled`, `PublishingService` memanggil `OutstandAdapter.cancelScheduledPost(outstandJobId)`.
3. `PostTarget.status` diubah ke `pending` (kembali ke antrean atau draft).

---

# Webhook Handling

## Overview

Outstand mengirim event webhook ke sistem kita untuk memberitahu hasil publikasi, kegagalan akun, dan data engagement baru. Webhook adalah mekanisme utama untuk mengetahui status post setelah dijadwalkan.

**Endpoint:** `POST /api/webhooks/outstand`

## Keamanan Webhook

Setiap request webhook dari Outstand harus diverifikasi sebelum diproses:

```
Request masuk
    └── Route Handler `/api/webhooks/outstand`
            ├── Verifikasi signature (HMAC-SHA256 dengan webhook secret)
            ├── Tolak jika signature tidak valid → 401
            └── Lanjut ke WebhookProcessor
```

- Outstand menyertakan header `X-Outstand-Signature` berisi HMAC-SHA256 dari request body.
- Webhook secret disimpan di environment variable, tidak di database.
- Jika signature tidak valid, response `401 Unauthorized` dikembalikan tanpa memproses payload.

## Daftar Event Webhook

| Event | Deskripsi | Domain yang Dinotifikasi |
|-------|-----------|--------------------------|
| `post.published` | Post berhasil dipublikasikan ke platform | Publishing BC |
| `post.failed` | Post gagal dipublikasikan | Publishing BC, Notification BC |
| `account.disconnected` | Akun media sosial dicabut aksesnya | Workspace BC, Notification BC |
| `comment.received` | Komentar baru diterima pada post | Engagement BC |
| `message.received` | Pesan DM baru diterima | Engagement BC |

## Alur Pemrosesan Webhook

```
Outstand
    └── POST /api/webhooks/outstand
            └── Route Handler
                    ├── Verifikasi signature
                    ├── Parse event type + payload
                    └── WebhookProcessor.process(event)
                                ├── event: post.published → PublishingService.markPostPublished(outstandJobId, publishedUrl)
                                ├── event: post.failed    → PublishingService.markPostFailed(outstandJobId, reason)
                                │                           NotificationService.notify(workspaceId, ...)
                                ├── event: account.disconnected → WorkspaceService.markAccountDisconnected(outstandAccountId)
                                │                                  NotificationService.notify(workspaceId, ...)
                                ├── event: comment.received → EngagementService.ingestInboxItem(payload)
                                └── event: message.received → EngagementService.ingestInboxItem(payload)
```

**Prinsip pemrosesan webhook:**
- Route Handler **tidak** mengandung business logic — hanya verifikasi dan dispatch ke `WebhookProcessor`.
- `WebhookProcessor` memanggil Application Service yang tepat menggunakan `outstandJobId` atau `outstandAccountId` sebagai external reference.
- Respons ke Outstand dikembalikan **segera** (`200 OK`) setelah event diterima dan sebelum pemrosesan selesai — untuk mencegah timeout pada sisi Outstand.
- Jika pemrosesan gagal, payload event disimpan ke tabel `background_jobs` sebagai job `JOB-01` (webhook retry) — strategi retry detail di `background-jobs.md`.

## Idempotency

Outstand dapat mengirim event yang sama lebih dari sekali (retry on failure). Sistem harus idempoten:

- Sebelum memproses `post.published`, cek apakah `PostTarget.status` sudah `published` — jika ya, skip.
- Sebelum memproses `comment.received`, cek apakah `InboxItem` dengan `outstandItemId` yang sama sudah ada — jika ya, skip.

---

# Engagement Data Sync

## Sumber Data

Data engagement (komentar dan DM) diterima dari dua mekanisme:

| Mekanisme | Event | Kegunaan |
|-----------|-------|----------|
| **Webhook** (push) | `comment.received`, `message.received` | Item baru secara real-time |
| **Polling** (pull) | Jadwal periodik | Catch-up jika webhook terlewat |

## Ingest via Webhook

- Event `comment.received` dan `message.received` diproses oleh `EngagementService.ingestInboxItem(payload)`.
- `OutstandAdapter` mentranslasikan payload Outstand ke `InboxItemData` (konsep domain internal).
- `EngagementService` membuat atau mengupdate `InboxItem` di repository.

**Atribut `InboxItem` yang berasal dari Outstand:**
- `outstandItemId` — ID unik dari Outstand, digunakan untuk idempotency check.
- `platform` — dari `ConnectedAccount`.
- `authorName` — nama pengirim komentar/DM.
- `content` — teks komentar/DM.
- `postId` — referensi ke `Post` jika komentar terkait post internal (matched via `outstandJobId`).
- `receivedAt` — timestamp dari Outstand.

## Reply via Outstand API

Ketika user membalas dari Engagement Inbox:

1. `EngagementService.reply(inboxItemId, text)` dipanggil.
2. `EngagementService` memanggil `OutstandAdapter.replyToEngagementItem(outstandItemId, text)`.
3. Setelah berhasil, `Reply` entity disimpan di repository sebagai audit trail.

---

# Analytics Data Sync

## Sumber Data

Data analytics (metrics post dan metrics workspace) diambil melalui polling periodik ke Outstand API. Outstand mengaggregasikan data dari platform social media.

| Data | Frekuensi Polling | Disimpan Sebagai |
|------|-------------------|------------------|
| Post metrics (likes, comments, shares, reach) | Per-job setelah publish | `analytics_post_metrics` |
| Workspace metrics (followers, reach harian/mingguan) | Harian | `analytics_workspace_snapshots` |

## Alur Sync

```
Background Job (scheduler)
    └── AnalyticsService.syncPostMetrics(workspaceId)
            └── OutstandAdapter.fetchPostMetrics(outstandJobId)
                    └── AnalyticsService.upsertPostMetrics(postId, metricsData)

Background Job (scheduler)
    └── AnalyticsService.syncWorkspaceMetrics(workspaceId, period)
            └── OutstandAdapter.fetchWorkspaceMetrics(outstandAccountId, period)
                    └── AnalyticsService.upsertWorkspaceSnapshot(workspaceId, snapshotData)
```

**Catatan:**
- Scheduling background job untuk polling analytics didefinisikan di `background-jobs.md`.
- Analytics tidak menggunakan webhook — Outstand tidak menyediakan webhook untuk perubahan metrics.
- Data metrics bersifat **append-only** atau **upsert** — snapshot lama tidak dihapus.

---

# Error Handling Strategy

## Klasifikasi Error

| Tipe Error | Contoh | Penanganan |
|------------|--------|------------|
| **Transient** | Timeout, 5xx, network error | Retry dengan exponential backoff |
| **Client Error** | 400 Bad Request, invalid params | Log + gagalkan operasi, jangan retry |
| **Auth Error** | 401 Unauthorized (API key salah) | Alert ke developer (monitoring), jangan retry |
| **Account Error** | 403 (akun dicabut aksesnya) | Tandai `ConnectedAccount.status = error`, notifikasi workspace owner |
| **Not Found** | 404 (job tidak ditemukan) | Log + skip (idempotent) |

## Strategi per Operasi

**Connect Account:**
- Gagal pada OAuth callback → tampilkan pesan error ke user, jangan simpan `ConnectedAccount` yang invalid.

**Schedule Post:**
- Gagal (transient) → retry via background job (maks 3x).
- Gagal (permanent) → tandai `PostTarget.status = failed`, simpan `PostTarget.error`, notifikasi creator.

**Webhook Processing:**
- Gagal memproses event → simpan sebagai job `JOB-01` (`outstand.webhook.retry`) di tabel `background_jobs`, jadwalkan retry.
- Retry maks 3x dengan exponential backoff: 5 menit, 15 menit, 60 menit (sesuai JOB-01 di `background-jobs.md`).
- Setelah maks retry habis → `background_jobs.status = 'failed'` (dead letter), dicatat di tabel untuk inspeksi manual.

**Analytics Sync:**
- Gagal polling → log error, skip siklus ini, coba lagi di jadwal berikutnya.
- Kegagalan tidak memblokir operasi lain.

## IntegrationError

Seluruh error dari Outstand API diterjemahkan oleh `OutstandAdapter` ke tipe `IntegrationError` sebelum dikembalikan ke domain:

```
IntegrationError
  ├── type: 'transient' | 'client_error' | 'auth_error' | 'account_error' | 'not_found'
  ├── outstandErrorCode: string?
  ├── message: string
  └── retryable: boolean
```

Domain internal **tidak pernah** melihat HTTP error code Outstand secara langsung.

---

# Keputusan Integration Layer

| ID | Topik | Keputusan |
|----|-------|-----------|
| IL-D01 | ACL Pattern | Anti-Corruption Layer via `OutstandAdapter` — satu-satunya titik interaksi dengan Outstand API |
| IL-D02 | Token Management | OAuth access token tidak disimpan di database internal — dikelola sepenuhnya oleh Outstand |
| IL-D03 | Webhook Security | HMAC-SHA256 signature verification sebelum setiap pemrosesan webhook event |
| IL-D04 | Webhook Response | Respons `200 OK` dikembalikan segera sebelum pemrosesan selesai (async processing) |
| IL-D05 | Webhook Idempotency | Cek duplikasi via `outstandJobId` / `outstandItemId` sebelum memproses event |
| IL-D06 | Analytics Strategy | Pull-based polling periodik — tidak ada webhook dari Outstand untuk metrics |
| IL-D07 | Media Strategy | Media diupload ke Supabase Storage (bucket private) terlebih dahulu; signed URL sementara (TTL ~24 jam) di-generate saat scheduling dan dikirim ke Outstand |
| IL-D08 | Error Translation | Seluruh error Outstand diterjemahkan ke `IntegrationError` di dalam `OutstandAdapter` |

---

# Related Documents

* `domain-model.md` — definisi `ConnectedAccount`, `PostTarget`, `OutstandJobId` sebagai external reference
* `database-strategy.md` — tabel `workspace_connected_accounts`, `publishing_post_targets`, `analytics_post_metrics`, `analytics_workspace_snapshots`
* `application-layer.md` — Route Handler sebagai entry point webhook; Application Service sebagai pemanggil OutstandAdapter
* `background-jobs.md` — strategi retry webhook event dan jadwal polling analytics
* `auth-architecture.md` — workspace membership check pada setiap operasi ConnectedAccount
* `../../project-manager/DECISIONS.md` — ADR-005, ADR-016, ADR-018, ADR-019, ADR-020, ADR-021
