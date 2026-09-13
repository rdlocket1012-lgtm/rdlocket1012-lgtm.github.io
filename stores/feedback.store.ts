import { create } from 'zustand';

/**
 * Backing store for the two app-wide feedback primitives (DESIGN.md §10.12):
 * the Cozy Scrapbook decision sheet and the toast.
 *
 * Both are driven imperatively from `lib/feedback.ts` so a call site reads as a
 * drop-in for `Alert.alert` — no per-screen state, no prop drilling. The host
 * components (`ConfirmSheetHost`, `ToastHost`) are mounted once in the root
 * layout and render whatever is queued here.
 */

export type SheetAction = {
  label: string;
  /** Returned to the caller when this action is picked. */
  value: string;
  /** Danger colouring — for anything that loses data. */
  destructive?: boolean;
  /** Filled emphasis. `confirm()` sets this; multi-option pickers don't, so
   *  their choices read as equal weight. */
  primary?: boolean;
};

export type SheetRequest = {
  id: number;
  title: string;
  message?: string;
  actions: SheetAction[];
  /** null renders no cancel button (single-button info sheet — see `alert()`). */
  cancelLabel: string | null;
  /** Icon name from components/ui/Icon.tsx. */
  icon?: string;
  /** Tints the icon chip. Defaults to Coral, or Danger if any action is destructive. */
  destructive?: boolean;
  /** Receives the picked action's `value`, or null on cancel/dismiss. */
  resolve: (value: string | null) => void;
};

export type ToastTone = 'neutral' | 'success' | 'error' | 'warn';

export type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
  /** Milliseconds on screen before auto-dismiss. */
  duration: number;
};

type FeedbackState = {
  /** Queued so two overlapping asks can't silently drop one. */
  sheets: SheetRequest[];
  toasts: ToastItem[];
  pushSheet: (req: SheetRequest) => void;
  /** Resolves the given request with `value` (null = cancelled) and pops it. */
  settleSheet: (id: number, value: string | null) => void;
  pushToast: (item: ToastItem) => void;
  dismissToast: (id: number) => void;
};

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  sheets: [],
  toasts: [],

  pushSheet: (req) => set((s) => ({ sheets: [...s.sheets, req] })),

  settleSheet: (id, value) => {
    const req = get().sheets.find((r) => r.id === id);
    if (!req) return;
    set((s) => ({ sheets: s.sheets.filter((r) => r.id !== id) }));
    req.resolve(value);
  },

  pushToast: (item) => set((s) => ({ toasts: [...s.toasts, item] })),

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
