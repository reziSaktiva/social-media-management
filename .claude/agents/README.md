# Subagent — Social Media Management

Panduan penggunaan 7 subagent kerja untuk project ini.

File peran (semua `*.md` di folder ini **kecuali dokumen ini sendiri**)
diklasifikasikan **Static Reference** (`project-manager/PROJECT_RULES.md`) —
read-only (chmod 444) dan **hanya boleh diubah atas permintaan eksplisit
user**, bukan inisiatif AI, karena scope dan batasannya sudah disepakati
langsung dengan user. Perubahan struktural wajib dicatat di
`../../project-manager/CHANGELOG.md`.

---

## Daftar subagent

| File                              | Nama                         | Peran                                                       | Tools dibatasi?                                    |
| --------------------------------- | ---------------------------- | ----------------------------------------------------------- | -------------------------------------------------- |
| `prabowo-feature-engineer.md`     | Prabowo Feature Engineer     | Implementasi fitur (entry → service → domain → repo)        | Tidak (semua tools)                                |
| `mark-ui-engineer.md`             | Mark UI Engineer             | UI/komponen Astryx di `apps/web`                            | Tidak                                              |
| `neymar-product-designer.md`      | Neymar Product Designer      | Claude Design via `DesignSync`                              | Tidak                                              |
| `elon-backend-engineer.md`        | Elon Backend Engineer        | Outstand ACL, webhook, background jobs, schema Prisma       | Tidak                                              |
| `ridwan-architecture-reviewer.md` | Ridwan Architecture Reviewer | Review kepatuhan boundary DDD, read-only                    | Ya — `Read, Bash, Grep, Glob, ReportFindings`      |
| `najwa-qa-engineer.md`            | Najwa QA Engineer            | Vitest + verifikasi browser end-to-end                      | Ya — `Read, Bash, Grep, Glob, mcp__Claude_Browser` |
| `gibran-project-manager.md`       | Gibran Project Manager       | Update `PROJECT_STATE.md` / `DECISIONS.md` / `CHANGELOG.md` | Ya — `Read, Edit, Write, Bash, Grep, Glob`         |

---

## Cara AI memerintahkan subagent

AI (Claude Code) mendelegasikan lewat `Agent` tool dengan `subagent_type` =
nama file tanpa `.md` (mis. `subagent_type: "elon-backend-engineer"`). User
tidak perlu memanggil subagent secara langsung — cukup beri task, AI yang
memilih subagent yang cocok berdasarkan `description` di frontmatter
masing-masing file. User juga bisa memaksa subagent tertentu secara eksplisit
("pakai Ridwan Architecture Reviewer untuk cek ini").

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
     `PROJECT_STATE.md` / `DECISIONS.md` / `CHANGELOG.md`, untuk mencegah
     konflik/duplikasi status.
- Kalau beberapa agent implementasi mengubah file yang berpotensi tumpang
  tindih, gunakan opsi `isolation: "worktree"` per agent supaya tidak saling
  menimpa.

---

## Mengubah subagent ini

File peran (`*.md` selain dokumen ini) di-chmod read-only (444) sebagai
pengaman teknis. Untuk mengubah (menambah peran baru, memperbaiki scope yang
keliru, dst.):

1. Konfirmasi eksplisit dari user dulu — jangan inisiatif sendiri.
2. `chmod 644 <file>.md`, edit, lalu `chmod 444 <file>.md` lagi.
3. Catat perubahan di `../../project-manager/CHANGELOG.md`.

---

## Related

- Entry point agent: `../../AGENTS.md`
- Governance dokumen: `../../project-manager/PROJECT_RULES.md` (klasifikasi
  Static Reference)
