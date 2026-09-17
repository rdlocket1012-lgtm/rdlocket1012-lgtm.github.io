import * as ImagePicker from 'expo-image-picker';
import { decode as decodeBase64 } from 'base64-arraybuffer';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Opens the photo library, lets the user crop a square, uploads to the
 * `avatars` bucket and stamps profiles.avatar_url. Returns the public URL,
 * or null if the user cancelled.
 *
 * Same pipeline as profile/edit — extracted so onboarding can reuse it.
 */
export async function pickAndUploadAvatar(profileId: string): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
    base64: true,
  });
  if (result.canceled || !result.assets?.[0]?.base64) return null;

  const arrayBuffer = decodeBase64(result.assets[0].base64);
  const path = `${profileId}/avatar_${Date.now()}.jpg`;
  const { error: upErr } = await supabase.storage.from('avatars').upload(path, arrayBuffer, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (upErr) throw new Error(upErr.message);

  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
  const publicUrl = `${pub.publicUrl}?t=${Date.now()}`;
  await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profileId);
  await useAuthStore.getState().fetchProfile(profileId);
  return publicUrl;
}
