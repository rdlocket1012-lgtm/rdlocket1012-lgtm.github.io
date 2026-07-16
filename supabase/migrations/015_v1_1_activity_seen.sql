-- v1.1 Cozy Scrapbook: activity-feed seen marker.
-- ADDITIVE ONLY — adds one nullable column to profiles. No existing data is
-- touched; a NULL marker simply means "has never opened the Activity screen",
-- which the client treats as "everything is unseen".
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
