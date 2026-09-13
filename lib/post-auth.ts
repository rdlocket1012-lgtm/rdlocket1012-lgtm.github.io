import { pendingInviteRoute } from '@/lib/pending-invite';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Where to send a user the instant they're authenticated. Couple-aware so we
 * never drop someone onto an empty home or a dead-end:
 *   1. pending invite → resume the join
 *   2. already has a couple → home
 *   3. signed in but no couple yet → onboarding
 * Refetches the profile first so couple_id is current.
 */
export async function routeAfterAuth(uid?: string | null): Promise<string> {
  const inv = await pendingInviteRoute();
  if (inv) return inv;
  if (uid) {
    try { await useAuthStore.getState().fetchProfile(uid); } catch { /* best-effort */ }
  }
  const hasCouple = !!useAuthStore.getState().profile?.couple_id;
  return hasCouple ? '/(tabs)' : '/(onboarding)/name';
}
