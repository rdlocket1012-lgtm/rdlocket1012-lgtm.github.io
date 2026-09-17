import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { LK, shade, tint, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { LIVE_CATEGORIES } from '@/constants/live-games';
import { useLiveLaunch } from '@/stores/live.store';

export default function ThisOrThatScreen() {
  const requestStart = useLiveLaunch((s) => s.requestStart);

  function pick(categoryId: string) {
    // Hand the chosen category to the Home screen's <LiveLayer/> and pop back
    // there — it owns the Realtime channel and runs the game.
    requestStart(categoryId);
    router.dismissAll();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.layout.screenX, paddingTop: 6, paddingBottom: 6 }}>
        <ScalePressable
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: LK.ivory, alignItems: 'center', justifyContent: 'center', ...theme.shadow.sm }}
          accessibilityLabel="Back"
        >
          <Icon name="chevL" size={22} color={LK.espresso} />
        </ScalePressable>
        <Text style={{ flex: 1, textAlign: 'center', fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 21, color: LK.espresso }}>This or That</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: theme.layout.screenX, paddingBottom: 40 }}>
        <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 16, color: LK.ink70, marginBottom: 16, marginTop: 2 }}>
          Pick a deck — you'll both answer together 💛
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {LIVE_CATEGORIES.map((cat) => (
            <ScalePressable
              key={cat.id}
              scaleTo={0.97}
              onPress={() => pick(cat.id)}
              accessibilityLabel={cat.name}
              containerStyle={{ width: '48%', marginBottom: 14 }}
            >
              <View style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.lg, padding: 16, minHeight: 178, justifyContent: 'space-between', borderWidth: 1.5, borderColor: tint(cat.color, 0.55), ...theme.shadow.card }}>
                {/* emoji medallion */}
                <View style={{ width: 60, height: 60, borderRadius: 22, backgroundColor: tint(cat.color, 0.62), alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 30 }}>{cat.emoji}</Text>
                </View>

                <View>
                  <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 18, lineHeight: 21, color: LK.espresso }}>
                    {cat.name}
                  </Text>
                  <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: LK.ink70, marginTop: 3, lineHeight: 16 }}>
                    {cat.blurb}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}>
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: cat.color }} />
                    <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11.5, color: shade(cat.color, 0.5) }}>
                      {cat.prompts.length} questions
                    </Text>
                  </View>
                </View>
              </View>
            </ScalePressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
