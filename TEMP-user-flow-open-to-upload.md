# TEMP — User Flow: Buka App → Connect Akun → Upload

> **FILE SEMENTARA — BUKAN BASELINE / BUKAN ACUAN**
>
> File ini dibuat hanya untuk diskusi visual. Silakan hapus setelah dibaca.
> Sumber yang dipakai: ringkasan dari `04-ux` (UF-01, UF-05) + pola auth/workspace + **ADR-039 Content Format** — **bukan** dokumen resmi baru.

---

## Ringkasan satu jalur (happy path pertama kali)

```mermaid
flowchart TD
  A[User membuka aplikasi] --> B{Sudah punya session?}

  B -->|Ya| D{Sudah punya workspace?}
  B -->|Tidak| C[Auth: Sign up / Sign in<br/>email-password atau Google]

  C --> C2[Session aktif] --> D

  D -->|Belum| E[Buat workspace<br/>nama, timezone]
  D -->|Sudah| F[Pilih / masuk workspace aktif]

  E --> F
  F --> G{Ada akun sosial<br/>terhubung?}

  G -->|Belum| H[Empty state / CTA Connect Account]
  G -->|Sudah| M[Publish → Drafts → New Post]

  H --> I[Workspace Settings → Connected Accounts]
  I --> J[Pilih platform<br/>IG FB X LinkedIn TikTok<br/>YouTube Threads Pinterest]
  J --> K[OAuth di platform pihak ketiga]
  K --> L{OAuth sukses?}

  L -->|Ya| L2[Akun muncul status Active]
  L -->|Tidak / batal| I

  L2 --> M
  M --> N[Tulis caption<br/>manual atau AI Assist opsional]
  N --> O[Upload / lampirkan media<br/>file lokal atau Media Library]
  O --> P[Pilih akun tujuan<br/>Account Selector]
  P --> P2[Content Format per akun<br/>IG/FB: Post Reel Story<br/>Pinterest: Pin · lainnya: Post]
  P2 --> Q{Siap dijadwalkan?}

  Q -->|Belum| R[Save as Draft]
  Q -->|Ya| S[Pilih waktu → Schedule<br/>konfirmasi caption + akun + format]

  R --> T[Selesai: konten tersimpan Draft]
  S --> U[Selesai: status Scheduled<br/>muncul di Calendar & Queue]
```

---

## Versi lebih linear (urutan langkah)

```mermaid
flowchart LR
  subgraph Auth
    A1[Buka app] --> A2[Login / Signup] --> A3[Session]
  end

  subgraph Workspace
    A3 --> W1[Buat atau pilih workspace]
  end

  subgraph Connect
    W1 --> C1[Connected Accounts] --> C2[Connect platform] --> C3[OAuth] --> C4[Akun Active]
  end

  subgraph Upload_Publish
    C4 --> P1[New Post] --> P2[Caption] --> P3[Upload media] --> P4[Pilih akun] --> P4b[Content Format] --> P5[Schedule / Draft]
  end
```

---

## Catatan singkat (bukan spesifikasi)

| Tahap     | Inti                                                                                                           |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| Buka app  | Entry via auth; tanpa session → login/signup                                                                   |
| Workspace | Multi-tenant: user masuk ke satu workspace aktif                                                               |
| Connect   | Via **Workspace Settings → Connected Accounts** (UF-05), OAuth Outstand/platform                               |
| Upload    | Media dilampirkan di **Draft Editor** (UF-01), lalu pilih akun + **Content Format** (ADR-039) + schedule/draft |

**Content Format (ADR-039) — wajib di Draft Editor:**

| Platform                              | Format di UI                           |
| ------------------------------------- | -------------------------------------- |
| Instagram, Facebook                   | Post · Reel · Story                    |
| Pinterest                             | Pin (+ title, destination link, board) |
| TikTok, X, LinkedIn, YouTube, Threads | Post (default; tanpa radio Reel/Story) |

**Cabang penting (opsional di mental model):**

- Token kadaluarsa → status `Disconnected` → **Reconnect** (bukan setup ulang dari nol).
- Belum siap publish → **Save as Draft** (tidak masuk Calendar/Queue).
- User yang sudah punya akun terhubung → bisa langsung New Post tanpa melewati Connect lagi.
- Format harus valid per platform sebelum Schedule (mis. Pinterest tidak boleh tersimpan sebagai `post`).

---

## Outstand: Authentication vs Connect Social Media

Sumber: [Authentication](https://www.outstand.so/docs/authentication), [Configurations](https://www.outstand.so/docs/configurations), [Get social network authentication URL](https://www.outstand.so/docs/get-social-network-authentication-url).

Ada **dua lapisan** yang sering tertukar:

| Lapisan                             | Siapa            | Apa                           | Dipakai untuk                           |
| ----------------------------------- | ---------------- | ----------------------------- | --------------------------------------- |
| **A. Auth ke Outstand API**         | Backend kita     | API key (`Bearer`)            | Semua request ke `api.outstand.so`      |
| **B. Connect akun sosial end-user** | User di app kita | OAuth platform (via Outstand) | User memasangkan IG/X/dll. ke workspace |

- **A** = kunci pintu ke Outstand (server-to-server).
- **B** = user mengizinkan app mengakses akun sosial mereka (browser OAuth).

Di arsitektur kita, keduanya hanya lewat **OutstandAdapter (ACL)** — domain tidak memanggil Outstand langsung.

```mermaid
flowchart TD
  subgraph LayerA [A — Auth API Outstand]
    K1[Dapatkan API key di dashboard Outstand] --> K2[Simpan di env server<br/>OUTSTAND_API_KEY]
    K2 --> K3["Setiap request:<br/>Authorization: Bearer sk_..."]
  end

  subgraph LayerB [B — Config + Connect akun sosial]
    C1[Configure credentials per network<br/>Managed Keys atau BYOK] --> C2[POST auth-url untuk network]
    C2 --> C3[Redirect user ke auth_url]
    C3 --> C4[User login + consent di platform]
    C4 --> C5[Callback ke redirect_uri app kita]
    C5 --> C6{Platform multi-page?<br/>FB / LinkedIn dll}
    C6 -->|Ya| C7[GET pending + POST finalize]
    C6 -->|Tidak| C8[Akun sudah connected di Outstand]
    C7 --> C8
    C8 --> C9[Simpan ConnectedAccount di workspace kita<br/>outstandAccountId + platform + handle]
  end

  LayerA --> LayerB
```

---

### A) Authentication ke Outstand API (API key)

Dokumen: [outstand.so/docs/authentication](https://www.outstand.so/docs/authentication)

1. Di website Outstand → **Get API Key** (tampil sekali — simpan aman).
2. Best practice: key terpisah per project / environment (dev vs prod).
3. Semua request memakai header:

```http
Authorization: Bearer <api_key>
```

**Contoh — list social accounts yang sudah terhubung:**

```bash
curl -X GET https://api.outstand.so/v1/social-accounts \
  -H "Authorization: Bearer sk_live_abc123def456"
```

Response sukses (ringkas):

```json
{
  "success": true,
  "data": [
    {
      "id": "acc_123",
      "network": "x",
      "username": "@mycompany"
    }
  ]
}
```

Error jika key hilang/salah:

```json
{
  "success": false,
  "error": "Invalid or missing API key"
}
```

**Di app kita (konsep):** key hanya di server (`apps/web/.env.local`), tidak pernah di browser.

```ts
// ilustrasi — bukan kode produksi
const res = await fetch("https://api.outstand.so/v1/social-accounts", {
  headers: {
    Authorization: `Bearer ${process.env.OUTSTAND_API_KEY}`,
  },
});
```

---

### B1) Configuration credentials social network (prasyarat connect)

Dokumen: [outstand.so/docs/configurations](https://www.outstand.so/docs/configurations)

Sebelum user bisa connect akun:

1. **Credentials** = Client ID / Secret OAuth app di developer portal platform (atau Managed Keys Outstand).
2. **Social Accounts** = profil nyata user (`@brand` di X, IG Business, dll.).

Urutan resmi Outstand:

1. Configure credentials per network
2. Connect accounts (OAuth)
3. Post content

**Contoh — daftar network via API (BYOK):**

```bash
curl -X POST https://api.outstand.so/v1/social-networks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "network": "x",
    "client_key": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET"
  }'
```

Atau lewat dashboard: **Settings → Social Networks** → isi Client ID/Secret.

Catatan: redirect URI di developer portal platform biasanya harus include callback Outstand (contoh LinkedIn: `https://www.outstand.so/app/api/socials/linkedin/callback`) — lihat guide per platform di docs Configurations.

---

### B2) Connect akun sosial end-user (OAuth URL)

Dokumen: [Get social network authentication URL](https://www.outstand.so/docs/get-social-network-authentication-url)

Ini yang dipetakan ke langkah **Connect** di flowchart di atas (UF-05).

**Prasyarat:** network sudah di-configure (B1).

**Endpoint:**

```http
POST /v1/social-networks/{network}/auth-url
```

Body opsional:

- `redirect_uri` — callback ke app kita (white-label / lanjut journey di UI kita)
- `tenant_id` — ID tenant/workspace kita (alphanumeric, `_`, `-`) agar akun bisa difilter per workspace
- `scopes` — override scope default (berguna jika BYOK dengan permission terbatas)

**Contoh — minta auth URL untuk Instagram, tautkan ke workspace:**

```bash
curl -X POST https://api.outstand.so/v1/social-networks/instagram/auth-url \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "redirect_uri": "https://app.example.com/api/integrations/outstand/callback",
    "tenant_id": "ws_abc123"
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "auth_url": "https://www.outstand.so/app/api/socials/instagram/:orgId?state=..."
  }
}
```

**Alur di browser:**

1. Backend kita panggil `auth-url` (dengan API key).
2. Frontend redirect user ke `auth_url`.
3. User login + beri izin di Instagram/X/dll.
4. Outstand redirect ke `redirect_uri` kita (atau default dashboard Outstand jika tidak di-set).
5. App kita selesaikan koneksi → simpan `ConnectedAccount` (lihat `integration-layer.md`: token OAuth **tidak** disimpan di DB kita; Outstand yang pegang token).

**Contoh TypeScript (ilustrasi server):**

```ts
async function getConnectUrl(network: string, workspaceId: string) {
  const res = await fetch(
    `https://api.outstand.so/v1/social-networks/${network}/auth-url`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OUTSTAND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        redirect_uri: `${process.env.APP_URL}/api/integrations/outstand/callback`,
        tenant_id: workspaceId, // map ke workspace kita
      }),
    },
  );
  const json = await res.json();
  return json.data.auth_url as string;
}
```

---

### B3) Platform multi-page (LinkedIn / Facebook, dll.)

Beberapa network butuh langkah ekstra setelah OAuth:

1. Callback membawa `?session=xxx`
2. `GET /v1/social-accounts/pending/{sessionToken}` — daftar page/profile yang bisa dipilih  
   (auth pakai session token path, bukan API key — lihat [pending connection](https://www.outstand.so/docs/get-pending-connection-details))
3. User pilih page
4. `POST /v1/social-accounts/pending/{sessionToken}/finalize` — selesai connect

Ini yang di flowchart sebagai cabang **multi-page**.

---

### Mapping ke langkah di flowchart TEMP

| Langkah user flow                     | Outstand                                                                                                                     |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| (sekali, ops eng) Configure platforms | API key + `POST /v1/social-networks` atau dashboard                                                                          |
| User klik Connect Account             | `POST .../social-networks/{network}/auth-url`                                                                                |
| OAuth di platform                     | User diarahkan ke `auth_url`                                                                                                 |
| Kembali ke app / Active               | Callback + (opsional) pending/finalize → list `GET /v1/social-accounts`                                                      |
| Upload & schedule post                | Endpoint Posts Outstand (setelah akun `Active`) — lewat ACL; `ContentFormat` dipetakan ke override Outstand (Story/Reel/Pin) |

---

_Hapus file ini kapan saja — tidak terhubung ke Project OS / CHANGELOG / ADR._
