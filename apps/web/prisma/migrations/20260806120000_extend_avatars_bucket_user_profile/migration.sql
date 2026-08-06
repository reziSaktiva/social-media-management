-- T-016.2: perluas scope bucket Supabase Storage `avatars` agar juga
-- menampung avatar user personal (`avatars/users/{user_id}/avatar.{ext}`),
-- bukan hanya avatar workspace/Start Page seperti sebelumnya
-- (lihat product-discovery/05-architecture/database-strategy.md § Storage
-- Strategy). Idempotent lewat ON CONFLICT DO NOTHING — aman dijalankan baik
-- bucket `avatars` sudah eksis (dibuat manual sebelum ada riwayat migrasi
-- ini) maupun belum, sehingga reproducible tanpa langkah dashboard manual.
--
-- Catatan: `storage.buckets` adalah tabel milik Supabase Storage, bukan
-- bagian dari schema.prisma — migration ini raw SQL, tidak digenerate dari
-- perubahan model Prisma.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;
