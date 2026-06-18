import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Animated } from 'react-native';
import { router } from 'expo-router';
import { LK, shade, theme } from '@/constants/theme';
import { useBucketList } from '@/hooks/useBucketList';
import { Icon } from '@/components/ui/Icon';
import { TabHeader } from '@/components/ui/TabHeader';
import { FadeSlideIn } from '@/components/ui/FadeSlideIn';
import { usePressScale } from '@/hooks/usePressScale';

/**
 * Fun tab — the play hub (§9.6b). Interim layout: cards linking to the
 * existing Games and Bucket List screens. The full 3-section block layout
 * (This or That · Creative · Bucket List with progress rings) is built in
 * the screen-by-screen pass.
 */
export default function FunScreen() {
  const { items } = useBucketList();
  const doneCount = items.filter((i) => i.is_done).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <TabHeader eyebrow="Let's play" title="Fun" accent={LK.lilac} />

        <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 14, gap: 12 }}>
          <FadeSlideIn delay={80}>
            <HubCard
              color={LK.lilac}
              icon="gameController"
              title="This or That & Games"
              sub="Play live, together — see if you match"
              onPress={() => router.push('/games')}
            />
          </FadeSlideIn>
          <FadeSlideIn delay={120}>
            <HubCard
              color={LK.success}
              icon="list"
              title="Bucket List"
              sub={`${doneCount} of ${items.length} done together`}
              onPress={() => router.push('/bucket-list')}
            />
          </FadeSlideIn>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HubCard({ color, icon, title, sub, onPress }: { color: string; icon: string; title: string; sub: string; onPress: () => void }) {
  const press = usePressScale(0.97);
  return (
    <TouchableOpacity onPress={onPress} onPressIn={press.onPressIn} onPressOut={press.onPressOut} activeOpacity={1} accessibilityLabel={title}>
      <Animated.View style={[{ backgroundColor: LK.ivory, borderRadius: theme.radii.lg, borderCurve: 'continuous', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, ...theme.shadow.card }, { transform: [{ scale: press.scale }] }]}>
        <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: color, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={icon} size={26} color={shade(color, 0.55)} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 17, color: LK.espresso, lineHeight: 21 }}>{title}</Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70, marginTop: 2 }}>{sub}</Text>
        </View>
        <Icon name="chevR" size={20} color={LK.ink70} />
      </Animated.View>
    </TouchableOpacity>
  );
}
