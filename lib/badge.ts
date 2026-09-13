import * as Notifications from 'expo-notifications';

/**
 * Mirrors the unseen-activity count onto the app-icon badge (the red bubble on
 * the device home screen).
 *
 * Two things move this number, and they have to agree:
 *  - the `notify` Edge Function sends `badge` on each push, so the count is
 *    right even when the app is backgrounded or killed;
 *  - this helper re-syncs from the client whenever counts change or the user
 *    opens the Activity screen, which is what actually clears it back to zero.
 *
 * Best-effort by design: a wrong badge must never surface an error to the user.
 */
export async function syncAppBadge(count: number): Promise<void> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return; // no permission → no badge to set
    await Notifications.setBadgeCountAsync(Math.max(0, count));
  } catch {
    // ignore — badge is cosmetic
  }
}

/** Clears the app-icon badge. Called when the Activity screen is opened. */
export async function clearAppBadge(): Promise<void> {
  await syncAppBadge(0);
}
