import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';
import { LK, tint, shade, rgba, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { Chip } from '@/components/ui';
import { useLetters } from '@/hooks/useLetters';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { usePartner } from '@/hooks/usePartner';
import { notifyPartner } from '@/lib/push';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { uploadVoiceLetter, formatDuration } from '@/lib/audio-letter';
import { SendMomentOverlay } from '@/components/ui/send-moment-overlay';
import {
  LOVE_CARD_ILLUSTRATIONS,
  encodeLoveCard,
  type IllustrationKey,
} from '@/constants/love-card-illustrations';

interface Props {
  onClose: () => void;
  isPremium: boolean;
  onPaywall: () => void;
  initialMode?: 'text' | 'voice' | 'card';
}

const SEAL_OPTIONS = [
  { label: 'Our anniversary', getValue: (startDate: string | undefined) => startDate ?? null },
  { label: 'Dec 31, 2026', getValue: () => '2026-12-31' },
  { label: '1 year from now', getValue: () => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().split('T')[0]; } },
  { label: '5 years from now', getValue: () => { const d = new Date(); d.setFullYear(d.getFullYear() + 5); return d.toISOString().split('T')[0]; } },
];

export function ComposeLetterModal({ onClose, isPremium, onPaywall, initialMode = 'text' }: Props) {
  const { sendLetter } = useLetters();
  const { profile } = useAuth();
  const { couple } = useCouple();
  const { partner } = usePartner();
  const partnerFirstName = partner?.display_name?.split(' ')[0] || 'my love';
  const [text, setText] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const [sealedOpen, setSealedOpen] = useState(false);
  const [sealedDate, setSealedDate] = useState<string | null>(null);
  const [sealedLabel, setSealedLabel] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'text' | 'voice' | 'card'>(initialMode);
  const [cardIllus, setCardIllus] = useState<IllustrationKey>('envelope');
  const [cardMessage, setCardMessage] = useState('');
  const recorder = useVoiceRecorder();

  useEffect(() => {
    if (!text) return;
    setDraftSaved(false);
    const id = setTimeout(() => setDraftSaved(true), 900);
    return () => clearTimeout(id);
  }, [text]);

  async function handleSend() {
    if (!text.trim() || !couple?.id || !profile?.id) return;
    setSaving(true);
    try {
      await sendLetter({
        couple_id: couple.id,
        sender_id: profile.id,
        recipient_id: null,
        body_rich_html: `<p>${text.replace(/\n/g, '</p><p>')}</p>`,
        is_draft: false,
        is_sealed_until: sealedDate !== null,
        reveal_at: sealedDate,
        sent_at: new Date().toISOString(),
        deleted_at: null,
        audio_path: null,
        audio_duration: null,
        transcript: null,
      });
      const name = (profile?.display_name || 'Your partner').split(' ')[0];
      if (sealedDate) {
        notifyPartner('letter', 'A sealed letter 💌', `${name} left you a letter to open later`);
      } else {
        notifyPartner('letter', 'A new love letter 💌', `${name} wrote you something`);
      }
      setSent(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleSendVoice() {
    if (!recorder.audioUri || !couple?.id || !profile?.id) return;
    setSaving(true);
    try {
      const path = await uploadVoiceLetter(recorder.audioUri, couple.id);
      if (!path) {
        setSaving(false);
        return;
      }
      const transcript = recorder.transcript.trim();
      await sendLetter({
        couple_id: couple.id,
        sender_id: profile.id,
        recipient_id: null,
        // Store transcript as the body too, so voice letters are searchable/readable.
        body_rich_html: transcript ? `<p>${transcript}</p>` : '<p>🎙️ Voice letter</p>',
        is_draft: false,
        is_sealed_until: sealedDate !== null,
        reveal_at: sealedDate,
        sent_at: new Date().toISOString(),
        deleted_at: null,
        audio_path: path,
        audio_duration: recorder.seconds,
        transcript: transcript || null,
      });
      const name = (profile?.display_name || 'Your partner').split(' ')[0];
      notifyPartner('letter', 'A voice letter 🎙️💌', `${name} recorded you something`);
      setSent(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleSendCard() {
    if (!cardMessage.trim() || !couple?.id || !profile?.id) return;
    setSaving(true);
    try {
      await sendLetter({
        couple_id: couple.id,
        sender_id: profile.id,
        recipient_id: null,
        body_rich_html: encodeLoveCard(cardIllus, cardMessage.trim()),
        is_draft: false,
        is_sealed_until: false,
        reveal_at: null,
        sent_at: new Date().toISOString(),
        deleted_at: null,
        audio_path: null,
        audio_duration: null,
        transcript: null,
      });
      const name = (profile?.display_name || 'Your partner').split(' ')[0];
      notifyPartner('letter', 'A Love Card 💌', `${name} sent you a Love Card`);
      setSent(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal animationType="slide" transparent={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: LK.ivory }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 56, paddingBottom: 6 }}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15.5, color: LK.ink70 }}>Cancel</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            {text.length > 0 && (
              draftSaved
                ? <><Icon name="check" size={13} color={LK.success} /><Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70 }}>Draft saved</Text></>
                : <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70 }}>Saving…</Text>
            )}
          </View>
          {(() => {
            const canSend =
              mode === 'text' ? !!text.trim() :
              mode === 'voice' ? recorder.state === 'done' && !!recorder.audioUri :
              !!cardMessage.trim();
            const onPress =
              mode === 'text' ? handleSend :
              mode === 'voice' ? handleSendVoice :
              handleSendCard;
            const label = mode === 'card' ? 'Send with love' : 'Seal & send';
            return (
              <TouchableOpacity
                onPress={onPress}
                disabled={!canSend || saving}
                style={{ backgroundColor: canSend ? LK.espresso : 'rgba(42,33,26,0.15)', borderRadius: 9999, paddingHorizontal: 20, paddingVertical: 10, minWidth: 96, alignItems: 'center' }}
              >
                {saving
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: canSend ? '#fff' : LK.ink70 }}>{label}</Text>}
              </TouchableOpacity>
            );
          })()}
        </View>

        {/* Mode toggle: Write / Voice / Love Card */}
        <View style={{ flexDirection: 'row', alignSelf: 'center', backgroundColor: 'rgba(42,33,26,0.06)', borderRadius: 9999, padding: 4, marginTop: 4 }}>
          {([
            { id: 'text', icon: 'feather', label: 'Write' },
            { id: 'voice', icon: 'mic', label: 'Voice' },
            { id: 'card', icon: 'heart', label: 'Love Card' },
          ] as const).map((m) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => setMode(m.id)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                backgroundColor: mode === m.id ? LK.ivory : 'transparent',
                borderRadius: 9999, paddingHorizontal: 14, paddingVertical: 8,
              }}
            >
              <Icon name={m.icon} size={14} color={mode === m.id ? (m.id === 'card' ? LK.coral : LK.espresso) : LK.ink70} />
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: mode === m.id ? LK.espresso : LK.ink70 }}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Toolbar */}
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingVertical: 10, alignItems: 'center' }}>
          <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(42,33,26,0.06)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 18, color: LK.espresso }}>B</Text>
          </View>
          <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(42,33,26,0.06)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 18, color: LK.espresso }}>i</Text>
          </View>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => isPremium ? setSealedOpen(true) : onPaywall()}
            style={{
              backgroundColor: sealedDate ? LK.marigold : 'rgba(42,33,26,0.06)',
              borderRadius: 9999, paddingHorizontal: 14, paddingVertical: 9,
              flexDirection: 'row', alignItems: 'center', gap: 6,
            }}
          >
            <Icon name="lock" size={14} color={sealedDate ? shade(LK.marigold, 0.6) : LK.ink70} />
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: sealedDate ? shade(LK.marigold, 0.6) : LK.ink70 }}>
              {sealedLabel ?? 'Sealed until'}
            </Text>
            {!isPremium && <Icon name="crown" size={13} color={LK.ink70} />}
          </TouchableOpacity>
        </View>

        {/* Editor */}
        {mode === 'text' ? (
          <TextInput
            autoFocus
            multiline
            value={text}
            onChangeText={setText}
            placeholder={`Dear ${partnerFirstName},\n\nWrite something they'll keep forever…`}
            placeholderTextColor="rgba(58,46,34,0.4)"
            style={{
              flex: 1,
              paddingHorizontal: 30,
              paddingVertical: 8,
              fontFamily: theme.fonts.serif,
              fontStyle: 'italic',
              fontSize: 20,
              lineHeight: 33,
              color: '#3a2e22',
              textAlignVertical: 'top',
            }}
          />
        ) : mode === 'voice' ? (
          <VoiceRecorderPanel recorder={recorder} partnerFirstName={partnerFirstName} />
        ) : (
          <LoveCardCompose
            selectedIllus={cardIllus}
            message={cardMessage}
            partnerFirstName={partnerFirstName}
            onSelectIllus={setCardIllus}
            onMessageChange={setCardMessage}
          />
        )}

        {/* Seal until picker */}
        {sealedOpen && (
          <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(20,15,10,0.4)', justifyContent: 'flex-end' } as any}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setSealedOpen(false)} />
            <View style={{ backgroundColor: LK.parchment, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 }}>
              <View style={{ width: 38, height: 5, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.15)', alignSelf: 'center', marginBottom: 18 }} />
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 23, color: LK.espresso }}>Seal until…</Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, color: LK.ink70, marginTop: 6, lineHeight: 21 }}>
                Your partner won't be able to open this until the date you choose.
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 18 }}>
                {SEAL_OPTIONS.map((opt) => {
                  const val = opt.getValue(couple?.start_date);
                  return (
                    <Chip
                      key={opt.label}
                      color={LK.marigold}
                      active={sealedDate === val}
                      onPress={() => {
                        setSealedDate(val);
                        setSealedLabel(opt.label);
                        setSealedOpen(false);
                      }}
                    >
                      {opt.label}
                    </Chip>
                  );
                })}
              </View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Send peak (§10.5) — overlays the editor in-place; no Modal prop swap
          (changing `transparent` on a live Modal blanks the screen on iOS). */}
      {sent && (
        <SendMomentOverlay
          visible
          name="letter-send"
          message={sealedDate ? `Sealed for ${partnerFirstName}` : `On its way to ${partnerFirstName}`}
          subMessage={sealedDate ? 'They’ll open it when the day comes' : 'They’ll feel it the moment they open the app'}
          onDismiss={onClose}
        />
      )}
    </Modal>
  );
}

// ── Voice recorder panel ─────────────────────────────────────────────────────

function VoiceRecorderPanel({ recorder, partnerFirstName }: {
  recorder: ReturnType<typeof useVoiceRecorder>;
  partnerFirstName: string;
}) {
  const { state, seconds, transcript, error, maxSeconds, available, start, stop, reset } = recorder;
  const pulse = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (state === 'recording') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.18, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(1);
    }
  }, [state]);

  // Native speech module not in this build — degrade gracefully so the rest of
  // the composer still works (text + Love Card). Available again after a rebuild.
  if (!available) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 14 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(42,33,26,0.06)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="mic" size={32} color={LK.ink70} />
        </View>
        <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 20, color: LK.espresso, textAlign: 'center' }}>
          Voice letters need an update
        </Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5, color: LK.ink70, textAlign: 'center', lineHeight: 21, maxWidth: 280 }}>
          This version of the app doesn't include voice recording yet. You can still write a letter or send a Love Card.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 20 }}>
      {/* Prompt */}
      {state === 'idle' && (
        <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 19, color: 'rgba(58,46,34,0.55)', textAlign: 'center', marginBottom: 36, lineHeight: 28 }}>
          Dear {partnerFirstName},{'\n'}say something they'll keep forever…
        </Text>
      )}

      {/* Live transcript while recording / after */}
      {(state === 'recording' || state === 'done') && transcript ? (
        <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 19, color: '#3a2e22', textAlign: 'center', marginBottom: 32, lineHeight: 29 }}>
          "{transcript}"
        </Text>
      ) : null}

      {/* Timer */}
      <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 40, color: LK.espresso, letterSpacing: -1, marginBottom: 24 }}>
        {formatDuration(seconds)}{' '}
        <Text style={{ fontSize: 18, color: LK.ink70 }}>/ 0:{maxSeconds}</Text>
      </Text>

      {/* Record / stop button */}
      {state !== 'done' ? (
        <Animated.View style={{ transform: [{ scale: state === 'recording' ? pulse : 1 }] }}>
          <TouchableOpacity
            onPress={state === 'recording' ? stop : start}
            activeOpacity={0.85}
            style={{
              width: 96, height: 96, borderRadius: 48,
              backgroundColor: state === 'recording' ? LK.coral : LK.blush,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 5, borderColor: state === 'recording' ? tint(LK.coral, 0.5) : tint(LK.blush, 0.5),
              ...theme.shadow.card,
            }}
          >
            <Icon name={state === 'recording' ? 'pause' : 'mic'} size={40} color={shade(state === 'recording' ? LK.coral : LK.blush, 0.55)} />
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <View style={{ alignItems: 'center', gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: tint(LK.success, 0.6), borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 10 }}>
            <Icon name="check" size={18} color={shade(LK.success, 0.5)} />
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: shade(LK.success, 0.5) }}>
              Recorded · {formatDuration(seconds)}
            </Text>
          </View>
          <TouchableOpacity onPress={reset} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14 }}>
            <Icon name="sync" size={15} color={LK.ink70} />
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13.5, color: LK.ink70 }}>Re-record</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Hint / error */}
      <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: error ? LK.coral : LK.ink70, textAlign: 'center', marginTop: 22, lineHeight: 18, maxWidth: 260 }}>
        {error
          ? error
          : state === 'idle'
          ? 'Tap to record up to 30 seconds. We transcribe it on your device as you speak.'
          : state === 'recording'
          ? 'Listening… tap to stop.'
          : 'Tap "Seal & send" to deliver your voice letter.'}
      </Text>
    </ScrollView>
  );
}

// ── Love Card compose ────────────────────────────────────────────────────────

function LoveCardCompose({
  selectedIllus,
  message,
  partnerFirstName,
  onSelectIllus,
  onMessageChange,
}: {
  selectedIllus: IllustrationKey;
  message: string;
  partnerFirstName: string;
  onSelectIllus: (k: IllustrationKey) => void;
  onMessageChange: (t: string) => void;
}) {
  const selected = LOVE_CARD_ILLUSTRATIONS.find((i) => i.key === selectedIllus)!;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Live card preview (3:4 ratio, §8.1 Love Card spec) */}
      <View style={{ paddingHorizontal: 40, paddingTop: 16, paddingBottom: 12 }}>
        <View
          style={{
            backgroundColor: LK.vellum,
            borderRadius: 16,
            borderCurve: 'continuous',
            borderWidth: 1.5,
            borderColor: LK.espresso,
            aspectRatio: 3 / 4,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(42,33,26,0.10), 0 1px 3px rgba(42,33,26,0.06)',
          }}
        >
          {/* Inner border */}
          <View
            style={{
              position: 'absolute',
              inset: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: LK.espresso,
              pointerEvents: 'none',
            }}
          />
          <Image
            source={selected.source}
            style={{ width: '60%', aspectRatio: 1 }}
            contentFit="contain"
          />
          {message.trim() ? (
            <Text
              style={{
                fontFamily: theme.fonts.serif,
                fontStyle: 'italic',
                fontSize: 15,
                color: LK.espresso,
                textAlign: 'center',
                paddingHorizontal: 20,
                marginTop: 12,
              }}
              numberOfLines={3}
            >
              {message}
            </Text>
          ) : (
            <Text
              style={{
                fontFamily: theme.fonts.serif,
                fontStyle: 'italic',
                fontSize: 14,
                color: 'rgba(42,33,26,0.30)',
                textAlign: 'center',
                paddingHorizontal: 20,
                marginTop: 12,
              }}
            >
              your message here…
            </Text>
          )}
          <Text
            style={{
              fontFamily: theme.fonts.body,
              fontSize: 12,
              fontWeight: '500',
              color: LK.faded,
              marginTop: 10,
            }}
          >
            for {partnerFirstName}
          </Text>
        </View>
      </View>

      {/* Illustration picker */}
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: '700',
          fontSize: 11,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: LK.faded,
          paddingHorizontal: 20,
          marginBottom: 10,
        }}
      >
        Illustration
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
      >
        {LOVE_CARD_ILLUSTRATIONS.map((illus) => {
          const active = illus.key === selectedIllus;
          return (
            <TouchableOpacity
              key={illus.key}
              onPress={() => onSelectIllus(illus.key)}
              style={{
                width: 72,
                alignItems: 'center',
                gap: 6,
              }}
              accessibilityLabel={illus.label}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  borderCurve: 'continuous',
                  backgroundColor: active ? tint(illus.accentColor, 0.82) : LK.ivory,
                  borderWidth: active ? 2 : 1.5,
                  borderColor: active ? illus.accentColor : 'rgba(42,33,26,0.10)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image source={illus.source} style={{ width: 44, height: 44 }} contentFit="contain" />
              </View>
              <View
                style={{
                  height: 4,
                  width: 28,
                  borderRadius: 2,
                  backgroundColor: illus.accentColor,
                  opacity: active ? 1 : 0.35,
                }}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Message field */}
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: '700',
          fontSize: 11,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: LK.faded,
          paddingHorizontal: 20,
          marginTop: 18,
          marginBottom: 10,
        }}
      >
        Message
      </Text>
      <TextInput
        value={message}
        onChangeText={onMessageChange}
        multiline
        maxLength={120}
        placeholder={`Something sweet for ${partnerFirstName}…`}
        placeholderTextColor="rgba(42,33,26,0.30)"
        style={{
          marginHorizontal: 20,
          backgroundColor: LK.ivory,
          borderRadius: 14,
          borderCurve: 'continuous',
          borderWidth: 1.5,
          borderColor: 'rgba(42,33,26,0.12)',
          padding: 16,
          fontFamily: theme.fonts.serif,
          fontStyle: 'italic',
          fontSize: 15,
          color: LK.espresso,
          lineHeight: 22,
          minHeight: 80,
          textAlignVertical: 'top',
        }}
      />
      <Text
        style={{
          alignSelf: 'flex-end',
          marginRight: 20,
          marginTop: 6,
          fontFamily: theme.fonts.body,
          fontSize: 11,
          color: LK.faded,
        }}
      >
        {message.length}/120
      </Text>
    </ScrollView>
  );
}
