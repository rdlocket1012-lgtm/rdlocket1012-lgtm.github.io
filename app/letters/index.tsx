import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { LK, tint, shade, rgba, theme } from '@/constants/theme';
import { useLetters } from '@/hooks/useLetters';
import { useCouple } from '@/hooks/useCouple';
import { useAuthStore } from '@/stores/auth.store';
import { useUnseenStore } from '@/stores/unseen.store';
import { FREE_LIMITS } from '@/constants/free-limits';
import { RoundIcon, Sticker, Avatar, IconChip } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { NewTag } from '@/components/ui/NewTag';
import { ComposeLetterModal } from '@/components/letter/ComposeLetterModal';
import { PaywallModal } from '@/components/paywall/PaywallModal';
import type { Letter } from '@/stores/letters.store';

export default function LettersScreen() {
  const { letters } = useLetters();
  const { isPremium } = useCouple();
  const myId = useAuthStore((s) => s.profile?.id);
  const [order, setOrder] = useState<'new' | 'old'>('new');
  const [sheet, setSheet] = useState<'compose' | 'paywall' | null>(null);
  const atCap = !isPremium && letters.length >= FREE_LIMITS.LETTERS;
  const sorted = order === 'new' ? letters : [...letters].reverse();

  // Snapshot the "last seen" time on open so New tags stay visible while viewing,
  // then mark the feature seen (clears tab/card badges elsewhere).
  const seenBaseline = useRef<string | null>(useUnseenStore.getState().seenAt.letters);
  useEffect(() => { useUnseenStore.getState().markSeen('letters'); }, []);
  const isNew = (l: Letter) =>
    !!l.sender_id && l.sender_id !== myId &&
    (!seenBaseline.current || new Date(l.created_at).getTime() > new Date(seenBaseline.current).getTime());

  function handleCompose() {
    if (atCap) { setSheet('paywall'); return; }
    setSheet('compose');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <ScreenHeader
          eyebrow="Love"
          title="Letters"
          onBack={() => router.back()}
          right={<RoundIcon onPress={handleCompose}><Icon name="feather" size={21} color={LK.ink} /></RoundIcon>}
        />

        <View style={{ paddingHorizontal: 22, paddingBottom: 4, paddingTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => setOrder(order === 'new' ? 'old' : 'new')}
            style={{ backgroundColor: 'rgba(42,33,26,0.06)', borderRadius: 9999, paddingHorizontal: 14, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6 }}
            accessibilityLabel="Toggle sort order"
          >
            <Icon name="sync" size={14} color={LK.ink70} />
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: LK.ink70 }}>
              {order === 'new' ? 'Newest first' : 'Oldest first'}
            </Text>
          </TouchableOpacity>
          {!isPremium && (
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: LK.ink70 }}>
              {letters.length} of {FREE_LIMITS.LETTERS}
            </Text>
          )}
        </View>

        <View style={{ paddingHorizontal: 18, paddingTop: 10, gap: 12 }}>
          {sorted.length === 0 && (
            <View style={{ alignItems: 'center', paddingTop: 60, gap: 14 }}>
              <IconChip color={LK.pink} size={72}><Icon name="feather" size={34} color={shade(LK.pink, 0.5)} /></IconChip>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 26, color: LK.ink, textAlign: 'center' }}>No letters yet</Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5, color: LK.ink70, textAlign: 'center', lineHeight: 22, maxWidth: 250 }}>
                Write something they'll keep forever.
              </Text>
              <TouchableOpacity onPress={handleCompose} style={{ backgroundColor: LK.ink, borderRadius: 9999, paddingHorizontal: 24, paddingVertical: 14, marginTop: 8 }}>
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: '#fff' }}>Write a letter</Text>
              </TouchableOpacity>
            </View>
          )}
          {sorted.map((l, i) => {
            if (l.is_sealed_until && l.reveal_at && new Date(l.reveal_at) > new Date()) {
              return <SealedRow key={l.id} l={l} premium={isPremium} onPaywall={() => setSheet('paywall')} />;
            }
            return (
              <Sticker key={l.id} tiltDeg={i % 2 === 0 ? -0.8 : 0.8} onPress={() => router.push(`/letter/${l.id}`)} style={{ flexDirection: 'row', gap: 13, alignItems: 'flex-start', padding: 16 }}>
                <Avatar initial={l.sender_id === myId ? 'Y' : 'P'} color={LK.coral} size={42} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 14.5, color: LK.ink }}>
                        {l.sender_id === myId ? 'You' : 'Partner'}
                      </Text>
                      {isNew(l) && <NewTag />}
                    </View>
                    <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.ink70, flexShrink: 0 }}>
                      {l.sent_at ? new Date(l.sent_at).toLocaleDateString() : ''}
                    </Text>
                  </View>
                  <Text numberOfLines={2} style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 15.5, color: LK.ink70, marginTop: 5, lineHeight: 22 }}>
                    "{l.body_rich_html.replace(/<[^>]+>/g, '').slice(0, 80)}…"
                  </Text>
                </View>
              </Sticker>
            );
          })}
        </View>
      </ScrollView>

      {sheet === 'compose' && <ComposeLetterModal onClose={() => setSheet(null)} isPremium={isPremium} onPaywall={() => setSheet('paywall')} />}
      {sheet === 'paywall' && <PaywallModal onClose={() => setSheet(null)} />}
    </SafeAreaView>
  );
}

function SealedRow({ l, premium, onPaywall }: { l: Letter; premium: boolean; onPaywall: () => void }) {
  return (
    <TouchableOpacity
      onPress={premium ? undefined : onPaywall}
      activeOpacity={0.85}
      style={{
        borderRadius: theme.radii.lg, padding: 18,
        backgroundColor: tint(LK.gold, 0.7),
        ...theme.shadow.sm,
      }}
      accessibilityLabel="Sealed letter"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
        <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: LK.gold, alignItems: 'center', justifyContent: 'center', flexShrink: 0, shadowColor: LK.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10 }}>
          <Icon name="lock" size={22} color={shade(LK.gold, 0.6)} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 14.5, color: LK.ink }}>Sealed letter</Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: shade(LK.gold, 0.5), fontWeight: '700', marginTop: 3 }}>
            Opens {l.reveal_at ? new Date(l.reveal_at).toLocaleDateString() : ''}
          </Text>
        </View>
        {!premium && (
          <View style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 9999, paddingHorizontal: 9, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="crown" size={12} color={shade(LK.gold, 0.5)} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
