import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/lib/supabase';

const APP_GROUP = 'group.com.siren96.locket';

// Auth tokens are sensitive — they live in the Keychain (encrypted at rest),
// shared with the widget extension via a keychain access group, NOT in the
// App Group's plaintext UserDefaults. The access-group string is the team-id
// prefix + bundle id; it must match the `keychain-access-groups` entitlement
// ($(AppIdentifierPrefix)com.siren96.locket) on both the app and the widget.
const KEYCHAIN_ACCESS_GROUP = '6BSN47U3U2.com.siren96.locket';
const KEYCHAIN_SERVICE = 'locket.widget';
const TOKEN_OPTS: SecureStore.SecureStoreOptions = {
  keychainService: KEYCHAIN_SERVICE,
  accessGroup: KEYCHAIN_ACCESS_GROUP,
  requireAuthentication: false,
  // AfterFirstUnlock so the nudge App Intent can read tokens even if the device
  // was recently locked. The nudge itself only fires while unlocked.
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

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
  /** ISO date (YYYY-MM-DD) the relationship started — the widget computes the
   * live day count from this so it flips at local midnight without an app open. */
  startDate?: string | null;
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
    if (data.startDate) storage.set('coupleStartDate', data.startDate);
    storage.set('coupleNickname', data.nickname || 'Us');
    storage.set('partnerName', data.partnerName || 'Partner');
    // The Partner Draw widget shows the partner's name too — keep it sourced
    // from the one place that actually knows it, so it's never the literal
    // "Partner" placeholder.
    storage.set('drawPartnerName', data.partnerName || 'Partner');
    storage.set('partnerStatusEmoji', data.partnerStatusEmoji || '💛');

    // Credentials the widget's App Intent needs to POST to the notify function.
    // We store both access_token and refresh_token so the Swift NudgeSender can
    // refresh before sending — access tokens expire after ~1 hour. These go to
    // the shared Keychain, never UserDefaults.
    const { data: s } = await supabase.auth.getSession();
    if (s.session) {
      storage.set('supabaseUrl', process.env.EXPO_PUBLIC_SUPABASE_URL ?? '');
      storage.set('anonKey', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '');
      try {
        await SecureStore.setItemAsync('widgetAccessToken', s.session.access_token, TOKEN_OPTS);
        await SecureStore.setItemAsync('widgetRefreshToken', s.session.refresh_token, TOKEN_OPTS);
      } catch {
        // Keychain write failed (e.g. entitlement not yet provisioned) — the
        // widget will simply not be able to nudge until the next successful sync.
      }
    }

    reloadWidget();
  } catch {
    // best-effort — never block the app on widget sync
  }
}

/**
 * Writes the latest partner drawing URL to the App Group so the
 * LocketDrawWidget can display it. The widget pre-downloads the image into its
 * shared container (AsyncImage is unreliable in WidgetKit). The partner's name
 * is published separately by {@link syncWidget}. No-op on Android. Best-effort.
 */
export async function syncDrawWidget(imageUrl: string): Promise<void> {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.set('drawImageUrl', imageUrl);
    reloadWidget();
  } catch {
    // best-effort
  }
}
