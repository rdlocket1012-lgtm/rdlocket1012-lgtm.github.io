import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActionSheetIOS, Alert, Platform, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { LK, tint, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { RoundIcon } from '@/components/ui/round-icon';
import { Avatar } from '@/components/ui/avatar';
import { useLetters } from '@/hooks/useLetters';
import { useAuth } from '@/hooks/useAuth';
import { usePartner } from '@/hooks/usePartner';
import { notifyPartner } from '@/lib/push';
import { VoiceLetterPlayer } from '@/components/letter/VoiceLetterPlayer';

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

  const letter = letters.find((l) => l.id === id);
  if (!letter) return null;

  const bodyText = letter.body_rich_html.replace(/<[^>]+>/g, ''); // for share/copy
  const isMine = !!letter.sender_id && letter.sender_id === profile?.id;
  const senderName = isMine
    ? (profile?.display_name?.trim().split(' ')[0] || 'You')
    : (partner?.display_name?.trim().split(' ')[0] || 'Partner');
  const senderAvatar = isMine ? profile?.avatar_url : partner?.avatar_url;
  const senderInitial = (isMine ? profile?.display_name : partner?.display_name)?.trim()?.[0]?.toUpperCase() || (isMine ? 'Y' : 'P');

  function confirmDelete() {
    if (!letter) return;
    Alert.alert(
      'Delete this letter?',
      'It will be removed for both of you. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch {}
            await deleteLetter(letter.id);
            router.back();
          },
        },
      ],
    );
  }

  async function shareLetter() {
    try { await Share.share({ message: bodyText }); } catch {}
  }

  function openMenu() {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    const options = ['Share', ...(isMine ? ['Delete letter'] : []), 'Cancel'];
    const cancelButtonIndex = options.length - 1;
    const destructiveButtonIndex = isMine ? 1 : undefined;

    const handle = (i: number) => {
      if (options[i] === 'Share') shareLetter();
      else if (options[i] === 'Delete letter') confirmDelete();
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex, destructiveButtonIndex },
        handle,
      );
    } else {
      // Android fallback
      const buttons: any[] = [{ text: 'Share', onPress: shareLetter }];
      if (isMine) buttons.push({ text: 'Delete letter', style: 'destructive', onPress: confirmDelete });
      buttons.push({ text: 'Cancel', style: 'cancel' });
      Alert.alert('Letter', undefined, buttons);
    }
  }

  function react(emoji: string) {
    if (!letter || !profile?.id) return;
    // Tapping the active reaction clears it; otherwise set the new one.
    const next = letter.reaction === emoji ? null : emoji;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    reactToLetter(letter.id, next, profile.id);
    // Notify the partner only when adding a reaction to a letter THEY sent you.
    if (next && letter.sender_id && letter.sender_id !== profile.id) {
      const me = profile.display_name || 'Your partner';
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 30, paddingVertical: 18, paddingBottom: 80 }}>
        {/* Sender header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 24 }}>
          <Avatar initial={senderInitial} imageUrl={senderAvatar} color={isMine ? LK.coral : LK.blush} size={44} />
          <View>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 15, color: LK.espresso }}>
              From {isMine ? 'You' : senderName}
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70 }}>
              {letter.sent_at ? new Date(letter.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
            </Text>
          </View>
        </View>

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
          <LetterBody html={letter.body_rich_html} />
        )}

        {/* Reactions */}
        <View style={{ marginTop: 36, alignItems: 'center' }}>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11.5, letterSpacing: 0.8, textTransform: 'uppercase', color: LK.ink70, marginBottom: 12 }}>
            {letter.reaction ? 'Reacted' : 'React to this letter'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, backgroundColor: LK.vellum, borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 8, ...theme.shadow.sm }}>
            {REACTIONS.map((emoji) => {
              const active = letter.reaction === emoji;
              return (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => react(emoji)}
                  activeOpacity={0.7}
                  style={{
                    width: 44, height: 44, borderRadius: 22,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: active ? tint(LK.blush, 0.5) : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 24, opacity: active || !letter.reaction ? 1 : 0.45 }}>{emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Privacy note */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 34 }}>
          <Icon name="lock" size={12} color={LK.ink70} />
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.ink70 }}>
            This letter is read-only and private to you both.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
