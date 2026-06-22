import React, { useEffect } from 'react';
import { Modal, Pressable, View, Text } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LK, theme, rgba, shade } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { useNudgeLaunch } from '@/stores/nudge-launch.store';

// Keep these in sync with the tab bar so the ✕ FAB lands exactly on the + FAB.
const TRAY_HEIGHT = 64;
const TRAY_BOTTOM_GAP = 8;
const FAB_SIZE = 54;
const FAB_BOTTOM = TRAY_HEIGHT - 26; // pops ~28px above the tray top

/**
 * Full-screen quick-actions overlay opened by the center FAB (§8.11).
 * NOT a route / formSheet — a dimmed in-app overlay over a transparent Modal.
 *
 * Animations are driven by Reanimated *shared values* (not entering/exiting
 * layout animations) because layout animations silently no-op inside a RN
 * <Modal>. The Modal's native "fade" handles the backdrop in/out; cards spring
 * up with a stagger and the ✕ FAB scales in.
 */

type Action = {
  key: string;
  label: string;
  hint: string;
  icon: string;
  color: string;
  run: () => void;
};

const ACTIONS: Action[] = [
  { key: 'nudge',  label: 'Send a Nudge',  hint: 'Kiss, hug or a little bite', icon: 'heart',    color: LK.blush,    run: () => { useNudgeLaunch.getState().request(); router.push('/(tabs)'); } },
  { key: 'letter', label: 'Write a Letter', hint: 'A note kept forever',        icon: 'envelope', color: LK.gold,     run: () => router.push('/letters') },
  { key: 'moment', label: 'Add a Moment',  hint: 'A photo for your timeline',   icon: 'camera',   color: LK.coral,    run: () => router.push('/(tabs)/timeline') },
  { key: 'pin',    label: 'Drop a Map pin', hint: 'Mark a place that matters',  icon: 'mapPin',   color: LK.sage,     run: () => router.push('/map') },
];

export function FabActionsOverlay({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();

  function pick(action: Action) {
    if (process.env.EXPO_OS === 'ios') {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { /* no-op */ }
    }
    onClose();
    // Let the overlay dismiss before navigating so the transition reads cleanly.
    setTimeout(action.run, 60);
  }

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop — tap anywhere to dismiss */}
      <View style={{ flex: 1, backgroundColor: rgba(LK.parchment, 0.92) }}>
        <Pressable
          style={{ flex: 1 }}
          accessibilityLabel="Close"
          accessibilityRole="button"
          onPress={onClose}
        >
          {/* Card stack anchored above the FAB / tray */}
          <View
            style={{
              position: 'absolute',
              left: 24,
              right: 24,
              bottom: insets.bottom + TRAY_BOTTOM_GAP + FAB_BOTTOM + FAB_SIZE + 20,
              gap: 12,
            }}
          >
            {ACTIONS.map((a, i) => (
              <ActionCard key={a.key} action={a} index={i} reduced={reduced} onPick={pick} />
            ))}
          </View>

          {/* The FAB stays put and shows ✕ while open (§8.11). Tapping it closes. */}
          <FabClose insets={insets} reduced={reduced} onClose={onClose} />
        </Pressable>
      </View>
    </Modal>
  );
}

function ActionCard({ action, index, reduced, onPick }: {
  action: Action;
  index: number;
  reduced: boolean;
  onPick: (a: Action) => void;
}) {
  const v = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      v.value = withDelay(index * 30, withTiming(1, { duration: 120 }));
      return;
    }
    v.value = withDelay(index * 45, withSpring(1, { damping: theme.spring.warm.damping, stiffness: theme.spring.warm.stiffness }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ translateY: (1 - v.value) * 18 }],
  }));

  return (
    <Animated.View style={style}>
      <ScalePressable
        scaleTo={0.97}
        accessibilityRole="button"
        accessibilityLabel={action.label}
        onPress={() => onPick(action)}
        style={{
          backgroundColor: LK.vellum,
          borderRadius: theme.radii.md,
          borderCurve: 'continuous',
          paddingVertical: 14,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          ...theme.shadow.card,
        }}
      >
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: action.color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={action.icon} size={24} color={shade(action.color, 0.55)} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 17, color: LK.espresso, lineHeight: 21 }}>
            {action.label}
          </Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70, marginTop: 1 }}>
            {action.hint}
          </Text>
        </View>
      </ScalePressable>
    </Animated.View>
  );
}

function FabClose({ insets, reduced, onClose }: {
  insets: { bottom: number };
  reduced: boolean;
  onClose: () => void;
}) {
  const v = useSharedValue(0);

  useEffect(() => {
    if (reduced) { v.value = withTiming(1, { duration: 120 }); return; }
    v.value = withSpring(1, { damping: theme.spring.snappy.damping, stiffness: theme.spring.snappy.stiffness });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ scale: 0.6 + v.value * 0.4 }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          alignSelf: 'center',
          bottom: insets.bottom + TRAY_BOTTOM_GAP + FAB_BOTTOM,
        },
        style,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={onClose}
        style={{ borderRadius: FAB_SIZE / 2 }}
      >
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
          <Icon name="x" size={24} color="#fff" strokeWidth={2.4} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}
