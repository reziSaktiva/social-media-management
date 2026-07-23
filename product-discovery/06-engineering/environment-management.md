# Environment Management

Dokumen ini mendefinisikan **katalog environment variables, strategi secret management, dan konfigurasi per tier** (local, staging, production) untuk produk Social Media Management.

Dokumen ini menkonkretkan konsekuensi isolasi kredensial dari `deployment-infrastructure.md` (DI-D03, ADR-029) dan kebijakan secret CI dari `cicd-pipeline.md` (CI-D06). Hosting database MVP tetap **Supabase Cloud**; jalur migrasi ke self-host dicatat sebagai rencana pasca-stabilisasi skema, bukan bagian bootstrap M7.

---

# Tujuan

* Menetapkan sumber kebenaran penamaan env var untuk seluruh aplikasi.
* Memisahkan secret per environment (local / staging / production) tanpa berbagi kredensial.
* Mendefinisikan cara developer menjalankan app lokal terhadap Supabase Cloud.
* Menetapkan di mana secret disimpan (Railway, Supabase dashboard, `.env.local`) dan apa yang boleh masuk Git.
* Mencatat rencana cloud → self-host tanpa mengunci tooling self-host sekarang.

---

# Keputusan yang Sudah Terkunci (dari Baseline)

| Topik | Keputusan | Sumber |
|-------|-----------|--------|
| Topology deploy | Production + Staging (Railway) | ADR-029, DI-D02 |
| Supabase project | Terpisah per environment deploy | ADR-029, DI-D03 |
| Secret di PR CI | Tidak wajib / tidak menyimpan secret produksi | CI-D06, ADR-032 |
| DB runtime URLs | `DATABASE_URL` (pooled) + `DIRECT_URL` (migrate) | DO-D04, ADR-031 |
| Auth URLs & OAuth | `BETTER_AUTH_*`, Google OAuth terpisah per env | AS-D05, ADR-030 |

---

# Keputusan Environment Management (Ditetapkan di Dokumen Ini)

| ID | Topik | Keputusan |
|----|-------|-----------|
| EM-D01 | Platform DB MVP | **Supabase Cloud** untuk local, staging, dan production. Self-host ditunda sampai skema & operasi cloud stabil (lihat bagian Cloud → Self-host). |
| EM-D02 | Local database | Project Supabase Cloud terpisah: **`social-media-local`**. App Next.js jalan di mesin developer; data tidak memakai staging/prod. |
| EM-D03 | Secret management | **Native only** — Railway Variables (staging/prod), Supabase dashboard (kredensial project), `.env.local` (local, gitignored). Tanpa Doppler/Infisical/Vault di MVP. |
| EM-D04 | File env di repo | Lokasi: `apps/web/`. Commit `.env.example` (placeholder, tanpa secret). Jangan commit `.env`, `.env.local`, `.env.*.local`. |
| EM-D05 | Validasi env | Fail-fast di server startup untuk required server vars; client hanya boleh membaca `NEXT_PUBLIC_*`. |
| EM-D06 | Isolasi kredensial | Satu set secret per tier; **dilarang** menyalin secret production ke local/staging atau sebaliknya. |

---

# Environment Tiers

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│ Local           │     │ Staging          │     │ Production        │
│ Next.js @ :3000 │     │ Railway staging  │     │ Railway production│
│ .env.local      │     │ Railway Variables│     │ Railway Variables │
└────────┬────────┘     └────────┬─────────┘     └─────────┬─────────┘
         │                       │                         │
         ▼                       ▼                         ▼
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│ social-media-   │     │ social-media-    │     │ social-media-prod │
│ local (Cloud)   │     │ staging (Cloud)  │     │ (Cloud)           │
└─────────────────┘     └──────────────────┘     └───────────────────┘
```

| Tier | Compute | Supabase project | Sumber env |
|------|---------|------------------|------------|
| Local | `bun run dev` di laptop | `social-media-local` | `.env.local` |
| Staging | Railway env `staging` (`web` + `cron`) | `social-media-staging` | Railway Variables |
| Production | Railway env `production` (`web` + `cron`) | `social-media-prod` | Railway Variables |

**Aturan:**
- Local **bukan** alias staging — eksperimen migrate/seed tidak boleh merusak data pra-rilis.
- Preview environment per-PR tetap tidak dipakai (ADR-029).
- Region project Supabase mengikuti Singapore/SEA (ADR-028) untuk ketiga project Cloud.

---

# Secret Management (EM-D03)

| Lokasi | Isi | Siapa yang mengisi |
|--------|-----|-------------------|
| Supabase dashboard (per project) | URL, anon key, service role, JWT secret, connection strings | Developer saat membuat project |
| Railway Variables (per environment + per service jika perlu) | Seluruh runtime + migrate secrets untuk staging/prod | Developer saat setup Railway |
| `.env.local` (mesin developer) | Salinan kredensial **hanya** project `social-media-local` + OAuth/dev secrets | Developer; tidak di-commit |
| GitHub Actions | Tidak menyimpan secret app/DB untuk MVP PR gates | — (CI-D06) |
| Git | Hanya `.env.example` | Repo |

**Praktik:**
- Rotasi secret dilakukan per environment (mis. rotate `BETTER_AUTH_SECRET` staging tanpa menyentuh production).
- Setelah rotate, redeploy Railway environment terkait agar proses memuat nilai baru.
- Jangan paste secret ke chat, issue, atau dokumen project.

---

# File Strategy (EM-D04)

| File | Di Git? | Peran |
|------|---------|-------|
| `.env.example` | Ya | Template nama var + komentar; nilai dummy / kosong |
| `.env.local` | Tidak | Local override untuk Next.js / Bun |
| `.env` | Tidak | Hindari; prefer `.env.local` agar tidak bentrok dengan convention Next |
| Railway / Supabase UI | N/A | Sumber kebenaran staging & production |

Lokasi file di monorepo (ditetapkan M7): **`apps/web/`** — `.env.example` (di Git) dan `.env.local` (gitignored) hidup di samping app Next.js agar env dimuat secara native tanpa wiring ekstra dari root. `.env.example` harus mencerminkan lokasi yang sama.

---

# Katalog Environment Variables

## Server (wajib di runtime web)

| Variable | Local | Staging | Production | Keterangan |
|----------|-------|---------|------------|------------|
| `DATABASE_URL` | local pooled | staging pooled | prod pooled | Supavisor transaction mode — Prisma runtime, Better Auth |
| `DIRECT_URL` | local direct | staging direct | prod direct | Session/direct — `prisma migrate` |
| `SUPABASE_URL` | local project URL | staging URL | prod URL | Platform API (Realtime, Storage) |
| `SUPABASE_SERVICE_ROLE_KEY` | local | staging | prod | **Server only** — jangan expose ke browser |
| `SUPABASE_JWT_SECRET` | local JWT secret | staging | prod | Sign JWT Supabase-compatible (AS-D03) |
| `BETTER_AUTH_SECRET` | unik local | unik staging | unik prod | Min. entropy tinggi; generate terpisah |
| `BETTER_AUTH_URL` | `http://localhost:3000` | `https://staging.<domain>` | `https://<production-domain>` | Base URL Better Auth + OAuth callback |
| `GOOGLE_CLIENT_ID` | OAuth client local/dev | OAuth staging | OAuth prod | Client terpisah atau redirect URI terpisah per env (AS-D05) |
| `GOOGLE_CLIENT_SECRET` | local/dev | staging | prod | Pasangan client di atas |
| `OUTSTAND_API_KEY` | sandbox/local key | staging key | prod key | Integrasi Outstand |
| `OUTSTAND_WEBHOOK_SECRET` | local | staging | prod | Verifikasi HMAC webhook |
| `JOB_SECRET` | local | staging | prod | Header `X-Job-Secret` untuk trigger cron → web |

**Tidak ada env var X/Twitter Client ID atau Client Secret.** BYOK X dikonfigurasi Project Owner langsung di dashboard Outstand per environment. Secret tersebut tidak disalin ke `.env.local`, Railway Variables, GitHub Actions, database, atau aplikasi.

## Client (boleh di-bundle)

| Variable | Keterangan |
|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project — sama nilai dengan `SUPABASE_URL` tier terkait; dipakai browser client Realtime/Storage bila diperlukan |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key — **bukan** service role; dilindungi RLS |

Hanya prefix `NEXT_PUBLIC_` yang boleh dibaca di Client Components. Service role, DB URLs, auth secrets, Outstand secrets, dan `JOB_SECRET` **wajib** server-only.

## Opsional / deferred

| Variable | Status |
|----------|--------|
| Provider email transactional (`RESEND_API_KEY`, dll.) | Belum ditetapkan (AS-D04) — ditambahkan ke katalog saat provider dipilih |
| `NODE_ENV` | Diatur runtime (`development` / `production`) — tidak perlu diisi manual di Railway kecuali override khusus |

---

# Perbedaan Konfigurasi per Tier

| Aspek | Local | Staging | Production |
|-------|-------|---------|------------|
| HTTPS | HTTP `localhost` | HTTPS Railway | HTTPS Railway |
| Cookie `Secure` | `false` (HTTP) | `true` | `true` |
| `BETTER_AUTH_URL` | `http://localhost:3000` | URL staging publik | URL production |
| Google redirect | `http://localhost:3000/api/auth/callback/google` | staging callback | production callback |
| Migrate | `prisma migrate dev` → `social-media-local` | `prisma migrate deploy` di Railway release | sama, project prod |
| Seed / reset | Diizinkan pada local | Hati-hati; jangan reset sembarangan | Dilarang reset |
| Cron (`JOB_SECRET`) | Boleh panggil manual / script | Railway Cron → `web` | Railway Cron → `web` |

Implementasi cookie local vs HTTPS harus selaras `auth-strategy.md` — staging/production memakai `useSecureCookies: true`; local memakai konfigurasi non-secure untuk HTTP.

---

# Alur Setup Local (Acuan M7)

1. Buat project Supabase Cloud `social-media-local` (region Singapore/SEA).
2. Salin connection strings, URL, anon key, service role, JWT secret ke `.env.local`.
3. Salin `.env.example` → `.env.local`, isi semua required vars.
4. Buat OAuth Google client (atau tambahkan redirect URI local) mengarah ke `http://localhost:3000/api/auth/callback/google`.
5. `bun install` → `bunx prisma migrate dev` (memakai `DIRECT_URL` local).
6. `bun run dev` — verifikasi auth, Realtime (anon + JWT), dan Storage dasar.
7. Konfigurasikan X BYOK di dashboard Outstand untuk akun/environment test bila alur Twitter/X akan diverifikasi; jangan menyalin secret X ke file env aplikasi.

Developer **tidak** mengarah `DATABASE_URL` local ke staging/prod.

---

# Validasi Env (EM-D05)

Pada bootstrap server (`apps/web`):

* Validasi keberadaan required server vars saat proses start (fail-fast dengan pesan jelas).
* Jangan silent-fallback ke string kosong untuk secret.
* CI PR **tidak** membutuhkan nilai secret nyata — gates typecheck/lint/test/validate boleh memakai env dummy hanya jika suatu test benar-benar membacanya; prefer mock di unit test (lihat `dx-tooling.md`).

---

# Cloud → Self-host (Rencana, Bukan MVP)

| Fase | Platform | Catatan |
|------|----------|---------|
| MVP / M7–M9 | Supabase Cloud (`local`, `staging`, `prod`) | Fokus stabilkan skema Prisma, RLS, Realtime, Storage |
| Pasca skema stabil | Evaluasi self-host Supabase (atau Postgres + komponen setara) | Butuh ADR baru: hosting, backup, upgrade, secrets, region |

**Prinsip migrasi kelak:**
- Aplikasi hanya bergantung pada Postgres + API yang kompatibel (Prisma `DATABASE_URL`/`DIRECT_URL`, Supabase client untuk Realtime/Storage, JWT secret untuk Realtime).
- Self-host **tidak** mengubah katalog nama env var secara masif — yang berubah terutama *nilai* URL/keys dan operasional infra.
- Jangan mulai self-host sebelum migrate path, RLS, dan backup cloud terbukti lancar.

Keputusan self-host di masa depan wajib ADR di `DECISIONS.md`; dokumen ini hanya mengunci **cloud-first**.

---

# Decision Log

| ID | Keputusan | Alasan | Alternatif |
|----|-----------|--------|-----------|
| EM-D01 | Supabase Cloud untuk semua tier MVP; self-host ditunda | Kurangi beban ops awal; skema bisa distabilkan dulu | Self-host sejak hari pertama (ops berat); campur cloud/self-host per tier (kompleks) |
| EM-D02 | Project Cloud terpisah `social-media-local` | Isolasi eksperimen dari staging/prod; tetap cloud-first | Pakai staging sebagai local (risiko data); Supabase CLI Docker (ops lokal lebih berat untuk fase ini) |
| EM-D03 | Secret native (Railway + Supabase + `.env.local`) | Cukup untuk solo MVP; zero tooling ekstra | Doppler/Infisical (nilai tambah belakangan jika kolaborator bertambah) |
| EM-D04 | `.env.example` + `.env.local` di `apps/web/`; secret file di-gitignore | Next.js memuat env dari app dir secara native; template onboarding tanpa membocorkan secret | Env di root monorepo (butuh wiring ekstra); commit `.env` terenkripsi (overhead); tanpa example (onboarding buram) |
| EM-D05 | Fail-fast validasi required server env | Gagal cepat lebih baik daripada runtime error samar | Optional env dengan default berbahaya |
| EM-D06 | Larangan berbagi secret lintas tier | Konsekuensi langsung DI-D03 / isolasi kredensial | Satu key dipakai semua env (blast radius besar) |
| EM-D07 | Tidak ada X client credential di env aplikasi | BYOK X dikelola manual di dashboard Outstand; mengurangi exposure secret |
| EM-D08 | ADR-040 | EM-D07 mengamandemen katalog/prasyarat integrasi Engineering Baseline |

---

# Related Documents

* `README.md` — scope dan workflow Engineering Planning
* `deployment-infrastructure.md` — topology Railway/Supabase, ringkasan secrets
* `auth-strategy.md` — `BETTER_AUTH_*`, OAuth, JWT Supabase-compatible
* `database-orm.md` — `DATABASE_URL` / `DIRECT_URL`, migrate
* `cicd-pipeline.md` — CI-D06, Railway memegang secret deploy
* `dx-tooling.md` — script local `dev`, `db:*`, test tanpa secret prod
* `../05-architecture/database-strategy.md` — platform data, RLS
* `../../project-manager/DECISIONS.md` — ADR-029, ADR-032, ADR-033
