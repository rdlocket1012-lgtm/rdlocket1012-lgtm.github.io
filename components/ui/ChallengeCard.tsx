import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { LK, rgba, theme } from '@/constants/theme';
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
          padding: 16,
          boxShadow: '0 2px 8px rgba(42,33,26,0.07)',
        } as any}
      >
        {/* Header row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
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
              fontSize: 14,
              color: LK.espresso,
              lineHeight: 18,
            }}
          >
            {title}
          </Text>
          {isComplete ? (
            <View
              style={{
                backgroundColor: rgba('#5FC79B', 0.16),
                borderRadius: 9999,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12, color: '#5FC79B' }}>
                Done ✓
              </Text>
            </View>
          ) : (
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 11, color: LK.faded }}>
              {daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}
            </Text>
          )}
        </View>

        {/* Progress bar */}
        <View
          style={{
            height: 6,
            backgroundColor: rgba(LK.espresso, 0.1),
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${Math.round(pct * 100)}%`,
              backgroundColor: isComplete ? '#5FC79B' : accent,
              borderRadius: 3,
            }}
          />
        </View>

        {/* Count line */}
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: 12,
            color: LK.sepia,
            marginTop: 8,
          }}
        >
          {isComplete
            ? 'Challenge complete — your streak is protected this week'
            : `${progress} / ${target} · ${progress === 0 ? 'get started!' : 'keep it up!'}`}
        </Text>
      </View>
    </Animated.View>
  );
}
