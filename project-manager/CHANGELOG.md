# CHANGELOG

Seluruh perubahan penting pada dokumentasi maupun implementasi project dicatat pada dokumen ini.

---

## 2026-07-31 — Audit konsistensi dokumentasi menyeluruh (2 temuan diperbaiki)

Dipicu permintaan King Rezi untuk cek dokumentasi menyeluruh. Ditemukan 2
inkonsistensi nyata, keduanya sudah diperbaiki di sesi yang sama.

### Fixed

* **`context/ctx-design.md`, `context/ctx-implementation.md`,
  `context/ctx-technical-context.md`** — ketiganya masih menginstruksikan
  "gunakan neutral theme Astryx selama M8" tanpa qualifier, padahal ADR-055
  (2026-07-31) sudah mengangkat Light/Dark Mode Toggle jadi fitur resmi dan
  meng-override baseline itu. Ketiga file diberi catatan bahwa toggle tetap
  berjalan di atas neutral theme (expose mekanisme dark mode bawaan Astryx,
  bukan tema/token baru) — bukan pelanggaran, tapi perlu disebutkan supaya
  agent berikutnya tidak salah kira dark mode belum ada.
* **`.claude/agents/*.md`** (7 file peran subagent) — `AGENTS.md` dan
  `.claude/agents/README.md` mengklaim file-file ini `chmod 444` (read-only)
  sebagai pengaman teknis, tapi kenyataannya `644` (kemungkinan step chmod
  444 terlewat setelah edit terakhir `najwa-qa-engineer.md`). Dikembalikan ke
  `444`; `.claude/agents/README.md` sendiri sengaja tetap `644` sesuai
  pengecualian di `PROJECT_RULES.md`.

### Verified (tidak ada masalah, dicatat sebagai bukti audit)

* Penomoran ADR-001 s/d ADR-055 di `DECISIONS.md` berurutan tanpa gap/duplikat.
* Klaim status implementasi kode di `PROJECT_STATE.md` (ADR-052 modal, ADR-053/
  054 belum di kode, ADR-055 sudah di kode) cocok dengan kode nyata di
  `apps/web/src`.
* Versi Astryx `0.1.8` konsisten di `apps/web/package.json`,
  `apps/web/.claude/CLAUDE.md`, dan `PROJECT_OVERVIEW.md`.
* Tidak ada README yang memuat status/progress — Document Type Classification
  di `PROJECT_RULES.md` dipatuhi.

---

## 2026-07-31 — ADR-055: Light/Dark Mode Toggle diangkat jadi fitur resmi produk

King Rezi meminta button switch light/dark; sebelum implementasi dimulai,
diklarifikasikan dulu (via `AskUserQuestion`) apakah ini alat banding
internal atau fitur resmi produk — King Rezi memilih **fitur resmi
produk**, mengoverride baseline "neutral theme selama M8" (ADR-041). Alur
kerja: Neymar (Claude Design) → Mark UI Engineer (kode `apps/web`) → Najwa
QA (verifikasi browser) → Ridwan (review arsitektur) — semua selesai dan
lolos.

### Added

* `DECISIONS.md` — ADR-055 baru: Toggle Light/Dark Mode sebagai kontrol
  persisten di sidebar footer, berlaku lintas seluruh section; default
  Light saat load pertama; sengaja tidak dipersist lintas full reload.
  Alasan tidak melanggar ADR-041: token dark mode sudah native di Astryx
  (`@astryxdesign/theme-neutral@0.1.8`), bukan implementasi custom.
* Claude Design (project "Social Media Management") — toggle ditambahkan
  di 7 layar KSP (Home, Publish Calendar/Queue/Drafts, Engage Inbox,
  Analyze Dashboard, Settings Connected Accounts) + App Prototype.
  `draft-editor.html` (KSP-05) dikecualikan — tidak ada sidebar (modal
  fullscreen, ADR-052).
* `apps/web/src/app/providers.tsx` — `ThemeModeContext`/`useThemeMode`.
* `apps/web/src/app/[slug]/workspace-side-nav.tsx` — `IconButton` toggle di
  sidebar footer, berdampingan user account dropdown.

### Verification

* Typecheck/lint/test (26 test) hijau.
* QA end-to-end via browser (tunnel ngrok): golden path toggle lolos,
  konsistensi tema lintas navigasi SPA, reset ke Light saat full reload
  dikonfirmasi working as intended (bukan bug), tidak ada regresi sidebar.
* Review arsitektur (Ridwan): lolos tanpa temuan — client component murni,
  tidak ada import domain/Prisma/Supabase/Outstand, pola context konsisten
  dengan `DraftEditorContext` yang sudah ada.

### Belum selesai (dicatat, bukan ditutup)

* `components/navigation.html` (dokumen referensi AppShell+SideNav di
  Claude Design) belum ter-push — terblokir karena tool `DesignSync`
  sempat nonaktif di sesi kerja desain. File hasil edit sudah disiapkan
  lengkap di scratchpad, tinggal di-push saat `DesignSync` aktif kembali.
* Persistensi tema lintas reload (localStorage/cookie) belum diputuskan —
  sengaja ditunda.

---

## 2026-07-31 — ADR-053 & ADR-054: Sidebar CTA "+ New Post" + redirect Draft Editor ke sub-screen tujuan

### Added

* `DECISIONS.md` — ADR-053 (Sidebar mendapat CTA "+ New Post" pinned di
  bawah Workspace Selector, tersedia dari section manapun, melengkapi
  CTA NP-D09 yang sudah ada di Calendar/Queue/Drafts) dan ADR-054 (Draft
  Editor redirect otomatis ke sub-screen tujuan setelah aksi terminal:
  Save as Draft → Drafts, Schedule → Queue, Publish Now → History/
  sementara Calendar).
* `product-discovery/04-ux/navigation-patterns.md` — zona CTA baru di
  diagram sidebar, NP-D12 (CTA "+ New Post" pinned) dan NP-D13 (Pola
  Redirect setelah Aksi Terminal Draft Editor) baru di Decision Log +
  tabel Ringkasan Pola.
* `product-discovery/04-ux/key-screen-patterns.md` — KSP-D15 baru di
  Decision Log; KSP-05-F08/F09/F12 diberi catatan tujuan redirect.
* Claude Design (project "Social Media Management") — CTA "+ New Post"
  ditambahkan di 7 layar shell (`home.html`, `publish-calendar.html`,
  `publish-queue.html`, `publish-drafts.html`, `engage-inbox.html`,
  `analyze-dashboard.html`, `settings-connected-accounts.html`) +
  `components/navigation.html` + class baru `.sidebar-cta` di
  `styles.css`. `AppPrototype.dc.html` — `saveDraftFromEditor()` kini
  redirect ke `publish-drafts`, handler `publishnow-confirm` diubah
  destinasi dari `'home'` ke `'publish-calendar'`.

### Notes

* Implementasi kode `apps/web` untuk kedua perubahan ini **belum
  berjalan** — menyusul di siklus implementasi berikutnya (lihat Next
  Tasks di `PROJECT_STATE.md`).
* Handler Schedule (`dialog-confirm` → `publish-queue`) di App Prototype
  tidak berubah — perilaku ini sudah ada sejak file dibuat, ADR-054 baru
  memformalkannya sebagai keputusan resmi.

---

## 2026-07-30 — QA: aturan URL testing (ngrok) + akun test terdokumentasi

Permintaan eksplisit user: Najwa QA Engineer sering butuh verifikasi browser,
tapi project ini tidak bisa testing lewat `localhost` (Better Auth tidak bisa
membaca session/cookie di setup ini), sehingga dipakai tunnel ngrok yang
efemeran (URL berubah tiap sesi).

### Added

* `project-manager/QA_TEST_ACCOUNTS.md` — dokumen baru: alasan testing browser
  pakai ngrok bukan `localhost`, catatan bahwa URL ngrok efemeran (harus
  dikonfirmasi ulang tiap sesi, tidak boleh reuse dari dokumentasi manapun),
  1 akun test yang sudah ada di database (Raka Pratama, Owner —
  `raka.test@kopiselasar.com`), dan catatan penundaan akun Manager/Creator
  sampai fitur invite member (`apps/web/src/app/[slug]/settings/members/
  page.tsx`, masih scaffold placeholder) selesai diimplementasikan.

### Changed

* `.claude/agents/najwa-qa-engineer.md` — 2 aturan baru: (1) step 0 di
  "Langkah kerja" — wajib tanya ke user URL testing aktif sebelum verifikasi
  browser (bukan `localhost`), dengan alasan singkat (Better Auth + ngrok
  efemeran); (2) pointer baru di "Referensi" ke
  `project-manager/QA_TEST_ACCOUNTS.md` untuk kredensial akun test.

---

## 2026-07-30 — ADR-052 Tahap 3: implementasi kode Draft Editor sebagai modal

### Added

* `apps/web/src/app/[slug]/publish/_draft-editor/` — `context.tsx`
  (`DraftEditorProvider`/`useDraftEditor`, state New Post/Edit Draft/Resume
  Unfinished Post), `modal.tsx` (`Dialog variant="fullscreen"` + `Layout`,
  pola `DialogFullscreenDialog` Astryx), `actions.ts` (`saveDraftAction`,
  `updateDraftAction`, `getDraftAction`), `status-badge.ts` (mapping
  `ContentStatus` → label/`Badge` variant sesuai `components/status-chips.html`
  Claude Design).
* `apps/web/src/app/[slug]/publish/drafts/drafts-list.tsx` — Drafts List
  data asli (`List`/`ListItem` di dalam `Card`), tiap row klik membuka
  Edit Draft.
* `apps/web/src/lib/utils/format-relative-time.ts` — format waktu relatif
  Bahasa Indonesia ("2 jam lalu", "kemarin", dst).
* Domain `publishing`: `PublishingService.listDrafts`/`getDraftById`/
  `updateDraft` + `IPublishingRepository.listDrafts`/`findDraftById`/
  `updateDraftCaption` (+ `updatedAt` di `PublishingPostRecord`), unit test
  baru untuk ketiganya.

### Changed

* `apps/web/src/app/[slug]/publish/layout.tsx` — dibungkus
  `DraftEditorProvider` + render `DraftEditorModal`, supaya modal tampil di
  atas Calendar/Queue/Drafts manapun tanpa navigasi URL (NP-D11).
* `apps/web/src/app/[slug]/publish/drafts/page.tsx` — jadi async Server
  Component yang fetch draft asli via `PublishingService.listDrafts`,
  menggantikan `EmptyState` statis.
* `apps/web/src/lib/repositories/publishing/publishing.repository.ts` —
  implementasi Prisma untuk 3 method baru + helper `mapPost`.

### Removed

* Route lama Draft Editor (digantikan modal, ADR-052): `publish/drafts/new/`,
  `publish/drafts/[postId]/`, `publish/calendar/[postId]/`,
  `publish/queue/[postId]/`. **Tidak** menyentuh `publish/history/[postId]/`
  (di luar scope ADR-052).

### Notes

* Sengaja tidak mengikuti mockup Claude Design 100%: tombol "Publish Now" di
  footer modal tidak ikut diimplementasikan (ADR-047 — task terpisah, belum
  disetujui untuk dikerjakan sesi ini); footer tetap 2 tombol (Save as
  Draft, Schedule). Toggle Fullscreen/Standard di Claude Design juga sengaja
  tidak ikut ke kode (alat banding internal, bukan keputusan final).
* Diverifikasi end-to-end via browser (tunnel ngrok, akun test Raka
  Pratama): New Post → Save as Draft → close → muncul di list → Edit Draft
  dari list (data server) → update in-place (tidak duplikat) → Resume
  Unfinished Post dialog. `bun run typecheck`/`lint`/`test` hijau.
* Bug ditemukan & diperbaiki saat verifikasi: Drafts List tidak refresh
  otomatis setelah modal ditutup (Server Component tidak tahu ada
  perubahan) — ditambahkan `router.refresh()` setelah Save as Draft
  berhasil.

---

## 2026-07-30 — Skill "work-report-simple": tambah byline "Dikerjakan oleh"

Permintaan eksplisit user: setiap laporan kerja harus menyebutkan siapa
(persona/subagent) yang mengerjakannya.

### Changed

* `.agents/skills/work-report-simple/SKILL.md` (sinkron otomatis dengan
  `.claude/skills/work-report-simple/SKILL.md`) — section baru "1. Dikerjakan
  oleh" (wajib, baris paling atas laporan): nama subagent kalau dikerjakan
  lewat subagent bernama di `.claude/agents/`, atau "AI utama" kalau tanpa
  delegasi. Section lain digeser jadi 2–5. Aturan gaya bahasa + kedua contoh
  output diperbarui mengikuti format baru.
* `.claude/agents/ridwan-architecture-reviewer.md` dan
  `.claude/agents/najwa-qa-engineer.md` — section baru "Cara melapor",
  referensi eksplisit ke `work-report-simple` (sebelumnya cuma
  `gibran-project-manager.md` yang punya pointer ini). Chmod dibuka (644)
  untuk edit, dikunci kembali (444).

---

## 2026-07-30 — Aturan sebutan user: "King Rezi"

Permintaan eksplisit user (membuka kembali file peran subagent yang
sebelumnya di-chmod read-only, sesuai prosedur di `.claude/agents/README.md`).

### Changed

* `AGENTS.md` — aturan keras #14 baru: panggil user "King Rezi" di seluruh
  komunikasi/output teks, berlaku untuk AI utama dan seluruh subagent.
* Ketujuh file `.claude/agents/*.md` — section baru "Sebutan user" di tiap
  file, chmod dibuka (644) untuk edit lalu dikunci kembali (444).

---

## 2026-07-30 — 7 subagent kerja ditambahkan (`.claude/agents/`)

Dibuat atas permintaan user untuk memungkinkan delegasi kerja ke beberapa
subagent Claude Code secara paralel, dengan nama custom per peran.

### Added

* `.claude/agents/prabowo-feature-engineer.md` — implementasi fitur produk
  (entry → service → domain → repo), tidak terikat milestone tertentu.
* `.claude/agents/mark-ui-engineer.md` — UI/komponen Astryx di `apps/web`.
* `.claude/agents/neymar-product-designer.md` — kerja di Claude Design
  (`DesignSync`), wajib baca skill `claude-design-scope-discipline`.
* `.claude/agents/elon-backend-engineer.md` — integrasi Outstand (ACL),
  webhook, background jobs, schema Prisma.
* `.claude/agents/ridwan-architecture-reviewer.md` — review kepatuhan
  boundary DDD, read-only (tools dibatasi, tanpa Edit/Write).
* `.claude/agents/najwa-qa-engineer.md` — QA (Vitest + verifikasi browser
  end-to-end).
* `.claude/agents/gibran-project-manager.md` — update
  `PROJECT_STATE.md`/`DECISIONS.md`/`CHANGELOG.md`, selalu dipanggil
  terakhir dan sekuensial (bukan paralel) untuk mencegah konflik status.
* `.claude/agents/README.md` — panduan pemakaian + aturan orkestrasi
  paralel/sekuensial antar subagent.

### Changed

* `PROJECT_RULES.md` — `.claude/agents/*.md` (kecuali `README.md`-nya)
  ditambahkan ke klasifikasi Static Reference; perubahan hanya atas
  permintaan eksplisit user.
* `AGENTS.md` — section baru "Subagent kerja (`.claude/agents/`)", pointer
  ke `.claude/agents/README.md`.

### Governance

* Ketujuh file peran di-chmod read-only (444) sebagai pengaman teknis
  supaya tidak berubah tanpa sengaja saat sesi kerja berjalan.

---

## 2026-07-30 — ADR-052: skill "Claude Design — Scope Discipline" ditambahkan (governance)

Retrospektif atas insiden default toggle Fullscreen/Standard yang diam-diam
berubah (lihat addendum ADR-052 sebelumnya) menghasilkan aturan pencegahan
permanen supaya kelas kesalahan yang sama (AI mengubah state/default yang
sudah disetujui sebagai efek samping fitur baru) tidak terulang.

### Added

* `.claude/skills/claude-design-scope-discipline/SKILL.md` — skill baru:
  kronologi insiden, aturan wajib (jangan ubah default sebagai efek
  samping; nyatakan ringkas apa yang berubah vs tetap sama; tanya dulu
  kalau ambigu; definisi selesai mencakup "tidak ada side-effect tak
  diminta"), contoh salah/benar.

### Changed

* `context/ctx-design.md` — Aturan operasional #10 baru + entri Related
  context, menunjuk ke skill di atas.
* `AGENTS.md` — Aturan keras #13 baru, pointer ke skill yang sama (entry
  point wajib dibaca tiap sesi).
* `DECISIONS.md` — ADR-052 mendapat addendum baru mendokumentasikan
  governance ini + alasan penempatan (skill khusus + `ctx-design.md`,
  bukan `PROJECT_RULES.md` yang scope-nya lebih luas dari kebutuhan, karena
  hanya Claude Code yang punya akses tool `DesignSync`).

---

## 2026-07-30 — ADR-052: perbaikan CSS Draft Editor tidak ter-inject + media-thumb hilang

User melaporkan Media (drop zone) dan Account Selector (pilihan akun sosial
media) tampil berubah/polos, tidak sesuai tampilan awal — terutama lewat
App Prototype. Ditemukan dua root cause: (1) CSS page-specific Draft Editor
hanya ada di `<style>` lokal `templates/draft-editor.html`, tidak ikut
ter-inject saat markup-nya dipindah ke document screen lain di App
Prototype (yang cuma link `../styles.css`, tanpa style lokal tambahan);
(2) `<div class="media-thumb">` (kotak preview media) hilang total dari
markup App Prototype sejak rewrite pertamanya — bug terpisah dari soal CSS.

### Changed (Claude Design project)

* `styles.css` — class Draft Editor (`.editor-grid`, `.ai-trigger`,
  `.media-drop`, `.media-thumb`, `.acc-row`(`.disconnected`),
  `.acc-row-top`, `.fmt-row` (+`label`), `.reconnect-link`, `.sched-row`)
  dipindah ke sini (section "App patterns"), nilai px dipertahankan persis
  sama dengan versi lama — tidak ada pergeseran visual.
* `templates/draft-editor.html` — `<style>` lokal dihapus total, sekarang
  murni mengandalkan `../styles.css`.
* `templates/app-prototype/AppPrototype.dc.html` — `<div
  class="media-thumb">preview media 4:3</div>` ditambahkan kembali ke
  `buildDraftEditorMarkup`, posisi sama seperti template statis.
* `readme.md` — aturan baru "setiap class page-specific wajib di
  `styles.css`, tidak boleh `<style>` lokal per halaman" ditambahkan ke
  "How to use this"/"Do"/"Don't"/"Files" supaya pola bug ini tidak terulang
  untuk screen lain.

### Verification

* Dibuat simulasi lokal: document HTML terpisah yang hanya link
  `../styles.css` (meniru `publish-drafts.html`), markup Draft Editor
  di-inject via JS persis seperti App Prototype. Terkonfirmasi: sebelum
  fix Media/Account Selector polos tanpa styling; setelah fix, render
  benar. `templates/draft-editor.html` standalone juga dicek tetap benar
  tanpa `<style>` lokal.

---

## 2026-07-30 — ADR-052: koreksi default toggle + posisi dipindah ke header

Koreksi atas entri Tahap sebelumnya — user menegaskan tidak pernah meminta
layout Draft Editor berubah, hanya toggle untuk membandingkan; membuat
"Standard" jadi default tanpa sadar mengubah tampilan yang sudah di-approve
Tahap 2 (Fullscreen). User juga meminta posisi toggle dipindah ke dalam
dialog (sejajar status chip, kiri tombol Close), bukan tombol eksternal.

### Changed (Claude Design project)

* `templates/draft-editor.html` — default variant dikembalikan ke
  **Fullscreen**; tombol toggle floating (pojok kiri bawah) dihapus,
  digantikan tombol kecil di dalam `.dialog-fs-header`/`.dialog-lg` header,
  di antara chip status dan tombol Close.
* `templates/app-prototype/AppPrototype.dc.html` — default `dialogVariant`
  dikembalikan ke `'fullscreen'`; tombol toggle toolbar dihapus, digantikan
  tombol `data-proto="draft-toggle-variant"` di dalam
  `buildDraftEditorMarkup` (header dialog, posisi sama seperti template
  statis). Method `toggleDraftEditorVariant(doc)` menggantikan
  `toggleDialogVariant()` lama — dipicu lewat `route()` langsung (sudah
  punya akses `doc`), bukan lewat lookup `this._frame` terpisah.
* `readme.md` — section "Draft Editor — Dialog variant still being
  compared" dan "How to Demo" diperbarui: posisi toggle (di dalam header,
  bukan toolbar/floating), default Fullscreen (bukan Standard).

### Verification

* Diverifikasi visual di browser lokal sebelum push: kedua varian (default
  Fullscreen, toggle ke Standard) render benar, toggle di posisi baru
  (dalam header, sejajar chip, kiri Close) berfungsi di kedua file.

---

## 2026-07-30 — ADR-052: perbaikan animasi Dialog + toggle Standard/Fullscreen

User mengecek langsung di Claude Design dan melaporkan New Post/Edit Draft
belum terasa memakai komponen Dialog/Modal (terlihat seperti halaman
biasa). Ditemukan animasi buka Dialog hilang di implementasi sebelumnya
(bug nyata, diperbaiki) — fullscreen juga memang sengaja tanpa backdrop
gelap terlihat (Astryx by design, bukan bug). Solusi: toggle Standard/
Fullscreen supaya tim bisa bandingkan langsung, default Standard.

### Changed (Claude Design project)

* `styles.css` — animasi masuk (`@keyframes dialog-enter`, fade + scale-in
  ~300ms) ditambahkan ke `.dialog`, `.dialog-fs`, dan `.dialog-lg`
  sekaligus, mereplikasi animasi asli Astryx Dialog (diverifikasi via
  `astryx swizzle Dialog` sementara — dibaca, dihapus segera, ADR-041).
  Class baru `.dialog-lg-backdrop` + `.dialog-lg` (varian "standard" besar
  — card `min(960px, 94vw)` + backdrop gelap, menggunakan ulang
  `.dialog-fs-header/-title/-actions/-body/-footer` yang sudah ada).
* `templates/draft-editor.html` — tombol toggle "Variant: Standard/
  Fullscreen" (pojok kiri bawah, di luar dialog — kontrol demo, bukan
  bagian UI produk), default Standard.
* `templates/app-prototype/AppPrototype.dc.html` — toggle yang sama di
  toolbar ("Draft Editor: Standard/Fullscreen"), state `dialogVariant`
  (default `'standard'`), live-switch overlay yang sedang terbuka tanpa
  kehilangan caption yang sudah diketik.
* `readme.md` — section baru "Draft Editor — Dialog variant still being
  compared" menjelaskan trade-off fullscreen (sengaja tanpa backdrop) vs
  standard (backdrop jelas, lebih mudah dikenali sebagai modal); catatan
  "Don't ship both variants to apps/web" ditambahkan.

### Impact

* **ADR-052 di `DECISIONS.md` — keputusan "fullscreen" tidak lagi final.**
  Ditandai eksplisit di Addendum baru: variant asli tetap didukung penuh,
  tapi pilihan final (fullscreen vs standard) menunggu keputusan tim
  setelah membandingkan langsung di Claude Design.
* Tahap 3 (implementasi kode) tetap **tidak dimulai** — menunggu aba-aba
  eksplisit user, dan keputusan variant final sebelum/saat itu dimulai.

---

## 2026-07-30 — ADR-052: App Prototype direwiring (gap Design System ditutup)

Menutup gap yang dicatat di entri Tahap 2 sebelumnya — `AppPrototype.dc.html`
(Claude Design) sekarang konsisten dengan `templates/draft-editor.html`.
Tahap 3 (implementasi kode `apps/web`) masih menunggu aba-aba eksplisit user.

### Changed (Claude Design project)

* `templates/app-prototype/AppPrototype.dc.html` — Draft Editor dihapus dari
  `SCREENS` (bukan lagi iframe-navigable route); di-inject sebagai overlay
  `.dialog-fs` ke document layar aktif (Calendar/Queue/Drafts), pola yang
  sama dengan dialog Schedule/Publish Now/Disconnect yang sudah ada
  sebelumnya. Trigger (`+ New Post`, klik item Calendar/Queue, Home →
  Today's Schedule) diarahkan ke method baru `triggerNewPost`/
  `triggerEditDraft`.
* **Resume Unfinished Post (New Post saja, KSP-05-F13) — interaktif nyata**
  via `localStorage` browser: ketik caption di New Post → tutup dengan ✕ →
  buka "+ New Post" lagi → dialog "Resume unfinished post?" muncul dengan
  isi sebelumnya (pilihan Resume/Mulai Baru). Edit Draft sengaja tidak
  punya mekanisme ini.
* Role-based button visibility (Publish Now/Schedule↔"Kirim untuk Review")
  dipindah dari logic berbasis `this.screen === 'draft-editor'` ke
  diterapkan langsung pada overlay saat dirender.
* Dropdown "Screen" toolbar: entri langsung "Draft Editor" diganti opsi
  "KSP-05 · Draft Editor (modal preview)" (shortcut preview, melewati cek
  Resume — didemokan lebih baik lewat tombol "+ New Post" sungguhan).
* `readme.md` — "How to Demo" dan "Files" diperbarui mendeskripsikan
  perilaku modal + langkah demo Resume Unfinished Post.

### Verification

* Skrip JS komponen diekstrak dan dicek `node --check` (syntax valid) —
  framework `dc-runtime`/`<x-dc>` tidak bisa dijalankan penuh di luar Claude
  Design untuk verifikasi visual end-to-end dari sesi ini.

---

## 2026-07-30 — ADR-052: Draft Editor jadi Modal (Design System)

Tahap 2 dari ADR-052 — sinkronisasi ke project Claude Design (`Social Media
Management`, ADR-042). Tahap 3 (implementasi kode `apps/web`) belum
berjalan.

### Changed (Claude Design project, bukan repo `product-discovery/`)

* `templates/draft-editor.html` — ditulis ulang total: dari full-page
  `.app-shell`/`.sidebar` menjadi modal `Dialog variant="fullscreen"`
  (`.dialog-fs`). Header (title + status chip + Close icon button), body
  (editor grid yang sudah ada, tidak berubah), footer (action bar) —
  struktur mengikuti pola `Layout` + `DialogHeader` + `LayoutContent` +
  `LayoutFooter` Astryx asli.
* `components/dialog.html` — ditambah contoh kedua: dialog "Resume
  unfinished post?" (`purpose="required"`, KSP-05-F13, khusus New Post).
* `styles.css` — 6 kelas baru (`.dialog-fs` + `-header/-title/-actions/
  -body/-footer`), nilai fullscreen (`100dvw`/`100dvh`, radius 0)
  diverifikasi via `astryx swizzle Dialog` sementara (dibaca, dihapus
  segera — ADR-041).
* `readme.md` — tabel Components, section Direction/Do, dan daftar Files
  diperbarui untuk mendokumentasikan pola modal baru.

### Known gap

* `templates/app-prototype/AppPrototype.dc.html` (interactive runner)
  **belum** direwiring — Draft Editor di situ masih navigasi halaman
  penuh, bukan modal. Dicatat eksplisit di `readme.md` project Claude
  Design dan di `PROJECT_STATE.md` Next Tasks, bukan diabaikan diam-diam.

---

## 2026-07-30 — ADR-052: Draft Editor jadi Modal (dokumentasi)

Tahap 1 (dokumentasi) dari perubahan New Post & Edit Draft menjadi modal
reusable, bukan full-page route. Tahap 2 (Design System/Claude Design) dan
Tahap 3 (implementasi kode) menyusul di sesi terpisah — belum ada kode yang
diubah pada entri ini.

### Added

* **ADR-052** di `DECISIONS.md` — Draft Editor (New Post & Edit Draft) jadi
  modal overlay fullscreen, mengoverride NP-D02. Resume unsaved state
  (localStorage + dialog "Resume unfinished post?") hanya untuk New Post.
  Route lama (`drafts/new`, `[postId]` di `calendar`/`queue`/`drafts`) akan
  dihapus total saat implementasi (modal-only) — `history/[postId]`
  ("Post Detail", layar terpisah, KSP-D10) tidak termasuk, di luar scope.
* **KSP-05-F13** (Resume Unfinished Post, New Post saja) dan **NP-D11**
  (override NP-D02) di `key-screen-patterns.md` / `navigation-patterns.md`.

### Changed

* `product-discovery/04-ux/navigation-patterns.md` — pola "Item → Editor"
  dan "New Post CTA" direword dari panel/layar-penuh menjadi modal overlay;
  Ringkasan Pola diperbarui; NP-D02 ditandai dioverride oleh NP-D11.
* `product-discovery/04-ux/key-screen-patterns.md` — KSP-05 Identitas/
  Tujuan diberi catatan modal; KSP-05-F10 direword jadi "Tutup Modal";
  State Handling ditambah 2 baris (Resume New Post, batasan Edit Draft);
  diagram Zona Fungsional diberi catatan modal.
* `product-discovery/06-engineering/monorepo-setup.md` — diagram App Router
  Publish diperbarui: `[postId]` di `calendar`/`queue`/`drafts` dihapus dari
  diagram (digantikan modal); `history/[postId]` (Post Detail, KSP-D10)
  dibiarkan apa adanya — di luar scope ADR-052.
* `PROJECT_STATE.md` — entri ADR-052 di Recent Decisions, In Progress, dan
  Next Tasks (Design System lalu implementasi kode).

---

## 2026-07-29 — Design-sync: kode `apps/web` disamakan dengan Claude Design

Arah kebalikan dari ADR-051 (yang menyamakan Claude Design ke Astryx) — kali
ini kode yang sudah diimplementasikan di M8 disamakan visual/struktur-nya ke
referensi Claude Design. Murni visual/structural, tidak menambah business
logic baru (Publish Now/AI Caption Assist sengaja tidak ditambahkan, sesuai
Next Tasks terpisah).

### Changed

* **Draft Editor** (`[slug]/publish/drafts/new/page.tsx`) — Card wrapper di
  4 section (Caption/Media/Account Selector/Schedule) dihapus, mengikuti
  referensi KSP-05 yang tidak card-wrap section form (Card = dashboard
  widget/settings group, bukan section form, per aturan Astryx sendiri).
  Tombol "+ Tambah Media" (disabled) diganti `FileInput` asli
  (`mode="dropzone"`, `isDisabled` + `disabledMessage`) — component swap
  yang benar, bukan re-design. Date+Time Schedule disejajarkan satu baris.
  Action bar (Save as Draft/Schedule) dibuat full-width sejajar via
  `StackItem size="fill"`. Label back button → "Kembali ke Drafts".
* **Publish tabbar baru** (`[slug]/publish/publish-tabbar.tsx` + update
  `publish/layout.tsx`) — shared `TabList`/`Tab` (Calendar/Queue/Drafts/
  History) di atas semua sub-route Publish, `Tab href` otomatis pakai
  Next.js `Link` (LinkProvider sudah global). 3 tab lain (Calendar/Queue/
  History) tetap placeholder, tidak ada logic baru ditambahkan.
* **Drafts List** (`[slug]/publish/drafts/page.tsx`) — page-head
  ("Publish" / "Draft yang belum terjadwal") + `EmptyState` dibungkus
  `Card`, sesuai komposisi KSP-04. Data tetap kosong/mock — tidak
  menambah fetch draft asli (di luar scope design-sync).
* **Sidebar** (`workspace-side-nav.tsx`) — `IconButton` 🔔 "Notifikasi"
  ditambahkan di footer sebelum user dropdown, link ke
  `/account/notifications` (placeholder yang sudah ada), tanpa
  unread-count real (Notification domain belum diimplementasi).
* **Auth screens** (Login/Register/Forgot/Reset Password) — dibandingkan
  detail ke referensi, sudah selaras; tidak ada perubahan kode.

Diverifikasi: `bun run typecheck` & `bun run lint` hijau; browser check
end-to-end lewat tunnel ngrok (akun test baru) — tabbar navigasi antar
tab, Draft Editor (FileInput dropzone + disabledMessage tampil benar,
"Save as Draft" tetap persist ke database nyata tanpa regresi), sidebar
notifikasi (navigasi ke `/account/notifications` terkonfirmasi).

---

## 2026-07-29 — Claude Design: 3 gap Critical Function vs 04-ux baseline diperbaiki

Lanjutan audit sinkronisasi (entri di bawah) — user meminta perbaikan
langsung ke Claude Design untuk 3 gap yang ditemukan, tanpa mengubah
baseline (baseline sudah benar, implementasi yang tertinggal).

### Fixed

* **KSP-01-F05 (Home)** — `home.html`: card/list-row diberi class
  semantik (`.home-schedule`, `.home-activity`, `.home-engagement`,
  `.home-analytics`); `AppPrototype.dc.html` diberi handler route() baru
  supaya klik item mengarah ke Draft Editor / Calendar / Engage /
  Analyze sesuai peta deep-link di baseline.
* **KSP-03-F05 (Queue)** — `publish-queue.html`: tombol ↑/↓ ditambahkan
  di tiap `queue-row`; `AppPrototype.dc.html` menukar posisi DOM baris
  dengan tetangganya saat tombol diklik + toast konfirmasi.
* **KSP-06-F02 (Engage)** — `engage-inbox.html`: 3 select filter (Semua
  Akun / Semua Platform / Semua Status) ditambahkan di atas
  `inbox-shell`, tiap `thread-item` diberi `data-platform`/`data-status`;
  `AppPrototype.dc.html` menambahkan `applyEngageFilter()` (dipanggil
  saat `change` pada select manapun) yang menyembunyikan thread tidak
  cocok dan menampilkan empty state _"Tidak ada interaksi untuk filter
  ini"_ (persis wording State Handling KSP-06) saat hasil kosong.

Diverifikasi visual (tampilan statis) di scratchpad sebelum push; logika
interaktif App Prototype (format `.dc.html` khusus Claude Design) diverifikasi
lewat review kode karena runtime-nya butuh environment Claude Design asli.

Detail lengkap temuan: entri CHANGELOG di bawah ("Audit sinkronisasi
Claude Design vs 04-ux baseline").

---

## 2026-07-29 — Audit sinkronisasi Claude Design vs 04-ux baseline

Diminta user untuk cek apakah project Claude Design masih selaras dengan
`key-screen-patterns.md` dan `navigation-patterns.md` (04-ux baseline)
setelah rewrite fidelitas Astryx (ADR-051). Dibaca ulang kedua dokumen
baseline secara penuh dan dibandingkan terhadap setiap Critical Function
KSP-01–08, label status, struktur sidebar, dan tab bar.

### Findings

* Tidak ada regresi dari rewrite ADR-051 — perubahan token/komponen murni
  visual, seluruh zona fungsional dan label status baseline masih utuh.
* 3 gap fungsional pre-existing (bukan disebabkan sesi ADR-051) ditemukan
  dan dicatat di `PROJECT_STATE.md` Known Issues: KSP-01-F05 (Home deep
  link belum di-wire), KSP-03-F05 (Queue reorder belum ada), KSP-06-F02
  (filter Engage tidak ada sama sekali).

Tidak ada perubahan pada file Claude Design maupun baseline — audit ini
murni pencatatan gap untuk task selanjutnya.

---

## 2026-07-29 — Claude Design: migrasi templates/ selesai, legacy alias dihapus total (ADR-051 addendum)

Lanjutan ADR-051: 13 layar (8 KSP + 5 Auth) + App Prototype
(`AppPrototype.dc.html`) ditulis ulang — setiap embedded `<style>`/inline
style yang masih memakai nama token lama (`--color-text-muted`,
`--radius-md`, `--color-accent-tint`, `--color-surface-subtle`, dst.)
diganti ke token Astryx asli langsung.

### Fixed

* `thumbnail.html` — ditemukan rusak sejak push pertama ADR-051:
  mereferensikan `--status-failed-bg`/`--status-published-bg`, token yang
  sudah dihapus total dari sistem baru (diganti sistem varian `Badge`),
  bukan dialiaskan. Diperbaiki ke `--color-error`/`--color-success`.
* Alias singkatan `--text-xs`/`--text-sm`/`--text-lg` (bukan nama token
  Astryx asli, dibuat sendiri saat penulisan ulang pertama) ternyata masih
  dipakai aktif di banyak file — diganti ke nama token asli
  (`--font-size-sm`/`--font-size-lg`) di seluruh project.

### Changed

* `styles.css` — blok "Legacy aliases" dihapus total (dikonfirmasi tidak
  ada lagi referensi ke nama lama di file manapun). Tidak ada satu pun
  nama token buatan sendiri yang tersisa di project ini.
* `readme.md` — bagian yang menjelaskan bridge legacy alias dan status
  "templates/ belum bermigrasi" diperbarui untuk mencerminkan migrasi
  yang sudah selesai penuh.

Detail lengkap: `DECISIONS.md` ADR-051 (addendum).

---

## 2026-07-29 — Claude Design: foundations + component library ditulis ulang mengikuti fidelitas Astryx (ADR-051)

User meminta seluruh komponen di project Claude Design memakai komponen
yang disediakan Astryx (astryx.atmeta.com/components) — bukan CSS buatan
tangan yang cuma mirip. Cara kerja yang diinginkan: dokumentasi → Design
System (Claude Design) merancang berdasar dokumentasi itu → implementasi
berkaca ke Design System. Karena Claude Design adalah kanvas HTML/CSS
statis (tidak bisa menjalankan React/StyleX asli), setiap nilai visual
ditulis ulang sebagai replika presisi dari `@astryxdesign/core@0.1.8` +
`@astryxdesign/theme-neutral@0.1.8` (versi exact pin yang sama dengan
`apps/web`) — diverifikasi via `bunx astryx docs <topic>` dan swizzle
sementara (source dibaca lalu dihapus segera, tidak pernah disimpan,
sesuai larangan swizzle ADR-041).

### Changed

* Project Claude Design (`Social Media Management`) — 13 file ditulis
  ulang: `styles.css`, `theme.json`, `readme.md`, `foundations/color.html`,
  `foundations/type.html`, `foundations/layout.html`,
  `components/buttons.html`, `components/cards.html`,
  `components/dialog.html`, `components/forms.html`,
  `components/navigation.html`, `components/status-chips.html`,
  `components/table.html`.
* Accent berubah dari placeholder rekaan (`#48517A`, slate-blue) ke accent
  neutral theme Astryx asli (`#262626`, near-black) — tetap placeholder
  brand (ADR-038/ADR-041), sekarang placeholder yang nyata, bukan rekaan.
* 6 status konten (draft/review/ready/scheduled/published/failed)
  dipetakan ke varian `Badge` asli (neutral/warning/info/purple/success/
  error) — `scheduled` memakai tag kategori "purple" karena Astryx cuma
  punya 5 varian semantik, bukan 6.
* `AppShell` dipetakan ke `variant="section"` (bukan "elevated") supaya
  arah hairline-divider produk ini tetap terjaga dengan varian asli yang
  benar-benar ada.
* Setiap file component library sekarang mencantumkan anotasi eksplisit
  komponen + props Astryx asli yang direplikasi (mis. `<Button
  variant="primary" size="md">`), supaya implementasi di `apps/web`
  tinggal pasang komponen asli.
* `styles.css` — token lama (`--color-bg`, `--space-4`, `--radius-md`, dst.)
  dipertahankan sebagai "legacy alias" ke token Astryx asli, supaya
  `templates/` (belum bermigrasi) tetap render tanpa rusak.
* Ditemukan version drift: situs live `astryx.atmeta.com` menunjukkan
  v0.1.9, sementara `apps/web` mengunci v0.1.8 — CLI lokal dipakai sebagai
  sumber final (AGENTS.md #12), bukan situs live.

### Not done (scope terpisah)

* `templates/` (8 KSP + 5 Auth + App Prototype) belum bermigrasi ke token
  Astryx asli — masih pakai page-pattern class lama + legacy alias.

Detail lengkap: `DECISIONS.md` ADR-051.

---

## 2026-07-29 — Astryx agent docs resmi menggantikan workflow manual di AGENTS.md

Ditemukan saat user menanyakan apakah "Workflow Astryx wajib" di `AGENTS.md`
sesuai dokumentasi resmi Astryx (astryx.atmeta.com/docs/working-with-ai):
section tersebut ternyata tulisan manual (dibuat saat ADR-041) yang meniru
konsep dokumentasi resmi, bukan output CLI asli — berpotensi salah/basi
dibanding command resmi `astryx init --features agents`. User meminta
diganti dengan yang resmi.

### Changed

* `apps/web/.claude/CLAUDE.md` — **baru**, di-generate via
  `bunx astryx init --features agents --agent claude` (dijalankan dari
  `apps/web`). Berisi component index (153 komponen), workflow discovery
  resmi (`astryx build` → `template` → `component`), aturan styling/token,
  CLI reference — semua ditarik otomatis dari `@astryxdesign/cli` v0.1.8
  yang ter-pin. Diberi marker `<!-- ASTRYX:START/END -->` sehingga bisa
  di-regenerate in-place setelah upgrade Astryx.
* `AGENTS.md` — section "Workflow Astryx wajib" (4 langkah manual) dan
  aturan keras #12 diganti: sekarang menunjuk ke
  `apps/web/.claude/CLAUDE.md` sebagai sumber resmi, bukan menyalin ulang
  langkah CLI secara manual. Baris "UI component / styling" di tabel
  mapping task ditambahkan referensi file ini.
* `DEVELOPER_WORKFLOW.md` — node diagram mermaid yang menyebut
  `template --list → component --dense` (langkah lama) diupdate menjadi
  pointer ke `apps/web/.claude/CLAUDE.md`.

---

## 2026-07-29 — MCP server Astryx (`xds`) ditambahkan

Susulan dari perubahan agent docs resmi di atas — user memutuskan lanjut
setup MCP server setelah trade-off (CLI lokal ter-pin vs server live)
dijelaskan.

### Changed

* `.mcp.json` — **baru** di root repo, mendaftarkan server `xds`
  (`https://astryx.atmeta.com/mcp`) sesuai konfigurasi resmi dari
  dokumentasi Astryx. Meng-expose tool `search(query)` dan `get(name)`
  untuk pencarian/lookup komponen tanpa shell out ke CLI.
* `AGENTS.md` — catatan baru di section "Workflow Astryx wajib": MCP
  boleh dipakai untuk exploration/pencarian awal, tapi keputusan final
  props/API tetap harus diverifikasi lewat CLI lokal v0.1.8 yang ter-pin
  — karena server MCP menunjuk ke versi live yang bisa beda dari versi
  ter-install (Astryx masih Beta).

---

## 2026-07-29 — ADR-050: method service Transfer Ownership & Delete Workspace

Menutup gap yang ditemukan ADR-049: `deleteWorkspace` dan
`transferOwnership` sama sekali tidak punya method service. User meminta
gap ini diperbaiki langsung, bukan ditunda sampai screen dirancang.

### Temuan & keputusan

* `deleteWorkspace` — tidak ada ambiguitas (skema DB sudah `ON DELETE
  CASCADE` di semua tabel `workspace_id`). Ditambahkan langsung: Owner
  saja, wajib konfirmasi Tier 1.
* `transferOwnership` — ternyata punya fork nyata yang belum pernah
  diputuskan di dokumen manapun: langsung vs butuh persetujuan target.
  User memilih **butuh persetujuan** — proses dua langkah:
  * `transferOwnership(targetMemberId)` — Owner memicu, isi
    `pendingOwnerTransferTo`, kirim notifikasi. Belum menukar role.
  * `acceptOwnershipTransfer()` — Admin target menerima, role baru
    bertukar, `pendingOwnerTransferTo` dikosongkan.
  * Pola ini meniru `inviteMember`/`acceptInvite` yang sudah ada di
    dokumen yang sama — bukan pola baru yang asing.

### Changed (dokumentasi)

* `application-layer.md` — 3 method baru di `WorkspaceService`
  (`transferOwnership`, `acceptOwnershipTransfer`, `deleteWorkspace`);
  catatan gap ADR-049 sebelumnya dihapus (sudah resolved).
* `domain-model.md` — field baru `Workspace.pendingOwnerTransferTo`; 2
  `NotificationType` baru (`ownership_transfer_requested`,
  `ownership_transfer_resolved`); DM-D11.
* `database-strategy.md` — kolom baru `pending_owner_transfer_to` di
  `workspaces`.
* `roles-permissions.md` — klarifikasi alur dua langkah + Related
  Documents.
* `DECISIONS.md` — ADR-050 baru.
* `PROJECT_STATE.md` — Completed, Next Tasks (disederhanakan — screen
  jadi satu-satunya blocker tersisa), Recent Decisions.

### Belum dikerjakan (task terpisah)

* Screen Workspace Settings → General/Members (di luar 8 KSP) — masih
  satu-satunya yang menghalangi implementasi Transfer Ownership/Delete
  Workspace/Remove Member di kode maupun App Prototype.

---

## 2026-07-29 — ADR-049: kebijakan Safety Check / Double Confirmation lintas produk

Lanjutan audit ADR-047/ADR-048: user meminta penilaian eksplisit — dari
seluruh aksi yang teridentifikasi, mana yang **seharusnya** wajib
Safety Check / Double Confirmation, berdasarkan kerangka reversibilitas +
blast radius.

### Kerangka & klasifikasi

* **Kriteria wajib:** irreversibel/mahal dibatalkan, ATAU blast radius
  besar (dampak melampaui data milik pengguna sendiri).
* **Tier 1** (konfirmasi diperkuat): Transfer Ownership, Delete/Hapus
  Workspace.
* **Tier 2** (dialog standar, pola Disconnect Confirmation): Delete Post,
  Delete Media, Remove Member, Update Member Role, Cancel Schedule,
  **Logout**.
* **Tidak wajib** (reversibel/frekuensi tinggi — UXP-03): Save as Draft,
  Kirim ke Review, Mark as Done, Reply komentar, Connect Account,
  Reconnect, Remove Link.
* User memindahkan **Logout** dari rekomendasi awal ("tidak perlu",
  karena reversibel penuh) ke **Tier 2** — dicatat sebagai keputusan
  eksplisit di ADR-049, bukan rekomendasi yang diikuti begitu saja.

### Temuan tambahan

* `deleteWorkspace` dan `transferOwnership` (dua aksi Tier 1) **belum
  punya method service sama sekali** di `application-layer.md` —
  screen pemicunya (Workspace Settings → General) belum pernah
  dirancang. Dicatat sebagai gap terpisah, bukan diperbaiki sekarang
  (menghindari menebak kontrak API tanpa desain layar).

### Changed (dokumentasi)

* `key-screen-patterns.md` — bagian baru "Pola Lintas Layar — Safety
  Check / Double Confirmation": kriteria, tabel tier, klasifikasi
  lengkap 17 aksi, catatan implementasi.
* `navigation-patterns.md` — NP-D10 baru (Logout wajib Tier 2) + catatan
  di bagian User Settings.
* `ux-principles.md` — bullet baru di UXP-04 menautkan ke kebijakan ini
  (bukan UXP baru — exit criteria dokumen membatasi ke 7 prinsip
  bertelusur insight I-01–I-08).
* `roles-permissions.md` — cross-reference tier di baris Hapus
  Workspace, Transfer Ownership, Undang/hapus member, Ubah role member.
* `application-layer.md` — cross-reference tier di `removeMember`,
  `updateMemberRole`, `cancelSchedule`, `deletePost`, `deleteMedia`,
  `disconnectAccount`; catatan gap `deleteWorkspace`/`transferOwnership`.
* `DECISIONS.md` — ADR-049 baru.
* `PROJECT_STATE.md` — Completed, Next Tasks (2 entry baru), Recent
  Decisions.

### Belum dikerjakan (task terpisah)

* Implementasi seluruh aksi Tier 1/Tier 2 yang baru diklasifikasikan
  (Cancel Schedule, Delete Post, Delete Media, Update Member Role,
  Logout) — baik di kode maupun App Prototype.
* Desain layar Workspace Settings → General/Members + method service
  `deleteWorkspace`/`transferOwnership` (prasyarat Tier 1).

---

## 2026-07-29 — Audit Safety Check/Double Confirmation seluruh aksi; ADR-048 Disconnect Confirmation

Lanjutan diskusi ADR-047 (Publish Now): user bertanya apakah setiap aksi
di produk melewati Safety Check/Double Confirmation. Audit menyeluruh
atas seluruh dokumen `product-discovery/` untuk memetakan setiap aksi
(publish, draft, akun, member, workspace, logout, dll.) terhadap ada/
tidaknya spesifikasi konfirmasi.

### Temuan

* Hanya **1 pola konfirmasi** yang terdokumentasi di seluruh produk:
  Confirmation Summary (KSP-05-F06), dipakai Schedule dan (sejak
  ADR-047) Publish Now.
* **Logout** tidak melewati Safety Check sama sekali — cuma disebut
  sebagai satu baris di User Menu (`navigation-patterns.md`), tanpa
  mention konfirmasi apa pun.
* Kalimat usang: `key-screen-patterns.md` sempat mengklaim Schedule
  sebagai *"satu-satunya momen"* konfirmasi eksplisit — sudah tidak
  akurat sejak ADR-047 menambahkan Publish Now. Diperbaiki jadi
  "satu-satunya **pola**" (masih akurat — cuma ada 1 pola, dipakai 2
  aksi).
* 4 aksi berisiko/destruktif — **Disconnect Account, Remove Member,
  Transfer Ownership, Delete Workspace** — sama sekali tidak punya
  spesifikasi konfirmasi. Dari keempatnya, hanya Disconnect Account yang
  sudah punya screen nyata (KSP-08); tiga lainnya belum pernah dirancang
  sebagai layar sama sekali (Workspace Settings → Members/General di
  luar 8 KSP).

### ADR-048 — Disconnect Account wajib dialog konfirmasi

* Fungsi baru **KSP-08-F07 (Disconnect Confirmation)** — dialog
  peringatan ringkas (bukan Confirmation Summary) sebelum eksekusi,
  mengingatkan bahwa post terjadwal untuk akun tersebut tetap di antrean
  (KSP-D09), tidak otomatis dibatalkan.
* Pola baru "Pola: Disconnect Flow" + baris Decision Log **KSP-D14** di
  `key-screen-patterns.md`.
* Tidak ada perubahan RBAC — akses Disconnect tetap Owner/Admin sesuai
  `roles-permissions.md` yang sudah ada; hanya ditambah catatan silang.
* Remove Member, Transfer Ownership, Delete Workspace **sengaja ditunda**
  — screen-nya belum pernah dirancang, perlu inisiatif desain terpisah
  sebelum pola konfirmasinya bisa diputuskan.

### Changed (dokumentasi)

* `key-screen-patterns.md` — KSP-08-F05 diperjelas, KSP-08-F07 baru,
  "Pola: Disconnect Flow" baru, KSP-D14 baru, kalimat "satu-satunya
  momen" diperbaiki, KSP-D05 disinkronkan.
* `roles-permissions.md` — baris "Tambah/hapus connected accounts" diberi
  catatan silang ke ADR-048; Related Documents diperbarui.
* `DECISIONS.md` — ADR-048 baru.
* `PROJECT_STATE.md` — Completed, Next Tasks (3 entry: Publish Now,
  Disconnect Confirmation, dan catatan ditunda untuk Remove
  Member/Transfer Ownership/Delete Workspace), Recent Decisions.

### Belum dikerjakan (task terpisah)

* Implementasi dialog Disconnect Confirmation di App Prototype
  (`settings-connected-accounts.html`) dan di kode nyata.
* Desain layar Workspace Settings → Members/General/Billing (prasyarat
  sebelum Remove Member/Transfer Ownership/Delete Workspace bisa dapat
  pola konfirmasi).

---

## 2026-07-29 — App Prototype: fix navigasi back + role switcher; ADR-047 Publish Now

Dua pekerjaan berurutan di sesi yang sama.

### 1. App Prototype Claude Design

* Fix bug: tombol "Kembali ke Calendar" di Draft Editor (`AppPrototype.dc.html`)
  selalu paksa balik ke Calendar walau dibuka dari Queue/Drafts —
  bertentangan `navigation-patterns.md` NP-D02. Diperbaiki jadi
  stack-aware (mengikuti riwayat navigasi asli); label tombol ikut
  menyesuaikan ("Kembali ke Queue"/"Kembali ke Drafts").
* Tambah role switcher (Owner/Admin/Manager/Creator → persona
  Dimas/Maya/Raka/Sinta) di toolbar prototype. Mendemokan pembatasan
  akses per role (`roles-permissions.md`) di 4 layar: Draft Editor
  (Schedule vs "Kirim untuk Review"), Engage (nav dikunci untuk Creator),
  Connected Accounts (read-only untuk Manager/Creator), Analyze Dashboard
  (detail disembunyikan untuk Creator).
* Perubahan ter-push ke project Claude Design "Social Media Management"
  via `DesignSync` (tidak ada perubahan di repo lokal untuk bagian ini).

### 2. ADR-047 — Publish Now

Audit konsistensi (dipicu saat kerja App Prototype, pertanyaan user
"bisakah user upload langsung tanpa schedule?") menemukan
`application-layer.md` menyebut method `publishNow` yang sama sekali
tidak dikenal di UX Baseline (`key-screen-patterns.md`) maupun
`roles-permissions.md`. Setelah diskusi soal role, diputuskan:

* Publish Now diangkat jadi fitur UX resmi: KSP-05 dapat function ID baru
  **KSP-05-F12**; bullet baru di `mvp-definition.md`; ditambahkan ke
  hierarki layar dan tabel pemetaan fitur di `information-architecture.md`.
* Akses dibatasi **identik** dengan Schedule: Owner, Admin, Manager —
  bukan tingkat akses baru, bukan lebih ketat (opsi "hanya Owner/Admin"
  dipertimbangkan dan ditolak demi konsistensi pola yang sudah ada).
  Baris transisi baru `Draft → Published (Publish Now, skip jadwal)` di
  `roles-permissions.md`.
* `application-layer.md` — baris `publishNow` diperjelas: rujuk
  KSP-05-F12, RBAC sama dengan `schedulePosts`, tetap wajib validasi
  matriks `ContentFormat` (ADR-039).

### Changed (dokumentasi)

* `mvp-definition.md`, `key-screen-patterns.md`, `information-architecture.md`,
  `roles-permissions.md`, `application-layer.md` — lihat detail di atas.
* `DECISIONS.md` — ADR-047 baru.
* `PROJECT_STATE.md` — Completed (2 entry baru), Next Tasks (implementasi
  Publish Now di kode + App Prototype belum berjalan), Recent Decisions.

### Belum dikerjakan (task terpisah)

* Implementasi `PublishingService.publishNow()` di kode.
* Tombol "Publish Now" di Draft Editor App Prototype (role switcher yang
  baru ditambahkan sudah siap dipakai untuk membatasi visibility-nya).

---

## 2026-07-29 — ADR-046 Amandemen Final: `/publish` redirect permanen

User memutuskan bentuk akhir `/publish` (pertanyaan yang ditunda dari sesi
2026-07-28): formalkan state interim sebagai **final**, bukan sekadar
sementara. Tidak ada perubahan kode — hanya dokumentasi, karena kode sudah
dalam bentuk yang diputuskan sejak revert 2026-07-28.

### Keputusan

* `/{slug}/publish` **permanen** redirect ke `/{slug}/publish/calendar`;
  `calendar/` (+ `calendar/[postId]`) **permanen** jadi folder statis.
* Publish dikecualikan **permanen** dari pola root-render ADR-046 —
  satu-satunya section dengan sibling route dinamis (`[postId]`) di root,
  sehingga root-render di sana akan menangkap path lama secara salah.
* Alternatif yang dipertimbangkan dan ditolak: root-render + rename
  `[postId]` ke path lain (mis. `/publish/post/[postId]`); root-render +
  `[postId]` sebagai intercepting/parallel route (modal). Keduanya
  menambah kompleksitas nyata untuk manfaat kosmetik (satu redirect lebih
  sedikit).

### Changed (dokumentasi)

* `DECISIONS.md` — ADR-046 ditambah section "Amandemen Final
  (2026-07-29)"; baris Publish di poin Decision #1 ditandai superseded;
  "Catatan Tambahan (2026-07-28)" ditandai interim/sudah diamandemen.
* `monorepo-setup.md` — route tree, Aturan Routing, dan MS-D09 diperbarui:
  "pengecualian sementara" → "pengecualian permanen".
* `application-layer.md` — Contoh 3: "interim" → "permanen".
* `PROJECT_STATE.md` — Known Issues (item Publish belum final dihapus),
  Completed (entry baru), Next Tasks (item diskusi lanjutan dihapus —
  tidak ada lagi yang menggantung), Recent Decisions diperbarui.

### Verified

* Tidak ada perubahan kode — verifikasi live 2026-07-28 (ngrok tunnel,
  akun test Raka Pratama) tetap berlaku untuk keputusan final ini.

---

## 2026-07-28 — ADR-046 (Publish): revert interim ke `/publish/calendar`

Verifikasi live ADR-046 menemukan `/publish/calendar` (path lama) tidak
404 — malah tertangkap `publish/[postId]` (memperlakukan `"calendar"`
sebagai ID) dan merender placeholder salah. Atas instruksi user, bagian
Publish di-revert sementara sambil menunggu diskusi lanjutan soal bentuk
akhir `publish/page.tsx`.

### Changed (kode)

* `publish/[postId]/` → `publish/calendar/[postId]/`; `publish/page.tsx`
  (isi Calendar) → `publish/calendar/page.tsx`.
* `publish/page.tsx` (baru) — cuma `redirect(`/${slug}/publish/calendar`)`.
* Home, Engage, Settings **tidak diubah** — tetap final sesuai ADR-046.

### Changed (dokumentasi)

* `DECISIONS.md` — ADR-046 ditambah section "Catatan Tambahan (2026-07-28,
  belum final)" mencatat temuan collision + revert interim; poin Decision
  asli tidak dihapus/ditulis ulang, tetap jadi catatan historis apa yang
  awalnya diputuskan.
* `monorepo-setup.md` — route tree `publish/` disesuaikan (`calendar/`
  kembali jadi folder), Aturan Routing dan MS-D09 mencatat Publish sebagai
  pengecualian sementara.
* `application-layer.md` — Contoh 3 disesuaikan kembali ke
  `/publish/calendar`.
* `PROJECT_STATE.md` — Known Issues, Completed, dan Next Tasks diperbarui;
  next task baru: lanjutkan diskusi bentuk final `publish/page.tsx` di
  sesi berikutnya.

### Verified

* `bun run typecheck`, `bun run lint`, `bun run test` — hijau.
* Live via ngrok tunnel: `/insvire/publish` redirect ke
  `/insvire/publish/calendar`, render "Content Calendar", sidebar Publish
  tetap ter-highlight.

### Status

**Belum final.** Ditunda ke sesi berikutnya atas permintaan user.

---

## 2026-07-28 — ADR-046: Routing convention, default view render di root path

Diskusi berawal dari temuan bahwa klik "Publish"/"Engage" di sidebar 404
karena parent segment (`layout.tsx`) tidak punya `page.tsx` sendiri. Audit
lanjutan menemukan pola yang sama berulang di 4 titik: root workspace
(`/{slug}`), `/publish`, `/engage`, `/settings` — semuanya cuma punya
`layout.tsx` (atau tidak punya apa-apa) di root, tanpa `page.tsx`/redirect.

### Added

* ADR-046 di `DECISIONS.md` — default/single view section (Home,
  Publish→Calendar, Engage→Inbox, Settings→General) merender langsung di
  `page.tsx` root path section, bukan named child segment. Menghapus
  `/home`, `/publish/calendar`, `/engage/inbox`, `/settings/general` dari
  routing structure secara permanen (bukan redirect kompatibilitas — belum
  ada internal link yang bergantung padanya, dikonfirmasi lewat audit grep
  menyeluruh terhadap kode dan dokumentasi).

### Changed

* `product-discovery/06-engineering/monorepo-setup.md` — App Router route
  tree diperbarui (hapus `home/`, `calendar/`, `inbox/`, `general/` sebagai
  folder terpisah; `calendar/[postId]` → `[postId]` sejajar dengan
  `queue/drafts/history`); tambah aturan routing baru + MS-D09 di Decision
  Log.
* `product-discovery/05-architecture/application-layer.md` — Contoh 3
  ("Load Halaman Calendar") diperbarui dari `/[workspace]/publish/calendar`
  menjadi `/[workspace]/publish`.
* `information-architecture.md` dan `navigation-patterns.md` **tidak
  diubah** — dikonfirmasi tidak menyebut literal URL path sama sekali,
  hanya struktur tab/screen konseptual yang tidak terdampak keputusan ini
  (IA-D04 Calendar sebagai default tab tetap berlaku).

### Note

Dokumentasi baseline diselaraskan lebih dulu; implementasi kode menyusul
di entri di bawah setelah go-ahead eksplisit dari user.

---

## 2026-07-28 — ADR-046: Implementasi routing default view

Branch `feat/adr-046-routing-default-view` (dari `feat/m8-publishing-draft-persistence`).

### Changed

* `apps/web/src/app/[slug]/home/page.tsx` → `apps/web/src/app/[slug]/page.tsx`
* `apps/web/src/app/[slug]/publish/calendar/page.tsx` → `.../publish/page.tsx`
* `apps/web/src/app/[slug]/publish/calendar/[postId]/page.tsx` → `.../publish/[postId]/page.tsx`
* `apps/web/src/app/[slug]/engage/inbox/page.tsx` → `.../engage/page.tsx`
* `apps/web/src/app/[slug]/settings/general/page.tsx` → `.../settings/page.tsx`
* Redirect target `/${slug}/home` → `/${slug}` di `app/page.tsx`,
  `onboarding/actions.ts`, `onboarding/page.tsx`.
* `WorkspaceSideNav` — href Home ke root workspace; `isSelected` Home pakai
  exact match pathname (bukan `startsWith`, karena semua route lain juga
  diawali `/${slug}` — `startsWith` akan membuat Home permanen ter-highlight).

### Verified

* `bun run typecheck`, `bun run lint`, `bun run test` — hijau (21/21 test).
* Live via ngrok tunnel dengan akun test (Raka Pratama): `/insvire`,
  `/insvire/publish`, `/insvire/engage`, `/insvire/settings` semua render
  default view langsung tanpa 404; sidebar highlight benar per section.
  `/insvire/engage/inbox` dan `/insvire/settings/general` (path lama)
  terkonfirmasi 404 bersih.

### Known Issue Ditemukan

* `/publish/calendar` (path lama) **tidak** 404 — tertangkap oleh
  `publish/[postId]` (memperlakukan `"calendar"` sebagai ID), merender
  placeholder Draft Editor. Dicatat di `PROJECT_STATE.md` → Known Issues;
  bukan regresi baru (karakteristik placeholder `[postId]` yang belum wired
  ke data asli), akan otomatis teratasi saat lookup by ID diimplementasikan.

---

## 2026-07-28 — Publishing MVP: persistensi nyata "Save as Draft"

### Added

* `PublishingService.saveDraft()` — domain layer baru di
  `apps/web/src/domains/publishing/services/`, diuji unit dengan fake
  repository (pola sama dengan `WorkspaceService`).
* `publishingRepository.createDraft()` — implementasi Prisma untuk
  `IPublishingRepository` di `apps/web/src/lib/repositories/publishing/`.
* `saveDraftAction` di `/publish/drafts/new/actions.ts` — resolve session +
  workspace by slug, lalu delegasikan ke `PublishingService.saveDraft()`.

### Changed

* Draft Editor (`/publish/drafts/new`) — tombol "Save as Draft" kini
  memanggil persistensi nyata (bukan lagi mock notice); mendapat post ID
  asli di success banner. Diverifikasi via browser (ngrok tunnel) dan cek
  langsung row di Supabase. "Schedule" tetap mock — menunggu
  `OutstandAdapter`/kredensial Outstand (ADR-040).

### Fixed

* `PROJECT_STATE.md` — section **In Progress** dan **Next Tasks** masih
  menyebut persistensi Publishing MVP sebagai belum dimulai, padahal
  implementasi di atas sudah selesai dan ter-commit. Dipindahkan ke
  **Completed**; sisa scope ("Schedule" + `OutstandAdapter`) disesuaikan.

---

## 2026-07-28 — Hapus folder `design/` (ADR-045)

Diskusi menemukan bahwa `design/` bukan acuan AI/engineering (SoT UI yang
benar-benar dipakai: `04-ux/` + `design-tokens.md` + Astryx CLI, dikonfirmasi
lewat `context/ctx-design.md`), dan belum ada designer aktif yang memakai
paket handoff-nya. Diputuskan hapus dengan versi ringan — pindahkan pointer
Claude Design, baru hapus sisanya.

### Removed

* Folder `design/` seluruhnya: `README.md`, `DESIGN_OVERVIEW.md`,
  `DESIGN_BRIEF.md`, `DESIGN_ONEPAGER.html`,
  `Design-Brief-Social-Media-Management.pdf`,
  `Design-One-Pager-Social-Media-Management.pdf`, `_build-brief-pdf.mjs`.

### Added

* ADR-045 di `DECISIONS.md` — mencatat penghapusan, alasan, dan alternatif
  yang dipertimbangkan; menegaskan tidak mengubah ADR-038 (SoT token) maupun
  ADR-042 (Claude Design sebagai handoff tool).
* `context/ctx-design.md` ditulis ulang — sekarang murni pointer ke UX
  Baseline (`04-ux/`) dan project Claude Design (project ID, akses,
  `DesignSync`), tanpa referensi ke file `design/` yang sudah tidak ada.

### Changed

* Referensi ke `design/` diperbarui/dihapus di 12 dokumen lain: `AGENTS.md`,
  `context/README.md`, `context/ctx-technical-context.md`,
  `project-manager/PROJECT_OVERVIEW.md`, `PROJECT_STATE.md`, `README.md`,
  `DEVELOPER_WORKFLOW.md`, `.agents/skills/project-os-navigator/SKILL.md`,
  `product-discovery/README.md`,
  `product-discovery/06-engineering/README.md`,
  `product-discovery/06-engineering/design-tokens.md`,
  `product-discovery/04-ux/README.md` — semua diarahkan ke
  `context/ctx-design.md` sebagai pointer baru.

---

## 2026-07-28 — Audit sinkronisasi dokumentasi lintas folder

Hasil audit menyeluruh (project-manager/, context/, product-discovery/, design/, vs kode aktual) menemukan 4 inkonsistensi struktural; semuanya diperbaiki di sesi ini.

### Fixed

* `AGENTS.md` (root) — tabel Source of Truth dan section "Related" belum
  mencantumkan `project-manager/DEVELOPER_WORKFLOW.md`, meski file itu sudah
  didaftarkan sebagai Core Document di `project-manager/README.md`. Agent
  yang strictly mengikuti AGENTS.md tidak akan menemukan file ini. Ditambahkan
  ke kedua section.
* `product-discovery/05-architecture/database-strategy.md` — kolom
  `workspace_connected_accounts.platform` masih mendaftar
  `instagram | facebook | twitter | linkedin | tiktok | youtube` saja,
  belum menyertakan `threads` dan `pinterest` yang ditambahkan ADR-037.
  Dokumen sibling-nya (`domain-model.md`) sudah benar; `database-strategy.md`
  kelewat saat sinkronisasi ADR-037. Diperbaiki agar konsisten.
* `design/DESIGN_BRIEF.md` — version metadata internal tidak konsisten
  (header `v1.1.0` vs footer `v1.0.0`, sisa dari commit `f658175` yang bump
  header tapi lupa footer). Diselaraskan jadi `v1.2.0` (menyamai
  `design/DESIGN_OVERVIEW.md` yang sudah di `v1.2.0` sejak commit `b1f9e6c`).
* `design/DESIGN_BRIEF.md` — belum menyertakan section **A.5.1 Auth Flow
  (suplemen, di luar 8 KSP)** yang sudah ada di `DESIGN_OVERVIEW.md` sejak
  commit `b1f9e6c` (5 layar pre-session: login, register, verify-email,
  forgot/reset password). Commit tersebut hanya mengubah `DESIGN_OVERVIEW.md`
  + `design/README.md`, tidak menyentuh `DESIGN_BRIEF.md` — padahal Brief
  seharusnya mirror Overview (per `design/README.md`). Section A.5.1 beserta
  referensi `templates/auth-*.html` di tabel struktur Claude Design dan B.7
  ditambahkan agar Brief (sumber PDF handoff resmi) tidak stale dibanding
  Overview.

---

## 2026-07-28 — Sinkronisasi PROJECT_STATE.md dengan kondisi repo (M8)

### Fixed

* `PROJECT_STATE.md` belum mencatat 4 commit M8 yang sudah merge (PR #15,
  2026-07-24): Workspace App Shell (SideNav + logout), `getWorkspaceBySlug`,
  Draft Editor mock data, dan config `allowedDevOrigins` ngrok. Status
  ditulis ulang: Current Status → M8 In Progress, Milestone Progress M8 →
  🟡 In Progress, section "In Progress" yang menyebut "UI Draft Editor belum
  diimplementasi" dihapus (sudah ada, mock data) dan diganti fokus baru:
  persistensi nyata + integrasi `OutstandAdapter`.

### Added

* **M8 — Workspace App Shell:** layout `[slug]` diganti dari placeholder
  kosong menjadi `AppShell` + `SideNav` persisten (Home/Publish/Engage/
  Analyze/Start Page) sesuai `navigation-patterns.md`. Sidebar header
  menampilkan nama workspace aktif via `WorkspaceService.getWorkspaceBySlug`
  (+ `IWorkspaceRepository.findBySlug` baru), footer berisi user dropdown
  dengan Profile dan Logout (`authClient.signOut`).
* **M8 — Draft Editor (mock data):** `/publish/drafts/new` (KSP-05) —
  Caption Editor, Account Selector, Content Format Selector per akun sesuai
  matriks ADR-039 (IG/FB: Post/Reel/Story; Pinterest: Pin + title/link;
  platform lain: Post), Schedule Picker, dan Confirmation Summary dialog.
  Connected accounts masih mock data (`OUTSTAND_API_KEY`/
  `OUTSTAND_WEBHOOK_SECRET` belum tersedia) — Save as Draft / Schedule hanya
  menampilkan notice mock, belum persist. Halaman placeholder Drafts kini
  link ke editor ini via CTA New Post. Persistensi nyata + integrasi
  `OutstandAdapter` adalah follow-up ADR-040.
* Dev config: `next.config.ts` — `allowedDevOrigins` menambahkan hostname
  tunnel ngrok untuk uji lokal (nilai efemeral).

---

## 2026-07-24 — M8: Workspace Onboarding (create-workspace flow)

### Added

* Onboarding Flow (First Login) dari `auth-architecture.md` diimplementasikan:
  `proxy.ts` — auth guard pakai `getSessionCookie` (Better Auth, tanpa DB
  call, cookie-presence check saja) untuk route terproteksi vs halaman auth
  publik; root `src/app/page.tsx` — Server Component yang memanggil
  `auth.api.getSession()` lalu redirect ke `/login`, `/{slug}/home`, atau
  `/onboarding` sesuai status workspace user; `src/app/onboarding/` — halaman
  create-workspace (1 field: nama, slug auto-generate) dengan Server Action
  `createWorkspaceAction`.
* `WorkspaceService` (BC-02) pertama kali diimplementasikan di
  `src/domains/workspace/`: `createWorkspace` (validasi nama, generate slug
  via value object `slugify`, retry suffix numerik saat slug bentrok, buat
  `Workspace` + `WorkspaceMember` role Owner via transaksi Prisma) dan
  `getDefaultWorkspaceSlugForUser` (dipakai orkestrasi redirect root/onboarding
  — bukan bagian tabel kontrak `WorkspaceService` di `application-layer.md`,
  ditambahkan untuk kebutuhan orkestrasi tanpa melanggar boundary).
  Implementasi repository Prisma di `src/lib/repositories/workspace/`
  (MS-D05 — repository implementation terpisah dari folder domain).
* Hierarki error `ApplicationError` (`AuthorizationError`, `NotFoundError`,
  `ValidationError`, `ConflictError`, `ExternalServiceError`) dari
  "Error Handling Strategy" (`application-layer.md`) diimplementasikan di
  `src/lib/utils/errors.ts` — infra bersama lintas domain, dipakai
  `WorkspaceService` dan siap dipakai Application Service BC lain.
* `MemberStatus` enum (`pending | active | removed`) ditambahkan ke
  `packages/shared` — sudah didokumentasikan di `domain-model.md` tapi belum
  ada di shared types.
* Test Vitest baru: `slugify` (edge case aksen, simbol, panjang), dan
  `WorkspaceService.createWorkspace` (validasi, retry-on-conflict, exhaustion)
  pakai fake in-memory repository.
* `apps/web/src/app/astryx-smoke.tsx` dihapus dari root route — tugasnya
  sebagai smoke test ADR-041 sudah selesai; root `page.tsx` sekarang berisi
  redirect logic produksi.

### Fixed

* Deteksi slug-conflict di `workspace.repository.ts` awalnya mengandalkan
  `error.meta.target` (nama kolom) untuk mengenali `P2002` — dengan driver
  adapter `@prisma/adapter-pg` (Prisma 7), `meta.target` tidak terisi
  sehingga retry logic tidak pernah terpicu dan slug bentrok akan crash
  alih-alih di-retry. Diverifikasi langsung dengan skrip terhadap database
  Supabase Cloud nyata (bukan hanya unit test dengan fake repository) —
  ditemukan lewat percobaan create-workspace kedua dengan nama sama. Fix:
  deteksi pakai `error.code === "P2002" && error.meta?.modelName === "Workspace"`
  (satu-satunya unique constraint pada `Workspace` selain PK adalah `slug`).

---

## 2026-07-24 — Better Auth Dash (official admin/monitoring plugin, optional)

### Added

* `@better-auth/infra` terpasang di `apps/web` — plugin `dash()` di
  `apps/web/src/lib/better-auth/auth.ts`, aktif hanya jika
  `BETTER_AUTH_API_KEY` terisi (pola sama dengan Google OAuth conditional).
  Tanpa API key, plugin tidak dipasang sama sekali (`plugins: undefined`) —
  tidak mengubah behavior auth existing.
* Env var baru (opsional, EM-D04): `BETTER_AUTH_API_KEY`, `BETTER_AUTH_API_URL`,
  `BETTER_AUTH_KV_URL` — dikatalogkan di `apps/web/.env.example` dan
  `apps/web/src/lib/env.ts`. Nilai aktual diisi manual oleh Project Owner di
  `.env.local` (bukan lewat agent).
* Ini dashboard resmi dari tim Better Auth untuk monitoring/admin auth
  server (bukan bagian dari `05-architecture/auth-architecture.md` atau
  `06-engineering/auth-strategy.md` — kalau mau dipakai permanen di
  production, disarankan dicatat lewat ADR terpisah agar konsisten dengan
  aturan baseline).

### Fixed

* `GET /api/auth/dash/validate` 500 — `Failed to parse URL from /api/auth/jwks`.
  Penyebab: `dash({ apiUrl: process.env.BETTER_AUTH_API_URL, ... })` selalu
  mengirim key `apiUrl`/`kvUrl` walau env var-nya kosong; `@better-auth/infra`
  men-spread raw options **setelah** default resolution-nya sendiri, jadi
  `apiUrl: undefined` eksplisit menimpa default bawaan (`https://dash.better-auth.com`)
  balik jadi `undefined` → JWKS self-check gagal parse URL relatif tanpa base.
  Diverifikasi langsung dengan memanggil `dash()` secara terisolasi (bukan
  tebakan). Fix: key `apiUrl`/`kvUrl` di-omit total (bukan diisi `undefined`)
  saat env var-nya tidak diset.

---

## 2026-07-24 — M8: Auth Flows UI (Login, Register, Forgot/Reset Password)

### Added

* Implementasi 4 layar auth di `apps/web/src/app/(auth)/` — mengganti
  placeholder scaffold M7: `login/`, `register/`, `forgot-password/`, dan
  route baru `reset-password/` (dua-state form + halaman tautan tidak
  valid). Layout bersama `(auth)/layout.tsx` (brand row + Center) mengikuti
  referensi visual Claude Design (`templates/auth-*.html`, ADR-042
  supplement Auth Flow).
* `apps/web/src/lib/better-auth/client.ts` — Better Auth React client
  (`createAuthClient`, tanpa `baseURL` eksplisit; default current origin).
* `googleOAuthEnabled()` di `apps/web/src/lib/env.ts` — tombol Google OAuth
  otomatis disembunyikan saat `GOOGLE_CLIENT_ID`/`SECRET` kosong.
* `sendResetPassword` stub di `apps/web/src/lib/better-auth/auth.ts` — log
  tautan reset ke server console; alur forgot/reset password jadi
  end-to-end testable secara lokal tanpa provider email (AS-D04 masih
  terbuka).
* Halaman UI mengikuti workflow Astryx CLI wajib (`template --list`,
  `component --dense` untuk Button/TextInput/Card/Banner/Divider/
  CheckboxInput/dll.) sesuai `AGENTS.md`.

### Verified

* `bun run typecheck` dan `bun run lint` hijau.
* Sign-up end-to-end diverifikasi via raw `fetch()` ke
  `/api/auth/sign-up/email` (akun berhasil dibuat, token session valid).
* Tampilan login & register dicek visual di browser — cocok dengan
  referensi Claude Design.

### Known Issue (terpisah, tidak menahan pass ini)

* Uji interaksi form (klik submit) via tunnel ngrok tidak berhasil
  memicu React `onSubmit` — seluruh halaman (bukan cuma form auth)
  tidak ter-hydrate saat diakses lewat tunnel tersebut (tidak ada
  React fiber di elemen manapun setelah >5 detik, walau `window.next`
  sudah termuat, tanpa error console). Kemungkinan besar isu HMR/WebSocket
  Turbopack lewat ngrok, bukan bug di kode auth — perlu diselidiki
  terpisah sebelum uji interaksi form penuh di browser bisa diandalkan.

---

## 2026-07-24 — M8 Bootstrap: Supabase Cloud + DB Migrate + ADR-044

### Added

* Project Supabase Cloud `social-media-local` dibuat (region SEA) dan
  `apps/web/.env.local` diisi (DB URL, Supabase platform, Better Auth).
* Migrasi Prisma baru `20260724075859_rename_engagement_inbox_unique_index`
  — menyamakan nama index `engagement_inbox_items_...` yang ter-truncate
  Postgres (>63 karakter) dengan yang diharapkan `schema.prisma`.

### Changed

* Rename env var client-side Supabase: `NEXT_PUBLIC_SUPABASE_ANON_KEY` →
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (ADR-044) — mengikuti sistem API
  key baru Supabase (publishable/secret menggantikan anon/service_role).
  Diterapkan di `environment-management.md`, `apps/web/.env.example`,
  `apps/web/src/lib/env.ts`, `apps/web/src/lib/supabase/client.ts`.

---

## 2026-07-24 — Migrasi Next.js 16 Middleware → Proxy

### Changed

* `apps/web/src/middleware.ts` di-rename menjadi `apps/web/src/proxy.ts`;
  fungsi `middleware` di-rename menjadi `proxy`. Mengikuti file convention
  resmi Next.js 16 (https://nextjs.org/docs/messages/middleware-to-proxy);
  `config.matcher` dan behavior auth guard tidak berubah.
* Komentar pointer di `apps/web/src/lib/supabase/middleware.ts` diperbarui
  ke `src/proxy.ts` (nama file lib ini sendiri tidak berubah — bukan file
  convention Next.js).
* `product-discovery/06-engineering/monorepo-setup.md` — folder tree dan
  wording disesuaikan ke `proxy.ts`/"Proxy".
* `product-discovery/06-engineering/auth-strategy.md` — Related Documents
  update path ke `src/proxy.ts`.
* `PROJECT_STATE.md` — Known Issue deprecation warning dihapus, dicatat
  sebagai selesai di Completed.

---

## 2026-07-24 — API Mobile-Ready via Route Handler + Bearer Auth (ADR-043)

### Added

* ADR-043 di `DECISIONS.md` — Route Handler `/api/v1` (Next.js App Router)
  sebagai API mobile-ready di atas Application Service yang sama dengan web;
  tidak ada backend terpisah (Hono/Express). Better Auth Bearer plugin
  sebagai mekanisme auth mobile, menggantikan cookie session.
* `TEMP-project-owner-questions.md` — section 8: ringkasan diskusi keputusan
  ini beserta pertanyaan Project Owner dan assessment keamanan Bearer token.

### Changed

* `product-discovery/05-architecture/application-layer.md` — section baru
  "Route Handler v1 — Mobile Client" (pola entry point, workspace context
  eksplisit, versioning); Decision Log AL-D08.
* `product-discovery/06-engineering/auth-strategy.md` — section baru "Mobile
  Auth — Bearer Plugin" (konfigurasi, `trustedOrigins` custom scheme,
  `rateLimit.customRules` endpoint sensitif); Decision Log AS-D06; update
  tabel Security Considerations (brute force, Bearer token mobile).
* `product-discovery/05-architecture/auth-architecture.md` — perjelas baris
  Post-MVP "API key untuk programmatic access" agar tidak tumpang tindih
  dengan Bearer plugin mobile; Decision Log AU-D11.

---

## 2026-07-24 — Developer Workflow Notes (diagram mermaid)

### Added

* `project-manager/DEVELOPER_WORKFLOW.md` — 3 flowchart mermaid: (1) alur
  kerja project dari kebutuhan sampai kode, (2) alur pengguna auth →
  workspace → connect account → publish (visualisasi UF-01/UF-05 +
  auth-architecture.md), (3) siklus status konten per role
  (roles-permissions.md). Bersifat visualisasi, bukan Source of Truth baru.
* Didaftarkan di `project-manager/README.md` (Core Documents + folder
  structure).

---

## 2026-07-24 — Claude Design Menggantikan Figma (ADR-042)

### Added

* Project Claude Design baru `Social Media Management`
  (`84aded99-bb23-49b1-be9f-dd8f21c6873e`) — token neutral interim
  (`theme.json`/`styles.css`), foundations (color/type/layout), components
  (buttons/forms/cards/navigation/table/dialog/status-chips), dan 8 layar
  KSP-01–08 sebagai template, diakses lewat tool `DesignSync` bawaan Claude
  Code.
* ADR-042 di `DECISIONS.md` — Claude Design menggantikan Figma sebagai design
  handoff tool; sinkronisasi dengan `product-discovery/` bersifat
  manual/on-request, bukan otomatis.

### Changed

* `product-discovery/06-engineering/design-tokens.md` — seluruh referensi
  Figma diganti Claude Design (Langkah 1 review, sumber token, catatan lock).
* `design/README.md` — bagian baru "Claude Design (design system project)"
  berisi pointer projectId dan cara akses; referensi Figma diganti.
* `context/ctx-design.md` — menambah pointer Claude Design di tabel baca dulu
  dan dua aturan operasional baru (butir 10–11) soal akses via `DesignSync`
  dan sinkronisasi manual/on-request.

---

## 2026-07-23 — Konfigurasi Dasar Claude Code

### Added

* `CLAUDE.md` mengimpor `AGENTS.md` sebagai instruksi project pada setiap sesi
  Claude Code tanpa menduplikasi aturan.
* `.claude/settings.json` menambahkan schema resmi dan menolak pembacaan file
  env, private key, serta file kredensial.

### Changed

* `.gitignore` mengabaikan `.claude/settings.local.json` dan `CLAUDE.local.md`
  yang bersifat lokal serta tidak boleh dibagikan melalui repository.

---

## 2026-07-23 — Dukungan Agent Skills untuk Claude Code

### Added

* Menambahkan proyeksi project-level di `.claude/skills/` untuk 14 skill vendor
  resmi dari Better Auth, Prisma, Supabase, dan Vercel.
* Menautkan tiga skill internal (`project-os-navigator`,
  `proactive-clarification`, dan `work-report-simple`) ke sumber kanonikal di
  `.agents/skills/` agar perubahan otomatis tersedia untuk Claude Code.

### Verification

* Skills CLI mendeteksi seluruh 17 skill sebagai skill project untuk Claude
  Code.

---

## 2026-07-23 — Perbaikan Status Dinamis di AGENTS.md

### Fixed

* Menghapus status M7/M8 dan pembatasan fase aktif dari `AGENTS.md` karena file
  tersebut merupakan Static Reference.
* Section mode kerja kini hanya mengarahkan agent ke `PROJECT_STATE.md` sebagai
  satu-satunya Source of Truth untuk fase, objective, izin, dan pembatasan
  terkini.

---

## 2026-07-23 — Aturan Workflow Astryx untuk Agent

### Added

* `AGENTS.md` mewajibkan agent membaca template, skeleton, dokumentasi komponen,
  styling, dan tokens melalui CLI Astryx lokal sebelum menulis UI.
* CLI lokal ditetapkan sebagai referensi utama agar dokumentasi selalu sesuai
  exact version Astryx yang terpasang dan agent tidak menebak props.

---

## 2026-07-23 — Pembersihan Artefak UI Lama

### Removed

* Skill UI lama dari `.agents/skills/`.
* Entri skill terkait dari `skills-lock.json`.
* Referensi operasional skill lama di `AGENTS.md` dan `PROJECT_STATE.md`.

### Verification

* Tidak ada package, konfigurasi `components.json`, komponen, atau import runtime
  UI lama di aplikasi.
* Referensi pada ADR dan catatan diskusi dipertahankan sebagai riwayat keputusan,
  bukan dependency aktif.

---

## 2026-07-23 — Instalasi & Smoke Test Astryx

### Added

* Dependency Astryx dipasang dengan exact pin: Core, Neutral Theme, dan CLI
  `0.1.8`, serta StyleX `0.19.0`.
* Provider global Astryx dengan neutral theme dan integrasi router-aware
  Next.js Link.
* Halaman smoke test untuk Button, Dialog, TextInput, Table, light mode, dark
  mode, serta Tailwind token bridge.
* Script `astryx` dan konfigurasi theme package untuk CLI diagnostics.

### Changed

* Global CSS memakai cascade layer resmi Astryx + Tailwind dan token bridge.
* Root layout sekarang membungkus aplikasi dengan Astryx provider.
* `PROJECT_STATE.md` dan `TEMP-project-owner-questions.md` diperbarui untuk
  menandai implementasi fondasi dan smoke test ADR-041 selesai.

### Verification

* Astryx doctor: 5 pass, 0 warning.
* Typecheck, lint, dan 3 test lulus.
* Next.js `16.2.10` production build lulus dengan env placeholder non-rahasia.
* Browser smoke test lulus untuk render light/dark, input, table, dan interaksi
  buka/tutup dialog beserta focus management.

### Status

Fondasi Astryx ADR-041 siap digunakan untuk M8 Development. Astryx tetap Beta,
sehingga exact pin dan verifikasi ulang saat upgrade tetap wajib.

---

## 2026-07-23 — Alignment Engineering & AI Context ADR-041

### Changed

* Engineering Baseline (`monorepo-setup.md`, `dependency-strategy.md`,
  `design-tokens.md`, dan `06-engineering/README.md`) — Astryx permanen,
  neutral theme selama M8, Tailwind layout-only, wrapper selektif, design-later
  workflow, exact pin Beta, dan smoke test gate.
* `PROJECT_OVERVIEW.md` — stack UI diperbarui dari shadcn/ui Planned menjadi
  Astryx (ADR-041) + Tailwind layout-only.
* `AGENTS.md` — stack cepat, hard rule UI, dan mapping task UI diarahkan ke
  Astryx serta baseline ADR-041.
* `context/ctx-design.md`, `ctx-technical-context.md`,
  `ctx-implementation.md`, dan `ctx-development.md` — aturan operasional agent
  diselaraskan dengan component boundary, dependency guardrail, dan alur
  designer setelah feature selesai.
* `PROJECT_STATE.md` — alignment ADR-041 ditandai selesai; instalasi dan smoke
  test Astryx tetap next task.

### Status

Alignment dokumentasi ADR-041 selesai. Kode aplikasi dan dependency belum
diubah; langkah berikutnya adalah instalasi dan smoke test Astryx pada Next.js
16.

---

## 2026-07-23 — Astryx UI Foundation (ADR-041)

### Added

* ADR-041 — Astryx menggantikan shadcn/ui sebagai fondasi component system
  permanen; neutral theme digunakan selama feature development dan designer
  menetapkan visual system final setelah feature selesai.
* Guardrail adopsi Astryx Beta — exact stable version, upgrade core+theme
  bersamaan, tanpa canary/swizzle awal, wrapper selektif, update manual,
  staging, dan smoke test Next.js 16.

### Changed

* ADR-035 diamendemen dengan pengecualian exact version untuk paket Astryx
  selama masih Beta.
* ADR-038 diamendemen pada urutan kerja: implementasi feature tidak menunggu
  design final; design tokens tetap Draft/TBD sampai designer masuk.
* `PROJECT_STATE.md` — next tasks alignment dan smoke test Astryx, Known Issue
  Beta/Next.js 16, serta Recent Decision ADR-041 ditambahkan.
* `TEMP-project-owner-questions.md` — diskusi UI component system ditandai
  selesai dan dipindahkan ke ADR-041.
* `CONVERSATIONS.md` — konteks keputusan design-later dan boundary styling
  dicatat.

### Status

Keputusan ADR-041 sudah Accepted. Alignment baseline, instalasi dependency, dan
smoke test belum dikerjakan.

---

## 2026-07-23 — Penyelarasan Kontrak Outstand (ADR-040)

### Added

* ADR-040 — kontrak resmi Outstand untuk webhook, Engagement, media, dan X BYOK.
* Migrasi Prisma `20260723121000_align_outstand_contract` — durable receipt
  `outstand_webhook_events`, reconnect state, metadata working copy media
  Outstand, serta idempotency Engagement per akun.
* Shared enum `EngagementType.Comment` untuk scope MVP.

### Changed

* Product, User, dan UX Baseline — Engagement MVP dibatasi ke komentar/reply
  melalui sync 30 menit + manual refresh; Direct Message, mention, dan webhook
  Engagement dikeluarkan dari MVP.
* Architecture dan Engineering Baseline — event resmi
  `post.published`/`post.error`/`account.token_expired`, durable-before-ACK,
  `outstand.webhook.process`, upload working copy media Outstand, serta
  konfigurasi X BYOK manual di dashboard Outstand.
* Prisma schema — menambahkan durable webhook receipt, reconnect state, metadata
  media Outstand, URL media cache nullable, dan constraint Engagement
  comments-only.
* Design handoff — Comments Inbox, manual refresh, dan status last sync
  diselaraskan tanpa mengubah visual token.

* `ARCHITECTURE_OVERVIEW.md` — diagram dan runtime flow diselaraskan untuk tiga
  webhook resmi, durable-before-ACK, retry internal, Engagement sync 30 menit +
  manual refresh, media working copy Outstand, dan X BYOK manual.
* `PROJECT_STATE.md` — metadata, completion alignment dokumen+schema, next tasks,
  known issues, dan recent decisions diperbarui tanpa mengklaim runtime sudah
  diimplementasikan.
* `context/ctx-project.md`, `ctx-business.md`, `ctx-domain.md`,
  `ctx-architecture.md`, `ctx-technical-context.md`, dan
  `ctx-implementation.md` — pointer dan guardrail M8 diperbarui agar agent tidak
  memakai kontrak Outstand lama.
* `TEMP-project-owner-questions.md` — section 3–5 ditandai selesai dan sudah
  dipindahkan ke ADR-040/baseline; catatan historis dipertahankan dan section
  landing/UI Astryx yang masih terbuka tidak diubah.

### Status

Alignment dokumentasi baseline dan schema/migration ADR-040 sudah selesai.
Implementasi handler, adapter, job, sync, dan UI tetap M8 pending.

---

## 2026-07-21 (sesi kelima puluh dua)

### Added — Content Format MVP: Post / Reel / Story / Pin (ADR-039)

* ADR-039 — format publikasi per `PostTarget` masuk Must Have MVP; matriks IG/FB vs TikTok vs Pinterest.
* `ContentFormat` enum di `packages/shared` (`post | reel | story | pin`).
* Migrasi Prisma `20260721140000_add_content_format` — kolom `content_format`, `platform_options` pada `publishing_post_targets`.

### Changed

* Product: `mvp-definition.md`, `feature-modules.md`, `feature-priority.md`, `product-scope.md`.
* Architecture: `domain-model.md`, `integration-layer.md`, `database-strategy.md`.
* UX: `key-screen-patterns.md` (KSP-05-F11, KSP-D12), `information-architecture.md` (IA tree + pemetaan fitur), `user-flows.md` (UF-01).
* Architecture: `application-layer.md`, `ARCHITECTURE_OVERVIEW.md` — Format di Publishing.
* Product: `release-roadmap.md` v0.2.
* Context: `ctx-domain.md`, `ctx-design.md`.
* `design/DESIGN_OVERVIEW.md` + `DESIGN_BRIEF.md` — catatan format di Draft Editor (handoff designer).
* `PROJECT_STATE.md`, `CONVERSATIONS.md` — keputusan + next task implementasi UI format.

### Consistency fix (review ADR-039)

* Klarifikasi default Pinterest `pin` vs default kolom DB `post` (fallback teknis; Application Service wajib set nilai bisnis).
* Definisi bentuk `PlatformPublishOptions` (JSON, bukan enum shared).
* Renomori fungsi UX: Content Format Selector = `KSP-05-F11` (bukan F04b).
* UF-01 & confirmation summary menyertakan format per akun.

---

## 2026-07-21 (sesi kelima puluh satu)

### Added — Design Tokens SoT + alur lock (ADR-038)

* `product-discovery/06-engineering/design-tokens.md` — template SoT visual tokens (font, brand/neutral/status/feedback, spacing, tema) + **panduan PM** saat design siap; status Draft / nilai `TBD`.
* ADR-038 di `DECISIONS.md` — lokasi SoT token di Engineering; `design/` bukan SoT; isi setelah design approve lalu mirror ke `apps/web`.

### Changed

* `product-discovery/06-engineering/README.md` — daftar dokumen + scope + decision rules untuk design tokens.
* `design/README.md` — pointer SoT token ke `design-tokens.md`.
* `context/ctx-technical-context.md`, `context/ctx-design.md` — pointer token ke Engineering.
* `PROJECT_STATE.md`, `CONVERSATIONS.md` — next task + log keputusan ADR-038.

---

## 2026-07-21 (sesi kelima puluh)

### Added — SocialPlatform: Threads & Pinterest (ADR-037)

* `threads` dan `pinterest` ditambahkan ke enum `SocialPlatform` di `packages/shared/src/enums.ts`.
* ADR-037 di `DECISIONS.md` — perluasan aditif daftar platform yang didukung.

### Changed

* `product-discovery/05-architecture/domain-model.md` — Shared Types `SocialPlatform` + deskripsi field platform.
* `product-discovery/05-architecture/integration-layer.md` — daftar platform eksternal.
* `project-manager/ARCHITECTURE_OVERVIEW.md` — daftar platform di System Context.
* `product-discovery/04-ux/user-flows.md` dan `key-screen-patterns.md` — daftar platform di UI connect/selector.
* `PROJECT_OVERVIEW.md` — catatan daftar platform yang didukung.
* `CONVERSATIONS.md`, `PROJECT_STATE.md` — log keputusan ADR-037.

---

## 2026-07-17 (sesi keempat puluh sembilan)

### Added — AI Context layer (opsi A)

* `context/README.md` — tujuan, struktur, batas keras antar file, cara pakai agent.
* `context/ctx-project.md` — Project OS, state, rules, ADR.
* `context/ctx-business.md` — Business + Product + User (gap opsi A ditutup tanpa file baru).
* `context/ctx-domain.md` — BC, shared types, boundary rules.
* `context/ctx-architecture.md` — layer, ACL, jobs, auth arch, realtime, DB strategy.
* `context/ctx-technical-context.md` — stack, env, Prisma, Better Auth, deploy/CI.
* `context/ctx-development.md` — DX, perintah, **aturan coding/konvensi**.
* `context/ctx-implementation.md` — pola implementasi di `apps/web` / `domains/`.
* `context/ctx-design.md` — `design/` + pointer UX (`04-ux/`).

### Changed

* `AGENTS.md` — `context/` aktif (bukan “direncanakan”); mapping task → `ctx-*` + baseline; step sesi baca `context/`.
* `README.md` — pointer AI Context ke `context/README.md`.
* `PROJECT_STATE.md` — scaffold selesai; next focus M8 Development.
* `CONVERSATIONS.md` — log keputusan opsi A.

---

## 2026-07-17 (sesi keempat puluh delapan)

### Added — Official agent skills (vendor)

* Prisma: `prisma-cli`, `prisma-client-api`, `prisma-database-setup`, `prisma-upgrade-v7` (`prisma/skills`).
* Better Auth: `better-auth-best-practices`, `create-auth`, `better-auth-security-best-practices`, `email-and-password-best-practices` (`better-auth/skills`).
* Vercel: `vercel-react-best-practices`, `vercel-composition-patterns`, `vercel-optimize`, `web-design-guidelines` (`vercel-labs/agent-skills`).
* Supabase: `supabase`, `supabase-postgres-best-practices` (`supabase/agent-skills`).
* shadcn/ui: `shadcn` (`shadcn/ui`).
* `skills-lock.json` — lock hash skill terpasang.

### Notes

* Skill deploy-Vercel / React Native / 2FA / organization / migrate-radix-to-base / Prisma Postgres tidak dipasang (di luar stack MVP).

---

## 2026-07-17 (sesi keempat puluh tujuh)

### Added

* `AGENTS.md` di root — pintu masuk AI coding agent (Source of Truth pointers, skills wajib, hard rules, mapping task → dokumen).

### Changed

* `PROJECT_STATE.md` — catat rencana AI Context layer (`context/` + `ctx-*.md`); `AGENTS.md` masuk Completed; next task scaffold `context/`.
* `CONVERSATIONS.md` — log keputusan struktur AI Context mengikuti screenshot referensi user.

### Notes

* Folder `context/` kemudian di-scaffold pada sesi keempat puluh sembilan (opsi A).

---

## 2026-07-17 (sesi keempat puluh enam)

### Changed — Prisma 7 datasource config

* `schema.prisma` — hapus `url`/`directUrl` dari datasource (tidak didukung Prisma 7).
* Tambah `apps/web/prisma.config.ts` — CLI migrate memakai `DIRECT_URL` (DO-D04).
* `src/lib/prisma/client.ts` — `PrismaClient` via `@prisma/adapter-pg` + pooled `DATABASE_URL`.
* Generator `prisma-client` → output `src/generated/prisma` (gitignored).
* Upgrade deps ke Prisma 7.8 + `pg` / `@prisma/adapter-pg`.
* Update cuplikan di `database-orm.md` agar selaras Prisma 7 (semantik DO-D04 tetap).

### Notes

* Error IDE “`url` is no longer supported in schema files” terselesaikan dengan migrasi ke pola Prisma 7.
* Verifikasi: `prisma validate`, `typecheck`, `lint`, `build` hijau.

---

## 2026-07-17 (sesi keempat puluh lima)

### Added — M7 Prisma, Better Auth, env, CI (M7 selesai)

* `apps/web/prisma/schema.prisma` — identity_* + domain MVP + `background_jobs`; migrasi `20260717100000_init`.
* `apps/web/src/lib/prisma/client.ts` — singleton PrismaClient.
* `apps/web/src/lib/better-auth/auth.ts` — Better Auth + Prisma adapter; `supabase-jwt.ts` (AS-D03).
* `apps/web/src/lib/supabase/{client,server,middleware}.ts` — stubs Realtime/Storage (DO-D02).
* `apps/web/src/lib/env.ts` — fail-fast required server vars (EM-D05).
* `apps/web/.env.example` — katalog env (EM-D04).
* `.github/workflows/ci.yml` — quality gates CI-D02.
* Route `/api/auth/[...all]` di-wire ke Better Auth (`toNextJsHandler`).

### Changed

* `apps/web/package.json` — deps Prisma 6.x, better-auth, @supabase/supabase-js, jose; script `db:*` + `postinstall` generate.
* `README.md` — setup env/migrate; hapus “Remaining M7”.
* `PROJECT_STATE.md` — Version 1.0.2 → 1.0.3; M7 ✅ Completed; fokus → M8.
* `PROJECT_OVERVIEW.md` — Status `Planning` → `Active` (hilangkan living-state stale).

### Notes

* Verifikasi: `typecheck`, `lint`, `test`, `format:check`, `build` hijau.
* Semantik DO-D04 tetap (`DATABASE_URL` pooled + `DIRECT_URL` migrate); di Prisma 7 URL tidak lagi di `schema.prisma` (lihat sesi keempat puluh enam).
* Email verification sementara off (AS-D04); RLS policies SQL belum di migrasi awal.
* Belum: initial git commit (menunggu instruksi).

---

## 2026-07-17 (sesi keempat puluh empat)

### Added — M7 DX tooling

* Root: `eslint.config.mjs`, `prettier.config.mjs`, `.prettierignore`, `vitest.config.ts`, `lefthook.yml`.
* Root scripts: `lint`, `lint:fix`, `format`, `format:check`, `test`, `test:watch`, `db:*`, `prepare` (Lefthook).
* `packages/shared/src/enums.test.ts` — smoke test Vitest.
* `git init` di root (branch `main`) agar pre-commit hooks aktif.

### Changed

* `dx-tooling.md` — DX-D06 (Vitest di root) dan DX-D07 (Lefthook via `prepare`) dikunci.
* `apps/web/package.json` — ESLint dipindah ke root; script `db:*` disiapkan untuk Prisma.
* `README.md` — dokumentasi script DX dan setup hooks.
* `PROJECT_STATE.md` — Version 1.0.1 → 1.0.2; M7 progress ~60%.

### Notes

* Verifikasi: `bun run lint`, `format:check`, `test`, `typecheck` hijau.
* Belum: Prisma, Better Auth, `.env.example`, CI, initial git commit.

---

## 2026-07-17 (sesi keempat puluh tiga)

### Added — M7 slice B: Hybrid Monorepo inti

* Root Bun Workspaces: `package.json`, `tsconfig.json`, `.gitignore`, `README.md`, `bun.lock`.
* `apps/web` (`@social/web`) — Next.js App Router, placeholder routes sesuai IA, 9 domain modules MVP, `src/lib/` stubs, middleware skeleton.
* `packages/shared` (`@social/shared`) — branded IDs, enums (`ContentStatus`, `MemberRole`, `SocialPlatform`, `WorkspacePlan`), value objects.

### Changed

* `environment-management.md` — EM-D04 dikunci: lokasi env di `apps/web/` (bukan root). Catatan: `05-architecture/README.md` tidak mengatur lokasi env (di luar scope Architecture).
* `PROJECT_STATE.md` — Version 1.0.0 → 1.0.1; M7 progress ~35%; Next Tasks digeser ke DX / Prisma / Auth / CI / git init.

### Notes

* Verifikasi: `bun run typecheck` dan `bun run build` hijau.
* Belum: DX tooling, Prisma, Better Auth, `.env.example`, CI, `git init` di root.

---

## 2026-07-17 (sesi keempat puluh dua)

### Changed

* `PROJECT_OVERVIEW.md` — preferensi kerja: perubahan di `design/` tidak dicatat di `CHANGELOG.md` / `PROJECT_STATE.md` (ruang operasional desain, bukan tracking development).

---

## 2026-07-17 (sesi keempat puluh satu)

### Added

* `project-manager/ARCHITECTURE_OVERVIEW.md` — High-Level Architecture Overview (2 frame Figma: System Context & Containers + Internal Layers & Domains), disintesis dari Architecture Baseline v1.0 dan Engineering Baseline v1.0.

### Changed

* `project-manager/README.md` — menambahkan `ARCHITECTURE_OVERVIEW.md` ke folder structure & Core Documents; klarifikasi pengecualian ringkasan visual vs SoT di product-discovery.
* `project-manager/PROJECT_OVERVIEW.md` — Related Documents merujuk `ARCHITECTURE_OVERVIEW.md` dan architecture README.
* `project-manager/PROJECT_RULES.md` — `ARCHITECTURE_OVERVIEW.md` diklasifikasikan sebagai Static Reference.
* `.agents/skills/project-os-navigator/SKILL.md` — File Map memuat `ARCHITECTURE_OVERVIEW.md`.
* `PROJECT_STATE.md` — mencatat penambahan Architecture Overview.

---

## 2026-07-17 (sesi keempat puluh)

### Added — ADR-036 Engineering Planning Baseline v1.0

* `project-manager/DECISIONS.md` — ADR-036: seluruh 8 dokumen `product-discovery/06-engineering/` ditetapkan sebagai Engineering Planning Baseline v1.0 setelah ENG-REVIEW-01 s/d ENG-REVIEW-06 Fixed.

### Changed

* `PROJECT_STATE.md` — Version 0.9.7 → 1.0.0; M6 ditutup (✅ Completed); M7 dibuka (🟡 In Progress); phase → Phase 5 — Repository & Bootstrap; Active Conversation Mode → Repository & Bootstrap (bootstrap diizinkan; feature implementation tetap dibatasi); Next Tasks diganti ke inisialisasi monorepo/tooling.
* `.agents/skills/project-os-navigator/SKILL.md` — referensi folder UX / Architecture / Engineering diperbarui ke Baseline v1.0 (menghapus status living "in progress" / "pending" yang melanggar Document Type Classification).

---

## 2026-07-17 (sesi ketiga puluh sembilan)

### Fixed — Engineering Planning Review: ENG-REVIEW-01 s/d ENG-REVIEW-06

**ENG-REVIEW-01 — `monorepo-setup.md`** (Major):
* Ditambahkan `api/jobs/run/route.ts` pada pohon App Router — selaras `deployment-infrastructure.md`, `background-jobs.md`, `auth-architecture.md`.

**ENG-REVIEW-02 — `monorepo-setup.md`** (Major):
* Ditambahkan `api/auth/[...all]/route.ts` (Better Auth catch-all) + catatan bypass Middleware untuk `/api/auth/*` dan `/api/jobs/*`.

**ENG-REVIEW-03 — `auth-strategy.md`** (Major):
* Cookie `Secure` / `useSecureCookies` dibuat env-aware: `false` di local HTTP, `true` di staging/production HTTPS — selaras `environment-management.md`.

**ENG-REVIEW-04 — `monorepo-setup.md`** (Minor):
* Klarifikasi 9 domain modules MVP; BC-10 Billing post-MVP tanpa folder `src/domains/billing/` (route Settings → Billing tetap placeholder).

**ENG-REVIEW-05 — `cicd-pipeline.md`** (Minor):
* Urutan CI-D02 di tabel keputusan diselaraskan: `install → prisma generate → prisma validate → typecheck → lint → test`.

**ENG-REVIEW-06 — `monorepo-setup.md`** (Minor):
* Komentar IR-03 diganti ke `PrismaPostRepository` / larangan import `prisma` client di domain (ADR-031).

### Changed

* `PROJECT_STATE.md` — Version 0.9.6 → 0.9.7, progress 96% → 97%; ENG-REVIEW Fixed; Next: Baseline v1.0.

---

## 2026-07-17 (sesi ketiga puluh delapan)

### Changed — Engineering Planning Review (M6)

* Review konsistensi lintas 8 dokumen `product-discovery/06-engineering/` terhadap sesama dokumen M6, Architecture Baseline (ADR-025), dan ADR-028 s/d ADR-035.
* **6 temuan** dicatat di `PROJECT_STATE.md` Known Issues sebagai ENG-REVIEW-01 s/d ENG-REVIEW-06 (belum diperbaiki).
* `PROJECT_STATE.md` — Version 0.9.5 → 0.9.6, progress 95% → 96%; fokus bergeser ke perbaikan temuan review sebelum Baseline v1.0.

---

## 2026-07-17 (sesi ketiga puluh tujuh)

### Added — Dokumen M6: dependency-strategy.md

* `product-discovery/06-engineering/dependency-strategy.md` — dokumen kedelapan (terakhir) M6 Engineering Planning:
  * Version ranges eksternal **caret (`^`)**; resolusi dikunci lockfile (DS-D01).
  * Update dependency **manual**; tanpa Renovate/Dependabot di MVP (DS-D02).
  * Satu **`bun.lockb` di root**, commit wajib, frozen install di CI (DS-D03).
  * Penempatan: root = tooling; `apps/web` = runtime; `@social/shared` tanpa runtime deps (DS-D04).
  * Shared packages: hanya `@social/shared` di MVP; package baru butuh alasan kuat (DS-D05).
  * Tanpa Bun Catalog di MVP (DS-D06).
  * Decision Log DS-D01 s/d DS-D06.

### Added — ADR-035

* `project-manager/DECISIONS.md` — ADR-035: Dependency Strategy — caret ranges, manual updates, root lockfile rules.

### Changed

* `PROJECT_OVERVIEW.md` — Technical Overview: baris Dependencies.
* `product-discovery/06-engineering/README.md` — deskripsi `dependency-strategy.md`; Decision Rules dependency strategy.
* `dx-tooling.md`, `monorepo-setup.md` — Related Documents menunjuk ke `dependency-strategy.md` / ADR-035.
* `PROJECT_STATE.md` — Version 0.9.4 → 0.9.5, progress 93% → 95%; 8/8 dokumen M6 selesai; Next: Engineering Planning Review.

---

## 2026-07-17 (sesi ketiga puluh enam)

### Added — Dokumen M6: environment-management.md

* `product-discovery/06-engineering/environment-management.md` — dokumen keenam M6 Engineering Planning:
  * Supabase **Cloud-first** untuk local/staging/production; self-host ditunda sampai skema stabil (EM-D01).
  * Local memakai project Cloud terpisah **`social-media-local`** (EM-D02).
  * Secret management **native**: Railway Variables + Supabase dashboard + `.env.local` (EM-D03, EM-D04).
  * Katalog env vars server/client, validasi fail-fast, isolasi kredensial antar tier (EM-D05, EM-D06).
  * Decision Log EM-D01 s/d EM-D06.

### Added — Dokumen M6: dx-tooling.md

* `product-discovery/06-engineering/dx-tooling.md` — dokumen ketujuh M6 Engineering Planning:
  * **ESLint + Prettier** untuk lint/format (DX-D01).
  * **Lefthook + lint-staged** untuk pre-commit (DX-D02).
  * **Vitest** sebagai test runner (`bun run test`) (DX-D03).
  * Kontrak script root + checklist local setup (DX-D04, DX-D05).
  * Decision Log DX-D01 s/d DX-D05.

### Added — ADR-033, ADR-034

* `project-manager/DECISIONS.md` — ADR-033 (Environment Management), ADR-034 (DX Tooling).

### Changed

* `PROJECT_OVERVIEW.md` — Technical Overview: Lint/Format, Pre-commit, Test Runner, Env/Secrets.
* `product-discovery/06-engineering/README.md` — deskripsi `environment-management.md` dan `dx-tooling.md`.
* `deployment-infrastructure.md`, `auth-strategy.md`, `database-orm.md`, `cicd-pipeline.md`, `monorepo-setup.md` — referensi ke ADR-033/034; target DB lokal dikunci ke `social-media-local`.
* `PROJECT_STATE.md` — Version 0.9.3 → 0.9.4, progress 91% → 93%; 7/8 dokumen M6; Next: `dependency-strategy.md`.

---

## 2026-07-17 (sesi ketiga puluh lima)

### Added — Dokumen M6: cicd-pipeline.md

* `product-discovery/06-engineering/cicd-pipeline.md` — dokumen kelima M6 Engineering Planning:
  * **GitHub Actions** sebagai CI (CI-D01); gates PR: install → prisma generate/validate → typecheck → lint → test (CI-D02).
  * Promosi kode: `feature/*` → `staging` → `main` (CI-D03).
  * CD tetap **Railway auto-deploy** (CI-D04, selaras DI-D05).
  * `prisma migrate deploy` di Railway release/pre-start per environment (CI-D05).
  * Secret sensitif tidak di PR CI (CI-D06).
  * Decision Log CI-D01 s/d CI-D06.

### Added — ADR-032

* `project-manager/DECISIONS.md` — ADR-032: CI/CD Pipeline — GitHub Actions gates + Railway deploy + migrate on release.

### Changed

* `PROJECT_OVERVIEW.md` — Technical Overview: baris `CI | GitHub Actions`.
* `product-discovery/06-engineering/README.md` — deskripsi `cicd-pipeline.md`.
* `deployment-infrastructure.md` / `database-orm.md` — referensi ke ADR-032 / CI-D05.
* `PROJECT_STATE.md` — Version 0.9.2 → 0.9.3, progress 89% → 91%; 5/8 dokumen M6; Next: `environment-management.md`.

---

## 2026-07-17 (sesi ketiga puluh empat)

### Added — Dokumen M6: database-orm.md

* `product-discovery/06-engineering/database-orm.md` — dokumen keempat M6 Engineering Planning:
  * **Prisma** sebagai ORM formal; repository implementations memakai Prisma Client (DO-D01).
  * Batas Supabase client: hanya Realtime + Storage, bukan CRUD domain (DO-D02).
  * **Prisma Migrate** sebagai sumber kebenaran migrasi; alur staging → production (DO-D03).
  * Connection pooling via Supabase Supavisor: `DATABASE_URL` (pooled) + `DIRECT_URL` (migrate) (DO-D04).
  * Better Auth via Prisma adapter; model `identity_*` di schema yang sama (DO-D05).
  * RLS defense-in-depth via `SET LOCAL app.current_user_id` melalui Prisma (DO-D06).
  * Decision Log DO-D01 s/d DO-D06.

### Added — ADR-031

* `project-manager/DECISIONS.md` — ADR-031: Prisma sebagai ORM formal; mengamandemen ADR-017 (implementasi repository dari Supabase client → Prisma).

### Changed — Sinkronisasi dokumen terdampak Prisma

* `DECISIONS.md` — ADR-017 di-amandemen (status + decision text).
* `PROJECT_OVERVIEW.md` — Technical Overview: `ORM | Prisma`; Data Access = Prisma (CRUD) + Supabase client (Realtime, Storage).
* `product-discovery/06-engineering/README.md` — deskripsi `database-orm.md` dan baris Repository Pattern di tabel input.
* `product-discovery/06-engineering/monorepo-setup.md` — `src/lib/prisma/`, repositories Prisma-based, batas Supabase client.
* `product-discovery/06-engineering/auth-strategy.md` — Prisma adapter, Konteks 1 via Prisma, AS-D01 diselaraskan.
* `product-discovery/05-architecture/application-layer.md` — repository via Prisma Client (ADR-031).
* `product-discovery/05-architecture/database-strategy.md` — Migration Strategy tooling diganti ke Prisma Migrate.

### Changed — PROJECT_STATE.md

* Version 0.9.1 → 0.9.2, Overall Progress 87% → 89%.
* Completed: `database-orm.md`; In Progress: 4/8 dokumen M6; Next: `cicd-pipeline.md`.
* Recent Decisions: ADR-031.

---

## 2026-07-17 (sesi ketiga puluh tiga)

### Added — Dokumen M6: deployment-infrastructure.md

* `product-discovery/06-engineering/deployment-infrastructure.md` — dokumen kedua M6 Engineering Planning:
  * Keputusan region: **Singapore / Southeast Asia** — Railway + Supabase co-located untuk latency terendah ke target market Indonesia (DI-D01).
  * Topologi environment: **Production + Staging** (dua tier persisten), branch `main`→prod, `staging`→staging (DI-D02, DI-D05).
  * Supabase project terpisah per environment untuk isolasi data penuh (DI-D03).
  * Arsitektur Railway: dua service per environment — `web` (Next.js) + `cron` (trigger background jobs, selaras ADR-022) (DI-D04).
  * Build & deploy pipeline untuk monorepo Bun, strategi domain/TLS, scaling MVP (single instance, stateless), dan rollback (expand-and-contract) (DI-D06).
  * Decision Log DI-D01 s/d DI-D06.

### Added — Dokumen M6: auth-strategy.md

* `product-discovery/06-engineering/auth-strategy.md` — dokumen ketiga M6 Engineering Planning:
  * Konfigurasi instance Better Auth (database Supabase, prefix `identity_`, database session) (AS-D01, AS-D02).
  * Provider MVP: email + password (dengan verifikasi email) + Google OAuth, redirect URI per environment (AS-D05).
  * Atribut session cookie (HttpOnly, Secure, SameSite=lax, expiry 7 hari).
  * **Dual-context RLS**: server-side via service role + `app.current_user_id`; Supabase Realtime via JWT Supabase-compatible (HS256, `sub=userId`) agar `auth.uid()` valid — menkonkretkan ARCH-REVIEW-02 (AS-D03).
  * Konfigurasi auth per environment dan security considerations.
  * Dependency terbuka dicatat: transactional email provider untuk password reset/verification belum ditetapkan (AS-D04).
  * Decision Log AS-D01 s/d AS-D05.

### Added — ADR-028, ADR-029, ADR-030

* `project-manager/DECISIONS.md`:
  * **ADR-028** — Deployment Region: Singapore/Southeast Asia, Railway + Supabase co-located.
  * **ADR-029** — Environment Topology: Production + Staging dengan Supabase project terisolasi.
  * **ADR-030** — Auth Implementation: Better Auth config + Supabase JWT integration untuk Realtime.

### Changed — PROJECT_STATE.md

* Version 0.9.0 → 0.9.1, Last Updated → 2026-07-17, Overall Progress 85% → 87%.
* Completed: menambahkan `deployment-infrastructure.md` dan `auth-strategy.md`.
* In Progress: M6 kini 3 dari 8 dokumen selesai; dokumen berikutnya `database-orm.md`.
* Next Tasks: menghapus dua dokumen yang sudah selesai.
* Recent Decisions: menambahkan ADR-028, ADR-029, ADR-030.
* Known Issues: mencatat dependency terbuka transactional email provider (AS-D04).

---

## 2026-07-15 (sesi ketiga puluh dua)

### Fixed — Sinkronisasi PM dengan Keputusan Arsitektur Terbaru

Audit konsistensi seluruh dokumen `project-manager/` terhadap keputusan yang sudah ditetapkan (ADR-014 s/d ADR-026). Ditemukan dan diperbaiki 4 inkonsistensi:

* `project-manager/PROJECT_OVERVIEW.md` — Technical Overview: baris `ORM | Prisma` dihapus (asumsi prematur yang bertentangan dengan ADR-017). Diganti `Data Access | Supabase client *(ORM formal TBD — M6)*` sesuai keputusan arsitektur. Ditambahkan baris yang sebelumnya tertinggal: `Auth | Better Auth` (ADR-024), `Storage | Supabase Storage`, `Deployment | Railway`.
* `product-discovery/06-engineering/README.md` — daftar dokumen: `database-orm.md — ORM (Prisma)` diselaraskan menjadi strategi akses data via Supabase client (ADR-017) dengan pilihan ORM formal masih TBD — menghapus asumsi Prisma yang bocor.

### Added — ADR-027

* `project-manager/DECISIONS.md` — ADR-027: Amandemen ADR-014, mencatat pengecualian penamaan tabel aggregate root (`workspaces`, `notifications`) yang sebelumnya hanya ada di CHANGELOG sesi ke-29 dan belum terdokumentasi sebagai keputusan. Menutup gap traceability.

### Changed — PROJECT_STATE.md

* Recent Decisions: ditambahkan ADR-027.

---

## 2026-07-15 (sesi ketiga puluh satu)

### Fixed — Cleanup Dokumentasi project-manager/

* `project-manager/PROJECT_STATE.md` — menghapus 11 item strikethrough (`~~done~~`) dari section **Next Tasks** yang sudah tidak relevan (seluruh topik M5 + monorepo-setup.md sudah tercatat di section Completed). Next Tasks kini hanya berisi task yang benar-benar pending.
* `project-manager/PROJECT_OVERVIEW.md` — memperbaiki inkonsistensi: kolom Database di Technical Overview diperbarui dari `PostgreSQL *(Planned)*` menjadi `Supabase PostgreSQL`, sesuai keputusan yang sudah ditetapkan di CONVERSATIONS (sesi ke-20) dan ADR-015 (Database Strategy Baseline v1.0). Last Updated diperbarui ke 2026-07-15.

---

## 2026-07-15 (sesi ketiga puluh)

### Added

* ADR-025 di `DECISIONS.md` — System Architecture Baseline v1.0 ditetapkan untuk `product-discovery/05-architecture/`.

### Changed

* `PROJECT_STATE.md` — M5 ditutup (✅ Completed), M6 dibuka (🟡 In Progress), phase diperbarui ke Phase 4 — Engineering Planning, progress ke 85%, Active Conversation Mode diperbarui ke Engineering Planning, Next Tasks diperbarui untuk seluruh 8 dokumen M6.
* `product-discovery/06-engineering/README.md` — bagian "Input dari Fase Sebelumnya — Dari System Architecture" diperbarui: ditambahkan tabel 14 keputusan konkret dari System Architecture Baseline v1.0 sebagai constraint langsung untuk Engineering Planning.
* `project-manager/PROJECT_STATE.md` — ADR-026 ditambahkan ke Recent Decisions, monorepo-setup.md ditandai Done di Next Tasks.

### Added (lanjutan)

* `product-discovery/06-engineering/monorepo-setup.md` — dokumen pertama M6 Engineering Planning: monorepo root structure, Bun Workspaces config, apps/web folder structure, App Router routing (selaras IA), domain modules structure, packages/shared, TypeScript config, import rules (IR-01 s/d IR-05), dan decision log (MS-D01 s/d MS-D05).
* ADR-026 di `DECISIONS.md` — Monorepo Workspace Layout: apps/web, packages/shared, domain modules di src/domains/.

---

## 2026-07-15 (sesi kedua puluh sembilan)

### Changed — Naming Convention Exception: tabel utama tanpa redundansi prefix

**Keputusan:** DB-D01 diperbarui — tabel utama (aggregate root) domain yang namanya identik dengan domain prefix boleh menggunakan nama pendek tanpa prefix.

**Tabel yang diubah:**
* `workspace_workspaces` → `workspaces` (semua FK references diperbarui di `database-strategy.md`)
* `notification_notifications` → `notifications` (semua referensi diperbarui di `database-strategy.md` dan `realtime-strategy.md`)

**Dokumen yang diperbarui:**
* `product-discovery/05-architecture/database-strategy.md` — DB-D01, naming convention section, schema tabel BC-02 & BC-09, FK references, Index Strategy, Traceability, Decision Log
* `product-discovery/05-architecture/realtime-strategy.md` — semua referensi tabel notification

---

## 2026-07-15 (sesi kedua puluh delapan)

### Fixed — Architecture Review: 8 inkonsistensi lintas dokumen diperbaiki

**ARCH-REVIEW-01 — `realtime-strategy.md`** (Critical):
* Nama tabel dikoreksi dari `notifications` menjadi `notification_notifications` (sesuai naming convention domain prefix).
* Schema tabel di realtime-strategy.md diselaraskan dengan database-strategy.md — `payload JSONB` dihapus (fungsi ini sudah ditangani oleh `related_entity_type` + `related_entity_id`).
* Subscription block diperbarui: menambahkan `Table: notification_notifications` secara eksplisit.

**ARCH-REVIEW-02 — `database-strategy.md` + `realtime-strategy.md`** (Major):
* Ditambahkan klarifikasi dua konteks RLS: server-side service role menggunakan `current_setting('app.current_user_id')`, sedangkan Supabase Realtime client menggunakan `auth.uid()` (memerlukan Better Auth + Supabase JWT integration — dikonfigurasi di M6).
* `realtime-strategy.md` menambahkan catatan cross-reference ke `auth-architecture.md` tentang konfigurasi JWT.

**ARCH-REVIEW-03 — `database-strategy.md`** (Major):
* Ditambahkan section baru **System Tables (Cross-cutting Concerns)** yang mendefinisikan tabel `background_jobs`.
* Traceability table diperbarui — menambahkan mapping `background_jobs` sebagai system-level table.

**ARCH-REVIEW-04 — `integration-layer.md`** (Major):
* Publishing flow notes: "URL publik media" dikoreksi menjadi "Signed URL sementara (TTL ~24 jam)" — konsisten dengan database-strategy.md bahwa bucket `media` bersifat Private.
* IL-D07 diperbarui: mencantumkan bahwa signed URL di-generate saat scheduling, bukan URL publik.

**ARCH-REVIEW-05 — `application-layer.md`** (Major):
* Circular dependency Publishing ↔ AI Assistant dieliminasi dari dependency map.
* `BC-04 AI Assistant` tidak memanggil `BC-03 Publishing` — `postId` hanya context data bawaan, bukan service call. Hasil AI diterapkan user via aksi `PublishingService.updateDraft` yang terpisah.
* Ditambahkan rule eksplisit pada "Dependency yang dilarang": AI Assistant tidak boleh memanggil Publishing.

**ARCH-REVIEW-06 — `background-jobs.md`** (Minor):
* JOB-03 (Engagement Sync) handler diperbaiki — tidak lagi membuat JOB-02 (Post Status Notification, payload tidak kompatibel). Diganti dengan direct call ke `NotificationService.notify()` dengan type `engagement.new`, dengan aggregation untuk menghindari spam.

**ARCH-REVIEW-07 — `integration-layer.md`** (Minor):
* Referensi ke tabel `webhook_event_log` (tidak pernah didefinisikan) dihapus. Diganti dengan referensi yang benar ke tabel `background_jobs` dan JOB-01.

**ARCH-REVIEW-08 — `integration-layer.md`** (Minor):
* Retry count webhook dikoreksi dari "maks 5x" menjadi "maks 3x" — konsisten dengan JOB-01 di `background-jobs.md`.

---

## 2026-07-15 (sesi kedua puluh tujuh)

### Added — product-discovery/05-architecture/background-jobs.md

* Dokumen baru: **Background Jobs & Scheduler** — topik #5 M5.
* Arsitektur job queue: PostgreSQL tabel `background_jobs` sebagai sumber kebenaran status job.
* Railway Cron sebagai trigger eksekusi via Route Handler `/api/jobs/run` (dilindungi `X-Job-Secret`).
* 4 job types terdefinisi: `outstand.webhook.retry` (JOB-01), `notification.post_status` (JOB-02), `engagement.sync` (JOB-03), `analytics.sync` (JOB-04).
* Retry strategy: exponential backoff (5m, 15m, 60m), max 3 kali, dead letter via status `failed`.
* Concurrency control: `SELECT FOR UPDATE SKIP LOCKED` — atomic locking native PostgreSQL.
* Integrasi dengan domain: Publishing BC → webhook retry, Workspace BC → engagement sync trigger.
* Decision Log BG-D01 s/d BG-D06.
* ADR-022 (Background Job Strategy: PostgreSQL job queue + Railway Cron).

### Added — product-discovery/05-architecture/realtime-strategy.md

* Dokumen baru: **Real-time Strategy** — topik #6 M5.
* Scope real-time MVP: Supabase Realtime hanya untuk tabel `notifications`; data lain menggunakan manual refresh.
* Notification flow: domain event → JOB-02 → `NotificationService` → INSERT ke `notifications` → Supabase Realtime → client.
* Supabase Realtime subscription: channel per `user_id`, filter INSERT only, RLS menghormati subscription.
* Notification type registry: 4 tipe (`post.published`, `post.failed`, `engagement.new`, `post.scheduled_reminder`).
* Manual refresh patterns: content calendar menggunakan optimistic update + hint dari notifikasi; engagement inbox badge + manual load; analytics on demand.
* Post-MVP considerations: presence, collaborative editing, push notification.
* Decision Log RT-D01 s/d RT-D05.
* ADR-023 (Real-time Strategy: Supabase Realtime untuk notifikasi + manual refresh).

### Added — product-discovery/05-architecture/auth-architecture.md

* Dokumen baru: **Auth Architecture** — topik #7 M5.
* Authentication via Better Auth: Email + Password + Google OAuth untuk MVP.
* Session: HTTP-only cookie (Secure, SameSite=lax, expiry 7 hari), tidak dapat diakses JavaScript browser.
* Workspace context resolution: Middleware membaca workspace slug dari URL, query membership, inject `x-workspace-id` dan `x-workspace-role` sebagai request headers.
* RBAC enforcement: `assertPermission(role, operation)` di Application Service sebelum domain logic; RLS sebagai defense-in-depth.
* Middleware flow: public routes bypass auth; webhook/job routes dilindungi secret; `/dashboard/*` wajib session + workspace membership check.
* Permission matrix ringkasan per role (Owner, Admin, Manager, Creator) untuk operasi kritikal.
* Onboarding flow: user baru tanpa workspace diarahkan ke `/onboarding`.
* Post-MVP considerations: multi-workspace switching, 2FA, SSO/SAML, API key.
* Decision Log AU-D01 s/d AU-D07.
* ADR-024 (Auth Architecture: Better Auth + HTTP-only cookie + Application-layer RBAC).

### Changed — project-manager/PROJECT_STATE.md

* Progress diperbarui: 70% → 80%.
* Project Status: "System Architecture In Progress" → "System Architecture Review Pending".
* Current Focus diperbarui: seluruh 7 dokumen architecture selesai, menunggu Architecture Review.
* In Progress diperbarui: semua 7 topik M5 selesai.
* Next Tasks: topik #5, #6, #7 ditandai Done; ditambahkan task Architecture Review dan baseline.
* ADR-022, ADR-023, ADR-024 ditambahkan ke Recent Decisions.

---

## 2026-07-15 (sesi kedua puluh enam)

### Added — product-discovery/05-architecture/integration-layer.md

* Dokumen baru: **Integration Layer** — topik #4 M5.
* Posisi Outstand API sebagai external system dengan diagram arsitektur inbound dan outbound flow.
* Anti-Corruption Layer (ACL): `OutstandAdapter` sebagai satu-satunya titik interaksi dengan Outstand API — isolasi domain dari perubahan API Outstand.
* ConnectedAccount management: OAuth redirect flow via Outstand, token tidak disimpan internal, CSRF protection via `state` parameter.
* Publishing flow: schedule dan cancel post via Outstand API, `outstandJobId` sebagai external reference di `PostTarget`.
* Webhook handling: Route Handler `/api/webhooks/outstand`, HMAC-SHA256 signature verification, daftar 5 event type, async processing, idempotency strategy.
* Engagement data sync: webhook push untuk item baru + polling periodik sebagai fallback.
* Analytics data sync: pull-based polling periodik untuk post metrics dan workspace snapshot.
* Error handling strategy: klasifikasi 5 tipe error (transient, client, auth, account, not found), penanganan per operasi, `IntegrationError` sebagai tipe domain.
* Decision Log IL-D01 s/d IL-D08.
* ADR-019 (Anti-Corruption Layer), ADR-020 (Webhook Handling), ADR-021 (OAuth via Outstand).

---

## 2026-07-15 (sesi kedua puluh lima)

### Added — product-discovery/05-architecture/application-layer.md

* Dokumen baru: **Application Layer** — topik #3 M5.
* Layer stack 4-tingkat: Entry Points → Application Service → Domain Logic → Repository → Infrastructure.
* Next.js entry point patterns: Server Components (read), Server Actions (UI mutations), Route Handlers (webhook/external), Middleware (auth guard + workspace context resolution).
* Application Service contracts untuk seluruh 9 bounded context MVP.
* Repository Pattern eksplisit: interface di domain module, implementasi via Supabase client, satu repository per Aggregate Root.
* Cross-domain communication: service-to-service call via `index.ts` (public API), aturan no circular dependency, only pass ID lintas domain.
* Error handling hierarchy: ApplicationError → AuthorizationError, NotFoundError, ValidationError, ConflictError, ExternalServiceError.
* 3 contoh request flow: Schedule Post, Webhook Outstand, Load Calendar Page.
* Decision Log AL-D01 s/d AL-D04.

### Changed — project-manager/DECISIONS.md

* Ditambahkan ADR-016: Application Layer — Next.js Entry Point Strategy.
* Ditambahkan ADR-017: Application Layer — Repository Pattern.
* Ditambahkan ADR-018: Application Layer — Cross-Domain Communication.

### Changed — project-manager/PROJECT_STATE.md

* Version: 0.6.0 → 0.7.0.
* Overall Progress: 65% → 70%.
* Current Focus diperbarui: Application Layer selesai, next Integration Layer.
* In Progress diperbarui ke topik #4: Integration Layer.
* Completed ditambahkan: application-layer.md.
* Next Tasks: Application Layer ditandai Done.
* Recent Decisions ditambahkan ADR-016, ADR-017, ADR-018.

---

## 2026-07-15 (sesi kedua puluh empat)

### Added — product-discovery/05-architecture/database-strategy.md

* Dokumen baru: **Database Strategy** — topik #2 M5.
* Multi-tenancy strategy: RLS dengan `workspace_id` sebagai unit isolasi; pendekatan application-enforced auth + RLS sebagai defense-in-depth karena Better Auth tidak terintegrasi native dengan Supabase JWT.
* Schema organization: single schema `public` dengan domain prefix (ADR-014).
* ID Convention: UUID v4 via `gen_random_uuid()` — native PostgreSQL/Supabase.
* 22 tabel terdefinisi untuk 10 bounded context — memetakan seluruh entitas dari domain-model.md ke tabel database.
* BC-01 Identity: tabel dikelola Better Auth dengan prefix `identity_`.
* Soft delete strategy: hard delete by default; `deleted_at` hanya pada `publishing_posts`.
* Storage strategy: Supabase Storage dengan dua bucket (`media` private, `avatars` public).
* Index strategy: workspace_id mandatory pada semua tabel multi-tenant; query-driven indexes per tabel.
* Migration strategy: Supabase CLI, detail di Engineering Planning (M6).
* Decision Log DB-D01 s/d DB-D06.

### Changed — project-manager/DECISIONS.md

* Ditambahkan ADR-014: Database Schema Organization — Single Schema dengan Domain Prefix.
* Ditambahkan ADR-015: Database Strategy Baseline v1.0.

### Changed — project-manager/PROJECT_STATE.md

* Version: 0.5.0 → 0.6.0.
* Overall Progress: 58% → 65%.
* Current Focus: diperbarui — Database Strategy selesai, fokus beralih ke Application Layer.
* In Progress: diperbarui ke topik #3 Application Layer.
* Next Tasks: Database Strategy ditandai Done.
* Completed: ditambahkan database-strategy.md.
* Recent Decisions: ditambahkan ADR-014 dan ADR-015.

---

## 2026-07-15 (sesi kedua puluh tiga)

### Added — product-discovery/05-architecture/domain-model.md

* Dokumen baru: **Domain Model & Bounded Context** — topik #1 M5.
* Mendefinisikan 10 bounded context: Identity, Workspace, Publishing, AI Assistant, Engagement, Analytics, Start Page, Media, Notification, Billing.
* Menetapkan Core Entities dan Key Attributes per bounded context.
* Context Map — diagram dan tabel relasi antar bounded context.
* Shared Types (`packages/shared`) — ID types, enums kanonikal (ContentStatus, MemberRole, SocialPlatform, WorkspacePlan), value objects.
* Domain Boundary Rules (BR-01 s/d BR-06) — aturan implementasi Pragmatic Boundary.
* Traceability ke Product Baseline (feature-modules.md) dan User Insights (I-01, I-04, I-06, I-08).
* Decision Log DM-D01 s/d DM-D06.

### Changed — project-manager/PROJECT_STATE.md

* Overall Progress: 55% → 58%.
* Current Focus: diperbarui — Domain Model selesai, fokus beralih ke Database Strategy.
* In Progress: diperbarui ke topik #2 Database Strategy.
* Next Tasks: Domain Model ditandai Done, Database Strategy menjadi prioritas berikutnya.
* Completed: ditambahkan domain-model.md.

---

## 2026-07-15 (sesi kedua puluh dua)

### Added — CONVERSATIONS.md

* Entry baru: Keputusan Pra-Architecture — Domain Boundary, Storage & Deployment.

### Changed — product-discovery/05-architecture/README.md

* Tambah 3 keputusan pra-architecture ke tabel: Storage (Supabase Storage), Deployment (Railway), Domain Boundary Strictness (Pragmatic Boundary).

---

## 2026-07-15 (sesi kedua puluh satu)

### Added — product-discovery/05-architecture/

* `README.md` — struktur, scope, daftar dokumen, workflow, input dari baseline sebelumnya, expected output, exit criteria, dan decision rules untuk fase System Architecture.

---

## 2026-07-15 (sesi kedua puluh)

### Added — CONVERSATIONS.md

* Entry baru: Keputusan Pra-Architecture — Database, Auth & Real-time. 4 keputusan ditetapkan, 2 masih pending.

---

## 2026-07-15 (sesi kesembilan belas)

### Added — DECISIONS.md

* ADR-013 — UX Planning Baseline v1.0: seluruh dokumen `product-discovery/04-ux/` ditetapkan sebagai baseline setelah semua 4 UX Planning Review item selesai diperbaiki.

### Changed — PROJECT_STATE.md

* Versi naik dari 0.4.0 → 0.5.0.
* Phase diupdate: Phase 2 — UX Planning → Phase 3 — System Architecture.
* Milestone aktif diupdate: M4 → M5.
* Sprint diupdate: Sprint 2 → Sprint 3.
* Overall Progress diupdate: 45% → 55%.
* M4 — UX Planning ditandai ✅ Completed.
* M5 — System Architecture ditandai 🟡 In Progress.
* Current Focus, Active Conversation Mode, In Progress, Next Tasks, Known Issues, dan Recent Decisions diperbarui sesuai fase baru.

### Added — CONVERSATIONS.md

* Entry baru: Briefing M5 System Architecture Planning — topik, urutan pembahasan, dan cara kerja antar sesi.

---

## 2026-07-15 (sesi kedelapan belas)

### Fixed — UX Planning Review — REVIEW-04 (Minor)

* `product-discovery/04-ux/navigation-patterns.md` — tambah pola baru **"New Post CTA dari Calendar dan Queue"** di section Contextual Navigation Pattern. Mendokumentasikan bahwa CTA New Post tersedia langsung dari Calendar dan Queue (bukan hanya dari Drafts), trigger dan konteks penggunaannya, serta perilaku transisi dan tombol Back.
* Tambah **NP-D09** ke Decision Log: alasan New Post CTA tersedia di Calendar dan Queue — mengurangi friction saat Raka menemukan gap jadwal di titik penemuan kebutuhan.
* Tambah baris baru ke Ringkasan Pola.

### Changed — PROJECT_STATE.md

* Fix #4 dipindahkan dari Next Tasks ke selesai; Next Tasks diperbarui ke satu item sisa: ADR-013 UX Planning Baseline.
* REVIEW-04 ditandai Fixed di Known Issues.
* Semua 4 REVIEW item kini berstatus Fixed.

---

## 2026-07-15 (sesi ketujuh belas)

### Fixed — UX Planning Review — REVIEW-03 (Minor)

* `product-discovery/04-ux/key-screen-patterns.md` — tambah KSP-D11 ke Decision Log: mendokumentasikan alasan eksklusi Start Page dari 8 layar kritis. Start Page bukan bagian dari siklus kerja harian; polanya sederhana (konfigurasi + preview) dan tidak memerlukan dokumentasi mendalam di fase ini.

### Changed — PROJECT_STATE.md

* Fix #3 dipindahkan dari Next Tasks ke selesai.
* REVIEW-03 ditandai Fixed di Known Issues.

---

## 2026-07-15 (sesi keenam belas)

### Fixed — UX Planning Review — REVIEW-02 (Minor)

* `product-discovery/04-ux/key-screen-patterns.md` — KSP-02-F07 (Disconnected Account Warning): koreksi referensi prinsip dari `UXP-05` menjadi `UXP-06`. UXP-06 (Status Jelas, Proses Ringan) adalah prinsip yang tepat untuk status visibilitas akun; UXP-05 mengacu ke prinsip AI.

### Changed — PROJECT_STATE.md

* Fix #2 dipindahkan dari Next Tasks ke selesai.
* REVIEW-02 ditandai Fixed di Known Issues.

---

## 2026-07-15 (sesi kelima belas)

### Fixed — UX Planning Review — REVIEW-01 (Kritis)

Selaraskan set status konten kanonikal lintas 4 dokumen UX — mengacu ke `product-discovery/02-product/roles-permissions.md` sebagai sumber kebenaran.

* `product-discovery/04-ux/ux-principles.md` — UXP-06: tambah `failed` ke status list; koreksi "ready" → "ready to schedule"; tambah bullet referensi ke `roles-permissions.md` untuk aturan transisi per role.
* `product-discovery/04-ux/information-architecture.md` — Status Indicator di IA tree: tambah `in review` dan `ready to schedule`.
* `product-discovery/04-ux/user-flows.md` — 3 tempat: Queue happy path, Queue UX principles rationale, Calendar happy path — semua status list dilengkapi dengan `In Review` dan `Ready to Schedule`.
* `product-discovery/04-ux/key-screen-patterns.md` — 3 tempat: KSP-02-F02 (Calendar status), KSP-03-F02 (Queue status), KSP-05-F07 (Draft Editor Status Indicator) — semua dilengkapi dengan `In Review` dan `Ready to Schedule`.

### Changed — PROJECT_STATE.md

* Fix #1 dipindahkan dari Next Tasks ke selesai.
* REVIEW-01 ditandai Fixed di Known Issues.

---

## 2026-07-15 (sesi keempat belas)

### Added — Roles & Permissions

* `product-discovery/02-product/roles-permissions.md` — addendum Product Baseline v1.0. Mendefinisikan 4 roles (Owner, Admin, Manager, Creator) beserta hak akses per area fitur, set status konten kanonikal (Draft, In Review, Ready to Schedule, Scheduled, Published, Failed), aturan transisi status per role, dan mapping roles ke 5 persona User Discovery Baseline.

### Added — DECISIONS.md

* ADR-012 — Addendum Product Baseline: `roles-permissions.md` ditambahkan ke `product-discovery/02-product/`. Mencakup alasan pendefinisian roles di fase Product dan penetapan set status konten sebagai acuan kanonikal lintas dokumen UX.

### Changed — PROJECT_STATE.md

* Task 1 (Roles & Permissions) dipindahkan dari Next Tasks ke Completed.
* Recent Decisions diperbarui: ADR-012 ditambahkan.

---

## 2026-07-15 (sesi ketiga belas)

### Changed — PROJECT_STATE.md

* Versi dinaikkan ke 0.4.0.
* Current Focus diperbarui: fokus bergeser ke UX Planning Review dan Roles & Permissions.
* In Progress diperbarui: UX Planning Review sedang berjalan, 4 inkonsistensi ditemukan.
* Next Tasks diperbarui: 2 task utama didefinisikan — Task 1 (Roles & Permissions + ADR-012) dan Task 2 (4 perbaikan UX Planning Review + ADR-013 untuk UX Planning Baseline).
* Known Issues diisi: 4 temuan inkonsistensi dari UX Planning Review dicatat sebagai REVIEW-01 hingga REVIEW-04.

---

## 2026-07-15 (sesi kedua belas)

### Added — Key Screen Patterns

* `product-discovery/04-ux/key-screen-patterns.md` — pola fungsi kritis untuk 8 layar utama produk: KSP-01 Home, KSP-02 Publish Calendar, KSP-03 Publish Queue, KSP-04 Publish Drafts, KSP-05 Draft Editor (termasuk pola AI Assist inline, Account Selector dengan status, dan Confirmation Summary), KSP-06 Engage Inbox (master-detail pattern), KSP-07 Analyze Dashboard, KSP-08 Connected Accounts. Setiap layar memiliki critical functions dengan ID, zona fungsional, state handling, dan decision log. 10 keputusan desain terdokumentasi (KSP-D01 hingga KSP-D10). Dokumen terakhir dari M4 — UX Planning.

### Changed — PROJECT_STATE.md

* Overall Progress diperbarui dari 38% ke 45%.
* `key-screen-patterns.md` dipindahkan dari In Progress ke Completed.
* Next Tasks diperbarui: fokus berikutnya adalah UX Planning Review lintas dokumen dan penetapan UX Planning Baseline.

---

## 2026-07-15 (sesi kesebelas)

### Added — Navigation Patterns

* `product-discovery/04-ux/navigation-patterns.md` — model dan pola navigasi lengkap: Persistent Sidebar Navigation sebagai model utama, primary/secondary/in-section navigation patterns, 5 contextual navigation patterns (Item→Editor, Thread Expansion, Status→Settings, Empty State→Action, Deep Link), notification badge pattern, cross-section navigation pattern, dan decision log 8 keputusan navigasi (NP-D01 hingga NP-D08).

---

## 2026-07-15 (sesi kesepuluh)

### Added — User Flows

* `product-discovery/04-ux/user-flows.md` — 6 solution flows untuk Must Have MVP: UF-01 (Membuat & Menjadwalkan Konten), UF-02 (Mengelola Queue), UF-03 (Review Kalender), UF-04 (Triage Engagement Inbox), UF-05 (Menghubungkan Akun Sosial), UF-06 (Melihat Ringkasan Performa). Setiap flow memiliki happy path + 1 alternate path paling kritis. 4 UX Decisions (UXD-01 hingga UXD-04) terdokumentasi.

### Added — Skill: Proactive Clarification

* `.agents/skills/proactive-clarification/SKILL.md` — skill baru yang memandu AI untuk secara proaktif mengidentifikasi keputusan yang belum ditentukan sebelum mengeksekusi tugas apapun. AI wajib bertanya dengan pilihan-pilihan terbaik di kelasnya (maks 4–5 opsi dikurasi), berlaku untuk semua jenis interaksi — dokumentasi, fitur, arsitektur, konfigurasi. Skill tidak aktif jika keputusan sudah ada di baseline project.

---

## 2026-07-15 (sesi kesembilan)

### Added — Information Architecture

* `product-discovery/04-ux/information-architecture.md` — IA lengkap: struktur navigasi (primary + secondary), hierarki layar untuk seluruh domain MVP (Home, Publish, Engage, Analyze, Start Page, Workspace Settings, User Settings), pemetaan fitur Must Have ke layar, entry points per persona, dan decision log 7 keputusan struktural.

### Added — UX Principles

* `product-discovery/04-ux/ux-principles.md` — 7 UX Principles ditetapkan, masing-masing diturunkan dari insight User Discovery (I-01 hingga I-08) dengan implikasi desain yang actionable.

---

## 2026-07-14 (sesi kedelapan)

### Fixed — Inkonsistensi pada PROJECT_OVERVIEW.md

* `project-manager/PROJECT_OVERVIEW.md` — menghapus section `Current Phase` yang memuat status/milestone basi (masih menyebut M1 — Discovery), melanggar aturan Document Type Classification yang sudah ditetapkan sendiri di `PROJECT_RULES.md`.

### Added — Developer Profile & Working Preferences

* Menambahkan section **Developer Profile & Working Preferences** di `PROJECT_OVERVIEW.md` — mencatat profil solo developer dan preferensi kerja yang sudah terkonfirmasi dari sesi-sesi sebelumnya.
* Menambahkan retroaktif 3 entri `CONVERSATIONS.md` yang terlewat: diskusi Document Type Classification, pemisahan `product-discovery/` dari `project-manager/`, dan evaluasi "apakah project-manager sudah menjadi asisten pribadi".

### Added — Proactive Consistency Check

* Menambahkan section **Proactive Consistency Check** pada `SKILL.md` — AI wajib memeriksa dokumen Static Reference terhadap kebocoran status/progress, dan wajib melaporkannya ke user (bukan memperbaiki diam-diam).
* Menambahkan 2 aturan baru pada **Aturan Context** di `SKILL.md`: larangan memperbaiki inkonsistensi secara diam-diam, dan kewajiban mengikuti serta memperbarui Working Preferences.

### Status

Gap yang ditemukan saat evaluasi "apakah project-manager sudah menjadi asisten pribadi" sudah ditindaklanjuti: status basi dibersihkan, log diskusi disinkronkan, working preference mulai terdokumentasi, dan ada mekanisme proaktif untuk mencegah inkonsistensi serupa terulang.

---

## 2026-07-14 (sesi ketujuh)

### Changed — Pemisahan Struktur `product-discovery/` dari `project-manager/`

* Memindahkan folder `product-discovery/` keluar dari `project-manager/` menjadi folder top-level, sejajar (sibling) dengan `project-manager/`.
* Menambahkan ADR-011 pada `DECISIONS.md` — mendokumentasikan alasan pemisahan struktur.
* Menulis ulang `project-manager/README.md` secara menyeluruh: menghapus struktur folder usang yang tidak pernah ada (`01-discovery/`, `07-ai/`, `08-management/`, dsb.), menjelaskan `project-manager/` sebagai dokumentasi cara kerja, dan `product-discovery/` sebagai Source of Truth produk.

### Fixed — Perbaikan Path Referensi Antar Dokumen

* `product-discovery/README.md` — path ke dokumen `project-manager/` diperbaiki (`../project-manager/...`).
* `product-discovery/01-business/README.md` — memperbaiki path yang sudah rusak sejak sebelum pemindahan folder (Documents dan Decision Rules section), sekaligus menyesuaikan ke struktur baru.
* `product-discovery/02-product/README.md`, `03-user/README.md`, `04-ux/README.md`, `06-engineering/README.md` — seluruh referensi ke `PROJECT_OVERVIEW.md`, `PROJECT_RULES.md`, `PROJECT_STATE.md`, `DECISIONS.md` diperbaiki menjadi `../../project-manager/...`.
* `project-manager/PROJECT_STATE.md`, `PROJECT_RULES.md`, `PROJECT_OVERVIEW.md` — section `Related Documents` diperbaiki menjadi `../product-discovery/...`.
* `.agents/skills/project-os-navigator/SKILL.md` — path operasional (`Load Context`, `File Map`, `Additional Resources`) diperbaiki dari `project-manager/product-discovery/...` menjadi `product-discovery/...`, dan File Map dipecah menjadi dua tree sejajar.
* Seluruh dokumen individual di `product-discovery/01-business/`, `02-product/`, `03-user/` (bukan hanya README.md) — referensi ke `PROJECT_OVERVIEW.md`, `PROJECT_RULES.md`, `PROJECT_STATE.md`, `DECISIONS.md`, `CHANGELOG.md` diperbaiki secara massal menjadi `../../project-manager/...`.

### Status

Struktur repository kini: `project-manager/` (cara kerja) dan `product-discovery/` (pengetahuan produk) sebagai dua folder top-level yang terpisah. Seluruh referensi path antar dokumen telah disinkronkan.

---

## 2026-07-14 (sesi ketiga)

### Added — Engineering Planning Phase

* Menambahkan `product-discovery/06-engineering/README.md` — titik masuk Engineering Planning (M6).
* Menambahkan ADR-010 pada `DECISIONS.md` — Engineering Planning sebagai fase baru di product-discovery.

### Changed — Milestone Numbering

* Menambahkan M6 — Engineering Planning sebagai milestone baru.
* Menggeser milestone lama: M6 → M7 (Repository & Bootstrap), M7 → M8 (Development), M8 → M9 (Testing & Release).
* Memperbarui `PROJECT_STATE.md`: milestone table, Recent Decisions, dan Related Documents.
* Memperbarui file map pada `.agents/skills/project-os-navigator/SKILL.md`.

### Status

Engineering Planning (M6) terdaftar sebagai fase baru. Masih ⏳ Pending — akan dikerjakan setelah M5 System Architecture selesai.

---

## 2026-07-14 (sesi keempat)

### Changed — product-discovery/README.md

* Memperbarui Objectives: menambahkan poin dokumentasi keputusan teknis engineering.
* Memperbarui Workflow: menambahkan step Engineering setelah Architecture.
* Memperbarui Folder Structure: menambahkan `06-engineering/` dengan status tiap folder.
* Memperbarui Discovery Stages: memisahkan scope `05-architecture` dan menambahkan section `06-engineering`.
* Memperbarui Exit Criteria: menambahkan Engineering Planning sebagai syarat selesai, menandai Business/Product/User Baseline yang sudah selesai.
* Memperbarui Next Phase: merujuk ke M7 — Repository & Bootstrap dengan referensi ADR-001.

### Status

`product-discovery/README.md` selaras dengan dokumentasi terbaru.

---

## 2026-07-14 (sesi kelima)

### Changed — Document Type Classification

* Menambahkan section **Document Type Classification** pada `PROJECT_RULES.md` yang mendefinisikan tiga tipe dokumen: Static Reference, Living Document, dan Append-Only.
* Menetapkan `PROJECT_STATE.md` sebagai satu-satunya source of truth untuk status dan progress.
* Menetapkan aturan: README tidak boleh memuat status (✅ ⏳ 🟡), progress (%), atau phase aktif.

### Fixed — Penghapusan Status Indicator dari README

* `product-discovery/01-business/README.md` — hapus section `Current Status`.
* `product-discovery/02-product/README.md` — hapus section `Current Status`.
* `product-discovery/03-user/README.md` — hapus section `Current Status`.
* `product-discovery/04-ux/README.md` — hapus section `Current Status`.
* `product-discovery/06-engineering/README.md` — hapus section `Current Status`.
* `product-discovery/README.md` — hapus status indicator (✅ 🟡 ⏳) dari Folder Structure dan Exit Criteria.
* `.agents/skills/project-os-navigator/SKILL.md` — hapus status indicator dari file map.

### Status

Seluruh README kini bersifat Static Reference. Status dan progress hanya ada di `PROJECT_STATE.md`.

---

## 2026-07-14 (sesi keenam)

### Changed — PROJECT_RULES.md Restructuring

* Menaikkan versi `PROJECT_RULES.md` dari 0.1.0 ke 0.2.0.
* Menambahkan section **Scope** untuk memperjelas batas aturan yang diatur dokumen ini.
* Menggabungkan `Documentation Rules` dan `Document Type Classification` menjadi satu section **Documentation Governance**, dengan subsection tambahan **Formatting Rules**.
* Memperbarui **Project Workflow**: menambahkan tahap `User` dan `Engineering` yang sebelumnya tidak tercantum, menyelaraskan dengan workflow di `product-discovery/README.md` dan milestone di `PROJECT_STATE.md`.
* Memperbaiki **Related Documents**: menghapus referensi usang `06-development/` yang tidak lagi sesuai struktur project, mengganti dengan daftar dokumen yang akurat.
* Menambahkan aturan baru pada **AI Collaboration Rules**: AI wajib mematuhi klasifikasi dokumen pada Documentation Governance.

### Status

`PROJECT_RULES.md` v0.2.0 — struktur lebih rapi, konsisten dengan milestone dan workflow terbaru.

---

## 2026-07-14 (sesi kedua)

### Added — Project OS & UX Planning Setup

* Menambahkan `CONVERSATIONS.md` — log percakapan penting antar sesi.
* Menambahkan `BRAINSTORM.md` — bank ide dari sesi brainstorming.
* Membuat `.cursor/skills/project-os-navigator/SKILL.md` — skill Cursor untuk menjaga AI selalu dalam konteks project.
* Membuat `product-discovery/04-ux/README.md` — titik masuk UX Planning (M4).

### Updated — Milestone & State

* Menyelesaikan User Discovery Review untuk `product-discovery/03-user/`.
* Menambahkan ADR-009 pada `DECISIONS.md` — User Discovery Baseline v1.0.
* Memperbarui `PROJECT_STATE.md`: M1 Discovery ✅ selesai, M4 UX Planning 🟡 aktif, progress 38%.

### Status

M1 Discovery selesai. Project masuk Phase 2 — UX Planning (M4).

---

## 2026-07-14 (sesi pertama)

### Added — Product Planning Completion

* Menambahkan `product-discovery/02-product/future-roadmap.md` sebagai backlog strategis pasca-MVP.
* Menambahkan ADR-008 pada `DECISIONS.md` untuk menetapkan Baseline Product Discovery v1.0.

### Updated — Cross-Document Synchronization

* Menandai `product-discovery/02-product/README.md` sebagai selesai (100%) dengan status review passed.
* Menyinkronkan status dan fokus terbaru pada `PROJECT_STATE.md` untuk transisi ke `product-discovery/03-user/`.
* Menyesuaikan progres overall project setelah selesainya tahap Product Planning.
* Merapikan konsistensi dokumen agar selaras dengan baseline Business v1.0 dan Product v1.0.

### Status

Product Planning selesai dan siap transisi ke User Discovery.

---

## 2026-07-13

### Added — Project Foundation

* Membuat struktur awal `project-manager/`.
* Menambahkan `README.md`.
* Menambahkan `PROJECT_OVERVIEW.md`.
* Menambahkan `PROJECT_RULES.md`.
* Menambahkan `PROJECT_STATE.md`.
* Menambahkan `DECISIONS.md`.
* Menambahkan `CHANGELOG.md`.
* Menambahkan struktur folder `product-discovery/` beserta subfolder domain.
* Menambahkan 8 dokumen awal pada `product-discovery/01-business/`.

### Updated — Documentation

* Menstandarkan struktur `product-discovery/01-business/README.md` menjadi:
  Overview, Purpose, Scope, Documents, Workflow, Expected Output,
  Exit Criteria, Decision Rules, dan Current Status.
* Menyinkronkan seluruh dokumen bisnis agar selaras dengan target market baru:
  Marketing Team (primary), Startup dan Digital Agency (secondary).
* Memperbarui `PROJECT_OVERVIEW.md`, `target-market.md`, `business-model.md`,
  `problem-statement.md`, `pricing-strategy.md`, dan `product-vision.md`.
* Menambahkan ADR-006 pada `DECISIONS.md` untuk perubahan target market.
* Menandai `product-discovery/01-business/` sebagai selesai (100%).
* Memperbarui status milestone aktif pada `PROJECT_STATE.md` ke M1 — Discovery.
* Menyesuaikan fokus project ke tahap `product-discovery/02-product/`.
* Melakukan Business Review lintas dokumen pada `product-discovery/01-business/`.
* Menyelaraskan `business-model.md` dan `pricing-strategy.md` agar konsisten (MVP free access, subscription sebagai hipotesis monetisasi).
* Menetapkan `product-discovery/01-business/` sebagai Baseline v1.0 melalui ADR-007.

### Decisions

* Memilih Hybrid Monorepo sebagai strategi repository.
* Memilih Bun sebagai JavaScript runtime.
* Memilih Next.js sebagai framework utama.
* Memilih Modular Monolith + Domain-Driven Design (DDD).
* Memilih Outstand API sebagai external integration provider.

### Status

Project Foundation sedang berlangsung.
