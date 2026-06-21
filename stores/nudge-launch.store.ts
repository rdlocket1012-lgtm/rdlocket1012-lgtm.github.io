import { create } from 'zustand';

/**
 * Cross-screen launch signal for the nudge composer. Both the center-FAB
 * overlay (§8.11) and the iOS widget deep-link (locket://nudge) call
 * `request()`. The tabs layout watches `pending` and opens NudgesLayer.
 * Mirrors `useLiveLaunch` (live.store).
 */
type NudgeLaunchState = {
  pending: boolean;
  /** Bumped each request so opening twice in a row still re-triggers. */
  nonce: number;
  request: () => void;
  consume: () => void;
};

export const useNudgeLaunch = create<NudgeLaunchState>((set) => ({
  pending: false,
  nonce: 0,
  request: () => set((s) => ({ pending: true, nonce: s.nonce + 1 })),
  consume: () => set({ pending: false }),
}));
