import { useFeedbackStore, type SheetAction, type ToastTone } from '@/stores/feedback.store';

/**
 * App-wide feedback API — the replacement for `Alert.alert`.
 *
 * Locket is a fully bespoke surface right up until a decision point, where a
 * stock grey iOS alert used to appear in San Francisco. These calls keep the
 * Cozy Scrapbook language all the way through:
 *
 *   await confirm({ title, destructive })   → themed sheet, Promise<boolean>
 *   await choose({ title, options })        → pick one of N, Promise<T | null>
 *   await alert(title, message)             → single-button info sheet
 *   toast('Saved')                          → non-blocking banner
 *
 * All are safe to call from anywhere (stores, lib, event handlers) — they don't
 * need React context. `<ConfirmSheetHost />` and `<ToastHost />` must be
 * mounted once in app/_layout.tsx.
 */

let nextId = 1;

export type ConfirmOptions = {
  title: string;
  message?: string;
  /** Default: "Confirm", or "Delete" when destructive. */
  confirmLabel?: string;
  /** Default: "Cancel". */
  cancelLabel?: string;
  /** Danger colouring + `warn()` haptic. Use for anything that loses data. */
  destructive?: boolean;
  /** Icon name from components/ui/Icon.tsx. Defaults to `alert` when destructive. */
  icon?: string;
};

/**
 * Ask the user to confirm. Resolves true if they tapped the confirm action,
 * false if they cancelled or dismissed the sheet.
 */
export async function confirm(options: ConfirmOptions): Promise<boolean> {
  const destructive = options.destructive ?? false;
  const picked = await new Promise<string | null>((resolve) => {
    useFeedbackStore.getState().pushSheet({
      id: nextId++,
      title: options.title,
      message: options.message,
      actions: [{
        label: options.confirmLabel ?? (destructive ? 'Delete' : 'Confirm'),
        value: 'confirm',
        destructive,
        primary: true,
      }],
      cancelLabel: options.cancelLabel ?? 'Cancel',
      destructive,
      icon: options.icon ?? (destructive ? 'alert' : undefined),
      resolve,
    });
  });
  return picked === 'confirm';
}

export type ChooseOptions<T extends string> = {
  title: string;
  message?: string;
  options: { label: string; value: T; destructive?: boolean }[];
  /** Default: "Cancel". Pass null for a sheet that can only be dismissed by tapping away. */
  cancelLabel?: string | null;
  icon?: string;
};

/**
 * Pick one of several actions — the replacement for multi-button `Alert.alert`
 * (e.g. the streak pause-duration picker). Resolves the chosen `value`, or null
 * if cancelled. Choices render equal-weight; none is styled as the default.
 */
export function choose<T extends string>(options: ChooseOptions<T>): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    useFeedbackStore.getState().pushSheet({
      id: nextId++,
      title: options.title,
      message: options.message,
      actions: options.options.map<SheetAction>((o) => ({
        label: o.label,
        value: o.value,
        destructive: o.destructive,
      })),
      cancelLabel: options.cancelLabel === undefined ? 'Cancel' : options.cancelLabel,
      icon: options.icon,
      resolve: (v) => resolve(v as T | null),
    });
  });
}

/**
 * Single-button info sheet — for disclosures too long for a toast (policy text,
 * help copy). Everything else informational should be a `toast()` instead.
 */
export function alert(title: string, message?: string, confirmLabel = 'Got it'): Promise<void> {
  return new Promise<void>((resolve) => {
    useFeedbackStore.getState().pushSheet({
      id: nextId++,
      title,
      message,
      actions: [{ label: confirmLabel, value: 'ok', primary: true }],
      cancelLabel: null,
      resolve: () => resolve(),
    });
  });
}

/**
 * Tell the user something happened. Never blocks — this replaces the
 * informational alerts that used to demand a tap for no reason.
 */
function show(message: string, tone: ToastTone = 'neutral', duration = 2600) {
  useFeedbackStore.getState().pushToast({ id: nextId++, message, tone, duration });
}

export const toast = Object.assign(
  (message: string) => show(message, 'neutral'),
  {
    success: (message: string) => show(message, 'success'),
    error: (message: string) => show(message, 'error', 3200),
    warn: (message: string) => show(message, 'warn', 3000),
  },
);
