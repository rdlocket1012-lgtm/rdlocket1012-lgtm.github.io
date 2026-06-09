import { Share, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

/** Generates a single-use invite token, stores it, and opens the share sheet. */
export async function shareInvite() {
  try {
    const coupleId = useAuthStore.getState().profile?.couple_id;

    // Generate a cryptographically random token (96 bits).
    let token: string;
    try {
      const bytes = new Uint8Array(12);
      crypto.getRandomValues(bytes);
      token = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback if crypto is unavailable
      token = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }

    if (coupleId) {
      // Best-effort — ignore failure if table doesn't exist yet.
      try {
        await supabase.from('partner_invites').insert({ couple_id: coupleId, token });
      } catch { /* ignore */ }
    }

    const link = `https://rdlocket1012-lgtm.github.io/invite?token=${token}`;
    await Share.share({ message: `Join me on Locket 💛 Tap to link our space: ${link}` });
  } catch (e: any) {
    Alert.alert('Could not share', e?.message ?? 'Please try again.');
  }
}
