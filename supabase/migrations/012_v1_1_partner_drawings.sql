-- Migration: Partner Draw Widget (Phase 14)
-- Creates the partner_drawings table for storing drawn images between partners.
-- ADDITIVE ONLY — no existing tables or columns are modified.
--
-- After running this migration, also create a public storage bucket named
-- 'partner-drawings' in the Supabase dashboard (Storage → New bucket → Public).

CREATE TABLE IF NOT EXISTS partner_drawings (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id   UUID        NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  sender_id   UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_path  TEXT        NOT NULL,
  image_url   TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON partner_drawings (couple_id, created_at DESC);

ALTER TABLE partner_drawings ENABLE ROW LEVEL SECURITY;

-- Couple members can read all drawings for their couple.
CREATE POLICY "couple_members_can_read_drawings"
  ON partner_drawings FOR SELECT
  USING (
    couple_id IN (
      SELECT couple_id FROM profiles WHERE id = auth.uid() AND couple_id IS NOT NULL
    )
  );

-- Users can insert drawings where they are the sender.
CREATE POLICY "user_can_insert_own_drawings"
  ON partner_drawings FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- Users can delete their own drawings.
CREATE POLICY "user_can_delete_own_drawings"
  ON partner_drawings FOR DELETE
  USING (sender_id = auth.uid());
