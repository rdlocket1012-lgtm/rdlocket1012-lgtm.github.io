-- 022 — Cap uploads. Every bucket had file_size_limit NULL and no MIME
-- restriction, so four PUBLIC buckets would accept a file of any size and any
-- type: unbounded storage cost, and arbitrary content hostable on the project's
-- own origin.
--
-- MIME lists are set only where the client sends a fixed, known content type
-- (verified in lib/avatar.ts, lib/cover-photo.ts, lib/milestone-photo.ts and
-- stores/draw.store.ts — all hardcoded). png/webp are allowed beyond the jpeg
-- those actually send, as headroom.
--
-- voice-letters is deliberately left MIME-unrestricted: lib/audio-letter.ts
-- derives the type from the recording's file extension, so the value is not
-- predictable across devices and a whitelist could silently break voice
-- letters. It is a PRIVATE bucket, so the exposure is limited to size, which is
-- capped here.
--
-- Verified after applying: zero existing objects exceed their new limit.

update storage.buckets set
  file_size_limit = 10485760,  -- 10 MB; 1:1 cropped, quality 0.85
  allowed_mime_types = array['image/jpeg','image/png','image/webp']
where id = 'avatars';

update storage.buckets set
  file_size_limit = 15728640,  -- 15 MB; full-frame camera photos
  allowed_mime_types = array['image/jpeg','image/png','image/webp']
where id in ('couple-covers','milestone-photos');

update storage.buckets set
  file_size_limit = 5242880,   -- 5 MB; a 280x280 canvas PNG is tiny
  allowed_mime_types = array['image/png','image/jpeg']
where id = 'partner-drawings';

update storage.buckets set
  file_size_limit = 26214400   -- 25 MB; several minutes of m4a
where id = 'voice-letters';
