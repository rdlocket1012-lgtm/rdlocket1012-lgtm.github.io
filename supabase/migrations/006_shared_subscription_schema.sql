-- Shared relationship-level subscription: tier + original payer, status vocabulary
-- aligned to 'active' / 'past_due' / 'free', and a disconnect (break-up) RPC.

alter table couples add column if not exists subscription_tier text;
alter table couples add column if not exists original_paying_user_id uuid references profiles;

update couples set subscription_status = 'active' where subscription_status in ('premium', 'lifetime');

update couples
set original_paying_user_id = subscribed_by
where original_paying_user_id is null
  and subscription_status in ('active', 'past_due')
  and subscribed_by is not null;

create or replace function disconnect_relationship(p_start_date date)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_old uuid; v_payer uuid; v_tier text; v_status text; v_new uuid; v_ampayer boolean;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  select couple_id into v_old from profiles where id = v_uid;
  if v_old is null then raise exception 'No relationship to disconnect'; end if;

  select original_paying_user_id, subscription_tier, subscription_status
    into v_payer, v_tier, v_status from couples where id = v_old;
  v_ampayer := (v_payer = v_uid) and v_status in ('active', 'past_due');

  insert into couples (start_date, subscription_status, subscription_tier, original_paying_user_id)
  values (
    p_start_date,
    case when v_ampayer then v_status else 'free' end,
    case when v_ampayer then v_tier else null end,
    case when v_ampayer then v_uid else null end
  ) returning id into v_new;

  update profiles set couple_id = v_new where id = v_uid;
  if v_ampayer then
    update couples set subscription_status = 'free', subscription_tier = null, original_paying_user_id = null where id = v_old;
  end if;
  return v_new;
end;
$$;

grant execute on function disconnect_relationship(date) to anon, authenticated;
