import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { LK, shade, tint, rgba, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { ScalePressable } from '@/components/ui/scale-pressable';

type Game = {
  key: string;
  emoji: string;
  name: string;
  tagline: string;
  color: string;
  route?: string;     // present ⇒ playable
};

// This or That is the live one; the rest are framed as "Soon" so the screen
// reads as a home for many games (the layout the user asked for).
const GAMES: Game[] = [
  { key: 'tot',   emoji: '🔀', name: 'this or that', tagline: 'Tap your pick, see if you match.', color: LK.lilac, route: '/games/this-or-that' },
  { key: 'draw',  emoji: '✏️', name: 'draw & guess', tagline: 'Draw it, guess it, laugh.', color: LK.sky, route: '/games/draw-and-guess' },
  { key: 'wyr',   emoji: '🤔', name: 'would you rather', tagline: 'Pick a side, spark a chat.', color: LK.coral },
  { key: 'triv',  emoji: '💡', name: 'love trivia', tagline: 'How well do you know us?', color: LK.success },
  { key: 'memory', emoji: '🧠', name: 'memory match', tagline: 'Flip cards, find the pairs.', color: LK.blush },
];

export default function GamesScreen() {
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
        <Text style={{ flex: 1, textAlign: 'center', fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 21, color: LK.espresso }}>Games</Text>
        {/* spacer to balance the back button */}
        <View style={{ width: 42 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: theme.layout.screenX, paddingBottom: 40 }}>
        <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 16, color: LK.ink70, marginBottom: 16, marginTop: 2 }}>
          Little games for two 💞
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {GAMES.map((g) => (
            <GameCard key={g.key} game={g} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function GameCard({ game }: { game: Game }) {
  const live = !!game.route;
  return (
    <ScalePressable
      scaleTo={0.97}
      disabled={!live}
      onPress={() => game.route && router.push(game.route as never)}
      accessibilityLabel={game.name}
      containerStyle={{ width: '48%', marginBottom: 14 }}
    >
      <LinearGradient
        colors={[tint(game.color, 0.12), shade(game.color, 0.18)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ height: 186, borderRadius: theme.radii.lg, padding: 15, justifyContent: 'space-between', opacity: live ? 1 : 0.7, ...theme.shadow.card }}
      >
        {/* top row: emoji chip + status pill */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: rgba('#ffffff', 0.22), alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 24 }}>{game.emoji}</Text>
          </View>
          {live ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: rgba('#ffffff', 0.25), borderRadius: 9999, paddingLeft: 9, paddingRight: 10, paddingVertical: 5 }}>
              <Icon name="play" size={12} color="#fff" />
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 12, color: '#fff' }}>Play</Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: rgba('#000000', 0.16), borderRadius: 9999, paddingHorizontal: 9, paddingVertical: 5 }}>
              <Icon name="lock" size={11} color="rgba(255,255,255,0.92)" />
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 11, color: 'rgba(255,255,255,0.92)' }}>Soon</Text>
            </View>
          )}
        </View>

        {/* bottom: name + tagline */}
        <View>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: 'rgba(255,255,255,0.78)', marginBottom: 3 }}>
            {game.name}
          </Text>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 19, lineHeight: 22, color: '#fff' }}>
            {game.tagline}
          </Text>
        </View>
      </LinearGradient>
    </ScalePressable>
  );
}
