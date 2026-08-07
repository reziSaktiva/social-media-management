-- Setup minimal untuk tabel platform Supabase Storage yang direferensikan
-- raw SQL di migration history Prisma (lihat
-- 20260806120000_extend_avatars_bucket_user_profile/migration.sql).
-- Dijalankan Prisma HANYA terhadap shadow database sebelum replay migration
-- history — bukan terhadap DB live/dev. Idempotent dan sengaja MINIMAL:
-- hanya kolom yang dipakai statement INSERT ... ON CONFLICT di migration
-- tersebut. Lihat KI-016 / ADR-073.

create schema if not exists "storage";

create table if not exists "storage"."buckets" (
  "id" text primary key,
  "name" text not null,
  "public" boolean not null default false,
  "file_size_limit" bigint,
  "allowed_mime_types" text[]
);
