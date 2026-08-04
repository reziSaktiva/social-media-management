# AGENTS.md — Social Media Management

Pintu masuk untuk AI coding agent. Baca file ini dulu di setiap sesi kerja pada repo ini.

## Purpose

Dokumen ini **bukan** Source of Truth produk. Ia mengarahkan agent ke dokumen yang benar, menegakkan aturan keras, dan mencegah duplikasi / asumsi yang bertentangan dengan baseline.

**Source of Truth:**

| Area                                | Lokasi                                     |
| ----------------------------------- | ------------------------------------------ |
| Status, phase, milestone, issue     | `project-manager/PROJECT_STATE.md`         |
| Backlog task (release/task/subtask) | `project-manager/TASKS.md` + `tasks/`      |
| Aturan kerja & governance           | `project-manager/PROJECT_RULES.md`         |
| Keputusan (ADR)                     | `project-manager/DECISIONS.md`             |
| Produk & engineering                | `product-discovery/`                       |
| Orientasi arsitektur (ringkas)      | `project-manager/ARCHITECTURE_OVERVIEW.md` |
| Alur kerja developer (mermaid)      | `project-manager/DEVELOPER_WORKFLOW.md`    |
| AI Context (ringkas, per domain)    | `context/`                                 |

## Wajib di awal sesi

1. Baca **Snapshot** di `project-manager/PROJECT_STATE.md` — phase, mode percakapan, fokus terdekat.
2. Kalau akan mengerjakan task: buka `project-manager/TASKS.md` (indeks), lalu **hanya** file `tasks/vXX-*.md` yang memuat task itu. Ikuti field **Baca dulu** pada task tersebut sebagai daftar bacaan minimal.
3. **Evaluasi delegasi subagent** (ADR-063) — kalau task itu scope implementasi kode: cek field **Domain**-nya terhadap pemetaan Domain → Subagent di `.claude/agents/README.md`, dan tentukan dikerjakan sendiri, satu subagent, atau beberapa subagent paralel (lihat poin di bawah kapan wajib paralel). Jangan lewati langkah ini hanya karena sudah biasa mengerjakan sendiri.
4. Ikuti skill project: `.claude/skills/project-os-navigator/SKILL.md`.
5. Untuk keputusan yang belum ada di baseline: ikuti `.claude/skills/proactive-clarification/SKILL.md`.
6. Setelah pekerjaan selesai: ikuti `.claude/skills/work-report-simple/SKILL.md`.
7. Untuk konteks teknis per domain: buka file `context/ctx-*.md` yang relevan (lihat `context/README.md`).

## AI Context layer (`context/`)

Struktur **opsi A** (aktif):

```
context/
├── README.md                  ← batas antar file + cara pakai
├── ctx-project.md             ← Project OS, state, rules, ADR
├── ctx-business.md            ← Business + Product + User
├── ctx-domain.md              ← Bounded context, shared types, boundary
├── ctx-architecture.md        ← Layer, ACL, jobs, auth arch, realtime
├── ctx-technical-context.md   ← Stack, env, Prisma, Better Auth, deploy/CI
├── ctx-development.md         ← DX, script, lint/test, aturan coding
├── ctx-implementation.md      ← Pola implementasi di apps/web & domains/
└── ctx-design.md              ← pointer UX (04-ux) + Claude Design (ADR-045)
```

**Aturan:** file `context/ctx-*.md` adalah **indeks + aturan operasional untuk agent** — menunjuk ke baseline, bukan menyalin ulang isi `product-discovery/` atau `project-manager/`. Jika konflik, baseline + ADR menang.

## Subagent kerja (`.claude/agents/`)

7 subagent kerja (Prabowo Feature Engineer, Mark UI Engineer, Neymar Product
Designer, Elon Backend Engineer, Ridwan Architecture Reviewer, Najwa QA
Engineer, Gibran Project Manager) didefinisikan di `.claude/agents/*.md` —
diklasifikasikan **Static Reference** (`PROJECT_RULES.md`), read-only (chmod
444), hanya diubah atas permintaan eksplisit user. Panduan pemakaian, aturan
orkestrasi paralel/sekuensial, dan pemetaan **Domain → Subagent** ada di
`.claude/agents/README.md`.

**Ini bukan referensi opsional.** Poin #3 di "Wajib di awal sesi" mewajibkan
evaluasi delegasi subagent untuk setiap task implementasi kode — termasuk
menjalankan beberapa subagent **paralel** kalau ada task/subtask independen
yang bisa berjalan bersamaan (ADR-063, ditulis setelah audit menemukan AI
jarang mendelegasikan karena langkah ini sebelumnya tidak terhubung ke
alur kerja manapun).

## Skills (`.claude/skills/`)

**Satu-satunya folder skill di project ini adalah `.claude/skills/<nama>/`.**
Folder `.agents/skills/` sempat ada (Cursor membacanya secara native, dan
juga membaca `.claude/skills/` untuk kompatibilitas) tapi **sudah dihapus**
per keputusan eksplisit King Rezi — supaya tidak ada dua salinan fisik yang
bisa divergen. Claude Code hanya membaca `.claude/skills/`; Cursor tetap bisa
membaca folder yang sama lewat jalur kompatibilitasnya.

**Konsekuensi yang perlu diingat:** jalur kompatibilitas Cursor untuk
`.claude/skills/` didokumentasikan sebagai fallback, bukan mekanisme native
utama — kalau di masa depan pindah/menambah tool AI lain yang hanya comply
ke standar terbuka [Agent Skills](https://agentskills.io) (lokasi native:
`.agents/skills/`) tanpa special-case Claude, skill di sini berisiko tidak
otomatis terbaca. Evaluasi ulang keputusan ini kalau situasi itu terjadi.

Aturan untuk mencegah duplikasi/divergensi terulang:

1. **Jangan buat ulang folder `.agents/skills/`** kecuali ada keputusan baru
   yang eksplisit dari King Rezi untuk kembali memakainya.
2. Skill vendor/third-party (Prisma, Supabase, Vercel, Better Auth, dst.)
   biasanya dipasang lewat installer resmi (`npx skills add ...`) yang
   **defaultnya menulis ke `.agents/skills/`** — kalau itu terjadi lagi,
   pindahkan manual hasilnya ke `.claude/skills/<nama>` (bukan dibiarkan
   berdampingan dengan folder lain), lalu hapus folder `.agents/skills/`
   yang baru terbentuk itu.
3. Edit/tambah skill custom project langsung di `.claude/skills/<nama>/`.

## Kompatibilitas tool: Claude Code ↔ Cursor (ADR-064)

Project ini dikerjakan di **dua tool**: Claude Code (utama) dan Cursor.
Sebagian aset agent terbaca di keduanya, sebagian tidak — tabel ini menetapkan
statusnya supaya tidak ada asumsi salah:

| Aset                                   | Claude Code                                     | Cursor                                            |
| -------------------------------------- | ----------------------------------------------- | ------------------------------------------------- |
| `AGENTS.md` (pintu masuk + hard rules) | ✅ via `CLAUDE.md`                              | ✅ native                                         |
| `.claude/skills/` (18 skill)           | ✅ satu-satunya lokasi                          | ✅ compatibility path                             |
| `.claude/agents/` (7 subagent kerja)   | ✅                                              | ✅ compatibility path                             |
| Config MCP (`xds` Astryx)              | ✅ `.mcp.json`                                  | ⚠️ `.cursor/mcp.json` — **file terpisah**         |
| Proteksi baca secret                   | ✅ `.claude/settings.json` (`permissions.deny`) | ⚠️ `.cursorignore` — **file terpisah**            |
| `.claude/launch.json` (preview server) | ✅                                              | ❌ tidak ada padanan — jalankan dev server manual |

**Dua pasang file kembar yang WAJIB dijaga sinkron.** Config MCP dan proteksi
secret tidak punya jalur kompatibilitas lintas tool — masing-masing tool hanya
membaca formatnya sendiri, dan tidak bisa disatukan lewat symlink tanpa
mengulang pola rapuh yang dibuang di ADR-064. Konsekuensinya:

1. Menambah/mengubah MCP server → ubah **`.mcp.json` dan `.cursor/mcp.json`**
   dalam perubahan yang sama. Formatnya identik (kunci `mcpServers`).
2. Menambah/mengubah pola file rahasia → ubah **`permissions.deny` di
   `.claude/settings.json` dan `.cursorignore`** dalam perubahan yang sama.
   Kalau hanya satu yang diubah, salah satu tool kehilangan proteksinya
   tanpa peringatan apa pun.

Aturan lain (skill, subagent, hard rules, alur dokumentasi) berlaku identik di
kedua tool — tidak ada instruksi khusus per-tool selain tabel di atas.

## Stack & layout (ingat cepat)

- Runtime: **Bun** · App: **Next.js** (`apps/web`) · Shared: `packages/shared`
- Auth: **Better Auth** · ORM: **Prisma 7** · DB/Storage/Realtime: **Supabase**
- Integrasi sosial: **Outstand** (via Anti-Corruption Layer), bukan SDK network langsung
- Arsitektur: **Modular Monolith + DDD** · domain di `apps/web/src/domains/`
- UI: **Astryx** (ADR-041) · neutral theme selama M8 · **Tailwind layout-only**
- Deploy: **Railway** (web + cron) · CI: **GitHub Actions**

Detail: `project-manager/PROJECT_OVERVIEW.md` dan `product-discovery/06-engineering/`.

## Aturan keras (jangan dilanggar)

1. Panggil user dengan sebutan **King Rezi** di seluruh komunikasi/output
   teks — bukan "user", "Anda", atau nama lain. Berlaku untuk AI utama dan
   seluruh subagent di `.claude/agents/`.
2. Biasakan menggunakan **"5 Magic Words"** dalam komunikasi/output teks:
   tolong (please), maaf (sorry), terima kasih (thank you), permisi (excuse
   me), dan silakan (please/go ahead). Berlaku untuk AI utama dan seluruh
   subagent di `.claude/agents/`.
3. Nama AI utama (main agent) di project ini adalah **"Jokowi"**. Setiap kali
   dipanggil dengan nama tersebut, sediakan laporan singkat berisi:
   (a) 3 pekerjaan terakhir yang sudah dikerjakan,
   (b) seluruh task yang masih belum dikerjakan (Next Tasks / In Progress),
   (c) pembahasan penting sebelumnya yang relevan,
   dan jika ada, tutup dengan rekomendasi langkah berikutnya untuk diajukan
   ke King Rezi.
4. Jangan ubah Architecture / Engineering / Product / Business baseline tanpa ADR baru di `DECISIONS.md`.
5. Entry points (RSC, Server Actions, Route Handlers, Middleware) **tidak** boleh berisi business logic — hanya memanggil Application Service.
6. Domain logic **tidak** mengimpor Prisma, Supabase client, atau HTTP client Outstand.
7. Cross-domain: lewat public API module domain lain — bukan import implementasi lintas folder.
8. Shared types hanya di `packages/shared` (ID, enum, value object) — tanpa business logic.
9. Supabase JS client: **hanya** Realtime + Storage. CRUD lewat Prisma.
10. Status progress (% / ✅ / phase aktif / milestone) **hanya** di
    `PROJECT_STATE.md` — jangan taruh di README atau baseline. **Satu
    pengecualian (ADR-062):** status per-task dan per-subtask ada di
    `project-manager/TASKS.md` + `tasks/vXX-*.md`. Pengecualian ini tidak
    meluas ke phase/milestone/overall progress.
11. Persona kanonikal: Raka, Maya, Sinta, Dimas, Lara.
12. Bahasa komunikasi & dokumentasi project: **Bahasa Indonesia** (kecuali user meminta lain).
13. Jangan commit / push kecuali user meminta eksplisit. Jangan commit secret (`.env.local`, kredensial).
14. UI produk hanya memakai Astryx. Wrapper dibuat selektif; jangan memakai
    canary atau `swizzle` Astryx pada tahap awal (ADR-041).
15. Sebelum menulis atau mengubah UI Astryx, baca `apps/web/.claude/CLAUDE.md`
    (agent docs resmi, lihat bawah) dan/atau jalankan CLI lokal yang versinya
    terkunci. Jangan menebak nama komponen, props, atau pola styling.
16. Sebelum mengubah apapun di Claude Design (via `DesignSync`) atau
    menambah kontrol pembanding (toggle/switch antar variant) di UI manapun,
    baca `.claude/skills/claude-design-scope-discipline/SKILL.md`. Jangan
    mengubah default/state yang sudah disetujui user sebagai efek samping
    fitur baru — insiden nyata di ADR-052.

## Workflow Astryx wajib

Agent docs resmi Astryx ada di `apps/web/.claude/CLAUDE.md` — **auto-generated**
oleh CLI resmi (`bunx astryx init --features agents --agent claude`, dijalankan
dari `apps/web`), bukan tulisan manual. Isinya: workflow discovery
(`astryx build` → `astryx template` → `astryx component`), aturan styling/token,
dan CLI reference — semua ditarik dari `@astryxdesign/cli` v0.1.8 yang ter-pin
di proyek ini.

Untuk setiap task UI di `apps/web`: baca `apps/web/.claude/CLAUDE.md` dulu,
lalu jalankan command CLI yang disebut di sana lewat
`bun run --cwd apps/web astryx -- <cmd>`.

**Setelah upgrade `@astryxdesign/core`/`cli`:** jalankan ulang
`bunx astryx init --features agents --agent claude` di `apps/web` untuk
regenerate file ini in-place (jangan edit manual — akan tertimpa saat
regenerate berikutnya).

**MCP server (`xds`, dikonfigurasi di `.mcp.json` untuk Claude Code **dan**
`.cursor/mcp.json` untuk Cursor — dua file kembar, jaga sinkron, lihat
"Kompatibilitas tool"):** tersedia untuk
pencarian cepat (`search`) dan lookup dokumentasi (`get`) tanpa shell out ke
CLI. Server ini menunjuk ke versi live `astryx.atmeta.com`, **bisa berbeda**
dari `@astryxdesign/cli` v0.1.8 yang ter-pin di `apps/web` (Astryx masih
Beta). Untuk exploration/pencarian awal, MCP boleh dipakai; untuk keputusan
final props/API yang dipakai di kode, tetap verifikasi lewat CLI lokal
(`astryx component <Name> --dense`) supaya konsisten dengan versi yang
benar-benar ter-install.

## Mode kerja

Lihat `Active Conversation Mode` di `PROJECT_STATE.md` untuk fase, objective,
action yang diizinkan, dan pembatasan terkini. Jangan menduplikasi status atau
fase aktif di file ini.

## Mapping task → baca dulu

| Jenis task                   | Context dulu                                 | Baseline minimal                                                                  |
| ---------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------- |
| Fitur / use-case             | `ctx-domain` + `ctx-implementation`          | BC di `05-architecture/` + UX di `04-ux/` (+ `ctx-business` untuk roles/MVP)      |
| Schema / migrasi             | `ctx-architecture` + `ctx-technical-context` | `database-strategy.md` + `database-orm.md` + `apps/web/prisma/schema.prisma`      |
| Auth / session               | `ctx-architecture` + `ctx-technical-context` | `auth-architecture.md` + `auth-strategy.md`                                       |
| Outstand / webhook / publish | `ctx-architecture`                           | `integration-layer.md`                                                            |
| Jobs / cron                  | `ctx-architecture`                           | `background-jobs.md`                                                              |
| Env / deploy / CI            | `ctx-technical-context`                      | `environment-management.md`, `deployment-infrastructure.md`, `cicd-pipeline.md`   |
| Coding conventions / DX      | `ctx-development`                            | `dx-tooling.md`                                                                   |
| UI component / styling       | `ctx-design` + `ctx-implementation`          | `apps/web/.claude/CLAUDE.md` + `monorepo-setup.md` + `design-tokens.md` + ADR-041 |
| Desain / handoff UI          | `ctx-design`                                 | `04-ux/` + pointer Claude Design (folder `design/` dihapus, ADR-045)              |

## Setelah mengubah sesuatu

- Update status task di `project-manager/TASKS.md` **dan** file
  `project-manager/tasks/vXX-*.md` terkait (dua-duanya, dalam perubahan yang
  sama — kalau tidak, hitungan di indeks jadi salah).
- Update `project-manager/PROJECT_STATE.md` bila phase / milestone / Known
  Issues / fokus terdekat berubah. Jangan menyalin detail task ke sana.
- Catat di `project-manager/COMPLETE_TASK.md` (append entri baru saja — jangan baca isi lengkapnya kecuali diperintah eksplisit King Rezi).
- Insight diskusi penting → `project-manager/CONVERSATIONS.md`.
- Keputusan material → ADR di `project-manager/DECISIONS.md`.

## Related

- Root setup: `README.md`
- Skills: `.claude/skills/`
- AI Context index: `context/README.md`
- Alur kerja developer (mermaid): `project-manager/DEVELOPER_WORKFLOW.md`
