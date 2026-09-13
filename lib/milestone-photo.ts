import * as ImagePicker from 'expo-image-picker';
import { decode as decodeBase64 } from 'base64-arraybuffer';
import { supabase } from '@/lib/supabase';

/**
 * Opens the photo library, lets the user crop a 4:3 photo, uploads it to the
 * public `milestone-photos` bucket and returns the public URL (or null if
 * cancelled). The caller collects URLs and saves them on the milestone's
 * `photos` JSONB array. Mirrors lib/cover-photo.ts.
 */
export async function pickAndUploadMilestonePhoto(coupleId: string): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
    base64: true,
  });
  if (result.canceled || !result.assets?.[0]?.base64) return null;

  const arrayBuffer = decodeBase64(result.assets[0].base64);
  const path = `${coupleId}/ms_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error: upErr } = await supabase.storage.from('milestone-photos').upload(path, arrayBuffer, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (upErr) throw new Error(upErr.message);

  const { data: pub } = supabase.storage.from('milestone-photos').getPublicUrl(path);
  return pub.publicUrl;
}
