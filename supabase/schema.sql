-- ──────────────────────────────────────────
-- MARKA — Database Schema
-- Run this in Supabase SQL Editor
-- ──────────────────────────────────────────

-- Profiles (public username for share links)
create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  username    text unique not null,
  display_name text not null,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Public profiles are readable by anyone (for share links)
create policy "Public profiles are viewable"
  on public.profiles for select
  using (true);


-- Races
create table public.races (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users on delete cascade,
  name               text not null,
  date               date not null,
  location_city      text not null,
  location_country   text not null,  -- ISO 3166-1 alpha-2 e.g. 'SG'
  sport_type         text not null
                       check (sport_type in ('triathlon','running','cycling','duathlon','open_water','other')),
  distance_category  text not null,  -- 'sprint','olympic','70.3','ironman','5k','10k','half','full','ultra', etc.
  finish_time        interval not null,
  overall_rank       integer,
  age_group_rank     integer,
  notes              text,
  created_at         timestamptz default now()
);

alter table public.races enable row level security;

create policy "Users can read own races"
  on public.races for select
  using (auth.uid() = user_id);

create policy "Users can insert own races"
  on public.races for insert
  with check (auth.uid() = user_id);

create policy "Users can update own races"
  on public.races for update
  using (auth.uid() = user_id);

create policy "Users can delete own races"
  on public.races for delete
  using (auth.uid() = user_id);

-- Public race reads (for share page)
create policy "Public races viewable via profile"
  on public.races for select
  using (true);

-- Index for fast lookup by user + date
create index races_user_date_idx on public.races (user_id, date desc);
create index races_user_sport_idx on public.races (user_id, sport_type);
create index races_user_country_idx on public.races (user_id, location_country);


-- Badges (computed and cached, recomputed on race changes)
create table public.badges (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  key        text not null,           -- e.g. 'country_SG', 'finisher_703'
  name       text not null,
  category   text not null
               check (category in ('geography','milestone','count')),
  earned_at  date not null,
  created_at timestamptz default now(),
  unique (user_id, key)               -- one badge per key per user
);

alter table public.badges enable row level security;

create policy "Users can read own badges"
  on public.badges for select
  using (auth.uid() = user_id);

create policy "Users can manage own badges"
  on public.badges for all
  using (auth.uid() = user_id);

-- Public badge reads (for share page)
create policy "Public badges viewable"
  on public.badges for select
  using (true);


-- ──────────────────────────────────────────
-- Auto-create profile on signup
-- ──────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    split_part(new.email, '@', 1),   -- default username from email
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
