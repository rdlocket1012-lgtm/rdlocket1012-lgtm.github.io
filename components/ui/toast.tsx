import React, { useEffect } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LK, theme, rgba, shade } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { useFeedbackStore, type ToastItem, type ToastTone } from '@/stores/feedback.store';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

/**
 * Non-blocking toast — the replacement for informational `Alert.alert` calls
 * that used to demand a tap to dismiss for no reason (UX_POLISH_PLAN Phase C).
 *
 * Mounted once in app/_layout.tsx as <ToastHost />; driven imperatively via
 * `toast()` from lib/feedback.ts.
 *
 * ⚠️ Rendered inside a transparent RN <Modal> ON PURPOSE: many of the alerts
 * being replaced fire from inside compose modals (AddMilestoneModal,
 * ComposeLetterModal, AddPinModal), and a toast in the root tree would render
 * *behind* those. The Modal is only mounted while a toast is on screen, and its
 * container is pointerEvents="box-none" so the app underneath stays live.
 */

const TONE: Record<ToastTone, { accent: string; icon: string }> = {
  neutral: { accent: LK.espresso, icon: 'info' },
  success: { accent: LK.success, icon: 'check' },
  error: { accent: LK.danger, icon: 'alert' },
  warn: { accent: LK.warning, icon: 'alert' },
};

export function ToastHost() {
  const item = useFeedbackStore((s) => s.toasts[0]);
  return (
    <Modal visible={!!item} transparent animationType="none" statusBarTranslucent>
      <View pointerEvents="box-none" style={{ flex: 1 }}>
        {item && <ToastCard key={item.id} item={item} />}
      </View>
    </Modal>
  );
}

function ToastCard({ item }: { item: ToastItem }) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const dismissToast = useFeedbackStore((s) => s.dismissToast);
  const { accent, icon } = TONE[item.tone];

  const progress = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (!reduced) progress.value = withSpring(1, theme.spring.warm);

    const hide = setTimeout(() => {
      if (reduced) { dismissToast(item.id); return; }
      progress.value = withTiming(0, { duration: theme.timing.exit });
      setTimeout(() => dismissToast(item.id), theme.timing.exit);
    }, item.duration);

    return () => clearTimeout(hide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * -22 }],
  }));

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        {
          position: 'absolute',
          top: insets.top + 10,
          left: theme.layout.screenX,
          right: theme.layout.screenX,
        },
        animStyle,
      ]}
    >
      <Pressable
        onPress={() => dismissToast(item.id)}
        accessibilityRole="button"
        accessibilityLabel={item.message}
        accessibilityLiveRegion="polite"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 11,
          backgroundColor: LK.vellum,
          borderRadius: 18,
          borderCurve: 'continuous',
          borderWidth: 1.5,
          borderColor: rgba(accent, 0.35),
          paddingVertical: 13,
          paddingHorizontal: 15,
          ...theme.shadow.card,
        } as any}
      >
        <View
          style={{
            width: 28, height: 28, borderRadius: 14,
            backgroundColor: rgba(accent, 0.16),
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={15} color={shade(accent, 0.3)} strokeWidth={2.2} />
        </View>
        <Text
          numberOfLines={3}
          style={{ flex: 1, fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 14, lineHeight: 19, color: LK.espresso }}
        >
          {item.message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
