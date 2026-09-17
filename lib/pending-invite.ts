import AsyncStorage from '@react-native-async-storage/async-storage';

// When a partner taps an invite link without a real account, we stash the token
// here, send them through sign-up/sign-in, then resume the join afterwards.
const KEY = 'pending_invite_token';

export async function setPendingInvite(token: string): Promise<void> {
  await AsyncStorage.setItem(KEY, token);
}

export async function clearPendingInvite(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

/** Returns the route to resume a pending invite join, or null if none. */
export async function pendingInviteRoute(): Promise<string | null> {
  const t = await AsyncStorage.getItem(KEY);
  return t ? `/invite?token=${encodeURIComponent(t)}` : null;
}
