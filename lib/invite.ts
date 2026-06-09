import { Share } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

/** Generates a single-use invite token, stores it, and opens the share sheet. */
export async function shareInvite() {
  const coupleId = useAuthStore.getState().profile?.couple_id;

  // Cryptographically secure token — 24 hex chars (96 bits of entropy).
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const token = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');

  if (coupleId) {
    // Best-effort — ignore failure.
    await supabase.from('partner_invites').insert({ couple_id: coupleId, token }).then(() => {}, () => {});
  }

  // HTTPS link: opens landing page → tries app → falls back to App Store.
  const link = `https://rdlocket1012-lgtm.github.io/invite?token=${token}`;
  await Share.share({ message: `Join me on Locket 💛 Tap to link our space: ${link}` });
}
