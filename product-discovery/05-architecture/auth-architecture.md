# Auth Architecture

Dokumen ini mendefinisikan **Security & Auth Architecture** untuk produk **Social Media Management** — arsitektur autentikasi, manajemen sesi, workspace context resolution, dan otorisasi berbasis role (RBAC).

Dokumen ini menjadi acuan desain keamanan sistem dan tidak mencakup implementasi kode. Detail implementasi (Better Auth configuration, middleware code) didokumentasikan di Engineering Planning (M6).

---

# Tujuan

* Mendefinisikan alur autentikasi menggunakan Better Auth.
* Menetapkan struktur sesi dan data yang disimpan dalam sesi.
* Mendefinisikan mekanisme workspace context resolution.
* Menetapkan model otorisasi berbasis role (RBAC) dan cara enforcement-nya.
* Mendokumentasikan strategi Middleware untuk auth guard.
* Mendefinisikan pola proteksi route dan API endpoint.

---

# Keputusan Pra-Architecture

Keputusan berikut sudah ditetapkan sebelum dokumen ini dibuat dan menjadi fondasi Auth Architecture:

| Topik | Keputusan | Sumber |
|-------|-----------|--------|
| Auth Library | Better Auth | Keputusan pra-architecture |
| Auth Enforcement | Application-enforced sebagai lapisan utama; RLS sebagai defense-in-depth | ADR-015 |
| Identity BC | BC-01 Identity — dikelola Better Auth, prefix tabel `identity_` | `domain-model.md` |
| Application Layer | Middleware untuk auth guard dan workspace context injection | ADR-016 |
| Roles | 4 roles: Owner, Admin, Manager, Creator | ADR-012, `roles-permissions.md` |
| Multi-tenancy Unit | `workspace_id` sebagai unit isolasi | ADR-015 |

---

# Authentication

## Better Auth sebagai Identity Provider

Better Auth mengelola seluruh lifecycle autentikasi:
- Registrasi akun (email + password).
- Login dengan email + password.
- OAuth login (Google — jika ditambahkan di Engineering Planning).
- Session lifecycle (create, refresh, destroy).
- Password reset via email.

**Domain internal tidak mengimplementasikan logika autentikasi dari nol.** BC-01 Identity hanya mengekspos interface yang memanggil Better Auth API.

## Metode Autentikasi MVP

| Metode | Status MVP |
|--------|-----------|
| Email + Password | ✅ MVP |
| Google OAuth | ✅ MVP (via Better Auth OAuth plugin) |
| Magic Link | Post-MVP |
| SSO/SAML | Post-MVP |

## Alur Registrasi

```
┌─────────┐    ┌──────────────────┐    ┌──────────────┐    ┌────────────┐
│  User   │    │  Next.js Server  │    │  Better Auth │    │  Database  │
│ Browser │    │  (Server Action) │    │              │    │ (Supabase) │
└────┬────┘    └────────┬─────────┘    └──────┬───────┘    └─────┬──────┘
     │                  │                      │                   │
     │  Submit form     │                      │                   │
     │─────────────────►│                      │                   │
     │                  │  auth.signUp()        │                   │
     │                  │─────────────────────►│                   │
     │                  │                      │  INSERT user       │
     │                  │                      │──────────────────►│
     │                  │                      │  INSERT session    │
     │                  │                      │──────────────────►│
     │                  │  Session cookie       │                   │
     │                  │◄─────────────────────│                   │
     │  Set-Cookie +    │                      │                   │
     │  Redirect        │                      │                   │
     │◄─────────────────│                      │                   │
```

**Setelah registrasi:**
- Workspace belum ada — user diarahkan ke onboarding untuk membuat workspace pertama.
- `WorkspaceService.createWorkspace()` dipanggil dengan `userId` dari sesi, user otomatis menjadi Owner.

## Alur Login

```
User submit form login
  └── Server Action
        └── Better Auth auth.signIn.email({ email, password })
              ├── Sukses → Set session cookie → Redirect ke /dashboard
              └── Gagal  → Return error ke form
```

## Session Cookie

Better Auth menggunakan **HTTP-only cookie** untuk menyimpan session token.

| Property | Value |
|----------|-------|
| Cookie name | `better-auth.session_token` (default Better Auth) |
| HTTP-only | Ya |
| Secure | Ya (production) |
| SameSite | `lax` |
| Expiry | 7 hari (configurable) |

**Catatan:** Session token disimpan di cookie, bukan di `localStorage` — mencegah XSS attack.

---

# Session Management

## Session Data Structure

Better Auth menyimpan sesi di tabel `identity_sessions`. Data yang dapat diakses dari sesi aktif:

```
Session {
  userId: string          -- User.id dari Better Auth
  expiresAt: Date
  ipAddress: string?
  userAgent: string?
}
```

## Workspace Context

Session Better Auth **tidak menyimpan** `workspaceId` secara langsung. Workspace context di-resolve oleh Middleware berdasarkan URL dan data member.

**Alasan:**
- User dapat memiliki akses ke beberapa workspace (post-MVP: workspace switching).
- Workspace aktif bergantung pada URL (misal `/dashboard/[workspaceSlug]/...`).
- Menyimpan workspaceId di session menciptakan state yang bisa stale.

## Session Validation

Setiap request ke halaman atau API yang terproteksi melalui Middleware:

```
Request masuk
  └── Middleware
        ├── Ambil session cookie
        ├── Panggil Better Auth auth.api.getSession({ headers })
        ├── Jika tidak ada session → redirect ke /login
        ├── Jika session expired → redirect ke /login
        └── Jika valid → inject userId ke request context → lanjut
```

---

# Workspace Context Resolution

## Cara Kerja

Workspace aktif di-resolve oleh Middleware dari URL path, kemudian divalidasi bahwa user memiliki akses ke workspace tersebut.

```
URL: /dashboard/[workspaceSlug]/publish
  └── Middleware
        ├── Extract workspaceSlug dari URL
        ├── Query: SELECT * FROM workspace_members
        │           WHERE workspace_id = (SELECT id FROM workspaces WHERE slug = ?)
        │             AND user_id = session.userId
        ├── Jika tidak ditemukan → redirect ke /dashboard (no access)
        ├── Jika ditemukan → inject { workspaceId, role } ke request headers
        └── Application Service dapat membaca workspaceId dari headers
```

## Workspace Context dalam Request

Middleware menginject workspace context sebagai custom request headers:

```
x-workspace-id: {workspaceId}
x-workspace-role: {owner | admin | manager | creator}
```

Application Service dan Server Actions membaca headers ini untuk mengetahui workspace aktif dan role user tanpa perlu query ulang ke database.

**Keamanan:** Header ini **tidak dapat diset oleh client** — hanya Middleware yang menulis headers ini. Next.js Middleware berjalan di server edge, bukan di browser.

---

# Authorization (RBAC)

## Pendekatan

Sistem menggunakan **Role-Based Access Control (RBAC)** yang di-enforce di **Application Service layer**.

**Posisi enforcement:**

```
Request (Server Action / Route Handler)
  └── Application Service
        ├── Baca role dari request context (header x-workspace-role)
        ├── Periksa: apakah role ini diizinkan untuk operasi ini?
        ├── Jika tidak → throw AuthorizationError
        └── Jika ya → lanjut ke domain logic
```

**Aturan enforcement:**
- Authorization check **wajib** ada di Application Service sebelum domain logic dieksekusi.
- Entry Point (Server Action, Route Handler) **tidak boleh** melakukan authorization check secara mandiri — delegasikan ke Application Service.
- RLS di Supabase adalah **defense-in-depth** — jika Application Service melewatkan check, RLS mencegah akses ke data yang tidak seharusnya.

## Role Hierarchy

```
Owner > Admin > Manager > Creator
```

Owner memiliki semua permission Admin. Admin memiliki semua permission Manager. Manager memiliki lebih banyak permission dari Creator.

## Permission Matrix

Referensi lengkap: `../../02-product/roles-permissions.md`

Ringkasan permission per area yang relevan untuk enforcement di Application Service:

| Operasi | Owner | Admin | Manager | Creator |
|---------|-------|-------|---------|---------|
| Hapus workspace | ✅ | ❌ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ | ❌ |
| Ubah billing | ✅ | ❌ | ❌ | ❌ |
| Kelola connected accounts | ✅ | ✅ | ❌ | ❌ |
| Undang/hapus member | ✅ | ✅ | Creator only | ❌ |
| Publish / jadwalkan post | ✅ | ✅ | ✅ | ❌ |
| Buat / edit draft | ✅ | ✅ | ✅ | ✅ |
| Hapus konten orang lain | ✅ | ✅ | ✅ | ❌ |
| Baca analytics | ✅ | ✅ | ✅ | ❌ |
| Balas engagement | ✅ | ✅ | ✅ | ❌ |
| Baca audit log | ✅ | ✅ | ❌ | ❌ |

## Authorization Helper

Application Service menggunakan helper function untuk memvalidasi permission:

```
assertPermission(role: WorkspaceRole, operation: Operation): void
  ├── Jika role diizinkan → return (lanjut eksekusi)
  └── Jika tidak → throw AuthorizationError("Insufficient permissions")
```

`AuthorizationError` ditangkap di Entry Point dan diterjemahkan ke HTTP 403 atau error message UI.

---

# Middleware Strategy

## Route Groups

Next.js Middleware mengelola dua zona route:

```
Middleware matchers:
├── /login          → Public route (bypass auth)
├── /register       → Public route (bypass auth)  
├── /api/webhooks/* → Webhook routes (bypass auth — protected via HMAC signature)
├── /api/jobs/*     → Job runner routes (bypass auth — protected via X-Job-Secret)
└── /dashboard/*    → Protected routes (wajib session + workspace context)
    └── /dashboard/[workspaceSlug]/* → Wajib workspace membership check
```

## Middleware Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE FLOW                                │
│                                                                   │
│  Request masuk                                                    │
│      │                                                            │
│      ▼                                                            │
│  Public route? ──── Ya ──► Lanjut ke handler                     │
│      │ Tidak                                                      │
│      ▼                                                            │
│  Webhook / Job route? ── Ya ──► Lanjut (protected by secret)     │
│      │ Tidak                                                      │
│      ▼                                                            │
│  Ambil session cookie                                             │
│      │                                                            │
│      ├─ Tidak ada / expired ──► Redirect /login                  │
│      │                                                            │
│      └─ Valid → Ada workspaceSlug di URL?                         │
│                     │                                             │
│                     ├─ Tidak ──► Inject userId → Lanjut          │
│                     │                                             │
│                     └─ Ya → Query workspace membership            │
│                                 │                                 │
│                                 ├─ Tidak ada akses → /dashboard  │
│                                 │                                 │
│                                 └─ Ada → Inject headers → Lanjut │
└──────────────────────────────────────────────────────────────────┘
```

---

# Proteksi Route API

## Route Handlers untuk External System

Route Handlers yang menerima request dari sistem eksternal (webhook, job runner) tidak melalui session auth. Dilindungi dengan mekanisme berbeda:

| Route | Mekanisme Proteksi |
|-------|-------------------|
| `/api/webhooks/outstand` | HMAC-SHA256 signature verification (ADR-020) |
| `/api/jobs/run` | Secret header `X-Job-Secret` dibandingkan env variable |
| `/api/integrations/outstand/callback` | CSRF protection via `state` parameter (ADR-021) |

## Internal API Route

Route Handler yang dipanggil dari Client Components harus:
1. Diproteksi oleh Middleware (session check).
2. Memeriksa workspace membership jika berkaitan dengan data workspace.

---

# Row-Level Security (Defense-in-Depth)

RLS tidak menggantikan authorization di Application Service — RLS adalah **lapisan keamanan tambahan** jika Application Service gagal melakukan pengecekan.

**Contoh RLS policy untuk data workspace:**

```sql
-- User hanya bisa baca data workspace yang mereka ikuti
CREATE POLICY "workspace_member_access"
ON publishing_posts
FOR ALL
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
  )
);
```

**Catatan:** RLS policy menggunakan `auth.uid()` dari Better Auth session — Supabase Better Auth integration harus dikonfigurasi agar `auth.uid()` mengembalikan userId yang benar. Detail konfigurasi di Engineering Planning (M6).

---

# Error Handling Auth

| Skenario | Response |
|----------|---------|
| Tidak ada session | Redirect ke `/login` (via Middleware) |
| Session expired | Redirect ke `/login` (via Middleware) |
| User tidak memiliki akses ke workspace | Redirect ke `/dashboard` |
| Role tidak cukup untuk operasi | `AuthorizationError` → UI error message / HTTP 403 |
| RLS violation | Supabase mengembalikan empty result atau error — Application Service menangani sebagai not found |

---

# Onboarding Flow (First Login)

Saat user pertama kali login dan belum memiliki workspace:

```
Login berhasil
  └── Middleware: session valid, tidak ada workspaceSlug di URL
        └── Redirect ke /onboarding
              └── User membuat workspace pertama
                    └── WorkspaceService.createWorkspace()
                          ├── Buat Workspace baru
                          ├── Buat WorkspaceMember (userId, role: owner)
                          └── Redirect ke /dashboard/[workspaceSlug]
```

---

# Post-MVP Considerations

| Fitur | Kompleksitas | Prioritas |
|-------|-------------|-----------|
| Multi-workspace switching | Medium | High |
| Magic Link login | Low | Medium |
| SSO/SAML | Tinggi | Low (enterprise) |
| Two-Factor Authentication (2FA) | Medium | Medium |
| Audit log untuk auth events | Low | Medium |
| API key untuk programmatic access | Medium | Low |

---

# Decision Log

| ID | Keputusan | Alasan |
|----|-----------|--------|
| AU-D01 | Better Auth sebagai auth library | Sudah ditetapkan sebagai keputusan pra-architecture; menghindari implementasi auth dari nol |
| AU-D02 | HTTP-only cookie untuk session token | Mencegah XSS attack; session tidak dapat diakses oleh JavaScript di browser |
| AU-D03 | Workspace context di-resolve via Middleware dari URL slug | Workspace aktif bergantung pada URL — lebih akurat dari menyimpan di session yang bisa stale |
| AU-D04 | Inject workspace context via custom request headers | Memungkinkan Application Service membaca context tanpa query database ulang; tidak dapat dimanipulasi client |
| AU-D05 | Authorization check di Application Service layer | Selaras dengan DDD — domain service yang mengetahui aturan bisnis; Entry Point tetap thin |
| AU-D06 | RLS sebagai defense-in-depth, bukan primary enforcement | Application-enforced lebih fleksibel dan testable; RLS sebagai safety net jika ada bug di layer atas |
| AU-D07 | Email + Password + Google OAuth untuk MVP | Cukup untuk target user (tim profesional); Magic Link dan SSO dipertimbangkan post-MVP |

---

# Related Documents

* `domain-model.md` — BC-01 Identity, BC-02 Workspace, WorkspaceMember entity
* `database-strategy.md` — tabel `identity_*` (Better Auth), `workspace_members`
* `application-layer.md` — Middleware strategy dan Application Service authorization pattern
* `../../02-product/roles-permissions.md` — Permission matrix lengkap per role
* `realtime-strategy.md` — Session diperlukan sebelum Supabase Realtime subscription
* `../../project-manager/DECISIONS.md` — ADR-024
