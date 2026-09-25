## Decision ADR-118

### Title

`listPinterestBoards` di `IOutstandAdapter` + `board_id` opsional per-post
di override Pinterest — menutup KI-072

### Status

Accepted

### Date

2026-09-25

### Decision

KI-072 menemukan bahwa API resmi Outstand mewajibkan `board_id` untuk
publish ke Pinterest (`pinterest: { board_id (wajib), title?, link?,
alt_text?, cover_image_url? }`), tapi domain/UI kita sama sekali tidak
pernah mengumpulkan `board_id` — key `pinterest` tidak pernah dikirim ke
Outstand (perilaku aman sejak ADR-114, tapi berarti publish Pinterest tidak
pernah membawa override apa pun). King Rezi sudah mengonfirmasi 2 keputusan
scope sebelum implementasi (`AskUserQuestion`, 2026-09-25 sesi sebelumnya):
board dipilih **per post** (Draft Editor saja, bukan per akun/Connected
Accounts, bukan hybrid) — sehingga **tidak ada schema Prisma baru**.
Rancangan UI board-picker sudah dikunci di Claude Design (`select` native,
sama gaya "Filter Akun").

ADR ini mengunci keputusan implementasi kode:

#### 1. Kontrak baru `listPinterestBoards` di `IOutstandAdapter`

`packages/shared/src/contracts/outstand-adapter.ts` menambah type
`PinterestBoard { id: string; name: string }` dan method baru
`listPinterestBoards(outstandAccountId: string): Promise<PinterestBoard[]>`.
Dipakai untuk mengisi dropdown board saat compose post Pinterest di Draft
Editor.

#### 2. `board_id` dikirim ke Outstand hanya kalau terisi

`RealOutstandAdapter.computePlatformOverride` untuk Pinterest sekarang
mengirim `{ board_id, title?, link? }` ke Outstand **kalau**
`platformOptions.boardId` non-kosong. Kalau kosong, tetap `null` (perilaku
lama sejak ADR-114, tidak ada regresi) — `board_id` diperlakukan opsional
di sisi kita meski wajib di sisi Outstand, konsisten dengan filosofi
best-effort override sekunder yang sudah dipakai untuk Story/Reel
(ADR-114).

#### 3. Wire-format diverifikasi via OpenAPI resmi, bukan tebakan

Diverifikasi langsung lewat WebFetch OpenAPI spec resmi Outstand
(`api.outstand.so/v1/posts/openapi.json` dan
`api.outstand.so/v1/pinterest/openapi.json`):

- Override Pinterest di `POST /v1/posts`:
  `pinterest: { board_id (wajib), title?, link?, alt_text?,
  cover_image_url? }`.
- Endpoint list board: `GET
  https://api.outstand.so/v1/pinterest/accounts/{id}/boards`.

#### 4. Fake adapter — mock instan (pola ADR-059)

`FakeOutstandAdapter.listPinterestBoards` mengembalikan 3 board tetap
("Resep & Minuman", "Interior Kedai", "Promo Musiman") tanpa delay/failure
simulation, selaras dengan mock data yang sudah dipakai di rancangan
Claude Design.

#### 5. Anti-IDOR di `WorkspaceService`

`WorkspaceService.listPinterestBoards(workspaceId, actorId,
connectedAccountId)` memvalidasi `connectedAccountId` milik workspace dan
platform-nya Pinterest **sebelum** delegasi ke adapter — semua member aktif
boleh akses (bukan cuma Owner/Admin, karena ini murni read data pendukung
compose, bukan aksi mutasi/koneksi akun).

### Consequences

- Menutup **KI-072**.
- Tidak ada schema Prisma baru (board dipilih per-post, bukan disimpan
  permanen).
- UI Draft Editor (`Modal.tsx`) menambah state `boardIdByAccount: Record<
  connectedAccountId, string | undefined>` per-akun (bukan satu state
  global) — mengikuti pola `formatByAccount` yang sudah ada di file yang
  sama.
- Diimplementasikan Elon Backend Engineer (backend) + Mark UI Engineer
  (UI); lolos review Ridwan Architecture Reviewer 0 temuan; QA Najwa PASS
  di level kode (typecheck/lint/test) — **catatan non-blocking**: retest
  visual browser untuk skenario 2+ akun Pinterest terpilih bersamaan
  (memastikan board berbeda per akun tidak saling menimpa) belum sempat
  dilakukan karena blocker environment lokal (`.env.local` berisi
  `OUTSTAND_API_KEY` asli saat sesi QA, sehingga dev server otomatis
  memakai `RealOutstandAdapter` yang menolak akun Pinterest palsu — bukan
  bug kode). King Rezi mengonfirmasi lanjut berdasarkan verifikasi kode
  tanpa menunggu retest visual tersebut.

### Related

- KI-072 (Resolved)
- ADR-114 (override platform-specific), ADR-059 (Fake adapter pattern)
- T-025 (`tasks/v02-publishing-mvp.md`)
- Branch: `feature/ki-072-pinterest-board-id`
