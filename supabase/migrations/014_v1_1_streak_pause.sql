-- Migration: Manual Streak Pause (v1.1)
-- Lets either partner pause the shared Daily-Match streak for a fixed window
-- (e.g. a holiday). Days inside an active pause neither break nor grow the
-- streak — it simply holds until the window ends and auto-resumes.
-- ADDITIVE ONLY — no existing tables, columns, or policies are dropped.

-- ─── streak_pauses ───────────────────────────────────────────────────────────
-- One row per pause window. start_date/end_date are inclusive LOCAL calendar
-- dates. A pause "covers" today when start_date <= today <= end_date. Resuming
-- early sets end_date to yesterday (an empty/expired window).

create table if not exists streak_pauses (
  id          uuid        primary key default gen_random_uuid(),
  couple_id   uuid        not null references couples(id) on delete cascade,
  start_date  date        not null,
  end_date    date        not null,      -- inclusive last protected day
  created_by  uuid,                      -- profile id of the partner who paused
  created_at  timestamptz not null default now()
);

create index if not exists idx_streak_pauses_couple_id
  on streak_pauses (couple_id, start_date desc);

alter table streak_pauses enable row level security;

create policy "couple can read streak pauses"
  on streak_pauses for select
  using (couple_id = public.my_couple_id());

create policy "couple can insert streak pauses"
  on streak_pauses for insert
  with check (couple_id = public.my_couple_id());

create policy "couple can update streak pauses"
  on streak_pauses for update
  using (couple_id = public.my_couple_id());
