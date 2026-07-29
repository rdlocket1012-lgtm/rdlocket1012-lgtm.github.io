import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tick, success as hapticSuccess } from '@/lib/haptics';
import { iGifted, useCouponsStore, type Coupon } from '@/stores/coupons.store';
import { useAuthStore } from '@/stores/auth.store';
import { notifyPartner } from '@/lib/push';

/** Ids the redeemer chose to hide early. Local-only (per device). */
const DISMISS_KEY = 'lk.couponHomeDismissed.v1';
/** How long a redeemed coupon stays on the home screen. */
export const REDEEMED_WINDOW_MS = 24 * 60 * 60 * 1000;

const myFirstName = () => (useAuthStore.getState().profile?.display_name || 'Your partner').split(' ')[0];

/**
 * Derives the two home-screen coupon banners from live coupon rows:
 *  - `pendingApprovals` — a recipient asked to redeem; shown to the GIFTER with
 *    Approve / Decline actions.
 *  - `recentlyRedeemed` — approved within the last 24 h; shown to BOTH with a
 *    live countdown. Only the redeemer (the non-gifter) may dismiss early.
 *
 * All timing is derived from existing columns (`redeem_requested_at`,
 * `redeemed_at`) — no schema change. Streak-restore coupons are excluded; they
 * auto-consume on creation and have their own keepsake treatment.
 */
export function useCouponHomeBanners() {
  const coupons = useCouponsStore((s) => s.coupons);
  const approveRedeem = useCouponsStore((s) => s.approveRedeem);
  const declineRequest = useCouponsStore((s) => s.declineRequest);

  const [dismissed, setDismissed] = useState<string[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const loadedDismiss = useRef(false);

  // Load the locally-dismissed ids once.
  useEffect(() => {
    AsyncStorage.getItem(DISMISS_KEY)
      .then((v) => {
        if (v) {
          try { setDismissed(JSON.parse(v)); } catch { /* corrupt — ignore */ }
        }
      })
      .catch(() => {})
      .finally(() => { loadedDismiss.current = true; });
  }, []);

  // Live clock — drives the countdown and the auto-hide at 24 h. 30 s cadence is
  // smooth enough for an hours/minutes display and easy on the battery.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const pendingApprovals = useMemo(
    () =>
      coupons.filter(
        (c) => c.type === 'standard' && iGifted(c) && !!c.redeem_requested_at && !c.redeemed_at,
      ),
    [coupons],
  );

  const recentlyRedeemed = useMemo(
    () =>
      coupons.filter((c) => {
        if (c.type !== 'standard' || !c.redeemed_at) return false;
        const elapsed = now - new Date(c.redeemed_at).getTime();
        if (elapsed < 0 || elapsed >= REDEEMED_WINDOW_MS) return false;
        // Only the redeemer (non-gifter) can dismiss; hide once they have.
        if (!iGifted(c) && dismissed.includes(c.id)) return false;
        return true;
      }),
    [coupons, now, dismissed],
  );

  // Keep the dismissed list from growing forever: drop ids whose coupon is no
  // longer in its 24 h window (or no longer exists).
  useEffect(() => {
    if (!loadedDismiss.current || dismissed.length === 0) return;
    const stillActive = new Set(
      coupons
        .filter((c) => c.redeemed_at && now - new Date(c.redeemed_at).getTime() < REDEEMED_WINDOW_MS)
        .map((c) => c.id),
    );
    const pruned = dismissed.filter((id) => stillActive.has(id));
    if (pruned.length !== dismissed.length) {
      setDismissed(pruned);
      AsyncStorage.setItem(DISMISS_KEY, JSON.stringify(pruned)).catch(() => {});
    }
  }, [coupons, now, dismissed]);

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      AsyncStorage.setItem(DISMISS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    tick();
  }, []);

  const approve = useCallback(
    async (c: Coupon) => {
      await approveRedeem(c.id);
      void notifyPartner('coupon_redeemed', 'Coupon approved 🎉', `${myFirstName()} approved "${c.title}" — enjoy!`);
      hapticSuccess();
    },
    [approveRedeem],
  );

  const decline = useCallback(
    async (c: Coupon) => {
      await declineRequest(c.id);
      void notifyPartner('coupon_declined', 'Not right now 💛', `${myFirstName()} can't redeem "${c.title}" just yet`);
    },
    [declineRequest],
  );

  return { pendingApprovals, recentlyRedeemed, now, dismiss, approve, decline };
}
