-- Daily Quiz (double-blind), Love Coupons, and a status emoji on profiles.

create table if not exists daily_quiz (
  id              uuid primary key default gen_random_uuid(),
  couple_id       uuid not null references couples on delete cascade,
  quiz_date       date not null,
  question_id     int not null,
  me_answer       text,
  partner_answer  text,
  me_comment      text,
  partner_comment text,
  created_at      timestamptz not null default now(),
  unique (couple_id, quiz_date)
);

alter table daily_quiz enable row level security;
create policy "couple can read quiz"   on daily_quiz for select using (couple_id = public.my_couple_id());
create policy "couple can insert quiz" on daily_quiz for insert with check (couple_id = public.my_couple_id());
create policy "couple can update quiz" on daily_quiz for update using (couple_id = public.my_couple_id());

create table if not exists coupons (
  id                 uuid primary key default gen_random_uuid(),
  couple_id          uuid not null references couples on delete cascade,
  created_by_person  text not null check (created_by_person in ('me','partner')),
  title              text not null,
  description        text,
  icon               text not null default 'gift',
  color              text not null default 'pink',
  redeemed_at        timestamptz,
  deleted_at         timestamptz,
  created_at         timestamptz not null default now()
);

alter table coupons enable row level security;
create policy "couple can read coupons"   on coupons for select using (couple_id = public.my_couple_id());
create policy "couple can insert coupons" on coupons for insert with check (couple_id = public.my_couple_id());
create policy "couple can update coupons" on coupons for update using (couple_id = public.my_couple_id());

alter table profiles add column if not exists status_emoji text;
