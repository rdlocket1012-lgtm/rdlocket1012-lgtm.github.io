import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LK, tint, shade, rgba, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { IconChip, Chip } from '@/components/ui';
import { useLetters } from '@/hooks/useLetters';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { usePartner } from '@/hooks/usePartner';
import { notifyPartner } from '@/lib/push';

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

  if (sent) {
    return (
      <Modal animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: tint(LK.pink, 0.6), alignItems: 'center', justifyContent: 'center', padding: 30 }}>
          <IconChip color={LK.pink} size={96}>
            <Icon name="envelope" size={46} color={shade(LK.pink, 0.5)} />
          </IconChip>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 30, color: LK.ink, marginTop: 22, letterSpacing: -1, textAlign: 'center' }}>
            Sealed & sent
          </Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 15.5, color: LK.ink70, marginTop: 10, lineHeight: 24, maxWidth: 260, textAlign: 'center' }}>
            Your letter is on its way. It's now read-only — kept forever.
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={{ backgroundColor: LK.ink, borderRadius: 9999, paddingHorizontal: 28, paddingVertical: 16, marginTop: 26 }}
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
                ? <><Icon name="check" size={13} color={LK.mint} /><Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70 }}>Draft saved</Text></>
                : <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70 }}>Saving…</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || saving}
            style={{ backgroundColor: text.trim() ? LK.ink : 'rgba(42,33,26,0.15)', borderRadius: 9999, paddingHorizontal: 20, paddingVertical: 10 }}
          >
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: text.trim() ? '#fff' : LK.ink70 }}>
              Seal & send
            </Text>
          </TouchableOpacity>
        </View>

        {/* Toolbar */}
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingVertical: 10, alignItems: 'center' }}>
          <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(42,33,26,0.06)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 18, color: LK.ink }}>B</Text>
          </View>
          <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(42,33,26,0.06)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 18, color: LK.ink }}>i</Text>
          </View>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => isPremium ? setSealedOpen(true) : onPaywall()}
            style={{
              backgroundColor: sealedDate ? LK.gold : 'rgba(42,33,26,0.06)',
              borderRadius: 9999, paddingHorizontal: 14, paddingVertical: 9,
              flexDirection: 'row', alignItems: 'center', gap: 6,
            }}
          >
            <Icon name="lock" size={14} color={sealedDate ? shade(LK.gold, 0.6) : LK.ink70} />
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: sealedDate ? shade(LK.gold, 0.6) : LK.ink70 }}>
              {sealedLabel ?? 'Sealed until'}
            </Text>
            {!isPremium && <Icon name="crown" size={13} color={LK.ink70} />}
          </TouchableOpacity>
        </View>

        {/* Editor */}
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

        {/* Seal until picker */}
        {sealedOpen && (
          <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(20,15,10,0.4)', justifyContent: 'flex-end' } as any}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setSealedOpen(false)} />
            <View style={{ backgroundColor: LK.cream, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 }}>
              <View style={{ width: 38, height: 5, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.15)', alignSelf: 'center', marginBottom: 18 }} />
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 23, color: LK.ink }}>Seal until…</Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, color: LK.ink70, marginTop: 6, lineHeight: 21 }}>
                Your partner won't be able to open this until the date you choose.
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 18 }}>
                {SEAL_OPTIONS.map((opt) => {
                  const val = opt.getValue(couple?.start_date);
                  return (
                    <Chip
                      key={opt.label}
                      color={LK.gold}
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
