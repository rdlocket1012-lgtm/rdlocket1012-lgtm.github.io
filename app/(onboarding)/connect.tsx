import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { Shell, PrimaryCta } from '@/components/onboarding/Shell';
import { PressableScale } from '@/components/onboarding/PressableScale';

const OPTIONS = [
  { key: 'together', icon: 'house', label: 'We live together', reward: "Cozy. We'll make home feel even warmer 🏡" },
  { key: 'nearby', icon: 'mapPin', label: 'Nearby, not together', reward: 'Close enough for spontaneous dates 🗺️' },
  { key: 'distance', icon: 'plane', label: 'Long-distance', reward: "We'll keep both your time zones in sight 🕰️" },
  { key: 'changes', icon: 'sync', label: 'It changes', reward: "We'll roll with wherever life takes you ✨" },
] as const;

export default function ConnectScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const reward = OPTIONS.find((o) => o.key === selected)?.reward;

  async function next() {
    if (!selected) return;
    await AsyncStorage.setItem('connection_style', selected);
    router.push('/(onboarding)/anniversary');
  }

  return (
    <Shell
      step={2}
      total={6}
      title="How do you two connect?"
      why="so Locket fits the shape of your relationship."
      footer={<PrimaryCta label="Continue" onPress={next} disabled={!selected} />}
    >
      <View style={{ marginTop: 28, gap: 11 }}>
        {OPTIONS.map((o) => {
          const active = selected === o.key;
          return (
            <PressableScale
              key={o.key}
              haptic="soft"
              scaleTo={0.975}
              onPress={() => setSelected(o.key)}
              accessibilityLabel={o.label}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 14,
                backgroundColor: active ? tint(LK.marigold, 0.72) : LK.ivory,
                borderRadius: 20, padding: 15,
                borderWidth: 1.5, borderColor: active ? LK.marigold : 'transparent',
                ...theme.shadow.sm,
              }}
            >
              <View style={{
                width: 44, height: 44, borderRadius: 22,
                backgroundColor: active ? LK.marigold : LK.parchmentDeep,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={o.icon} size={21} color={active ? shade(LK.marigold, 0.55) : LK.espresso} />
              </View>
              <Text style={{
                flex: 1, fontFamily: theme.fonts.heading, fontWeight: '700',
                fontSize: 16.5, color: LK.espresso,
              }}>
                {o.label}
              </Text>
              {active && <Icon name="check" size={19} color={shade(LK.marigold, 0.5)} />}
            </PressableScale>
          );
        })}
      </View>

      {!!reward && (
        <Animated.View key={selected} entering={FadeInDown.springify().damping(18).reduceMotion(ReduceMotion.System)} style={{ marginTop: 20 }}>
          <Text style={{
            fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 16.5,
            color: shade(LK.marigold, 0.4), textAlign: 'center', lineHeight: 24,
          }}>
            {reward}
          </Text>
        </Animated.View>
      )}
    </Shell>
  );
}
