import * as ImagePicker from 'expo-image-picker';
import { decode as decodeBase64 } from 'base64-arraybuffer';
import { supabase } from '@/lib/supabase';
import { useCoupleStore } from '@/stores/couple.store';

/**
 * Opens the photo library, lets the user crop a wide cover, uploads to the
 * `couple-covers` bucket and stamps `couples.cover_photo_url`. Returns the
 * public URL, or null if cancelled.
 *
 * Mirrors lib/avatar.ts. NOTE: needs the cover-photo migration —
 * `couples.cover_photo_url` column + a public `couple-covers` Storage bucket.
 * Until that lands the upload/update will throw; callers should catch and
 * surface a gentle error.
 */
export async function pickAndUploadCoverPhoto(coupleId: string): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.85,
    base64: true,
  });
  if (result.canceled || !result.assets?.[0]?.base64) return null;

  const arrayBuffer = decodeBase64(result.assets[0].base64);
  const path = `${coupleId}/cover_${Date.now()}.jpg`;
  const { error: upErr } = await supabase.storage.from('couple-covers').upload(path, arrayBuffer, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (upErr) throw new Error(upErr.message);

  const { data: pub } = supabase.storage.from('couple-covers').getPublicUrl(path);
  const publicUrl = `${pub.publicUrl}?t=${Date.now()}`;
  const { error: updErr } = await supabase.from('couples').update({ cover_photo_url: publicUrl }).eq('id', coupleId);
  if (updErr) throw new Error(updErr.message);

  await useCoupleStore.getState().fetchCouple(coupleId);
  return publicUrl;
}
