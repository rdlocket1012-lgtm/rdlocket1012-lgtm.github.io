-- v1.1 Cozy Scrapbook: photo strip on milestone cards (Timeline §9.5).
-- Stores up to 5 photo URLs per milestone as a JSONB array.
-- Used by app/(tabs)/timeline and the milestone detail screen.

alter table milestones add column if not exists photos jsonb not null default '[]'::jsonb;

-- Public photo bucket so milestone photos can be displayed without tokens.
insert into storage.buckets (id, name, public)
values ('milestone-photos', 'milestone-photos', true)
on conflict (id) do nothing;

drop policy if exists "milestone-photos public read"   on storage.objects;
drop policy if exists "milestone-photos authed write"  on storage.objects;
drop policy if exists "milestone-photos authed update" on storage.objects;
drop policy if exists "milestone-photos authed delete" on storage.objects;

create policy "milestone-photos public read"
  on storage.objects for select using (bucket_id = 'milestone-photos');

create policy "milestone-photos authed write"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'milestone-photos');

create policy "milestone-photos authed update"
  on storage.objects for update to authenticated
  using (bucket_id = 'milestone-photos');

create policy "milestone-photos authed delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'milestone-photos');
