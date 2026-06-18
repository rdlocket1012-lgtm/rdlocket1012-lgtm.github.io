import * as Haptics from 'expo-haptics';

/**
 * Locket's haptic vocabulary — one signature per kind of touch, used
 * everywhere so the app's "feel" stays consistent:
 *
 *  tap()     — crisp light impact. Button press-ins, chips, toggles.
 *  soft()    — delicate soft impact. Card selection, gentle confirms.
 *  tick()    — selection click. Wheel-picker detents, steppers, sliders.
 *  success() — settled "it worked" note. Reveals, saves, joins.
 *  warn()    — something needs attention. Validation, destructive asks.
 *
 * All fire-and-forget and silently no-op on devices without haptics.
 */
export function tap() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
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
