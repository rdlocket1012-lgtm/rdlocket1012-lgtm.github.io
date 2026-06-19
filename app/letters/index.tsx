import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, FlatList, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { LK, tint, shade, rgba, theme } from '@/constants/theme';
import { useLetters } from '@/hooks/useLetters';
import { useCouple } from '@/hooks/useCouple';
import { usePartner } from '@/hooks/usePartner';
import { useAuthStore } from '@/stores/auth.store';
import { useUnseenStore } from '@/stores/unseen.store';
import { FREE_LIMITS } from '@/constants/free-limits';
import { RoundIcon } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ComposeLetterModal } from '@/components/letter/ComposeLetterModal';
import { PaywallModal } from '@/components/paywall/PaywallModal';
import type { Letter } from '@/stores/letters.store';
import {
  decodeLoveCard,
  getIllustration,
} from '@/constants/love-card-illustrations';

const EMPTY_ILLUS = require('../../assets/illustrations/empty-states/no-letters.png');
type Segment = 'received' | 'sent' | 'cards';

function timeAgo(iso: string | null): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const secs = Math.max(0, (Date.now() - then) / 1000);
  if (secs < 60) return 'just now';
  const mins = secs / 60;
  if (mins < 60) return `${Math.floor(mins)}m`;
  const hrs = mins / 60;
  if (hrs < 24) return `${Math.floor(hrs)}h`;
  const days = hrs / 24;
  if (days < 7) return `${Math.floor(days)}d`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function fmtDuration(secs: number | null): string {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function LettersScreen() {
  const { letters, loading } = useLetters();
  const { isPremium } = useCouple();
  const { partner } = usePartner();
  const myId = useAuthStore((s) => s.profile?.id);
  const myProfile = useAuthStore((s) => s.profile);

  const firstName = (name?: string | null, fb = '') => (name?.trim().split(' ')[0]) || fb;
  const partnerName = firstName(partner?.display_name, 'Partner');

  const [seg, setSeg] = useState<Segment>('received');
  const [sheet, setSheet] = useState<'compose' | 'compose_card' | 'paywall' | null>(null);
  const atCap = !isPremium && letters.length >= FREE_LIMITS.LETTERS;

  // Snapshot "last seen" on open so unread dots stay visible while viewing.
  const seenBaseline = useRef<string | null>(useUnseenStore.getState().seenAt.letters);
  useEffect(() => { useUnseenStore.getState().markSeen('letters'); }, []);
  const isUnread = (l: Letter) =>
    !!l.sender_id && l.sender_id !== myId &&
    (!seenBaseline.current || new Date(l.created_at).getTime() > new Date(seenBaseline.current).getTime());

  const isCard = (l: Letter) => !!decodeLoveCard(l.body_rich_html);
  const received = letters.filter((l) => l.sender_id !== myId && !isCard(l));
  const sent = letters.filter((l) => l.sender_id === myId && !isCard(l));
  const cards = letters.filter(isCard);
  const list = seg === 'received' ? received : seg === 'sent' ? sent : [];

  function handleCompose() {
    if (atCap) { setSheet('paywall'); return; }
    setSheet('compose');
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top']}>
        <ScreenHeader eyebrow="Love" title="Letters" onBack={() => router.back()} />
        <LettersSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top']}>
      <ScreenHeader
        eyebrow="Love"
        title="Letters"
        onBack={() => router.back()}
        right={
          <View>
            <RoundIcon onPress={handleCompose}><Icon name="feather" size={21} color={LK.espresso} /></RoundIcon>
            {atCap && (
              <View style={{ position: 'absolute', top: -1, right: -1, width: 18, height: 18, borderRadius: 9, backgroundColor: LK.gold, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: LK.parchment }}>
                <Icon name="lock" size={9} color="#fff" strokeWidth={2.5} />
              </View>
            )}
          </View>
        }
      />

      {/* Segmented control */}
      <View style={{ flexDirection: 'row', marginHorizontal: theme.layout.screenX, marginTop: 10, backgroundColor: 'rgba(42,33,26,0.06)', borderRadius: 9999, padding: 4 }}>
        {([['received', 'Received'], ['sent', 'Sent'], ['cards', 'Love Cards']] as const).map(([id, label]) => {
          const active = seg === id;
          return (
            <Pressable
              key={id}
              onPress={() => setSeg(id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: 9999, backgroundColor: active ? LK.vellum : 'transparent', ...(active ? theme.shadow.sm : null) }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 13.5, color: active ? LK.espresso : LK.sepia }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {seg === 'cards' ? (
        <LoveCardsGrid
          cards={cards}
          myId={myId}
          partnerName={partnerName}
          onCompose={() => setSheet('compose_card')}
        />
      ) : null}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: theme.layout.screenX, paddingTop: 14, paddingBottom: 100, gap: 12 }} style={seg === 'cards' ? { display: 'none' } : undefined}>
        {list.length === 0 ? (
          <EmptyState
            illustration
            title={seg === 'sent' ? 'Nothing sent yet' : 'No letters yet'}
            line={seg === 'sent' ? 'Write something they’ll keep forever.' : 'Your first letter is the hardest to start.'}
            cta={atCap ? undefined : 'Write a letter'}
            onCta={handleCompose}
          />
        ) : (
          list.map((l) => {
            const sealed = l.is_sealed_until && l.reveal_at && new Date(l.reveal_at) > new Date();
            if (sealed) return <SealedCard key={l.id} l={l} premium={isPremium} onPaywall={() => setSheet('paywall')} />;
            return (
              <LetterCard
                key={l.id}
                l={l}
                mine={l.sender_id === myId}
                senderName={l.sender_id === myId ? 'You' : partnerName}
                unread={isUnread(l)}
                onPress={() => router.push(`/letter/${l.id}`)}
              />
            );
          })
        )}
      </ScrollView>

      {sheet === 'compose' && <ComposeLetterModal onClose={() => setSheet(null)} isPremium={isPremium} onPaywall={() => setSheet('paywall')} />}
      {sheet === 'compose_card' && <ComposeLetterModal onClose={() => setSheet(null)} isPremium={isPremium} onPaywall={() => setSheet('paywall')} initialMode="card" />}
      {sheet === 'paywall' && <PaywallModal onClose={() => setSheet(null)} />}
    </SafeAreaView>
  );
}

function LetterCard({ l, mine, senderName, unread, onPress }: { l: Letter; mine: boolean; senderName: string; unread: boolean; onPress: () => void }) {
  const isVoice = !!l.audio_path;
  const preview = l.body_rich_html.replace(/<[^>]+>/g, '').trim();

  return (
    <Pressable onPress={onPress} accessibilityLabel={`Letter from ${senderName}`} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}>
      <View style={{ flexDirection: 'row', backgroundColor: LK.ivory, borderRadius: theme.radii.md, borderCurve: 'continuous', overflow: 'hidden', ...theme.shadow.sm }}>
        <View style={{ width: 4, backgroundColor: LK.gold }} />
        <View style={{ flex: 1, padding: 16, flexDirection: 'row', gap: 13 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: LK.gold, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="envelope" size={20} color="#fff" strokeWidth={2} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: LK.espresso }}>{senderName}</Text>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '500', fontSize: 12, color: LK.faded, flexShrink: 0 }}>{timeAgo(l.sent_at ?? l.created_at)}</Text>
            </View>
            {isVoice ? (
              <View style={{ alignSelf: 'flex-start', marginTop: 7, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: tint(LK.blush, 0.6), borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Icon name="mic" size={13} color={shade(LK.blush, 0.5)} />
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 11.5, color: shade(LK.blush, 0.5) }}>
                  Voice · {fmtDuration(l.audio_duration)}
                </Text>
              </View>
            ) : (
              <Text numberOfLines={2} style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 14.5, color: LK.sepia, marginTop: 4, lineHeight: 21 }}>
                {preview ? `“${preview.slice(0, 90)}${preview.length > 90 ? '…' : ''}”` : ''}
              </Text>
            )}
            {l.reaction ? (
              <View style={{ alignSelf: 'flex-start', marginTop: 8, backgroundColor: tint(LK.blush, 0.5), borderRadius: 9999, paddingHorizontal: 9, paddingVertical: 3 }}>
                <Text style={{ fontSize: 14 }}>{l.reaction}</Text>
              </View>
            ) : null}
          </View>
        </View>
        {unread && <View style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: LK.gold }} />}
      </View>
    </Pressable>
  );
}

function SealedCard({ l, premium, onPaywall }: { l: Letter; premium: boolean; onPaywall: () => void }) {
  return (
    <Pressable
      onPress={premium ? undefined : onPaywall}
      accessibilityLabel="Sealed letter"
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: tint(LK.marigold, 0.7), borderRadius: theme.radii.md, borderCurve: 'continuous', padding: 16, ...theme.shadow.sm }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: LK.marigold, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="lock" size={21} color={shade(LK.marigold, 0.6)} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: LK.espresso }}>Sealed letter</Text>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: shade(LK.marigold, 0.5), marginTop: 3 }}>
            Opens {l.reveal_at ? new Date(l.reveal_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
          </Text>
        </View>
        {!premium && <Icon name="crown" size={15} color={shade(LK.marigold, 0.5)} />}
      </View>
    </Pressable>
  );
}

function LoveCardsGrid({
  cards,
  myId,
  partnerName,
  onCompose,
}: {
  cards: Letter[];
  myId: string | null | undefined;
  partnerName: string;
  onCompose: () => void;
}) {
  const { width } = useWindowDimensions();
  const cardW = (width - theme.layout.screenX * 2 - 12) / 2;
  const cardH = cardW * (4 / 3); // 3:4 portrait ratio

  if (cards.length === 0) {
    return (
      <View style={{ alignItems: 'center', paddingTop: 56, paddingHorizontal: theme.layout.screenX, gap: 16 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: tint(LK.blush, 0.7), alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="heart.fill" size={32} color={shade(LK.blush, 0.4)} />
        </View>
        <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 22, color: LK.espresso, textAlign: 'center' }}>No love cards yet</Text>
        <Text style={{ fontFamily: theme.fonts.handMedium, fontSize: 17, color: LK.sepia, textAlign: 'center', lineHeight: 24, maxWidth: 260 }}>
          Send {partnerName} an illustrated card
        </Text>
        <Pressable onPress={onCompose} style={({ pressed }) => ({ backgroundColor: LK.coral, borderRadius: 9999, paddingHorizontal: 24, paddingVertical: 14, marginTop: 8, transform: [{ scale: pressed ? 0.97 : 1 }] })}>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: '#fff' }}>Send one first</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: theme.layout.screenX,
        paddingTop: 14,
        paddingBottom: 100,
        gap: 12,
      }}
    >
      {cards.map((card) => {
        const payload = decodeLoveCard(card.body_rich_html);
        if (!payload) return null;
        const illus = getIllustration(payload.illus);
        const fromMe = card.sender_id === myId;
        return (
          <Pressable
            key={card.id}
            style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }], width: cardW })}
            accessibilityLabel={`Love card: ${payload.message}`}
          >
            <View
              style={{
                width: cardW,
                height: cardH,
                backgroundColor: LK.vellum,
                borderRadius: 12,
                borderCurve: 'continuous',
                borderWidth: 1.5,
                borderColor: LK.espresso,
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
                ...theme.shadow.card,
              }}
            >
              {/* Inner border */}
              <View style={{ position: 'absolute', inset: 10, borderRadius: 4, borderWidth: 1, borderColor: LK.espresso }} pointerEvents="none" />
              <Image source={illus.source} style={{ width: '55%', aspectRatio: 1 }} contentFit="contain" />
              <Text
                numberOfLines={3}
                style={{
                  fontFamily: theme.fonts.serif,
                  fontStyle: 'italic',
                  fontSize: 13,
                  color: LK.espresso,
                  textAlign: 'center',
                  paddingHorizontal: 18,
                  marginTop: 10,
                  lineHeight: 19,
                }}
              >
                {payload.message}
              </Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 11, fontWeight: '500', color: LK.faded, marginTop: 8 }}>
                {fromMe ? `You → ${partnerName}` : `${partnerName} → You`}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function LettersSkeleton() {
  return (
    <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 20, gap: 12 }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            backgroundColor: LK.ivory,
            borderRadius: 20,
            borderCurve: 'continuous',
            padding: 16,
            gap: 10,
            borderWidth: 1.5,
            borderColor: LK.hairline,
            boxShadow: '0 2px 8px rgba(42,33,26,0.07)',
          } as any}
        >
          <View style={{ width: 80, height: 10, borderRadius: 5, backgroundColor: 'rgba(42,33,26,0.08)' }} />
          <View style={{ width: '85%', height: 14, borderRadius: 7, backgroundColor: 'rgba(42,33,26,0.06)' }} />
          <View style={{ width: '60%', height: 12, borderRadius: 6, backgroundColor: 'rgba(42,33,26,0.05)' }} />
        </View>
      ))}
    </View>
  );
}

function EmptyState({ title, line, cta, onCta, illustration }: { title: string; line: string; cta?: string; onCta?: () => void; illustration?: boolean }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 56, gap: 14 }}>
      {illustration ? (
        <Image source={EMPTY_ILLUS} style={{ width: 120, height: 120 }} contentFit="contain" />
      ) : (
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: tint(LK.gold, 0.7), alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="envelope" size={32} color={shade(LK.gold, 0.4)} />
        </View>
      )}
      <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 22, color: LK.espresso, textAlign: 'center' }}>{title}</Text>
      <Text style={{ fontFamily: theme.fonts.handMedium, fontSize: 17, color: LK.sepia, textAlign: 'center', lineHeight: 24, maxWidth: 260 }}>{line}</Text>
      {cta && onCta && (
        <Pressable onPress={onCta} style={({ pressed }) => ({ backgroundColor: LK.coral, borderRadius: 9999, paddingHorizontal: 24, paddingVertical: 14, marginTop: 8, transform: [{ scale: pressed ? 0.97 : 1 }] })}>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: '#fff' }}>{cta}</Text>
        </Pressable>
      )}
    </View>
  );
}
