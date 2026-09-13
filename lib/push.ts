import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

/**
 * The CURRENT user's first name, for use in pushes *they* trigger.
 *
 * Push bodies are read by the partner, so they must name the sender — not the
 * recipient. Getting this backwards is easy: a screen usually has the partner's
 * name close to hand and the sender's nowhere in sight.
 *
 * Falls back to "Your partner", which reads correctly sentence-initially
 * ("Your partner sent you a hug").
 */
export function senderName(): string {
  return (useAuthStore.getState().profile?.display_name || 'Your partner').split(' ')[0];
}

const PROJECT_ID =
  (Constants?.expoConfig?.extra as any)?.eas?.projectId ??
  (Constants as any)?.easConfig?.projectId ??
  '34c35f43-76e1-4efc-8a85-8a8596485ba0';

/**
 * Fetches this device's Expo push token and saves it on the current user's
 * profile. Safe to call repeatedly. No-ops on simulators / when permission is
 * denied.
 *
 * **`request` defaults to false, and the app-startup caller must leave it that
 * way.** This used to always request, which meant the cold OS permission prompt
 * fired from `app/_layout.tsx` the instant a session existed — before onboarding
 * had rendered a single screen, with no explanation of why an app the user had
 * just signed into wanted to notify them. Given how much of Locket rides on push
 * (nudges, letters, date reminders, partner activity), a denial there is
 * expensive and effectively permanent.
 *
 * The one place that passes `request: true` is the onboarding priming screen
 * (`app/(onboarding)/notification-permission.tsx`), which asks in Locket's own
 * words first.
 * Everywhere else this only picks up a token the user has already agreed to —
 * including on every later launch, so a permission granted in iOS Settings after
 * the fact still lands a token.
 */
export async function registerForPush(
  profileId: string,
  opts: { request?: boolean } = {},
): Promise<void> {
  try {
    if (!Device.isDevice) return; // push doesn't work on simulators

    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (status !== 'granted' && opts.request) {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const tokenResp = await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID });
    const token = tokenResp.data;
    if (!token) return;

    await supabase.from('profiles').update({ push_token: token }).eq('id', profileId);
  } catch {
    // Best-effort — never block the app on push registration.
  }
}

export type PushType = 'letter' | 'coupon_gift' | 'coupon_redeem_request' | 'coupon_redeemed' | 'coupon_declined' | 'coupon_streak_restore' | 'streak_pause' | 'milestone' | 'quiz' | 'partner_joined' | 'nudge_hug' | 'nudge_kiss_request' | 'letter_reaction' | 'bite' | 'thumb_kiss' | 'live_invite' | 'draw_invite' | 'partner_draw';

/**
 * Asks the secure `notify` Edge Function to push a message to the caller's
 * partner. Best-effort and fire-and-forget — failures never surface to the user.
 */
export async function notifyPartner(
  type: PushType,
  title: string,
  body: string,
  categoryId?: string,
): Promise<void> {
  try {
    await supabase.functions.invoke('notify', { body: { type, title, body, categoryId } });
  } catch {
    // ignore — notification is non-critical
  }
}
