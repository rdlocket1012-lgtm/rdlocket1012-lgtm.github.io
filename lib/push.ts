import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';

const PROJECT_ID =
  (Constants?.expoConfig?.extra as any)?.eas?.projectId ??
  (Constants as any)?.easConfig?.projectId ??
  '34c35f43-76e1-4efc-8a85-8a8596485ba0';

/**
 * Requests notification permission, fetches this device's Expo push token,
 * and saves it on the current user's profile. Safe to call repeatedly.
 * No-ops on simulators / when permission is denied.
 */
export async function registerForPush(profileId: string): Promise<void> {
  try {
    if (!Device.isDevice) return; // push doesn't work on simulators

    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (status !== 'granted') {
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

export type PushType = 'letter' | 'coupon_gift' | 'coupon_redeemed' | 'milestone' | 'quiz' | 'partner_joined';

/**
 * Asks the secure `notify` Edge Function to push a message to the caller's
 * partner. Best-effort and fire-and-forget — failures never surface to the user.
 */
export async function notifyPartner(type: PushType, title: string, body: string): Promise<void> {
  try {
    await supabase.functions.invoke('notify', { body: { type, title, body } });
  } catch {
    // ignore — notification is non-critical
  }
}
