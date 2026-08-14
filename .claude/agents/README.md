# Subagent — Social Media Management

Panduan penggunaan 7 subagent kerja untuk project ini.

File peran (semua `*.md` di folder ini **kecuali dokumen ini sendiri**)
diklasifikasikan **Static Reference** (`project-manager/PROJECT_RULES.md`) —
read-only (chmod 444) dan **hanya boleh diubah atas permintaan eksplisit
user**, bukan inisiatif AI, karena scope dan batasannya sudah disepakati
langsung dengan user. Perubahan struktural wajib dicatat di
`../../project-manager/COMPLETE_TASK.md`.

---

## Daftar subagent

| File                              | Nama                         | Peran                                                                                   | Tools dibatasi?                                    |
| --------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `prabowo-feature-engineer.md`     | Prabowo Feature Engineer     | Implementasi fitur (entry → service → domain → repo)                                    | Tidak (semua tools)                                |
| `mark-ui-engineer.md`             | Mark UI Engineer             | UI/komponen Astryx di `apps/web`                                                        | Tidak                                              |
| `neymar-product-designer.md`      | Neymar Product Designer      | Claude Design via `DesignSync`                                                          | Tidak                                              |
| `elon-backend-engineer.md`        | Elon Backend Engineer        | Outstand ACL, webhook, background jobs, schema Prisma                                   | Tidak                                              |
| `ridwan-architecture-reviewer.md` | Ridwan Architecture Reviewer | Review kepatuhan boundary DDD, read-only                                                | Ya — `Read, Bash, Grep, Glob, ReportFindings`      |
| `najwa-qa-engineer.md`            | Najwa QA Engineer            | Vitest + verifikasi browser end-to-end                                                  | Ya — `Read, Bash, Grep, Glob, mcp__Claude_Browser` |
| `gibran-project-manager.md`       | Gibran Project Manager       | Update `PROJECT_STATE.md` / `TASKS.md` / `tasks/` / `DECISIONS.md` / `COMPLETE_TASK.md` | Ya — `Read, Edit, Write, Bash, Grep, Glob`         |

---

## Cara AI memerintahkan subagent

AI (Claude Code) mendelegasikan lewat `Agent` tool dengan `subagent_type` =
nama file tanpa `.md` (mis. `subagent_type: "elon-backend-engineer"`). User
tidak perlu memanggil subagent secara langsung — cukup beri task, AI yang
memilih subagent yang cocok berdasarkan `description` di frontmatter
masing-masing file. User juga bisa memaksa subagent tertentu secara eksplisit
("pakai Ridwan Architecture Reviewer untuk cek ini").

**Penentuan subagent adalah tugas AI, bukan pertanyaan ke user.** Jangan
pakai `AskUserQuestion` untuk menanyakan "task ini dikerjakan siapa" —
pemetaan Domain → Subagent di bawah sudah cukup untuk memutuskan sendiri.
Reservasi `AskUserQuestion` untuk keputusan scope/produk (apa yang dibangun),
bukan keputusan delegasi (siapa yang membangun).

## Keterbatasan teknis: `DesignSync` di sesi subagent

Tool `DesignSync` (akses Claude Design) tercatat gagal dimuat dua kali di
sesi `neymar-product-designer` (Channels sidebar ADR-058, dan fix
TikTok/Pinterest + Content Format Selector — keduanya 2026-07-31), padahal
tool yang sama berhasil di sesi utama pada waktu yang berdekatan. Sampai ada
bukti sebaliknya (`DesignSync` berhasil dimuat di sesi subagent), jangan
delegasikan kerja Claude Design ke `neymar-product-designer` sebagai langkah
pertama — minta izin eksplisit user untuk mengerjakannya langsung di sesi
utama, verifikasi `DesignSync` termuat, baru lanjut. Kalau di masa depan
`DesignSync` terbukti berhasil di sesi subagent, update catatan ini alih-alih
mengasumsikan keterbatasan ini berlaku selamanya.

---

## Aturan orkestrasi (paralel vs sekuensial)

- **Boleh paralel** (beda file/domain, tidak saling menyentuh): Prabowo, Mark,
  Neymar, Elon — bisa dijalankan bersamaan dalam satu giliran `Agent` tool
  selama task-nya independen (mis. Elon kerjakan `OutstandAdapter` bersamaan
  Mark kerjakan tombol Publish Now).
- **Wajib sekuensial, setelah implementasi selesai:**
  1. **Ridwan** (review arsitektur) — jalan setelah agent implementasi
     selesai, sebelum QA.
  2. **Najwa** (QA/testing) — jalan setelah Ridwan (atau langsung setelah
     implementasi kalau review tidak diminta).
  3. **Gibran** (governance/docs) — **selalu paling akhir, sendirian**.
     Jangan dijalankan bersamaan dengan agent lain yang berpotensi menyentuh
     `PROJECT_STATE.md` / `TASKS.md` / `tasks/` / `DECISIONS.md` /
     `COMPLETE_TASK.md`, untuk mencegah konflik/duplikasi status.
- Kalau beberapa agent implementasi mengubah file yang berpotensi tumpang
  tindih, gunakan opsi `isolation: "worktree"` per agent supaya tidak saling
  menimpa.

---

## Kapan WAJIB dievaluasi (bukan opsional)

Ini bukan sekadar referensi pasif — `AGENTS.md` ("Wajib di awal sesi") dan
`.claude/skills/project-os-navigator/SKILL.md` (behavior "Pekerjaan Baru")
mewajibkan AI berhenti di titik ini **sebelum** mulai implementasi kode:

1. Task punya field **Domain** (di `tasks/vXX-*.md`) yang scope-nya
   implementasi kode (bukan diskusi/dokumentasi murni)? → cek tabel
   pemetaan di bawah.
2. Ada **lebih dari satu task/subtask independen** (domain atau file
   berbeda, tidak saling menyentuh) yang bisa dikerjakan bersamaan? → jalankan
   subagent yang relevan secara paralel (lihat "Aturan orkestrasi" di atas)
   alih-alih mengerjakannya sendiri satu per satu secara sekuensial.
3. Kalau task match salah satu subagent dan tidak ada alasan kuat untuk
   dikerjakan sendiri (mis. scope sangat kecil, 1-2 baris, atau murni
   dokumentasi) → delegasikan lewat `Agent`/`Task` tool.

## Pemetaan Domain → Subagent

Field **Domain** tiap task di `tasks/vXX-*.md` bisa langsung dipetakan ke
subagent implementasi berikut sebagai titik awal (bukan aturan kaku — cek
juga `description` di frontmatter masing-masing file peran untuk keputusan
akhir):

| Domain (field task)                    | Subagent utama              | Catatan                                                                         |
| -------------------------------------- | --------------------------- | ------------------------------------------------------------------------------- |
| `identity`                             | Prabowo Feature Engineer    | Auth flows, session, konfigurasi Better Auth                                    |
| `workspace`                            | Prabowo Feature Engineer    | Workspace, member, roles                                                        |
| `publishing`                           | Prabowo Feature Engineer    | Draft, Schedule, Queue, Publish Now                                             |
| `analytics`                            | Prabowo Feature Engineer    | Dashboard/metrics — logic; UI-nya lihat baris `UI`                              |
| `integration`, `media`, `notification` | Elon Backend Engineer       | Outstand ACL, webhook, background jobs                                          |
| `UI`                                   | Mark UI Engineer            | Komponen Astryx, styling, layout                                                |
| `platform`, `DX`                       | — (biasanya tanpa subagent) | Tooling/config internal (CI, monorepo) — sering lebih cepat dikerjakan langsung |

Domain gabungan (mis. `workspace · UI`) berarti **dua subagent bisa paralel**
dalam satu giliran — satu untuk logic domain (Prabowo/Elon), satu untuk UI
(Mark) — selama file yang disentuh tidak tumpang tindih (lihat "Aturan
orkestrasi" di atas untuk kapan perlu `isolation: "worktree"`).

---

## Mengubah subagent ini

File peran (`*.md` selain dokumen ini) di-chmod read-only (444) sebagai
pengaman teknis. Untuk mengubah (menambah peran baru, memperbaiki scope yang
keliru, dst.):

1. Konfirmasi eksplisit dari user dulu — jangan inisiatif sendiri.
2. `chmod 644 <file>.md`, edit, lalu `chmod 444 <file>.md` lagi.
3. Catat perubahan di `../../project-manager/COMPLETE_TASK.md`.

---

## Related

- Entry point agent: `../../AGENTS.md`
- Governance dokumen: `../../project-manager/PROJECT_RULES.md` (klasifikasi
  Static Reference)
