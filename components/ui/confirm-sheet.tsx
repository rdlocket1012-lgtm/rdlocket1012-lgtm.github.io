import React, { useEffect } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { LK, theme, rgba, tint, shade } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { useFeedbackStore, type SheetRequest, type SheetAction } from '@/stores/feedback.store';
import { warn as hapticWarn, soft as hapticSoft } from '@/lib/haptics';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

/**
 * Cozy Scrapbook decision sheet — the replacement for `Alert.alert` at every
 * decision point (DESIGN.md §10.12; UX_POLISH_PLAN Phase C).
 *
 * Mounted once in app/_layout.tsx as <ConfirmSheetHost />; driven imperatively
 * via `confirm()` / `choose()` / `alert()` from lib/feedback.ts.
 *
 * ⚠️ Reanimated `entering`/`exiting` layout animations no-op inside an RN
 * <Modal>, so the card's entrance runs off a shared value instead, with the
 * Modal itself on animationType="fade" for the scrim.
 */
export function ConfirmSheetHost() {
  const request = useFeedbackStore((s) => s.sheets[0]);
  return (
    <Modal
      visible={!!request}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (request) useFeedbackStore.getState().settleSheet(request.id, null);
      }}
    >
      {request && <SheetCard key={request.id} request={request} />}
    </Modal>
  );
}

function SheetCard({ request }: { request: SheetRequest }) {
  const reduced = useReducedMotion();
  const settle = useFeedbackStore((s) => s.settleSheet);

  const progress = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    progress.value = withSpring(1, theme.spring.warm);
    if (request.destructive) hapticWarn(); else hapticSoft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: 0.92 + progress.value * 0.08 },
      { translateY: (1 - progress.value) * 14 },
    ],
  }));

  const accent = request.destructive ? LK.danger : LK.coral;

  function close(value: string | null) {
    // Exit is faster than the entrance (§10.2) — fade the card, then settle.
    if (reduced) { settle(request.id, value); return; }
    progress.value = withTiming(0, { duration: theme.timing.exit });
    setTimeout(() => settle(request.id, value), theme.timing.exit);
  }

  return (
    <Pressable
      onPress={() => close(null)}
      accessibilityLabel="Dismiss"
      style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.5)', justifyContent: 'center', paddingHorizontal: 28 }}
    >
      {/* Stop taps inside the card from dismissing. */}
      <Pressable onPress={() => {}}>
        <Animated.View
          accessibilityViewIsModal
          style={[
            {
              backgroundColor: LK.vellum,
              borderRadius: 26,
              borderCurve: 'continuous',
              padding: 24,
              ...theme.shadow.card,
            } as any,
            cardStyle,
          ]}
        >
          {request.icon && (
            <View
              style={{
                width: 46, height: 46, borderRadius: 15, borderCurve: 'continuous',
                backgroundColor: rgba(accent, 0.14),
                alignItems: 'center', justifyContent: 'center', marginBottom: 14,
              } as any}
            >
              <Icon name={request.icon} size={22} color={shade(accent, 0.35)} strokeWidth={2} />
            </View>
          )}

          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 21, lineHeight: 26, color: LK.espresso, letterSpacing: -0.4 }}>
            {request.title}
          </Text>

          {request.message ? (
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5, lineHeight: 21, color: LK.ink70, marginTop: 8 }}>
              {request.message}
            </Text>
          ) : null}

          <View style={{ gap: 9, marginTop: 22 }}>
            {request.actions.map((action) => (
              <SheetButton key={action.value} action={action} onPress={() => close(action.value)} />
            ))}

            {request.cancelLabel !== null && (
              <ScalePressable
                scaleTo={0.97}
                haptic={false}
                onPress={() => close(null)}
                accessibilityRole="button"
                accessibilityLabel={request.cancelLabel}
                style={{
                  backgroundColor: 'transparent',
                  borderRadius: 9999,
                  paddingVertical: 15,
                  alignItems: 'center',
                  minHeight: 44,
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15.5, color: LK.ink70 }}>
                  {request.cancelLabel}
                </Text>
              </ScalePressable>
            )}
          </View>
        </Animated.View>
      </Pressable>
    </Pressable>
  );
}

/** Primary actions are filled; picker choices are tinted and equal-weight. */
function SheetButton({ action, onPress }: { action: SheetAction; onPress: () => void }) {
  const filled = action.primary;
  const ink = action.destructive ? LK.danger : LK.espresso;

  return (
    <ScalePressable
      scaleTo={0.97}
      haptic={false}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      style={{
        backgroundColor: filled ? ink : tint(LK.espresso, 0.94),
        borderRadius: 9999,
        paddingVertical: 15,
        alignItems: 'center',
        minHeight: 44,
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: filled ? '800' : '700',
          fontSize: 15.5,
          color: filled ? '#fff' : ink,
        }}
      >
        {action.label}
      </Text>
    </ScalePressable>
  );
}
