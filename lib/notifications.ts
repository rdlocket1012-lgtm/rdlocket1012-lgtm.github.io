import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { notifyPartner } from '@/lib/push';

/**
 * Routes a tapped notification to the right place based on its payload `type`
 * (the `notify` Edge Function attaches `data: { type }`). Game invites deep-link
 * straight into the game so accepting is one tap.
 */
function routeFromNotificationData(data: unknown): void {
  const type = (data as { type?: string } | null)?.type;
  try {
    if (type === 'live_invite') router.navigate('/(tabs)');           // Home — LiveLayer shows the invite
    else if (type === 'draw_invite') router.navigate('/games/draw-and-guess');
    else if (type === 'partner_draw') router.navigate('/draw');
    else if (type === 'letter') router.navigate('/letters');
    else if (type === 'calendar_event') router.navigate('/calendar');
  } catch {
    // navigation not ready — best effort
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    // Apply the `badge` the notify Edge Function sends, so the app-icon count
    // stays right even for pushes that land while the app is foregrounded.
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Registers the interactive "bite" notification category so an incoming bite
 * push shows a [Bite Back! 🦷] action button. Tapping it doesn't open the app.
 */
export async function registerNudgeCategories(): Promise<void> {
  try {
    await Notifications.setNotificationCategoryAsync('bite', [
      {
        identifier: 'BITE_BACK',
        buttonTitle: 'Bite Back! 🦷',
        options: { opensAppToForeground: false },
      },
    ]);
  } catch {
    // best-effort
  }
}

let nudgeResponseSub: { remove: () => void } | null = null;

/**
 * Wires the "Bite Back!" retaliation loop: when the user taps the action button
 * on a bite notification, fire a sharp haptic and send a bite straight back —
 * without fully opening the app.
 */
export function setupNudgeResponseHandler(): () => void {
  nudgeResponseSub?.remove();
  nudgeResponseSub = Notifications.addNotificationResponseReceivedListener(async (response) => {
    if (response.actionIdentifier === 'BITE_BACK') {
      try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}
      // Ensure the persisted session is loaded before invoking the secure function.
      await supabase.auth.getSession();
      await notifyPartner('bite', 'Ouch! 🦷', 'Bitten back! 🦷 Open to keep the war going…', 'bite');
      return;
    }
    // Default tap → deep-link to the relevant screen (game invites, letters…).
    // The listener also receives the tap that cold-launched the app because it's
    // registered early in the root layout.
    routeFromNotificationData(response.notification.request.content.data);
  });

  return () => { nudgeResponseSub?.remove(); nudgeResponseSub = null; };
}

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') return true;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/** Stable identifier for the daily On This Day reminder. */
export const OTD_NOTIFICATION_ID = 'otd-daily';

export async function scheduleOnThisDay(hour = 9, minute = 0): Promise<void> {
  // Cancel ONLY this reminder, by id. This used to call
  // cancelAllScheduledNotificationsAsync(), which also wiped the date reminders
  // in lib/date-reminders.ts — toggling On This Day silently killed every
  // birthday and anniversary alert.
  await cancelOnThisDay();
  await Notifications.scheduleNotificationAsync({
    identifier: OTD_NOTIFICATION_ID,
    content: {
      title: 'On this day…',
      body: 'A memory from your past is waiting for you.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelOnThisDay(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(OTD_NOTIFICATION_ID);
  } catch {
    // never scheduled — nothing to cancel
  }
}
