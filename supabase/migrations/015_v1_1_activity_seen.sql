-- v1.1 Cozy Scrapbook: activity-feed seen marker.
-- ADDITIVE ONLY — adds one column to profiles. No existing table or column is
-- modified or dropped.
--
-- Powers:
--   * the coral dot on the Home bell
--   * the iOS/Android app-icon badge count
--
-- This is deliberately SEPARATE from letters_seen_at / coupons_seen_at /
-- milestones_seen_at. Those clear when you open each feature screen and drive
-- the per-item "NEW" tags. Opening the Activity feed must NOT mark a letter as
-- read — you saw that it arrived, you didn't read it. Two markers, two jobs.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS activity_seen_at TIMESTAMPTZ;

-- Seed existing profiles to now(). The client reads NULL as "has never opened
-- the feed → everything is unseen", so without this backfill every live couple
-- would be badged with their ENTIRE history on the release that ships this.
-- Seeding makes existing users start caught-up; only new activity counts.
UPDATE profiles SET activity_seen_at = now() WHERE activity_seen_at IS NULL;

-- Match the convention already used by the other *_seen_at columns, so a newly
-- created profile also starts caught-up rather than seeing its own backlog.
ALTER TABLE profiles ALTER COLUMN activity_seen_at SET DEFAULT now();
ALTER TABLE profiles ALTER COLUMN activity_seen_at SET NOT NULL;
