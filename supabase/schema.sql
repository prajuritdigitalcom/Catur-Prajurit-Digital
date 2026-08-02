-- ============================================================================
-- Prajurit Digital Chess — Supabase schema
-- Jalankan file ini di: Supabase Dashboard > SQL Editor > New query > Run
-- ============================================================================

-- 1. Tabel utama untuk menyimpan state tiap room online
create table if not exists public.rooms (
  code            text primary key,
  host            jsonb not null,
  guest           jsonb,
  status          text not null default 'waiting', -- 'waiting' | 'active' | 'finished'
  time_control    jsonb not null,
  fen             text not null default 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  pgn             text not null default '',
  history         jsonb not null default '[]'::jsonb,
  chat_messages   jsonb not null default '[]'::jsonb,
  current_turn    text not null default 'w', -- 'w' | 'b'
  draw_offered_by text,
  winner          text, -- 'w' | 'b' | 'draw'
  status_reason   text,
  created_at      timestamptz not null default now()
);

-- 2. Auto-bersihkan room lama (opsional tapi disarankan, biar tabel tidak
--    menumpuk). Room yang dibuat lebih dari 6 jam lalu akan dianggap basi.
create index if not exists rooms_created_at_idx on public.rooms (created_at);

-- 3. Aktifkan Row Level Security.
--    Semua operasi TULIS (create/join/move/chat/action) dilakukan lewat
--    Vercel serverless function memakai SERVICE ROLE KEY, yang otomatis
--    melewati RLS. Jadi di sini kita hanya perlu izinkan BACA (select)
--    untuk role "anon", supaya:
--      a) Realtime bisa mengirim event perubahan ke browser pemain, dan
--      b) tidak ada yang bisa menulis langsung ke tabel dari browser.
alter table public.rooms enable row level security;

drop policy if exists "Public read access" on public.rooms;
create policy "Public read access"
  on public.rooms
  for select
  to anon, authenticated
  using (true);

-- 4. Aktifkan Realtime untuk tabel ini (wajib, agar perubahan baris
--    ter-broadcast otomatis ke semua client yang subscribe).
alter publication supabase_realtime add table public.rooms;
