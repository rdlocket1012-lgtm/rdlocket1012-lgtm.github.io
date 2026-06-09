-- Redeem a partner invite token and join the inviter's couple.
create or replace function join_couple(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_couple uuid; v_expires timestamptz; v_used timestamptz;
  v_my_couple uuid; v_member_count int;
begin
  if v_uid is null then raise exception 'You need to be signed in first.'; end if;

  select couple_id, expires_at, used_at into v_couple, v_expires, v_used
  from partner_invites where token = p_token;

  if v_couple is null then raise exception 'This invite link is not valid.'; end if;
  if v_used is not null then raise exception 'This invite has already been used.'; end if;
  if v_expires < now() then raise exception 'This invite has expired.'; end if;

  select couple_id into v_my_couple from profiles where id = v_uid;
  if v_my_couple = v_couple then raise exception 'This is your own invite link.'; end if;

  select count(*) into v_member_count from profiles where couple_id = v_couple;
  if v_member_count >= 2 then raise exception 'This couple is already complete.'; end if;

  update profiles set couple_id = v_couple where id = v_uid;
  update partner_invites set used_at = now() where token = p_token;
  return v_couple;
end;
$$;

grant execute on function join_couple(text) to anon, authenticated;
