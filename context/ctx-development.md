# Context — Development

Indeks **Developer Experience**, perintah lokal/CI, dan **aturan coding / konvensi**.  
Pola “fitur ditaruh di mana / alur call” → `ctx-implementation.md`.  
Stack & env → `ctx-technical-context.md`.

---

## Baca dulu

| Dokumen                                                                                                  | Topik                                                |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [`../product-discovery/06-engineering/dx-tooling.md`](../product-discovery/06-engineering/dx-tooling.md) | ESLint, Prettier, Lefthook, Vitest, script (ADR-034) |
| [`cicd-pipeline.md`](../product-discovery/06-engineering/cicd-pipeline.md)                               | Gates CI yang sama dengan lokal                      |
| [`monorepo-setup.md`](../product-discovery/06-engineering/monorepo-setup.md)                             | Layout workspace & TypeScript                        |
| [`../README.md`](../README.md)                                                                           | Setup cepat root                                     |

Config di repo: `eslint.config.*`, `prettier.config.*`, `lefthook.yml`, `vitest.config.ts` (root).

---

## Perintah inti

| Tujuan          | Perintah                                  |
| --------------- | ----------------------------------------- |
| Dev server      | `bun run dev`                             |
| Typecheck       | `bun run typecheck`                       |
| Lint            | `bun run lint` / `bun run lint:fix`       |
| Format          | `bun run format` / `bun run format:check` |
| Test            | `bun run test`                            |
| Prisma generate | `bun run db:generate`                     |
| Migrate (dev)   | `bun run db:migrate`                      |

Sebelum menganggap pekerjaan selesai: typecheck + lint (+ test bila menyentuh logic yang tercover) harus hijau.

---

## Aturan coding (operasional)

Aturan di bawah melengkapi hard rules di [`../AGENTS.md`](../AGENTS.md). Detail arsitektur tetap di baseline.

### Umum

1. Format & lint dipercayakan ke **Prettier + ESLint** — jangan reformatting massal di luar scope task.
2. TypeScript ketat: hindari `any`; prefer tipe dari `@social/shared` untuk ID/enum lintas BC.
3. Jangan commit secret; jangan menambah dependency tanpa alasan jelas (ikuti
   `dependency-strategy.md`). Paket Astryx Beta wajib exact pin; core, neutral
   theme, dan CLI di-upgrade sebagai satu unit.
4. Perubahan kecil & terfokus — jangan refactor spekulatif di luar task.
5. Komentar hanya untuk intent non-obvious; jangan komentar narasi ulang kode.

### UI / styling

6. Astryx adalah fondasi komponen permanen; gunakan stable release, bukan
   canary.
7. Tailwind hanya untuk layout, wrapper, spacing, grid, flex, dan responsive
   page composition.
8. Wrapper Astryx dibuat selektif. Hindari `swizzle` dan authoring StyleX pada
   tahap awal.

### Naming & file

9. Domain module: `apps/web/src/domains/<domain>/` — nama selaras BC (kebab/folder lowercase).
10. Public API domain diekspor dari `index.ts` module tersebut.
11. Shared types: `packages/shared` — nama jelas, tanpa logic bisnis.
12. Persona & role: pakai nama kanonikal (Raka, Maya, … / Owner, Admin, Manager, Creator).

### Testing

13. Unit/domain test: **Vitest** (`bun run test`).
14. Test yang ditambah harus relevan dengan behavior yang diubah; jangan stub berlebihan tanpa nilai.

### Git / PR (saat diminta user)

15. Commit hanya jika user meminta — Conventional Commits, imperative, fokus “why”.
16. Jangan `--no-verify` / force push ke main kecuali diminta eksplisit.

---

## Checklist sebelum selesai task kode

- [ ] Tidak melanggar hard rules `AGENTS.md` (entry point, domain imports, Prisma/Supabase batas)
- [ ] `bun run typecheck` hijau
- [ ] `bun run lint` hijau
- [ ] Test relevan hijau (jika ada)
- [ ] Jika menambah/meng-upgrade Astryx: smoke test UI + dark mode + Tailwind
      cascade layer + Next.js production build hijau
- [ ] `PROJECT_STATE` / `CHANGELOG` diupdate jika progress project berubah

---

## Related context

- Pola implementasi fitur → `ctx-implementation.md`
- Stack / Prisma / env → `ctx-technical-context.md`
- Project OS → `ctx-project.md`
