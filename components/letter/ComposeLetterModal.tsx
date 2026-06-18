import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Animated, Easing } from 'react-native';
import { LK, tint, shade, rgba, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { IconChip, Chip } from '@/components/ui';
import { useLetters } from '@/hooks/useLetters';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { usePartner } from '@/hooks/usePartner';
import { notifyPartner } from '@/lib/push';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { uploadVoiceLetter, formatDuration } from '@/lib/audio-letter';

interface Props {
  onClose: () => void;
  isPremium: boolean;
  onPaywall: () => void;
}

const SEAL_OPTIONS = [
  { label: 'Our anniversary', getValue: (startDate: string | undefined) => startDate ?? null },
  { label: 'Dec 31, 2026', getValue: () => '2026-12-31' },
  { label: '1 year from now', getValue: () => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().split('T')[0]; } },
  { label: '5 years from now', getValue: () => { const d = new Date(); d.setFullYear(d.getFullYear() + 5); return d.toISOString().split('T')[0]; } },
];

export function ComposeLetterModal({ onClose, isPremium, onPaywall }: Props) {
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
  const [mode, setMode] = useState<'text' | 'voice'>('text');
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

  if (sent) {
    return (
      <Modal animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: tint(LK.blush, 0.6), alignItems: 'center', justifyContent: 'center', padding: 30 }}>
          <IconChip color={LK.blush} size={96}>
            <Icon name="envelope" size={46} color={shade(LK.blush, 0.5)} />
          </IconChip>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 30, color: LK.espresso, marginTop: 22, letterSpacing: -1, textAlign: 'center' }}>
            Sealed & sent
          </Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 15.5, color: LK.ink70, marginTop: 10, lineHeight: 24, maxWidth: 260, textAlign: 'center' }}>
            Your letter is on its way. It's now read-only — kept forever.
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={{ backgroundColor: LK.espresso, borderRadius: 9999, paddingHorizontal: 28, paddingVertical: 16, marginTop: 26 }}
          >
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: '#fff' }}>Back to letters</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal animationType="slide" transparent={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: '#FBF3E0' }}>
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
            const canSend = mode === 'text' ? !!text.trim() : recorder.state === 'done' && !!recorder.audioUri;
            const onPress = mode === 'text' ? handleSend : handleSendVoice;
            return (
              <TouchableOpacity
                onPress={onPress}
                disabled={!canSend || saving}
                style={{ backgroundColor: canSend ? LK.espresso : 'rgba(42,33,26,0.15)', borderRadius: 9999, paddingHorizontal: 20, paddingVertical: 10, minWidth: 96, alignItems: 'center' }}
              >
                {saving
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: canSend ? '#fff' : LK.ink70 }}>Seal & send</Text>}
              </TouchableOpacity>
            );
          })()}
        </View>

        {/* Mode toggle: Write / Voice */}
        <View style={{ flexDirection: 'row', alignSelf: 'center', backgroundColor: 'rgba(42,33,26,0.06)', borderRadius: 9999, padding: 4, marginTop: 4 }}>
          {(['text', 'voice'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                backgroundColor: mode === m ? LK.ivory : 'transparent',
                borderRadius: 9999, paddingHorizontal: 18, paddingVertical: 8,
              }}
            >
              <Icon name={m === 'text' ? 'feather' : 'mic'} size={15} color={mode === m ? LK.espresso : LK.ink70} />
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13.5, color: mode === m ? LK.espresso : LK.ink70 }}>
                {m === 'text' ? 'Write' : 'Voice'}
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
        ) : (
          <VoiceRecorderPanel recorder={recorder} partnerFirstName={partnerFirstName} />
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
    </Modal>
  );
}

// ── Voice recorder panel ─────────────────────────────────────────────────────

function VoiceRecorderPanel({ recorder, partnerFirstName }: {
  recorder: ReturnType<typeof useVoiceRecorder>;
  partnerFirstName: string;
}) {
  const { state, seconds, transcript, error, maxSeconds, start, stop, reset } = recorder;
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
