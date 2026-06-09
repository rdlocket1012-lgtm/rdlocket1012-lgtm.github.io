-- Profile details (favorite color, etc.) with per-person rows and questions,
-- avatar_url column, and a public avatars storage bucket.

create table if not exists profile_details (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid not null references couples on delete cascade,
  person      text not null check (person in ('me','partner')),
  key         text not null,
  label       text not null,
  value       text,
  is_question boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (couple_id, person, key)
);

alter table profile_details enable row level security;

create policy "couple can read details"
  on profile_details for select using (couple_id = public.my_couple_id());
create policy "couple can insert details"
  on profile_details for insert with check (couple_id = public.my_couple_id());
create policy "couple can update details"
  on profile_details for update using (couple_id = public.my_couple_id());
create policy "couple can delete details"
  on profile_details for delete using (couple_id = public.my_couple_id());

alter table profiles add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars public read"
  on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars authed write"
  on storage.objects for insert to authenticated with check (bucket_id = 'avatars');
create policy "avatars authed update"
  on storage.objects for update to authenticated using (bucket_id = 'avatars');
create policy "avatars authed delete"
  on storage.objects for delete to authenticated using (bucket_id = 'avatars');
