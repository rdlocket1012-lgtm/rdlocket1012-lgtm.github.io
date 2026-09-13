-- 021 — Clear the last actionable security-advisor finding.
--
-- `my_couple_id()` is SECURITY DEFINER and was reachable by `anon` via
-- /rest/v1/rpc/my_couple_id. It returns NULL for an anonymous caller, so this is
-- defence in depth rather than a live hole — but an unauthenticated caller has
-- no reason to reach a SECURITY DEFINER function at all.
--
-- NOTE: revoking from `anon` alone is a NO-OP here. EXECUTE was granted to
-- PUBLIC, which subsumes anon, so the advisor finding survived the first
-- attempt. The grant that matters is the PUBLIC one.
--
-- `authenticated`, `service_role` and `postgres` each hold their own explicit
-- grant (verified before running this), so dropping PUBLIC removes anonymous
-- access without touching any path the app uses. Every RLS policy in the schema
-- calls this function as `authenticated`, so that grant must stay.

revoke execute on function public.my_couple_id() from anon;
revoke execute on function public.my_couple_id() from public;
