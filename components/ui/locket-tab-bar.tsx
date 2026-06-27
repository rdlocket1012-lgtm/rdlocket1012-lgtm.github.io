import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LK, theme, rgba } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { useUnseenStore } from '@/stores/unseen.store';
import { FabActionsOverlay } from '@/components/ui/fab-actions-overlay';

/**
 * Cozy Scrapbook floating tab bar (§8.11): a Vellum tray with 4 tabs and a
 * centered coral FAB that pops above it. The FAB opens the quick-actions
 * overlay and does NOT change the selected tab.
 *
 * Passed to expo-router's <Tabs tabBar={…}>. Rendered absolutely so it floats
 * over content (screens clear it with paddingBottom: 80).
 */

const TRAY_HEIGHT = 64;
const TRAY_BOTTOM_GAP = 8;
const FAB_SIZE = 54;
const FAB_BOTTOM = TRAY_HEIGHT - 26; // pops ~28px above the tray top
const PILL = rgba(LK.coral, 0.12);
const INACTIVE_INK = 'rgba(42,33,26,0.35)';

const TABS: Record<string, { label: string; icon: string }> = {
  index: { label: 'Home', icon: 'homeTab' },
  timeline: { label: 'Timeline', icon: 'scroll' },
  fun: { label: 'Fun', icon: 'gameController' },
  us: { label: 'Us', icon: 'heart' },
};

const spring = theme.spring.snappy;

function TabButton({
  focused,
  label,
  icon,
  badge,
  onPress,
}: {
  focused: boolean;
  label: string;
  icon: string;
  badge?: boolean;
  onPress: () => void;
}) {
  const p = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    p.value = withSpring(focused ? 1 : 0, spring);
  }, [focused]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ scale: 0.86 + p.value * 0.14 }],
  }));

  const ink = focused ? LK.espresso : INACTIVE_INK;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: TRAY_HEIGHT }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            left: 8,
            right: 8,
            top: 8,
            bottom: 8,
            borderRadius: 20,
            borderCurve: 'continuous',
            backgroundColor: PILL,
          },
          pillStyle,
        ]}
      />
      <View style={{ alignItems: 'center', gap: 3 }}>
        <View>
          <Icon name={icon} size={24} color={ink} strokeWidth={focused ? 2.3 : 1.9} />
          {badge && (
            <View
              style={{
                position: 'absolute',
                top: -2,
                right: -3,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: LK.coral,
              }}
            />
          )}
        </View>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: '700',
            fontSize: 10,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            color: focused ? LK.espresso : LK.faded,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export default function LocketTabBar({ state, navigation }: MaterialTopTabBarProps) {
  const insets = useSafeAreaInsets();
  const [fabOpen, setFabOpen] = useState(false);
  const counts = useUnseenStore((s) => s.counts);
  const usHasUnread = (counts.letters + counts.coupons) > 0;

  // Real tab routes, in declared order (index, timeline, fun, us).
  const routes = state.routes;
  const mid = Math.ceil(routes.length / 2);
  const leftRoutes = routes.slice(0, mid);
  const rightRoutes = routes.slice(mid);

  function go(routeName: string, routeKey: string, isFocused: boolean) {
    if (process.env.EXPO_OS === 'ios') {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { /* no-op */ }
    }
    const event = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  }

  function renderTab(routeName: string, routeKey: string, index: number) {
    const cfg = TABS[routeName];
    if (!cfg) return null;
    const isFocused = state.index === index;
    return (
      <TabButton
        key={routeKey}
        focused={isFocused}
        label={cfg.label}
        icon={cfg.icon}
        badge={routeName === 'us' && usHasUnread}
        onPress={() => go(routeName, routeKey, isFocused)}
      />
    );
  }

  function openFab() {
    if (process.env.EXPO_OS === 'ios') {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch { /* no-op */ }
    }
    setFabOpen(true);
  }

  return (
    <>
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: insets.bottom + TRAY_BOTTOM_GAP,
        }}
      >
        {/* Floating Vellum tray */}
        <View
          style={{
            marginHorizontal: 12,
            height: TRAY_HEIGHT,
            backgroundColor: LK.vellum,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
            borderCurve: 'continuous',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 8,
            boxShadow: `0 8px 28px ${rgba(LK.espresso, 0.14)}`,
          }}
        >
          {leftRoutes.map((r, i) => renderTab(r.name, r.key, i))}
          <View style={{ width: 64 }} />
          {rightRoutes.map((r, i) => renderTab(r.name, r.key, mid + i))}
        </View>

        {/* Center FAB — pops above the tray */}
        <FabButton onPress={openFab} />
      </View>

      <FabActionsOverlay visible={fabOpen} onClose={() => setFabOpen(false)} />
    </>
  );
}

function FabButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Quick actions"
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.92, { damping: 20, stiffness: 500 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 14, stiffness: 320 }); }}
      style={{
        position: 'absolute',
        alignSelf: 'center',
        bottom: FAB_BOTTOM,
        borderRadius: FAB_SIZE / 2,
      }}
    >
      <Animated.View style={animStyle}>
        <LinearGradient
          colors={[LK.coral, '#FF9A6B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: FAB_SIZE,
            height: FAB_SIZE,
            borderRadius: FAB_SIZE / 2,
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 16px ${rgba(LK.coral, 0.4)}`,
          }}
        >
          <Icon name="plus" size={24} color="#fff" strokeWidth={2.4} />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}
