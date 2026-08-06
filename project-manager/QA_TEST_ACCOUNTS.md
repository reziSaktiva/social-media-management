# QA TEST ACCOUNTS

Dokumen ini mencatat akun test yang tersedia untuk verifikasi browser
end-to-end (dipakai terutama oleh Najwa QA Engineer, `.claude/agents/
najwa-qa-engineer.md`), supaya akun yang sama bisa dipakai berulang kali
tanpa registrasi ulang.

---

## Testing browser sekarang pakai localhost langsung — ngrok tidak lagi wajib (ADR-070)

**Update 2026-08-06:** Catatan "wajib ngrok" di bawah ini **sudah tidak berlaku**.
Akar masalahnya bukan Better Auth (self-hosted) gagal membaca session/cookie
di `localhost` — melainkan **Better Auth Cloud** (produk hosted terpisah,
sempat aktif via plugin `dash` di `auth.ts` dengan `BETTER_AUTH_API_KEY`
terisi) yang mewajibkan Base URL publik. Setelah `BETTER_AUTH_API_KEY`
dikosongkan dan project kembali ke Better Auth self-hosted sesuai baseline
(`auth-strategy.md`, ADR-024), login/session terverifikasi normal lewat
`http://localhost:3000` — lihat ADR-070 di `DECISIONS.md`.

**Verifikasi browser sekarang:** buka langsung `http://localhost:3000` (via
`bun run dev` atau `preview_start` dengan config `web` di `.claude/
launch.json`) — **tidak perlu tanya URL tunnel ke user lagi.**

<details>
<summary>Riwayat lama (sebelum ADR-070) — kenapa dulu ngrok dipakai</summary>

Better Auth pada setup project ini **tidak bisa membaca session/cookie**
saat diakses lewat `localhost` — sudah dikonfirmasi lewat insiden hydration
gagal (lihat `PROJECT_STATE.md` — Known Issues KI-013). Karena itu verifikasi
browser dilakukan lewat **tunnel ngrok**, bukan `http://localhost:3000`.

**URL ngrok bersifat efemeran** — berubah setiap kali tunnel baru dibuka.
Jangan pernah pakai URL ngrok dari sesi sebelumnya atau dari dokumentasi
manapun (termasuk `COMPLETE_TASK.md`/`PROJECT_STATE.md` yang menyebut "tunnel
ngrok" tanpa URL eksplisit). **Wajib tanya ke user URL testing yang aktif
di setiap sesi baru** sebelum mulai verifikasi browser.

</details>

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
