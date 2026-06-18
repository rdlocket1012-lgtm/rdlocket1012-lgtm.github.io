import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

const APP_GROUP = 'group.com.siren96.locket';

// Lazily require ExtensionStorage so a missing/broken native module
// never crashes the JS bundle on import.
function getStorage() {
  if (Platform.OS !== 'ios') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ExtensionStorage } = require('@bacons/apple-targets');
    return new ExtensionStorage(APP_GROUP);
  } catch {
    return null;
  }
}

// Lazily reload widget — same guard.
function reloadWidget() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ExtensionStorage } = require('@bacons/apple-targets');
    ExtensionStorage.reloadWidget?.();
  } catch {
    // best-effort
  }
}

export interface WidgetData {
  dayCount: number;
  nickname: string;
  partnerName: string;
  partnerStatusEmoji?: string | null;
}

/**
 * Publishes the live couple data + auth credentials into the App Group so the
 * iOS home-screen widget can render the day counter / status emoji and fire the
 * "Micro-Love" nudge App Intent. No-op on Android. Best-effort.
 */
export async function syncWidget(data: WidgetData): Promise<void> {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.set('dayCount', String(data.dayCount));
    storage.set('coupleNickname', data.nickname || 'Us');
    storage.set('partnerName', data.partnerName || 'Partner');
    storage.set('partnerStatusEmoji', data.partnerStatusEmoji || '💛');

    // Credentials the widget's App Intent needs to POST to the notify function.
    const { data: s } = await supabase.auth.getSession();
    if (s.session) {
      storage.set('supabaseUrl', process.env.EXPO_PUBLIC_SUPABASE_URL ?? '');
      storage.set('anonKey', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '');
      storage.set('accessToken', s.session.access_token);
    }

    reloadWidget();
  } catch {
    // best-effort — never block the app on widget sync
  }
}

/** Reads the timestamp of the last nudge fired from the widget (for in-app confirmation). */
export function getLastWidgetNudge(): string | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    return storage.get('lastWidgetNudgeAt');
  } catch {
    return null;
  }
}
