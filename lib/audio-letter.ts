import { supabase } from '@/lib/supabase';

const BUCKET = 'voice-letters';

/**
 * Uploads a locally-recorded audio file to the private `voice-letters` bucket.
 * Returns the storage path (not a URL) — playback uses a short-lived signed URL.
 */
export async function uploadVoiceLetter(
  localUri: string,
  coupleId: string,
): Promise<string | null> {
  try {
    // Read the file as an ArrayBuffer for upload
    const res = await fetch(localUri);
    const blob = await res.arrayBuffer();

    const ext = localUri.split('.').pop()?.split('?')[0] || 'm4a';
    const path = `${coupleId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, {
        contentType: `audio/${ext === 'm4a' ? 'mp4' : ext}`,
        upsert: false,
      });

    if (error) return null;
    return path;
  } catch {
    return null;
  }
}

/**
 * Returns a signed URL (valid 1 hour) for playing back a stored voice letter.
 */
export async function getVoiceLetterUrl(path: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60);
    if (error) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

/** Formats a duration in seconds as m:ss. */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
