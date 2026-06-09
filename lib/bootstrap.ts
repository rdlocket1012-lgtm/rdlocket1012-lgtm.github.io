import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Ensures the user has an authenticated session (anonymous if needed),
 * a profile row, and a couple linked to that profile.
 *
 * Returns the couple_id. Safe to call repeatedly — it is idempotent.
 *
 * Requires "Anonymous sign-ins" to be enabled in the Supabase dashboard
 * (Authentication → Providers → Anonymous), and migration 002 to be applied.
 */
export async function ensureCoupleSession(startDate: string): Promise<string> {
  // 1. Ensure a session exists.
  let {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw new Error(`Sign-in failed: ${error.message}`);
    session = data.session;
  }

  if (!session?.user) throw new Error('Could not establish a session.');

  // 2. Create / link couple atomically via RPC.
  const { data: coupleId, error: rpcError } = await supabase.rpc('bootstrap_couple', {
    p_start_date: startDate,
  });
  if (rpcError) throw new Error(`Couple setup failed: ${rpcError.message}`);

  // 3. Refresh the auth store so couple_id propagates to all hooks.
  useAuthStore.getState().setSession(session);
  await useAuthStore.getState().fetchProfile(session.user.id);

  return coupleId as string;
}
