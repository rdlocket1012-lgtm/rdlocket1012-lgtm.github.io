import { create } from 'zustand';

/**
 * Cross-screen launch signal for the nudge composer. The center-FAB overlay
 * (§8.11) lives in the tab bar, but the NudgesLayer composer lives on Home.
 * "Send a Nudge" sets `pending` here and routes to Home, where an effect
 * consumes it and opens the composer. Mirrors `useLiveLaunch` (live.store).
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
