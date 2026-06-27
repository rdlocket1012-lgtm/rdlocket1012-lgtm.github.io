import React, { useEffect } from 'react';
import { router } from 'expo-router';
import Transition from 'react-native-screen-transitions';
import { TransitionNativeStack } from '@/components/navigation/transition-native-stack';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import Mapbox from '@rnmapbox/maps';

// Initialise Mapbox once at app startup — must run before any MapView renders.
try {
  Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '');
} catch {
  // guard against missing native module in dev/OTA scenarios
}
import { useURL } from 'expo-linking';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { ReducedMotionConfig, ReduceMotion } from 'react-native-reanimated';
import { useAuth } from '@/hooks/useAuth';
import { useSyncTimezone } from '@/hooks/useSyncTimezone';
import { OfflineBanner } from '@/components/offline/OfflineBanner';
import { setupPurchases } from '@/lib/revenuecat';
import { supabase } from '@/lib/supabase';
import { registerForPush } from '@/lib/push';
import { registerNudgeCategories, setupNudgeResponseHandler } from '@/lib/notifications';
import { routeAfterAuth } from '@/lib/post-auth';
import { useNudgeLaunch } from '@/stores/nudge-launch.store';
import { AppErrorBoundary } from '@/components/ui/error-boundary';
import { initSentry, Sentry } from '@/lib/sentry';

// Initialise crash reporting before anything renders (no-op without a DSN).
initSentry();

// Root error fallback — expo-router renders this when any screen throws during
// render, instead of crashing the whole app to a white screen.
export { AppErrorBoundary as ErrorBoundary };

/** Extracts key=value pairs from both the query string AND hash of a URL. */
function parseAllParams(url: string): Record<string, string> {
  try {
    const [base, hash = ''] = url.split('#');
    const query = base.includes('?') ? base.split('?')[1] : '';
    return {
      ...Object.fromEntries(new URLSearchParams(query)),
      ...Object.fromEntries(new URLSearchParams(hash)),
    };
  } catch {
    return {};
  }
}

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const { session, loading } = useAuth();
  const reduced = useReducedMotion();

  // Milestone card → detail morph (§10.13). The TRUE shared-element morph: the
  // tapped timeline card (Transition.Boundary.Trigger group="milestone") grows
  // into the detail surface (Transition.Boundary.View group="milestone"). This
  // is why the root navigator is a TransitionNativeStack — the trigger lives in
  // a tab, so the morph has to be owned by the root stack, not a nested group.
  // Reduce Motion → fall back to the plain modal slide (no morph).
  const milestoneOptions = reduced
    ? ({ presentation: 'modal' } as const)
    : Transition.Presets.SharedAppleMusic({ sharedBoundTag: 'milestone' });

  // Keep our own timezone synced so the partner sees our correct local time.
  useSyncTimezone();

  // useURL() from expo-router gives us the active deep-link URL reactively —
  // it fires on cold-start AND when the app is foregrounded via a link.
  const url = useURL();

  useEffect(() => {
    if (!url) return;
    handleDeepLink(url);
  }, [url]);

  async function handleDeepLink(url: string) {
    // Widget nudge shortcut: locket://nudge opens the nudge composer immediately.
    // On iOS 17+ the widget fires the AppIntent directly (no app launch).
    // On iOS 16 it falls back to this deep link.
    if (url.startsWith('locket://nudge')) {
      useNudgeLaunch.getState().request();
      return;
    }

    if (url.startsWith('locket://draw')) {
      try { router.navigate('/draw'); } catch {}
      return;
    }

    // Day-counter widget tap — just bring the user to the home tab.
    if (url.startsWith('locket://home')) {
      try { router.navigate('/'); } catch {}
      return;
    }

    const params = parseAllParams(url);

    if (params.code) {
      // PKCE flow (Supabase default): exchange the code for a session.
      // For recovery, onAuthStateChange fires PASSWORD_RECOVERY (handled below).
      const { data } = await supabase.auth.exchangeCodeForSession(params.code);
      // Email-confirmation link → session is now live; route into the app
      // (onboarding if not set up yet, home if already a couple).
      if (url.includes('confirm-email') && data.session) {
        router.replace((await routeAfterAuth(data.session.user.id)) as never);
      }
      return;
    }

    if (params.access_token && params.refresh_token) {
      // Implicit flow fallback: set the session directly from tokens.
      await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });
    }
  }

  // Register the interactive "Bite Back!" notification category + its handler.
  useEffect(() => {
    registerNudgeCategories();
    const teardown = setupNudgeResponseHandler();
    return teardown;
  }, []);

  // Routes to reset-password once exchangeCodeForSession/setSession establishes a recovery session.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.replace('/(auth)/reset-password');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Initialise in-app purchases (no-op in Expo Go) and tie them to the user.
  useEffect(() => {
    setupPurchases(session?.user?.id);
  }, [session?.user?.id]);

  // Register this device for push notifications once we know who the user is.
  useEffect(() => {
    if (session?.user?.id) registerForPush(session.user.id);
  }, [session?.user?.id]);

  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque: require('../assets/fonts/BricolageGrotesque-Bold.ttf'),
    PlusJakartaSans: require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    Newsreader: require('../assets/fonts/Newsreader-Regular.ttf'),
    ShantellSans: require('../assets/fonts/ShantellSans-Regular.ttf'),
    'ShantellSans-Medium': require('../assets/fonts/ShantellSans-Medium.ttf'),
  });

  const fontsReady = fontsLoaded || !!fontError;

  useEffect(() => {
    if (!loading && fontsReady) SplashScreen.hideAsync();
  }, [loading, fontsReady]);

  if (loading || !fontsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* KeyboardProvider (react-native-keyboard-controller) powers the smooth,
          keyboard-frame-tracking KeyboardAvoidingView used by the compose screens
          (§10.12 / Library Rules: lib KAV over RN KAV for new/compose screens).
          ⚠️ It mounts a NATIVE module — screens still on RN KeyboardAvoidingView
          keep working, but the JS won't load until a dev build includes this dep.
          RN <Modal> renders outside this provider, so modals re-wrap their own. */}
      <KeyboardProvider>
      {/* Honour the OS "Reduce Motion" setting globally (DESIGN.md §10.11). When
          it's on, Reanimated springs/timings collapse to instant; flows pair this
          with useReducedMotion() to swap EaseView/shared-element transitions for
          fades. Never force motion app-wide — that's an accessibility fail. */}
      <ReducedMotionConfig mode={ReduceMotion.System} />
      <StatusBar style="dark" />
      <OfflineBanner />
      {/* Root navigator is a TransitionNativeStack (§10.13) so root-level screens
          can opt into shared-element (bounds) morphs while every other screen
          keeps native chrome (modal/formSheet/large-title headers) and native
          animations unchanged — it's a drop-in over react-native-screens. Only
          screens that pass a Transition preset (milestone/[id]) run the morph;
          all others behave exactly as they did under expo-router's <Stack>. */}
      <TransitionNativeStack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <TransitionNativeStack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
        <TransitionNativeStack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <TransitionNativeStack.Screen name="(auth)/forgot-password" options={{ animation: 'fade' }} />
        <TransitionNativeStack.Screen name="(auth)/reset-password" options={{ animation: 'fade' }} />
        <TransitionNativeStack.Screen name="(tabs)" />
        <TransitionNativeStack.Screen name="map/index" />
        {/* Milestone detail morphs out of the tapped timeline card (see
            milestoneOptions above). Reduce Motion falls back to the modal slide. */}
        <TransitionNativeStack.Screen name="milestone/[id]" options={milestoneOptions} />
        <TransitionNativeStack.Screen name="milestone/photo-viewer" options={{ presentation: 'modal', animation: 'fade' }} />
        <TransitionNativeStack.Screen name="invite" options={{ presentation: 'modal' }} />
        {/* Letters is a nested TransitionStack group (§10.13) — the detail
            screen lives at app/letters/[id].tsx and uses screen transitions.
            gestureEnabled:false so the outer native edge-swipe doesn't pop the
            whole group (skipping the list); the inner TransitionStack owns the
            back-swipe (detail → list). Back button still pops the group → home. */}
        <TransitionNativeStack.Screen name="letters" options={{ gestureEnabled: false }} />
        <TransitionNativeStack.Screen name="coupons/index" />
        <TransitionNativeStack.Screen name="games/index" />
        <TransitionNativeStack.Screen name="games/this-or-that" />
        <TransitionNativeStack.Screen name="games/draw-and-guess" options={{ headerShown: false }} />
        <TransitionNativeStack.Screen name="bucket-list/index" />
        <TransitionNativeStack.Screen name="bucket-list/add-item" options={{ presentation: 'modal' }} />
        <TransitionNativeStack.Screen name="settings/index" options={{ presentation: 'modal' }} />
        <TransitionNativeStack.Screen name="settings/danger-zone" options={{ presentation: 'modal' }} />
        <TransitionNativeStack.Screen name="quiz/history" options={{ presentation: 'modal' }} />
        <TransitionNativeStack.Screen name="streak/index" />
        <TransitionNativeStack.Screen name="notes/index" />
        {/* fullScreenModal (not formSheet): in the TransitionNativeStack a
            formSheet sizes to its content — a flex:1 writing surface collapses —
            and a native header renders as empty circles (draw/compose GOTCHAS
            1+3). fullScreenModal fills the screen + slides up; compose renders
            its own header. */}
        <TransitionNativeStack.Screen name="notes/compose" options={{ presentation: 'fullScreenModal', headerShown: false }} />
        <TransitionNativeStack.Screen name="profile/about" />
        <TransitionNativeStack.Screen name="profile/edit" options={{ presentation: 'modal' }} />
        <TransitionNativeStack.Screen name="notifications/index" />
        {/* Draw is a nested TransitionNativeStack group (§10.13) — the gallery
            cell morphs into app/draw/viewer.tsx. headerShown:false so the root
            stack doesn't double the group's native header; gestureEnabled:false
            so the outer edge-swipe doesn't pop the whole group (mirrors letters).
            index keeps its native large-title header, compose keeps its formSheet
            — both configured inside app/draw/_layout.tsx + the screens. */}
        <TransitionNativeStack.Screen name="draw" options={{ headerShown: false, gestureEnabled: false }} />
      </TransitionNativeStack>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

// Sentry.wrap enables native crash + JS error capture and touch/navigation
// breadcrumbs for the whole tree. No-op behaviour is preserved when no DSN is set.
export default Sentry.wrap(RootLayout);
