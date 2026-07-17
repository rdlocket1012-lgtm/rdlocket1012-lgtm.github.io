import React from 'react';
import { View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  useReducedMotion,
} from 'react-native-reanimated';
import { LK, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { tick } from '@/lib/haptics';

const THRESHOLD = 96; // px of travel that commits the dismiss
const SPRING = { damping: 18, stiffness: 280 }; // spring.warm

/**
 * Swipe-left-to-dismiss wrapper for an Activity row.
 *
 * Left only, deliberately: a right swipe near the screen edge is the iOS
 * interactive back gesture, and competing with it makes both feel broken.
 */
export function DismissibleRow({
  children,
  onDismiss,
  enabled = true,
}: {
  children: React.ReactNode;
  onDismiss: () => void;
  enabled?: boolean;
}) {
  const tx = useSharedValue(0);
  const reduced = useReducedMotion();

  const commit = () => {
    tick();
    onDismiss();
  };

  const pan = Gesture.Pan()
    .enabled(enabled)
    // Only claim the gesture once it's clearly horizontal, so the list keeps
    // scrolling vertically as normal.
    .activeOffsetX([-12, 12])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      tx.value = Math.min(0, e.translationX); // left only
    })
    .onEnd((e) => {
      const gone = e.translationX < -THRESHOLD || e.velocityX < -800;
      if (gone) {
        tx.value = withTiming(-500, { duration: 160 }, (done) => {
          if (done) runOnJS(commit)();
        });
      } else {
        tx.value = withSpring(0, SPRING);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
    // Fade as it goes, so the row reads as leaving rather than sliding under.
    opacity: reduced ? 1 : Math.max(0, 1 - Math.abs(tx.value) / (THRESHOLD * 2.2)),
  }));

  const hintStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.abs(tx.value) / THRESHOLD),
  }));

  if (!enabled) return <>{children}</>;

  return (
    <View style={{ position: 'relative', justifyContent: 'center' }}>
      {/* Behind the row: the dismiss affordance the swipe reveals. */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingRight: 18,
            gap: 4,
          },
          hintStyle,
        ]}
      >
        <Icon name="x" size={18} color={LK.danger} />
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 11, fontWeight: '700', color: LK.danger }}>
          Dismiss
        </Text>
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={rowStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}
