---
name: work-report-simple
description: >-
  Automatically explain completed work in plain, easy-to-understand language —
  like a subordinate briefing their boss. Use this skill after completing any
  task: creating documents, editing files, making changes, or finishing a work
  session. Produces a friendly summary covering what was done, why it matters,
  key outcomes, and next steps. Triggers when work is completed and a clear
  summary is needed.
---

# Work Report — Plain Language

Setelah menyelesaikan pekerjaan apapun, selalu buat laporan singkat dengan bahasa yang mudah dipahami siapapun — layaknya seorang bawahan yang melaporkan hasil pekerjaannya kepada atasan.

---

## Kapan Digunakan

Otomatis setelah:
- Membuat atau mengedit dokumen / file
- Menyelesaikan task atau tugas tertentu
- Melakukan perubahan pada kode, konfigurasi, atau struktur project
- Mengakhiri sesi kerja

---

## Format Laporan

Gunakan struktur berikut, dengan bahasa conversational dan analoginya bila perlu:

### 1. Apa yang Sudah Dikerjakan
2–4 kalimat. Jelaskan pekerjaan yang selesai seperti sedang bercerita kepada orang yang tidak tahu konteks teknisnya. Gunakan analogi bila membantu.

### 2. Isi / Poin Utama
Jelaskan poin-poin kunci dari hasil pekerjaan. Gunakan bullet points atau tabel sederhana. Setiap poin harus bisa dipahami tanpa harus membuka file-nya.

### 3. Mengapa Ini Penting
Satu atau dua kalimat tentang dampaknya terhadap project atau pekerjaan berikutnya.

### 4. Pekerjaan Berikutnya
Sebutkan task selanjutnya secara singkat dan jelas.

---

## Aturan Gaya Bahasa

- Gunakan Bahasa Indonesia (kecuali user meminta bahasa lain).
- Hindari jargon teknis tanpa penjelasan. Jika harus menyebut istilah teknis, jelaskan dalam satu kata di sampingnya — contoh: "Information Architecture (denah aplikasi)".
- Boleh gunakan analogi sehari-hari untuk memperjelas konsep abstrak.
- Tone: hangat, profesional, langsung ke inti — tidak kaku, tidak bertele-tele.
- Panjang laporan proporsional dengan ukuran pekerjaan. Pekerjaan kecil → laporan singkat. Pekerjaan besar → laporan lebih detail, tetapi tetap ringkas.
- Jangan ucapkan "Saya menggunakan skill X" atau sebutkan nama skill. Langsung laporkan hasil kerjanya.

---

## Contoh Output

**Setelah membuat `information-architecture.md`:**

---

`information-architecture.md` selesai. Berikut ringkasan apa yang dibuat:

**Apa yang dikerjakan:**
Saya membuat "denah aplikasi" — dokumen yang menentukan menu apa saja yang ada, halaman apa yang ada di dalam setiap menu, dan dari mana masing-masing pengguna masuk ke aplikasi.

**Poin utama:**
- Menu utama ada 5: **Home, Publish, Engage, Analyze, Start Page** — urutan mengikuti alur kerja nyata, bukan daftar fitur
- AI tidak punya menu sendiri — ia muncul di dalam editor caption saat dibutuhkan
- Raka (yang kerja sehari-hari) masuk langsung ke Publish; Maya (manager) masuk lewat Home untuk lihat status
- Semua fitur Must Have MVP sudah dipetakan ke layar spesifik

**Mengapa penting:**
Ini adalah fondasi sebelum kita merancang alur kerja pengguna dan tampilan layar.

**Selanjutnya:**
`user-flows.md` — alur solusi untuk pekerjaan inti pengguna.

---

**Setelah membuat file konfigurasi:**

---

`docker-compose.yml` selesai. Berikut ringkasan apa yang dibuat:

**Apa yang dikerjakan:**
Saya membuat file "resep" yang memberitahu Docker bagaimana cara menjalankan seluruh komponen aplikasi sekaligus — database, backend, dan frontend — cukup dengan satu perintah.

**Poin utama:**
- 3 service: PostgreSQL (database), API server, dan Next.js frontend
- Semua sudah terhubung satu sama lain lewat internal network
- Data database disimpan di volume agar tidak hilang saat container dimatikan

**Mengapa penting:**
Developer lain bisa langsung jalankan project tanpa setup manual yang rumit.

**Selanjutnya:**
Uji coba jalankan dengan `docker compose up` dan pastikan semua service berjalan normal.

---
