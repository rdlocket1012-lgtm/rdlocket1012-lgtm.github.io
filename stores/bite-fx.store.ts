import { create } from 'zustand';

/**
 * Transient "a bite just happened" flag. NudgesLayer flips it on send/receive;
 * the home header reads it to press teeth-marks onto the partner avatar and
 * briefly restyle the status line. Auto-clears after 3s.
 */
type BiteFxState = {
  feisty: boolean;
  /** id increments each flash so animations can re-trigger. */
  tick: number;
  flash: () => void;
};

let timer: ReturnType<typeof setTimeout> | null = null;

export const useBiteFx = create<BiteFxState>((set) => ({
  feisty: false,
  tick: 0,
  flash: () => {
    set((s) => ({ feisty: true, tick: s.tick + 1 }));
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => set({ feisty: false }), 3000);
  },
}));
