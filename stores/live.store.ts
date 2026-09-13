import { create } from 'zustand';

/**
 * Tiny launcher bridge for the live "This or That" game.
 *
 * The game's networking + overlays live in a single <LiveLayer/> mounted on the
 * Home screen (one mount = one Realtime channel, avoiding channel collisions).
 * The Games hub and category-picker are separate pushed routes, so they can't
 * call LiveLayer's imperative ref directly. Instead they drop the chosen
 * category here and pop back to Home, where an effect consumes it and starts
 * the game.
 */
type LiveLaunchState = {
  pendingCategory: string | null;
  /** non-null nonce so picking the same category twice still re-triggers. */
  nonce: number;
  requestStart: (categoryId: string) => void;
  consume: () => void;
};

export const useLiveLaunch = create<LiveLaunchState>((set) => ({
  pendingCategory: null,
  nonce: 0,
  requestStart: (categoryId) => set((s) => ({ pendingCategory: categoryId, nonce: s.nonce + 1 })),
  consume: () => set({ pendingCategory: null }),
}));
