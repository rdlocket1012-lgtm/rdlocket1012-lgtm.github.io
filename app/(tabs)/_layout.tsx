import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { LK } from '@/constants/theme';
import { useUnseen } from '@/hooks/useUnseen';
import { useAuth } from '@/hooks/useAuth';
import { usePartner } from '@/hooks/usePartner';
import { useLiveLaunch } from '@/stores/live.store';
import { useNudgeLaunch } from '@/stores/nudge-launch.store';
import { usePartnerTime } from '@/hooks/usePartnerTime';
import { LiveLayer, type LiveHandle } from '@/components/live/LiveLayer';
import { NudgesLayer } from '@/components/nudges/NudgesLayer';
import LocketTabBar from '@/components/ui/locket-tab-bar';

// Swipe-enabled pager (react-native-pager-view) wired into expo-router's
// file-based routing. Replaces bottom <Tabs> so the four main pages can be
// dragged left/right; the floating LocketTabBar + center FAB still float over it.
const { Navigator } = createMaterialTopTabNavigator();
const SwipeTabs = withLayoutContext(Navigator);

export default function TabsLayout() {
  // Keep unread counts live for the whole app (the tab bar reads them for badges).
  useUnseen();

  const { profile } = useAuth();
  const { partner } = usePartner();
  const partnerTime = usePartnerTime();

  // ── This or That live layer ────────────────────────────────────────────────
  // Mounted here so the invite, "both online" banner, and game overlay appear
  // from ANY tab, not just when the user is on Home.
  const liveRef = useRef<LiveHandle>(null);
  const pendingCategory = useLiveLaunch((s) => s.pendingCategory);
  const launchNonce = useLiveLaunch((s) => s.nonce);
  const consumeLaunch = useLiveLaunch((s) => s.consume);

  useEffect(() => {
    if (pendingCategory) {
      liveRef.current?.start(pendingCategory);
      consumeLaunch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCategory, launchNonce]);

  // ── Nudges layer ───────────────────────────────────────────────────────────
  // Mounted here so the send-nudge menu and incoming nudge overlays (hug, kiss,
  // bite, thumb-kiss) surface from ANY tab via the center FAB or push.
  const [nudgeOpen, setNudgeOpen] = useState(false);
  const nudgePending = useNudgeLaunch((s) => s.pending);
  const nudgeNonce = useNudgeLaunch((s) => s.nonce);
  const consumeNudge = useNudgeLaunch((s) => s.consume);

  useEffect(() => {
    if (nudgePending) {
      setNudgeOpen(true);
      consumeNudge();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nudgePending, nudgeNonce]);

  return (
    <View style={{ flex: 1 }}>
      <SwipeTabs
        tabBarPosition="bottom"
        screenOptions={{
          swipeEnabled: true,
          lazy: true,
          animationEnabled: true,
          sceneStyle: { backgroundColor: LK.parchment },
          lazyPlaceholder: () => <View style={{ flex: 1, backgroundColor: LK.parchment }} />,
        }}
        tabBar={(props) => <LocketTabBar {...props} />}
      >
        <SwipeTabs.Screen name="index" />
        <SwipeTabs.Screen name="timeline" />
        <SwipeTabs.Screen name="fun" />
        <SwipeTabs.Screen name="us" />
      </SwipeTabs>

      <LiveLayer
        ref={liveRef}
        coupleId={profile?.couple_id ?? null}
        userId={profile?.id ?? null}
        partnerName={partner?.display_name ?? null}
        myName={profile?.display_name ?? null}
      />

      <NudgesLayer
        open={nudgeOpen}
        onClose={() => setNudgeOpen(false)}
        coupleId={profile?.couple_id ?? null}
        userId={profile?.id ?? null}
        partnerName={partner?.display_name ?? null}
        partnerAsleep={!!partnerTime?.asleep}
        partnerSilent={partner?.nudge_haptics === false}
      />
    </View>
  );
}
