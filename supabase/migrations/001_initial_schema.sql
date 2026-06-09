-- Locket initial schema
-- Run against your Supabase project in the SQL editor

-- =====================
-- 1. CREATE ALL TABLES FIRST
-- =====================

create table if not exists couples (
  id                  uuid primary key default gen_random_uuid(),
  nickname            text,
  start_date          date,
  subscription_status text not null default 'free',
  subscribed_by       uuid,
  created_at          timestamptz not null default now()
);

create table if not exists profiles (
  id            uuid primary key references auth.users on delete cascade,
  couple_id     uuid references couples,
  display_name  text,
  birthday      date,
  avatar_color  text,
  deleted_at    timestamptz,
  created_at    timestamptz not null default now()
);

create table if not exists partner_invites (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references couples,
  token      text not null unique,
  expires_at timestamptz not null default (now() + interval '7 days'),
  used_at    timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists milestones (
  id             uuid primary key default gen_random_uuid(),
  couple_id      uuid not null references couples,
  created_by     uuid references profiles,
  title          text not null,
  milestone_date date not null,
  type           text not null default 'other',
  note           text,
  note_rich_html text,
  is_future      boolean not null default false,
  deleted_at     timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists letters (
  id              uuid primary key default gen_random_uuid(),
  couple_id       uuid not null references couples,
  sender_id       uuid references profiles,
  recipient_id    uuid references profiles,
  body_rich_html  text not null,
  is_sealed_until boolean not null default false,
  reveal_at       timestamptz,
  sent_at         timestamptz,
  is_draft        boolean not null default false,
  deleted_at      timestamptz,
  created_at      timestamptz not null default now()
);

create table if not exists map_pins (
  id           uuid primary key default gen_random_uuid(),
  couple_id    uuid not null references couples,
  added_by     uuid references profiles,
  name         text not null,
  note         text,
  category     text not null default 'trip',
  latitude     double precision not null,
  longitude    double precision not null,
  place_name   text,
  country      text,
  visited_date date,
  deleted_at   timestamptz,
  created_at   timestamptz not null default now()
);

create table if not exists bucket_list_items (
  id           uuid primary key default gen_random_uuid(),
  couple_id    uuid not null references couples,
  added_by     uuid references profiles,
  title        text not null,
  category     text not null default 'travel',
  target_date  text,
  note         text,
  is_done      boolean not null default false,
  completed_at timestamptz,
  deleted_at   timestamptz,
  created_at   timestamptz not null default now()
);

-- =====================
-- 2. ENABLE RLS ON ALL TABLES
-- =====================

alter table couples          enable row level security;
alter table profiles         enable row level security;
alter table partner_invites  enable row level security;
alter table milestones       enable row level security;
alter table letters          enable row level security;
alter table map_pins         enable row level security;
alter table bucket_list_items enable row level security;

-- =====================
-- 3. RLS POLICIES (profiles exists now, safe to reference)
-- =====================

-- couples
create policy "couple members can read couples"
  on couples for select
  using (id in (select couple_id from profiles where id = auth.uid()));

create policy "authenticated users can insert couples"
  on couples for insert
  with check (auth.uid() is not null);

create policy "couple members can update couples"
  on couples for update
  using (id in (select couple_id from profiles where id = auth.uid()));

-- profiles
create policy "users can read own profile"
  on profiles for select
  using (id = auth.uid());

create policy "users can insert own profile"
  on profiles for insert
  with check (id = auth.uid());

create policy "users can update own profile"
  on profiles for update
  using (id = auth.uid());

create policy "couple members can read partner profile"
  on profiles for select
  using (
    couple_id is not null and
    couple_id in (select couple_id from profiles where id = auth.uid())
  );

-- partner_invites
create policy "couple members can read invites"
  on partner_invites for select
  using (couple_id in (select couple_id from profiles where id = auth.uid()));

create policy "couple members can insert invites"
  on partner_invites for insert
  with check (couple_id in (select couple_id from profiles where id = auth.uid()));

-- milestones
create policy "couple members can read milestones"
  on milestones for select
  using (couple_id in (select couple_id from profiles where id = auth.uid()));

create policy "couple members can insert milestones"
  on milestones for insert
  with check (couple_id in (select couple_id from profiles where id = auth.uid()));

create policy "couple members can update milestones"
  on milestones for update
  using (couple_id in (select couple_id from profiles where id = auth.uid()));

-- letters
create policy "couple members can read letters"
  on letters for select
  using (
    couple_id in (select couple_id from profiles where id = auth.uid())
    and (
      is_sealed_until = false
      or reveal_at <= now()
      or sender_id = auth.uid()
    )
  );

create policy "couple members can insert letters"
  on letters for insert
  with check (couple_id in (select couple_id from profiles where id = auth.uid()));

create policy "senders can update own letters"
  on letters for update
  using (sender_id = auth.uid());

-- map_pins
create policy "couple members can read pins"
  on map_pins for select
  using (couple_id in (select couple_id from profiles where id = auth.uid()));

create policy "couple members can insert pins"
  on map_pins for insert
  with check (couple_id in (select couple_id from profiles where id = auth.uid()));

create policy "couple members can update pins"
  on map_pins for update
  using (couple_id in (select couple_id from profiles where id = auth.uid()));

-- bucket_list_items
create policy "couple members can read bucket items"
  on bucket_list_items for select
  using (couple_id in (select couple_id from profiles where id = auth.uid()));

create policy "couple members can insert bucket items"
  on bucket_list_items for insert
  with check (couple_id in (select couple_id from profiles where id = auth.uid()));

create policy "couple members can update bucket items"
  on bucket_list_items for update
  using (couple_id in (select couple_id from profiles where id = auth.uid()));

-- =====================
-- 4. TRIGGERS
-- =====================

create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger milestones_updated_at
  before update on milestones
  for each row execute procedure handle_updated_at();

-- =====================
-- 5. AUTO-CREATE PROFILE ON SIGN UP
-- =====================

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
