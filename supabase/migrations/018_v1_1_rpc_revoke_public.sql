-- 018_v1_1_rpc_revoke_public.sql
--
-- Corrects section 3 of migration 017.
--
-- 017 tried to take anon's access to the four session-only RPCs with
-- `REVOKE EXECUTE ... FROM anon`. That was a no-op: anon never held a direct
-- grant. Postgres grants EXECUTE to PUBLIC on every newly created function, and
-- anon reaches these through that. The catalog showed it plainly — the ACL
-- entry `=X/postgres` (empty grantee = PUBLIC) survived the revoke:
--
--   bootstrap_couple → {=X/postgres,postgres=X/postgres,authenticated=X/postgres,...}
--                       ^^^^^^^^^^^ PUBLIC still holds EXECUTE
--
-- The same section's trigger-function revokes named PUBLIC explicitly and did
-- work, which is what isolates the cause.
--
-- Revoking PUBLIC is enough on its own here: `authenticated` already holds a
-- direct grant (`authenticated=X/postgres`), so it keeps access. The GRANTs
-- below are written anyway so this migration is correct when replayed against a
-- fresh database, where that direct grant may not exist yet.

REVOKE EXECUTE ON FUNCTION public.bootstrap_couple(date)                    FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.disconnect_relationship(date)             FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.join_couple(text)                         FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.restore_couple_streak(uuid, uuid, date[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.bootstrap_couple(date)                    TO authenticated;
GRANT EXECUTE ON FUNCTION public.disconnect_relationship(date)             TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_couple(text)                         TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_couple_streak(uuid, uuid, date[]) TO authenticated;

-- my_couple_id() is still left reachable by anon, on purpose. It is called from
-- inside the RLS policies on couples / profiles / letters, and an anon query
-- against those tables would raise a permission error instead of returning zero
-- rows if the role could not execute it.
--
-- The remaining `authenticated_security_definer_function_executable` findings
-- are by design: these are exactly the RPCs the app calls on behalf of a
-- signed-in user (stores/couple.store.ts, lib/bootstrap.ts, lib/invite.ts,
-- hooks/useStreakRestore.ts).
