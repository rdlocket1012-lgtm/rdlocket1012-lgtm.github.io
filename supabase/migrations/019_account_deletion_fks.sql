-- 019 — Make account deletion possible without destroying the partner's data.
--
-- WHY THIS EXISTS
-- ---------------
-- `profiles.id` is `REFERENCES auth.users(id) ON DELETE CASCADE`, so deleting an
-- auth user is *supposed* to remove their profile. It never could: nine columns
-- across seven tables reference `profiles(id)` with the default NO ACTION rule,
-- so the cascade hits a foreign-key violation for any user who has ever written
-- a letter, saved a milestone, dropped a pin, made a coupon or answered a quiz.
-- In other words, account deletion could not have worked even if the client had
-- called it — and the client never did (see app/settings/danger-zone.tsx).
--
-- NO DATA IS DROPPED OR RECREATED BY THIS MIGRATION. It only rewrites the
-- ON DELETE rule of existing foreign keys. Every column switched to SET NULL was
-- verified nullable first; no table, column or row is touched.
--
-- TWO RULES, TWO INTENTS
-- ----------------------
-- • profiles(id) referrers -> ON DELETE SET NULL.
--   Shared content is jointly authored. When one partner leaves, the letter or
--   milestone stays for the person still using the app; it simply loses its
--   author attribution. This is what "your partner's account will remain
--   unaffected" means in the delete-account screen.
--
-- • couples(id) referrers -> ON DELETE CASCADE.
--   A couple row is only ever deleted once nobody is left in it (see the
--   delete-account Edge Function). At that point its content must go with it,
--   or it is orphaned forever and unreachable by RLS. Most couple-scoped tables
--   already cascaded; these five were the stragglers.
--
-- `profiles.couple_id` also becomes SET NULL so a couple can be torn down even
-- if a profile row is still mid-delete.

begin;

-- ── profiles(id) referrers → SET NULL ──────────────────────────────────────
alter table public.letters             drop constraint letters_sender_id_fkey;
alter table public.letters             add  constraint letters_sender_id_fkey
  foreign key (sender_id)              references public.profiles(id) on delete set null;

alter table public.letters             drop constraint letters_recipient_id_fkey;
alter table public.letters             add  constraint letters_recipient_id_fkey
  foreign key (recipient_id)           references public.profiles(id) on delete set null;

alter table public.letters             drop constraint letters_reaction_by_fkey;
alter table public.letters             add  constraint letters_reaction_by_fkey
  foreign key (reaction_by)            references public.profiles(id) on delete set null;

alter table public.milestones          drop constraint milestones_created_by_fkey;
alter table public.milestones          add  constraint milestones_created_by_fkey
  foreign key (created_by)             references public.profiles(id) on delete set null;

alter table public.map_pins            drop constraint map_pins_added_by_fkey;
alter table public.map_pins            add  constraint map_pins_added_by_fkey
  foreign key (added_by)               references public.profiles(id) on delete set null;

alter table public.bucket_list_items   drop constraint bucket_list_items_added_by_fkey;
alter table public.bucket_list_items   add  constraint bucket_list_items_added_by_fkey
  foreign key (added_by)               references public.profiles(id) on delete set null;

alter table public.coupons             drop constraint coupons_created_by_fkey;
alter table public.coupons             add  constraint coupons_created_by_fkey
  foreign key (created_by)             references public.profiles(id) on delete set null;

alter table public.daily_quiz          drop constraint daily_quiz_created_by_fkey;
alter table public.daily_quiz          add  constraint daily_quiz_created_by_fkey
  foreign key (created_by)             references public.profiles(id) on delete set null;

alter table public.couples             drop constraint couples_original_paying_user_id_fkey;
alter table public.couples             add  constraint couples_original_paying_user_id_fkey
  foreign key (original_paying_user_id) references public.profiles(id) on delete set null;

-- ── couples(id) referrers → CASCADE ────────────────────────────────────────
alter table public.letters             drop constraint letters_couple_id_fkey;
alter table public.letters             add  constraint letters_couple_id_fkey
  foreign key (couple_id)              references public.couples(id) on delete cascade;

alter table public.milestones          drop constraint milestones_couple_id_fkey;
alter table public.milestones          add  constraint milestones_couple_id_fkey
  foreign key (couple_id)              references public.couples(id) on delete cascade;

alter table public.map_pins            drop constraint map_pins_couple_id_fkey;
alter table public.map_pins            add  constraint map_pins_couple_id_fkey
  foreign key (couple_id)              references public.couples(id) on delete cascade;

alter table public.bucket_list_items   drop constraint bucket_list_items_couple_id_fkey;
alter table public.bucket_list_items   add  constraint bucket_list_items_couple_id_fkey
  foreign key (couple_id)              references public.couples(id) on delete cascade;

alter table public.partner_invites     drop constraint partner_invites_couple_id_fkey;
alter table public.partner_invites     add  constraint partner_invites_couple_id_fkey
  foreign key (couple_id)              references public.couples(id) on delete cascade;

alter table public.profiles            drop constraint profiles_couple_id_fkey;
alter table public.profiles            add  constraint profiles_couple_id_fkey
  foreign key (couple_id)              references public.couples(id) on delete set null;

-- A streak override outlives the coupon that bought it: the streak day it
-- rescued already happened and must not silently un-rescue itself.
alter table public.quiz_streak_overrides drop constraint quiz_streak_overrides_source_coupon_id_fkey;
alter table public.quiz_streak_overrides add  constraint quiz_streak_overrides_source_coupon_id_fkey
  foreign key (source_coupon_id)       references public.coupons(id) on delete set null;

commit;
