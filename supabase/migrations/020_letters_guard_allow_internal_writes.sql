-- 020 — Stop the letters edit-guard from silently defeating foreign keys.
--
-- FOUND WHILE TESTING 019. `letters_guard_non_sender_edits` is a BEFORE UPDATE
-- trigger that reverts sender_id/recipient_id to OLD for any caller that is not
-- the sender. During a referential action — the ON DELETE SET NULL added in 019,
-- which runs when an account is deleted — there is no end user, so auth.uid() is
-- NULL, the guard took the "not the sender" branch, and it undid the foreign
-- key's own update. The row was left pointing at a profile that no longer
-- existed: a state the constraint declares impossible, created by the trigger.
--
-- Symptom to recognise if this shape recurs: a DELETE succeeds, the referenced
-- row is gone, and the referencing column still holds the old id with no error
-- anywhere. Any BEFORE UPDATE trigger that rewrites NEW can do this to a
-- SET NULL / CASCADE-to-NULL foreign key.
--
-- A NULL auth.uid() means the write came from the database itself or the service
-- role (referential actions, Edge Functions, migrations). Those already bypass
-- RLS entirely, so exempting them grants nothing that wasn't already possible.
-- Anonymous clients are NOT exempted: the UPDATE policy on letters requires
-- `couple_id = my_couple_id()`, which is never true without a session.

create or replace function public.letters_guard_non_sender_edits()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
BEGIN
  -- Internal / service-role write (referential action, Edge Function, migration).
  -- Never guard these: doing so silently breaks foreign-key integrity.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Senders may edit their own letters freely.
  IF NEW.sender_id = auth.uid() THEN
    RETURN NEW;
  END IF;

  -- Non-senders (the recipient) may only touch reaction fields; everything
  -- else is reverted to its previous value so letter content stays immutable.
  NEW.couple_id        := OLD.couple_id;
  NEW.sender_id        := OLD.sender_id;
  NEW.recipient_id     := OLD.recipient_id;
  NEW.body_rich_html   := OLD.body_rich_html;
  NEW.is_sealed_until  := OLD.is_sealed_until;
  NEW.reveal_at        := OLD.reveal_at;
  NEW.sent_at          := OLD.sent_at;
  NEW.is_draft         := OLD.is_draft;
  NEW.deleted_at       := OLD.deleted_at;
  NEW.created_at       := OLD.created_at;
  NEW.audio_path       := OLD.audio_path;
  NEW.audio_duration   := OLD.audio_duration;
  NEW.transcript       := OLD.transcript;
  RETURN NEW;
END;
$function$;
