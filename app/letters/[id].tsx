import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { confirm, choose } from '@/lib/feedback';
import { warn as hapticWarn } from '@/lib/haptics';
import Transition from 'react-native-screen-transitions';
import { EaseView } from 'react-native-ease';
import { LK, tint, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { RoundIcon } from '@/components/ui/round-icon';
import { Avatar } from '@/components/ui/avatar';
import { useLetters } from '@/hooks/useLetters';
import { useAuth } from '@/hooks/useAuth';
import { usePartner } from '@/hooks/usePartner';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { notifyPartner } from '@/lib/push';
import { VoiceLetterPlayer } from '@/components/letter/VoiceLetterPlayer';
import { SendMomentOverlay } from '@/components/ui/send-moment-overlay';
import { shouldCelebrateLetter, markLetterCelebrated } from '@/lib/letter-moments';

/** Gentle staggered "unfold" for the letter — the page settling open (§10.13).
 *  Honours Reduce Motion by snapping to the final state. */
const unfold = (delay: number, reduced: boolean) =>
  reduced
    ? ({ type: 'none' } as const)
    : ({
        opacity: { type: 'timing', duration: 300, delay },
        transform: { type: 'spring', damping: 14, stiffness: 220, delay },
      } as const);

const REACTIONS = ['❤️', '🥹', '😍', '😘', '🔥', '😂'];

const BASE_LETTER_STYLE = {
  fontFamily: theme.fonts.serif,
  fontStyle: 'italic' as const,
  fontSize: 20.5,
  color: LK.espresso,
  lineHeight: 34,
};

function parseInlineHtml(html: string, paraIdx: number): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /<strong>([\s\S]*?)<\/strong>|<em>([\s\S]*?)<\/em>|([^<]+)/g;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = regex.exec(html)) !== null) {
    const key = `${paraIdx}-${i++}`;
    if (match[3] !== undefined) {
      nodes.push(match[3]);
    } else if (match[1] !== undefined) {
      nodes.push(<Text key={key} style={{ fontWeight: '800' }}>{match[1]}</Text>);
    } else if (match[2] !== undefined) {
      nodes.push(<Text key={key} style={{ fontStyle: 'italic' }}>{match[2]}</Text>);
    }
  }
  return nodes;
}

function LetterBody({ html }: { html: string }) {
  const paras = html
    .replace(/<\/p>/gi, '\n')
    .replace(/<p>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .split('\n')
    .map(p => p.trim());

  const nonEmpty = paras.filter(p => p.length > 0);

  return (
    <Text style={BASE_LETTER_STYLE} selectable>
      {nonEmpty.map((para, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 ? '\n\n' : ''}
          {parseInlineHtml(para, idx)}
        </React.Fragment>
      ))}
    </Text>
  );
}

export default function LetterReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { letters, reactToLetter, deleteLetter } = useLetters();
  const { profile } = useAuth();
  const { partner } = usePartner();
  const reduced = useReducedMotion();

  const letter = letters.find((l) => l.id === id);

  // ── Arrival moment (§M1/M2) ───────────────────────────────────────────────
  // Letters were the only peak-worthy event in the app without a peak: opening
  // one your partner wrote looked identical to opening your own. `letter-received`
  // was drawn for exactly this and had no call site anywhere.
  //
  // Held back until the card→letter morph has settled, so the two animations
  // don't fight. Hooks sit above the early return below.
  const [arrival, setArrival] = useState(false);
  useEffect(() => {
    if (!letter || !profile?.id) return;
    const fromPartner = !!letter.sender_id && letter.sender_id !== profile.id;
    if (!fromPartner) return;
    // A sealed letter that hasn't reached its reveal date isn't an arrival yet.
    if (letter.reveal_at && new Date(letter.reveal_at).getTime() > Date.now()) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    shouldCelebrateLetter(letter.id, letter.created_at).then((yes) => {
      if (!yes || cancelled) return;
      markLetterCelebrated(letter.id);
      timer = setTimeout(() => { if (!cancelled) setArrival(true); }, reduced ? 0 : 480);
    });
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter?.id, profile?.id]);

  if (!letter) return null;

  const bodyText = letter.body_rich_html.replace(/<[^>]+>/g, ''); // for share/copy
  const isMine = !!letter.sender_id && letter.sender_id === profile?.id;
  const senderName = isMine
    ? (profile?.display_name?.trim().split(' ')[0] || 'You')
    : (partner?.display_name?.trim().split(' ')[0] || 'Partner');
  const senderAvatar = isMine ? profile?.avatar_url : partner?.avatar_url;
  const senderInitial = (isMine ? profile?.display_name : partner?.display_name)?.trim()?.[0]?.toUpperCase() || (isMine ? 'Y' : 'P');

  async function confirmDelete() {
    if (!letter) return;
    const ok = await confirm({
      title: 'Delete this letter?',
      message: 'It will be removed for both of you. This cannot be undone.',
      destructive: true,
      icon: 'trash',
    });
    if (!ok) return;
    hapticWarn();
    await deleteLetter(letter.id);
    router.back();
  }

  async function shareLetter() {
    try { await Share.share({ message: bodyText }); } catch {}
  }

  // One themed sheet on both platforms — this used to be ActionSheetIOS on
  // iOS with an Alert.alert fallback on Android, so the menu looked different
  // depending on the phone.
  async function openMenu() {
    // No tap() here: RoundIcon routes through ScalePressable, which already
    // fires it on press-in.
    const picked = await choose({
      title: 'This letter',
      options: [
        { label: 'Share', value: 'share' },
        ...(isMine ? [{ label: 'Delete letter', value: 'delete', destructive: true }] : []),
      ],
      icon: 'envelope',
    });
    if (picked === 'share') shareLetter();
    else if (picked === 'delete') confirmDelete();
  }

  function react(emoji: string) {
    if (!letter || !profile?.id) return;
    // Tapping the active reaction clears it; otherwise set the new one.
    const next = letter.reaction === emoji ? null : emoji;
    // ScalePressable already fired tap() on press-in.
    reactToLetter(letter.id, next, profile.id);
    // Notify the partner only when adding a reaction to a letter THEY sent you.
    if (next && letter.sender_id && letter.sender_id !== profile.id) {
      // First name only — matches every other push in the app (§T1).
      const me = (profile.display_name || 'Your partner').split(' ')[0];
      notifyPartner('letter_reaction', `${next} ${me} reacted`, `${me} reacted ${next} to your letter.`);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 6 }}>
        <RoundIcon onPress={() => router.back()}>
          <Icon name="chevL" size={20} color={LK.espresso} />
        </RoundIcon>
        <RoundIcon onPress={openMenu}>
          <Icon name="dots" size={20} color={LK.espresso} />
        </RoundIcon>
      </View>

      {/* DESTINATION for the card→letter morph (§10.13): the source LetterCard
          (group="letter" id) grows into this surface. sharedBoundTag 'letter'. */}
      <Transition.Boundary.View group="letter" id={id} style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 30, paddingVertical: 18, paddingBottom: 80 }}>
        {/* Sender header */}
        <EaseView
          initialAnimate={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={unfold(40, reduced)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 24 }}
        >
          <Avatar initial={senderInitial} imageUrl={senderAvatar} color={isMine ? LK.coral : LK.blush} size={44} />
          <View>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 15, color: LK.espresso }}>
              From {isMine ? 'You' : senderName}
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70 }}>
              {letter.sent_at ? new Date(letter.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
            </Text>
          </View>
        </EaseView>

        {/* Voice letter player */}
        {letter.audio_path && (
          <VoiceLetterPlayer audioPath={letter.audio_path} duration={letter.audio_duration} />
        )}

        {/* Transcript label for voice letters */}
        {letter.audio_path && letter.transcript && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Icon name="mic" size={13} color={LK.ink70} />
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: LK.ink70 }}>
              Transcript
            </Text>
          </View>
        )}

        {/* Letter body / transcript */}
        {(!letter.audio_path || letter.transcript) && (
          <EaseView
            initialAnimate={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={unfold(140, reduced)}
          >
            <LetterBody html={letter.body_rich_html} />
          </EaseView>
        )}

        {/* Reactions */}
        <EaseView
          initialAnimate={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={unfold(240, reduced)}
          style={{ marginTop: 36, alignItems: 'center' }}
        >
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11.5, letterSpacing: 0.8, textTransform: 'uppercase', color: LK.ink70, marginBottom: 12 }}>
            {letter.reaction ? 'Reacted' : 'React to this letter'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, backgroundColor: LK.vellum, borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 8, ...theme.shadow.sm }}>
            {REACTIONS.map((emoji) => {
              const active = letter.reaction === emoji;
              return (
                <ScalePressable
                  key={emoji}
                  onPress={() => react(emoji)}
                  scaleTo={0.85}
                  accessibilityLabel={`React ${emoji}`}
                  style={{
                    width: 44, height: 44, borderRadius: 22,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: active ? tint(LK.blush, 0.5) : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 24, opacity: active || !letter.reaction ? 1 : 0.45 }}>{emoji}</Text>
                </ScalePressable>
              );
            })}
          </View>
        </EaseView>

        {/* Privacy note */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 34 }}>
          <Icon name="lock" size={12} color={LK.ink70} />
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.ink70 }}>
            This letter is read-only and private to you both.
          </Text>
        </View>
      </ScrollView>
      </Transition.Boundary.View>

      {/* The arrival moment — plays once per letter, per device (§M1/M2). */}
      <SendMomentOverlay
        visible={arrival}
        name="letter-received"
        message={`A letter from ${senderName} 💌`}
        subMessage="Take your time with it."
        onDismiss={() => setArrival(false)}
      />
    </SafeAreaView>
  );
}
