-- v1.1 Cozy Scrapbook: per-user Activity feed dismissals.
-- ADDITIVE ONLY — new table, no existing table or column is touched.
--
-- Dismissing is strictly personal: hiding a letter from YOUR feed must never
-- hide it from your partner's. Hence user_id (not couple_id) in the key, and
-- owner-only RLS with no couple-wide read — the same shape as private_notes
-- (migration 010).
--
-- item_id is the Activity feed's synthetic row id (e.g. 'lt-<uuid>',
-- 'cp-<uuid>', 'bk-<uuid>'), NOT a foreign key. It's deliberately loose text:
-- one source row can produce two distinct feed rows (a coupon gifted vs. that
-- same coupon's redeem request), so the feed id is the only thing that
-- identifies what the user actually swiped away. The trade-off is no cascade —
-- see the cleanup note below.

CREATE TABLE IF NOT EXISTS activity_dismissals (
  user_id      UUID        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  item_id      TEXT        NOT NULL,
  dismissed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, item_id)
);

ALTER TABLE activity_dismissals ENABLE ROW LEVEL SECURITY;

-- Owner-only. A user can never read or write another user's dismissals —
-- including their partner's.
CREATE POLICY "owner can select dismissals"
  ON activity_dismissals FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "owner can insert dismissals"
  ON activity_dismissals FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Undo support: a user can un-dismiss their own rows.
CREATE POLICY "owner can delete dismissals"
  ON activity_dismissals FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_activity_dismissals_user ON activity_dismissals (user_id);

-- Note: rows here outlive the source item (no FK to cascade from). This is
-- harmless — the feed only ever filters items it has already loaded, so a
-- dismissal for a deleted letter simply never matches. The table stays tiny
-- (one short row per swipe, per user).
