import { useAuth } from '@/hooks/useAuth';
import { usePartner } from '@/hooks/usePartner';
import type { Person } from '@/stores/details.store';

/**
 * The `profile_details` table stores rows under an absolute `person` slot
 * ('me' | 'partner'), but those labels are only meaningful relative to one
 * viewer. To make About Us correct for BOTH partners — and to stop the two
 * of them overwriting each other's self-details — we anchor the 'me' slot to
 * the partner who set the couple up first (earliest profile `created_at`,
 * with the user id as a stable tiebreaker). Both devices compute the same
 * anchor, so each person owns a distinct slot and sees their own as "You".
 */
export function useSelfPerson(): { selfPerson: Person; partnerPerson: Person } {
  const { profile } = useAuth();
  const { partner } = usePartner();

  // Solo (partner not joined yet) → the only user owns the 'me' slot.
  if (!partner?.id || !profile?.id) {
    return { selfPerson: 'me', partnerPerson: 'partner' };
  }

  const mine = profile.created_at ?? '';
  const theirs = partner.created_at ?? '';

  let iAmAnchor: boolean;
  if (mine !== theirs) {
    iAmAnchor = mine < theirs; // earlier creator anchors to 'me'
  } else {
    iAmAnchor = profile.id < partner.id; // deterministic tiebreak
  }

  return iAmAnchor
    ? { selfPerson: 'me', partnerPerson: 'partner' }
    : { selfPerson: 'partner', partnerPerson: 'me' };
}
