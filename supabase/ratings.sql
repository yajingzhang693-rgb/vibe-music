-- Discurse ratings 表结构（在 Supabase SQL Editor 中执行）

create table if not exists public.ratings (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  album_id text not null,
  album_name text not null default '',
  artist_name text not null default '',
  genre text not null default '',
  release_date text not null default '',
  overall numeric(3,1) not null default 0,
  production numeric(3,1) not null default 0,
  songwriting numeric(3,1) not null default 0,
  score numeric(3,1) not null default 0,
  review text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, album_id)
);

-- 若表已存在，仅补充分项分数列：
alter table public.ratings
  add column if not exists overall numeric(3,1) not null default 0,
  add column if not exists production numeric(3,1) not null default 0,
  add column if not exists songwriting numeric(3,1) not null default 0;

alter table public.ratings enable row level security;

create policy "Allow anon insert ratings"
  on public.ratings for insert
  to anon with check (true);

create policy "Allow anon update ratings"
  on public.ratings for update
  to anon using (true);

create policy "Allow anon select ratings"
  on public.ratings for select
  to anon using (true);
