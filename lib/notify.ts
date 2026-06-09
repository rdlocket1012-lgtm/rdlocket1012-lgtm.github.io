import * as Notifications from 'expo-notifications';

let handlerSet = false;
let permissionAsked = false;

function ensureHandler() {
  if (handlerSet) return;
  handlerSet = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Fire an immediate local notification. Best-effort: silently no-ops without permission. */
export async function notifyLocal(title: string, body: string) {
  try {
    ensureHandler();
    if (!permissionAsked) {
      permissionAsked = true;
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const req = await Notifications.requestPermissionsAsync();
        if (req.status !== 'granted') return;
      }
    }
    await Notifications.scheduleNotificationAsync({ content: { title, body }, trigger: null });
  } catch {
    // no-op (e.g. Expo Go limitations)
  }
}
