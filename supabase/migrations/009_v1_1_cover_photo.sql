-- v1.1 Cozy Scrapbook: couple cover photo column + storage bucket.
-- Used by lib/cover-photo.ts (pickAndUploadCoverPhoto).

alter table couples add column if not exists cover_photo_url text;

-- Public bucket so cover photos can be displayed without auth tokens.
insert into storage.buckets (id, name, public)
values ('couple-covers', 'couple-covers', true)
on conflict (id) do nothing;

-- Drop stale policies if re-running (idempotent).
drop policy if exists "couple-covers public read"    on storage.objects;
drop policy if exists "couple-covers authed write"   on storage.objects;
drop policy if exists "couple-covers authed update"  on storage.objects;
drop policy if exists "couple-covers authed delete"  on storage.objects;

create policy "couple-covers public read"
  on storage.objects for select using (bucket_id = 'couple-covers');

create policy "couple-covers authed write"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'couple-covers');

create policy "couple-covers authed update"
  on storage.objects for update to authenticated
  using (bucket_id = 'couple-covers');

create policy "couple-covers authed delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'couple-covers');
