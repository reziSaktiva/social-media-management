-- T-016.2: perluas scope bucket Supabase Storage `avatars` agar juga
-- menampung avatar user personal (`avatars/users/{user_id}/avatar.{ext}`),
-- bukan hanya avatar workspace/Start Page seperti sebelumnya
-- (lihat product-discovery/05-architecture/database-strategy.md § Storage
-- Strategy). Idempotent lewat ON CONFLICT DO UPDATE — aman dijalankan baik
-- bucket `avatars` sudah eksis (dibuat manual sebelum ada riwayat migrasi
-- ini) maupun belum, sehingga reproducible tanpa langkah dashboard manual;
-- DO UPDATE (bukan DO NOTHING) supaya guardrail di bawah ini juga
-- diterapkan ke baris yang sudah ada, bukan hanya insert baru.
--
-- file_size_limit/allowed_mime_types menegakkan batas 2MB + JPG/PNG di
-- level Storage juga (bukan hanya application-layer di identity.service.ts)
-- — code-review finding: tanpa ini, jalur upload lain ke bucket yang sama
-- (mis. tool admin) tidak punya guardrail sama sekali.
--
-- Catatan: `storage.buckets` adalah tabel milik Supabase Storage, bukan
-- bagian dari schema.prisma — migration ini raw SQL, tidak digenerate dari
-- perubahan model Prisma.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
