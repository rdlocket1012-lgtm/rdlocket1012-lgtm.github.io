-- 008: Security & performance hardening.
--   #1  Pin search_path on trigger functions; revoke public EXECUTE on the
--       SECURITY DEFINER signup trigger so it can't be called as an RPC.
--   #2  Stop the public `avatars` bucket from allowing clients to LIST files.
--       (Public object URLs keep working — downloads on a public bucket do not
--        go through RLS, so the broad SELECT policy was only enabling listing.)
--   #3  Add covering indexes for every foreign key flagged by the linter.

-- =====================
-- #1  Function hardening
-- =====================

-- Both functions reference only schema-qualified objects (public.profiles) and
-- pg_catalog builtins (now()), so an empty search_path is safe and immutable.
alter function public.handle_updated_at() set search_path = '';
alter function public.handle_new_user()  set search_path = '';

-- handle_new_user runs as an AFTER INSERT trigger on auth.users; triggers fire
-- as the table owner regardless of EXECUTE grants, so revoking here removes the
-- RPC attack surface without affecting signup.
revoke execute on function public.handle_new_user() from anon, authenticated;

-- =====================
-- #2  Lock down avatar listing
-- =====================

drop policy if exists "avatars public read" on storage.objects;

-- =====================
-- #3  Covering indexes for foreign keys
-- =====================

create index if not exists idx_bucket_list_items_added_by      on public.bucket_list_items (added_by);
create index if not exists idx_bucket_list_items_couple_id     on public.bucket_list_items (couple_id);
create index if not exists idx_couples_original_paying_user_id on public.couples (original_paying_user_id);
create index if not exists idx_coupons_couple_id               on public.coupons (couple_id);
create index if not exists idx_letters_couple_id               on public.letters (couple_id);
create index if not exists idx_letters_recipient_id            on public.letters (recipient_id);
create index if not exists idx_letters_sender_id               on public.letters (sender_id);
create index if not exists idx_map_pins_added_by               on public.map_pins (added_by);
create index if not exists idx_map_pins_couple_id              on public.map_pins (couple_id);
create index if not exists idx_milestones_couple_id            on public.milestones (couple_id);
create index if not exists idx_milestones_created_by           on public.milestones (created_by);
create index if not exists idx_partner_invites_couple_id       on public.partner_invites (couple_id);
create index if not exists idx_profiles_couple_id              on public.profiles (couple_id);
