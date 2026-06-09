-- Fix infinite recursion in profiles RLS.
-- The original "couple members can read partner profile" policy queried the
-- profiles table from within a policy ON profiles, causing infinite recursion
-- that aborted every read of profiles — which in turn broke fetchProfile, the
-- couple lookup, and every insert permission check that sub-queries profiles.
--
-- Fix: a SECURITY DEFINER helper that returns the current user's couple_id
-- without re-triggering RLS, used in place of all `select couple_id from
-- profiles where id = auth.uid()` sub-queries.

create or replace function public.my_couple_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select couple_id from public.profiles where id = auth.uid();
$$;

grant execute on function public.my_couple_id() to anon, authenticated;

-- profiles
drop policy if exists "couple members can read partner profile" on profiles;
create policy "couple members can read partner profile"
  on profiles for select
  using (couple_id is not null and couple_id = public.my_couple_id());

-- couples
drop policy if exists "couple members can read couples" on couples;
create policy "couple members can read couples"
  on couples for select using (id = public.my_couple_id());

drop policy if exists "couple members can update couples" on couples;
create policy "couple members can update couples"
  on couples for update using (id = public.my_couple_id());

-- partner_invites
drop policy if exists "couple members can read invites" on partner_invites;
create policy "couple members can read invites"
  on partner_invites for select using (couple_id = public.my_couple_id());

drop policy if exists "couple members can insert invites" on partner_invites;
create policy "couple members can insert invites"
  on partner_invites for insert with check (couple_id = public.my_couple_id());

-- milestones
drop policy if exists "couple members can read milestones" on milestones;
create policy "couple members can read milestones"
  on milestones for select using (couple_id = public.my_couple_id());

drop policy if exists "couple members can insert milestones" on milestones;
create policy "couple members can insert milestones"
  on milestones for insert with check (couple_id = public.my_couple_id());

drop policy if exists "couple members can update milestones" on milestones;
create policy "couple members can update milestones"
  on milestones for update using (couple_id = public.my_couple_id());

-- letters
drop policy if exists "couple members can read letters" on letters;
create policy "couple members can read letters"
  on letters for select
  using (
    couple_id = public.my_couple_id()
    and (is_sealed_until = false or reveal_at <= now() or sender_id = auth.uid())
  );

drop policy if exists "couple members can insert letters" on letters;
create policy "couple members can insert letters"
  on letters for insert with check (couple_id = public.my_couple_id());

-- map_pins
drop policy if exists "couple members can read pins" on map_pins;
create policy "couple members can read pins"
  on map_pins for select using (couple_id = public.my_couple_id());

drop policy if exists "couple members can insert pins" on map_pins;
create policy "couple members can insert pins"
  on map_pins for insert with check (couple_id = public.my_couple_id());

drop policy if exists "couple members can update pins" on map_pins;
create policy "couple members can update pins"
  on map_pins for update using (couple_id = public.my_couple_id());

-- bucket_list_items
drop policy if exists "couple members can read bucket items" on bucket_list_items;
create policy "couple members can read bucket items"
  on bucket_list_items for select using (couple_id = public.my_couple_id());

drop policy if exists "couple members can insert bucket items" on bucket_list_items;
create policy "couple members can insert bucket items"
  on bucket_list_items for insert with check (couple_id = public.my_couple_id());

drop policy if exists "couple members can update bucket items" on bucket_list_items;
create policy "couple members can update bucket items"
  on bucket_list_items for update using (couple_id = public.my_couple_id());
