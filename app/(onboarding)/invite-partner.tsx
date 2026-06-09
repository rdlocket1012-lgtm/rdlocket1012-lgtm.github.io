import React, { useState } from 'react';
import { View, Text, Share, SafeAreaView, TouchableOpacity, ActivityIndicator, Linking, TextInput } from 'react-native';
import { router } from 'expo-router';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Btn, StepDots, Sticker, IconChip, Chip } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { ComposeLetterModal } from '@/components/letter/ComposeLetterModal';

export default function InvitePartnerScreen() {
  const [generated, setGenerated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const DEFAULT_MESSAGE = "Hey Daljeet, I built this thinking of us — a place to grow together, collect memories, and have fun along the way. I hope someday it helps other people feel a little closer too. Hope you like it. Give honest opinions haan.\n\nLove you. — Rendell";
  const [welcomeMsg, setWelcomeMsg] = useState(DEFAULT_MESSAGE);
  const [msgSaved, setMsgSaved] = useState(false);
  // HTTPS link — opens the landing page which tries the app then falls back to the App Store.
  // Universal Links (AASA) means iOS opens the app directly when installed.
  const inviteLink = `https://rdlocket1012-lgtm.github.io/invite?token=${token}`;

  async function handleGenerate() {
    if (busy) return;
    if (!generated) {
      setBusy(true);
      try {
        const coupleId = useAuthStore.getState().profile?.couple_id;
        const bytes = new Uint8Array(12);
        crypto.getRandomValues(bytes);
        const newToken = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
        if (coupleId) {
          // Best-effort: store a real invite row. Ignore failure (table optional).
          await supabase.from('partner_invites').insert({ couple_id: coupleId, token: newToken });
        }
        setToken(newToken);
        setGenerated(true);
      } finally {
        setBusy(false);
      }
      return;
    }
    await Share.share({ message: `Join me on Locket 💛 Tap to link our space: ${inviteLink}` });
  }

  async function saveWelcomeMessage() {
    const coupleId = useAuthStore.getState().profile?.couple_id;
    if (!coupleId || !welcomeMsg.trim()) return;
    await supabase.from('couples').update({ welcome_message: welcomeMsg.trim() }).eq('id', coupleId);
    setMsgSaved(true);
    setTimeout(() => setMsgSaved(false), 2000);
  }

  async function handleCopyLink() {
    // Opens the iOS share sheet — includes a "Copy" row at the top.
    await Share.share({ message: `Join me on Locket 💛 ${inviteLink}` });
  }

  async function openShareTarget(url: string) {
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) await Linking.openURL(url);
      else await Share.share({ message: `Join me on Locket 💛 Tap to link our space: ${inviteLink}` });
    } catch {
      await Share.share({ message: `Join me on Locket 💛 Tap to link our space: ${inviteLink}` });
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream }}>
      <TouchableOpacity
        onPress={() => router.back()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={{ position: 'absolute', top: 56, left: 22, zIndex: 10, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(42,33,26,0.06)', alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon name="chevL" size={22} color={LK.ink} />
      </TouchableOpacity>
      <View style={{ flex: 1, padding: 30, justifyContent: 'center' }}>
        <Text style={{
          fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 33,
          color: LK.ink, letterSpacing: -1, lineHeight: 38, marginBottom: 14,
        }}>
          Invite your person
        </Text>
        <Text style={{
          fontFamily: theme.fonts.body, fontSize: 15.5, color: LK.ink70,
          lineHeight: 24, maxWidth: 290, marginBottom: 30,
        }}>
          Locket is built for two. Send them a private link to join your space.
        </Text>

        {!generated ? (
          <Sticker color={LK.sky} tiltDeg={1.5} style={{ alignItems: 'center', gap: 14, paddingVertical: 30 }}>
            <IconChip color={LK.sky} size={64}><Icon name="heart" size={30} color={shade(LK.sky, 0.5)} /></IconChip>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: LK.ink, textAlign: 'center' }}>
              One link. One partner.
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 13.5, color: LK.ink70, textAlign: 'center', lineHeight: 20 }}>
              Links expire after 48 hours and can only be used once.
            </Text>
          </Sticker>
        ) : (
          <Sticker tiltDeg={-1}>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: LK.ink70 }}>
              Your invite link
            </Text>
            <TouchableOpacity
              onPress={handleCopyLink}
              activeOpacity={0.7}
              style={{ backgroundColor: 'rgba(42,33,26,0.05)', borderRadius: 14, padding: 14, marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }}
            >
              <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontSize: 14, fontWeight: '700', color: LK.ink }}>{inviteLink}</Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, fontWeight: '700', color: LK.ink70 }}>
                Share
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              {([
                { label: 'iMessage', url: `sms:&body=${encodeURIComponent(`Join me on Locket! ${inviteLink}`)}` },
                { label: 'WhatsApp', url: `whatsapp://send?text=${encodeURIComponent(`Join me on Locket! ${inviteLink}`)}` },
              ] as const).map((s) => (
                <TouchableOpacity
                  key={s.label}
                  onPress={() => openShareTarget(s.url)}
                  style={{
                    flex: 1, alignItems: 'center', padding: 12,
                    borderRadius: 14, backgroundColor: tint(LK.sky, 0.8),
                  }}
                >
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: shade(LK.sky, 0.5) }}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: LK.ink70, marginTop: 12, textAlign: 'center' }}>
              Expires in 48 hours · single use
            </Text>
          </Sticker>
        )}
      </View>

      {/* Welcome message card — short personal note shown on her join screen */}
      {generated && (
        <View style={{ paddingHorizontal: 30, paddingBottom: 12 }}>
          <View style={{ backgroundColor: tint(LK.gold, 0.55), borderRadius: theme.radii.lg, padding: 16 }}>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 14, color: shade(LK.gold, 0.5), marginBottom: 8, letterSpacing: 0.3 }}>
              Welcome message 💛
            </Text>
            <TextInput
              value={welcomeMsg}
              onChangeText={setWelcomeMsg}
              multiline
              style={{
                fontFamily: theme.fonts.serif,
                fontStyle: 'italic',
                fontSize: 14.5,
                color: LK.ink,
                lineHeight: 22,
                backgroundColor: 'rgba(255,255,255,0.55)',
                borderRadius: 12,
                padding: 12,
                minHeight: 110,
                textAlignVertical: 'top',
              }}
            />
            <TouchableOpacity
              onPress={saveWelcomeMessage}
              activeOpacity={0.8}
              style={{ alignSelf: 'flex-end', marginTop: 10, backgroundColor: shade(LK.gold, 0.15), borderRadius: 9999, paddingHorizontal: 18, paddingVertical: 8 }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: shade(LK.gold, 0.55) }}>
                {msgSaved ? 'Saved ✓' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Welcome letter prompt — appears once the link is generated */}
      {generated && (
        <View style={{ paddingHorizontal: 30, paddingBottom: 8 }}>
          <TouchableOpacity
            onPress={() => setShowCompose(true)}
            activeOpacity={0.85}
            style={{
              backgroundColor: tint(LK.pink, 0.7), borderRadius: theme.radii.lg,
              padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13,
            }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: LK.pink, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="feather" size={20} color={shade(LK.pink, 0.55)} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 15.5, color: LK.ink }}>
                Write her a welcome letter ✍️
              </Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70, marginTop: 2 }}>
                It'll be waiting when she opens the app.
              </Text>
            </View>
            <Icon name="chevR" size={18} color={shade(LK.pink, 0.5)} />
          </TouchableOpacity>
        </View>
      )}

      <View style={{ padding: 22, paddingBottom: 36, gap: 16 }}>
        <Btn full kind={generated ? 'accent' : 'primary'} onPress={handleGenerate}>
          {busy
            ? <ActivityIndicator color={generated ? LK.ink : '#fff'} />
            : generated
            ? <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 17, color: LK.ink }}>Share link</Text>
            : <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 17, color: '#fff' }}>Generate invite link</Text>}
        </Btn>
        <Btn full kind="ghost" onPress={() => router.push('/(onboarding)/first-milestone')}>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: LK.ink70 }}>Skip for now</Text>
        </Btn>
        <StepDots total={5} current={1} />
      </View>

      {showCompose && (
        <ComposeLetterModal
          isPremium={false}
          onClose={() => setShowCompose(false)}
          onPaywall={() => setShowCompose(false)}
        />
      )}
    </SafeAreaView>
  );
}
