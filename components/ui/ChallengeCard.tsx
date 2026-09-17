import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { LK, rgba, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';

type Props = {
  title: string;
  icon: string;
  accent: string;
  progress: number;
  target: number;
  daysLeft: number;
  isComplete: boolean;
};

export function ChallengeCard({ title, icon, accent, progress, target, daysLeft, isComplete }: Props) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const prevComplete = React.useRef(isComplete);

  // Pulse once when the card transitions to completed.
  useEffect(() => {
    if (isComplete && !prevComplete.current && !reducedMotion) {
      scale.value = withSequence(
        withSpring(1.04, theme.spring.bounce),
        withSpring(1, theme.spring.bounce),
      );
    }
    prevComplete.current = isComplete;
  }, [isComplete, reducedMotion]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const pct = Math.min(1, target > 0 ? progress / target : 0);

  return (
    <Animated.View style={animStyle}>
      <View
        style={{
          backgroundColor: LK.ivory,
          borderRadius: 20,
          borderCurve: 'continuous',
          borderWidth: 1.5,
          borderColor: LK.hairline,
          padding: 16,
          boxShadow: '0 2px 8px rgba(42,33,26,0.07)',
        } as any}
      >
        {/* Header row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: rgba(accent, 0.14),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={icon} size={17} color={accent} strokeWidth={2} />
          </View>
          <Text
            numberOfLines={2}
            style={{
              flex: 1,
              fontFamily: theme.fonts.body,
              fontWeight: '700',
              fontSize: 15,
              color: LK.espresso,
              lineHeight: 19,
            }}
          >
            {title}
          </Text>
          {isComplete ? (
            <View
              style={{
                backgroundColor: rgba(LK.success, 0.16),
                borderRadius: 9999,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12, color: shade(LK.success, 0.45) }}>
                Done ✓
              </Text>
            </View>
          ) : (
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 12, color: LK.ink70 }}>
              {daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}
            </Text>
          )}
        </View>

        {/* Progress bar */}
        <View
          style={{
            height: 8,
            backgroundColor: rgba(accent, 0.14),
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${Math.round(pct * 100)}%`,
              backgroundColor: isComplete ? LK.success : accent,
              borderRadius: 4,
              // A 0% bar reads as broken; a nub reads as "ready to start".
              minWidth: 8,
            }}
          />
        </View>

        {/* Count line */}
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: 12.5,
            fontWeight: '500',
            color: LK.ink70,
            marginTop: 8,
          }}
        >
          {isComplete
            ? 'Challenge complete — your streak is protected this week'
            : progress === 0
              ? `${target} to go this week`
              : `${progress} of ${target} · ${target - progress} to go`}
        </Text>
      </View>
    </Animated.View>
  );
}
