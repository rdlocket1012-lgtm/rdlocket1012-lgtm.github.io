-- 017_v1_1_advisor_hardening.sql
--
-- Clears the Supabase security + performance advisor findings from the
-- 2026-09-13 pre-launch audit. Everything here is additive or in-place:
-- no table is dropped, no column is removed, and no policy's meaning changes.
--
-- Sections:
--   1. Pin search_path on the one function that missed migration 008's pass
--   2. Stop exposing trigger functions as callable RPCs
--   3. Revoke anon EXECUTE on session-only RPCs
--   4. Index the 5 foreign keys added after 008
--   5. Collapse private_notes' four overlapping policies to one
--   6. Wrap auth.uid() in a scalar subquery across 12 policies
--
-- NOT handled here (dashboard settings, no SQL equivalent):
--   • Leaked-password protection — Authentication → Policies
--   • Anonymous sign-in provider — should be OFF; the app no longer uses it


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Mutable search_path
--
-- Migration 008 pinned search_path across every function that existed then.
-- restore_couple_streak arrived later (013) and never got the same treatment,
-- so it resolves unqualified names against the caller's search_path — the
-- classic SECURITY DEFINER hijack vector.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER FUNCTION public.restore_couple_streak(uuid, uuid, date[])
  SET search_path = public, pg_temp;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Trigger functions exposed over the REST API
--
-- handle_new_user() and letters_guard_non_sender_edits() are trigger functions.
-- Postgres grants EXECUTE to PUBLIC on every new function, and PostgREST then
-- publishes anything executable as /rest/v1/rpc/<name> — so both were callable
-- by anyone with the anon key. Nothing should ever invoke them directly.
--
-- Revoking is safe for the triggers themselves: EXECUTE on a trigger function
-- is checked when the trigger is CREATED, not each time it fires.
-- ─────────────────────────────────────────────────────────────────────────────

REVOKE EXECUTE ON FUNCTION public.handle_new_user()
  FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.letters_guard_non_sender_edits()
  FROM PUBLIC, anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Session-only RPCs should not be reachable by anon
--
-- All four derive the caller from auth.uid(), so an anon call already fails —
-- this just stops them being probeable with nothing but the publishable key.
--
-- my_couple_id() is deliberately NOT revoked: it is called from inside the RLS
-- policies on couples / profiles / letters. Removing anon's EXECUTE would turn
-- an anon read from "zero rows" into a permission error, which is a worse
-- surface than leaving it callable.
-- ─────────────────────────────────────────────────────────────────────────────

REVOKE EXECUTE ON FUNCTION public.bootstrap_couple(date)                   FROM anon;
REVOKE EXECUTE ON FUNCTION public.disconnect_relationship(date)            FROM anon;
REVOKE EXECUTE ON FUNCTION public.join_couple(text)                        FROM anon;
REVOKE EXECUTE ON FUNCTION public.restore_couple_streak(uuid, uuid, date[]) FROM anon;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Unindexed foreign keys
--
-- Same pass 008 did for the tables that existed then. Without a covering index
-- every cascade check and every join on these columns is a sequential scan.
-- Plain CREATE INDEX (not CONCURRENTLY) because migrations run inside a
-- transaction and these tables are small.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by
  ON public.calendar_events (created_by);

CREATE INDEX IF NOT EXISTS idx_letters_reaction_by
  ON public.letters (reaction_by);

CREATE INDEX IF NOT EXISTS idx_partner_drawings_sender_id
  ON public.partner_drawings (sender_id);

CREATE INDEX IF NOT EXISTS idx_private_notes_user_id
  ON public.private_notes (user_id);

CREATE INDEX IF NOT EXISTS idx_quiz_streak_overrides_source_coupon_id
  ON public.quiz_streak_overrides (source_coupon_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. private_notes: four permissive policies where one does the job
--
-- `owner_only` is FOR ALL with both USING and WITH CHECK. The three command
-- -specific policies are exact subsets of it, so every query on the one table
-- holding genuinely private data was evaluating two policies instead of one.
--
-- Keep `owner_only` and drop the subsets — NOT the other way round. `owner_only`
-- is the only one of the four that covers DELETE; dropping it would silently
-- remove the ability to delete a note.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS owner_only_select ON public.private_notes;
DROP POLICY IF EXISTS owner_only_insert ON public.private_notes;
DROP POLICY IF EXISTS owner_only_update ON public.private_notes;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. auth.uid() re-evaluated per row
--
-- Bare auth.uid() in a policy is re-executed for every candidate row. Wrapping
-- it in a scalar subquery lets the planner hoist it into an InitPlan and run it
-- once per statement. Predicate logic is otherwise byte-for-byte unchanged.
--
-- ALTER POLICY rather than DROP + CREATE: it is atomic, so there is no instant
-- where the table sits unprotected.
-- ─────────────────────────────────────────────────────────────────────────────

-- profiles
ALTER POLICY "users can read own profile"   ON public.profiles
  USING (id = (select auth.uid()));

ALTER POLICY "users can insert own profile" ON public.profiles
  WITH CHECK (id = (select auth.uid()));

ALTER POLICY "users can update own profile" ON public.profiles
  USING (id = (select auth.uid()));

-- couples
ALTER POLICY "authenticated users can insert couples" ON public.couples
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- letters
-- my_couple_id() is left as-is: the advisor flags only auth.<fn>(), and keeping
-- this edit to the single flagged call keeps the diff reviewable.
ALTER POLICY "couple members can read letters" ON public.letters
  USING (
    (couple_id = my_couple_id())
    AND (
      (is_sealed_until = false)
      OR (reveal_at <= now())
      OR (sender_id = (select auth.uid()))
    )
  );

-- partner_drawings
ALTER POLICY "couple_members_can_read_drawings" ON public.partner_drawings
  USING (
    couple_id IN (
      SELECT profiles.couple_id
      FROM profiles
      WHERE profiles.id = (select auth.uid())
        AND profiles.couple_id IS NOT NULL
    )
  );

ALTER POLICY "user_can_insert_own_drawings" ON public.partner_drawings
  WITH CHECK (sender_id = (select auth.uid()));

ALTER POLICY "user_can_delete_own_drawings" ON public.partner_drawings
  USING (sender_id = (select auth.uid()));

-- activity_dismissals
ALTER POLICY "owner can select dismissals" ON public.activity_dismissals
  USING (user_id = (select auth.uid()));

ALTER POLICY "owner can insert dismissals" ON public.activity_dismissals
  WITH CHECK (user_id = (select auth.uid()));

ALTER POLICY "owner can delete dismissals" ON public.activity_dismissals
  USING (user_id = (select auth.uid()));

-- private_notes (the surviving FOR ALL policy from section 5)
ALTER POLICY owner_only ON public.private_notes
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
