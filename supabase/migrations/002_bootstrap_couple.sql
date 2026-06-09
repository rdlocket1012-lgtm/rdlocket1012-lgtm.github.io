-- Locket bootstrap RPC
-- Creates a couple for the current user and links their profile, atomically.
-- SECURITY DEFINER so it bypasses the couples SELECT RLS gotcha on INSERT ... RETURNING.
-- Run this in the Supabase SQL editor AFTER 001_initial_schema.sql.

create or replace function bootstrap_couple(p_start_date date)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_couple_id uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Ensure a profile row exists (handle_new_user trigger normally makes it,
  -- but anonymous sign-ins or race conditions can leave it missing).
  insert into public.profiles (id, display_name)
  values (v_uid, 'You')
  on conflict (id) do nothing;

  -- If already linked to a couple, return it (idempotent).
  select couple_id into v_couple_id
  from public.profiles
  where id = v_uid;

  if v_couple_id is not null then
    -- keep the start date fresh if it changed
    update public.couples set start_date = p_start_date where id = v_couple_id;
    return v_couple_id;
  end if;

  -- Otherwise create a new couple and link it.
  insert into public.couples (start_date, subscription_status)
  values (p_start_date, 'free')
  returning id into v_couple_id;

  update public.profiles
  set couple_id = v_couple_id
  where id = v_uid;

  return v_couple_id;
end;
$$;

grant execute on function bootstrap_couple(date) to anon, authenticated;
