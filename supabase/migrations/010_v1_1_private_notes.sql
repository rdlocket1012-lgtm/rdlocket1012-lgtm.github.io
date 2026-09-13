-- v1.1 Cozy Scrapbook: per-user private notes (§12.11).
-- Notes are user-scoped — partners never see each other's entries.
-- Used by hooks/usePrivateNotes.ts.

create table if not exists private_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  content    text not null,
  tag        text check (tag in ('gift','observation','memory','idea','reminder')),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table private_notes enable row level security;

-- Strict owner-only access — partner can NEVER read.
create policy "owner can select private notes"
  on private_notes for select
  using (user_id = auth.uid());

create policy "owner can insert private notes"
  on private_notes for insert
  with check (user_id = auth.uid());

create policy "owner can update private notes"
  on private_notes for update
  using (user_id = auth.uid());

create index if not exists idx_private_notes_user_id on private_notes (user_id);
