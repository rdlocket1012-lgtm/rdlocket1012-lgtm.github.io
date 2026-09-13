import * as Haptics from 'expo-haptics';

/**
 * Locket's haptic vocabulary — one signature per kind of touch, used
 * everywhere so the app's "feel" stays consistent:
 *
 *  tap()     — crisp light impact. Button press-ins, chips, toggles.
 *  impact()  — weightier medium impact. Primary actions only: the FAB,
 *              committing a quiz answer, sending a drawing.
 *  soft()    — delicate soft impact. Card selection, gentle confirms.
 *  tick()    — selection click. Wheel-picker detents, steppers, sliders.
 *  success() — settled "it worked" note. Reveals, saves, joins.
 *  warn()    — something needs attention. Validation, destructive asks.
 *
 * All fire-and-forget and silently no-op on devices without haptics.
 *
 * Rule (DESIGN.md §10.12): haptics confirm DECISIONS. Never fire one for
 * navigation or scrolling — tab switches, back gestures and list scrolling stay
 * silent. `tap()` already fires from ScalePressable on press-in, so a press
 * handler should not fire another one on top of it.
 *
 * The nudge buzz patterns (components/nudges/NudgesLayer.tsx, lib/notifications.ts,
 * stores/draw.store.ts) deliberately call expo-haptics directly — there the
 * vibration IS the feature, not UI feedback, so it doesn't belong to this
 * vocabulary.
 */
export function tap() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function impact() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

export function soft() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
}

export function tick() {
  Haptics.selectionAsync().catch(() => {});
}

export function success() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function warn() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}
