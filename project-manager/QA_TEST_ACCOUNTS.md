# QA TEST ACCOUNTS

Dokumen ini mencatat akun test yang tersedia untuk verifikasi browser
end-to-end (dipakai terutama oleh Najwa QA Engineer, `.claude/agents/
najwa-qa-engineer.md`), supaya akun yang sama bisa dipakai berulang kali
tanpa registrasi ulang.

---

## Testing browser pakai localhost langsung (ADR-070)

Akar masalah requirement ngrok sebelumnya adalah **Better Auth Cloud**
(produk hosted terpisah, sempat aktif via plugin `dash` di `auth.ts` dengan
`BETTER_AUTH_API_KEY` terisi) yang mewajibkan Base URL publik — bukan
Better Auth self-hosted. Setelah `BETTER_AUTH_API_KEY` dikosongkan dan
project kembali ke Better Auth self-hosted sesuai baseline
(`auth-strategy.md`, ADR-024), login/session terverifikasi normal lewat
`http://localhost:3000` — lihat ADR-070 di `DECISIONS.md`.

**Verifikasi browser:** buka langsung `http://localhost:3000` (via
`bun run dev` atau `preview_start` dengan config `web` di `.claude/
launch.json`) — **tidak perlu tanya URL tunnel ke user lagi.**

---

## Akun test yang tersedia saat ini

Akun ini **sudah terdaftar di database** — jangan registrasi ulang.

| Field    | Value                        |
| -------- | ---------------------------- |
| Nama     | Raka Pratama                 |
| Email    | `raka.test@kopiselasar.com`  |
| Password | `Password123!`                |
| Role     | Owner                         |

Akun ini sudah dipakai berkali-kali untuk verifikasi end-to-end M8 (lihat
riwayat "akun test Raka Pratama" di `PROJECT_STATE.md` — ADR-046, Publishing
MVP persistensi, ADR-052 Tahap 3, dll).

---

## Akun Manager & Creator — ditunda

King Rezi awalnya meminta 3 akun test (Owner/Manager/Creator). Setelah
dicek, fitur invite member (`apps/web/src/app/[slug]/settings/members/
page.tsx`) **masih scaffold placeholder** — belum ada alur invite yang
benar-benar berjalan. Karena itu:

- Pembuatan akun Manager & Creator **ditunda** sampai fitur invite member
  selesai diimplementasikan.
- **Jangan** membuat akun ini via hack langsung ke database kecuali
  diminta eksplisit oleh user nanti.

---

## Update dokumen ini

Saat akun test baru ditambahkan (mis. Manager/Creator setelah fitur invite
selesai, atau akun tambahan lain), tambahkan baris baru di tabel "Akun test
yang tersedia saat ini" di atas — jangan buat file terpisah lagi per akun.
