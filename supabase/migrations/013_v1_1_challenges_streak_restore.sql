-- Migration: Weekly/Monthly Challenges + Streak Restore Coupon (Phase 15)
-- Adds challenge tracking, streak override dates, and coupon type extension.
-- ADDITIVE ONLY — no existing tables, columns, or policies are dropped.

-- ─── 1. couple_challenges ────────────────────────────────────────────────────
-- One row per couple per challenge period. Created client-side on app startup
-- when no row exists for the current week/month.

create table if not exists couple_challenges (
  id             uuid        primary key default gen_random_uuid(),
  couple_id      uuid        not null references couples(id) on delete cascade,
  challenge_key  text        not null,    -- matches key in constants/challenge-definitions.ts
  period_type    text        not null check (period_type in ('weekly', 'monthly')),
  period_start   date        not null,
  period_end     date        not null,
  completed_at   timestamptz,             -- null while in progress
  streak_awarded boolean     not null default false,
  created_at     timestamptz not null default now(),
  unique (couple_id, period_start, period_type)
);

create index if not exists idx_couple_challenges_couple_id
  on couple_challenges (couple_id, period_start desc);

alter table couple_challenges enable row level security;

create policy "couple can read challenges"
  on couple_challenges for select
  using (couple_id = public.my_couple_id());

create policy "couple can insert challenges"
  on couple_challenges for insert
  with check (couple_id = public.my_couple_id());

create policy "couple can update challenges"
  on couple_challenges for update
  using (couple_id = public.my_couple_id());

-- ─── 2. quiz_streak_overrides ────────────────────────────────────────────────
-- Dates "forgiven" by a streak restore coupon. The streak computation function
-- treats these dates as completed quiz days.

create table if not exists quiz_streak_overrides (
  id               uuid  primary key default gen_random_uuid(),
  couple_id        uuid  not null references couples(id) on delete cascade,
  override_date    date  not null,
  source_coupon_id uuid  references coupons(id),
  created_at       timestamptz not null default now(),
  unique (couple_id, override_date)
);

create index if not exists idx_quiz_streak_overrides_couple_id
  on quiz_streak_overrides (couple_id, override_date desc);

alter table quiz_streak_overrides enable row level security;

create policy "couple can read streak overrides"
  on quiz_streak_overrides for select
  using (couple_id = public.my_couple_id());

create policy "couple can insert streak overrides"
  on quiz_streak_overrides for insert
  with check (couple_id = public.my_couple_id());

-- ─── 3. coupons — extend with type + streak restore fields ───────────────────

alter table coupons
  add column if not exists type                      text        not null default 'standard',
  add column if not exists streak_restore_days       integer,     -- streak count at break time
  add column if not exists streak_restore_expires_at timestamptz; -- 48 h gifting deadline

-- ─── 4. RPC: restore_couple_streak ───────────────────────────────────────────
-- Called by the client immediately when a streak restore coupon is gifted.
-- Inserts override dates for each missed day; idempotent via ON CONFLICT.

create or replace function public.restore_couple_streak(
  p_couple_id    uuid,
  p_coupon_id    uuid,
  p_missed_dates date[]
)
returns void
language plpgsql
security definer
as $$
begin
  insert into quiz_streak_overrides (couple_id, override_date, source_coupon_id)
  select p_couple_id, d, p_coupon_id
  from   unnest(p_missed_dates) as d
  on conflict (couple_id, override_date) do nothing;
end;
$$;

grant execute on function public.restore_couple_streak(uuid, uuid, date[])
  to authenticated;
