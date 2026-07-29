import React, { useEffect, useState } from 'react';
import { View, Text, Share, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { Shell, PrimaryCta, QuietCta } from '@/components/onboarding/Shell';
import { PressableScale } from '@/components/onboarding/PressableScale';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { useCouple } from '@/hooks/useCouple';
import { ComposeLetterModal } from '@/components/letter/ComposeLetterModal';
import { SendMomentOverlay } from '@/components/ui/send-moment-overlay';
import { success } from '@/lib/haptics';

// No lookalike characters (0/O, 1/I/L) — this code gets read aloud.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function genCode(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => ALPHABET[b % ALPHABET.length]).join('');
}

export default function InvitePartnerScreen() {
  const profile = useAuthStore((s) => s.profile);
  const { isPremium } = useCouple();
  const [code, setCode] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [onboardingPeak, setOnboardingPeak] = useState(false);

  const first = (profile?.display_name ?? '').trim().split(' ')[0];
  const DEFAULT_MESSAGE = `I made us a little home for our memories — it's already waiting for you. 💛${first ? `\n— ${first}` : ''}`;
  const [welcomeMsg, setWelcomeMsg] = useState(DEFAULT_MESSAGE);
  const [msgSaved, setMsgSaved] = useState(false);

  // The code IS the invite token — same string works as a tappable link and
  // as six letters read out over a call. Single-use, 48h expiry server-side.
  useEffect(() => {
    (async () => {
      const c = genCode();
      const coupleId = useAuthStore.getState().profile?.couple_id;
      if (coupleId) {
        try { await supabase.from('partner_invites').insert({ couple_id: coupleId, token: c }); } catch { /* table optional */ }
      }
      setCode(c);
    })();
  }, []);

  const link = code ? `https://rdlocket1012-lgtm.github.io/invite?token=${code}` : '';

  async function share() {
    if (!code) return;
    await Share.share({
      message: `Join me on Locket 💛 ${link}\n\nOr open Locket and enter our code: ${code}`,
    });
    setShared(true);
    setOnboardingPeak(true);
  }

  async function saveWelcomeMessage() {
    const coupleId = useAuthStore.getState().profile?.couple_id;
    if (!coupleId || !welcomeMsg.trim()) return;
    try { await supabase.from('couples').update({ welcome_message: welcomeMsg.trim() }).eq('id', coupleId); } catch { /* best-effort */ }
    success();
    setMsgSaved(true);
    setTimeout(() => setMsgSaved(false), 2000);
  }

  function goNext() {
    router.push('/(onboarding)/photo-permission');
  }

  return (
    <Shell
      step={5}
      total={6}
      title="Invite your person"
      why="one link — or six little letters — and you're linked."
      keyboardAvoid
      footer={
        <>
          <PrimaryCta
            label={shared ? 'Continue' : 'Share invite'}
            onPress={shared ? goNext : share}
            disabled={!code}
          />
          <QuietCta label="Skip for now" onPress={goNext} />
        </>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 24, paddingBottom: 12, gap: 14 }}>
        {/* The code card */}
        <PressableScale haptic="soft" scaleTo={0.98} onPress={share} accessibilityLabel="Share your invite code">
          <View style={{
            backgroundColor: LK.ivory, borderRadius: theme.radii.lg, paddingVertical: 24,
            alignItems: 'center', ...theme.shadow.card,
          }}>
            <Text style={{
              fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 11.5,
              letterSpacing: 2, textTransform: 'uppercase', color: LK.ink70,
            }}>
              Your code
            </Text>
            {code ? (
              <Text style={{
                fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 40,
                letterSpacing: 9, color: LK.espresso, marginTop: 8, marginLeft: 9,
              }}>
                {code}
              </Text>
            ) : (
              // Sized to the 40px code text so there is no layout jump on load.
              <Skeleton width={196} height={44} radius={10} style={{ marginTop: 8, marginLeft: 9 }} />
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <Icon name="share" size={13} color={LK.ink70} />
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: LK.ink70 }}>
                Tap to share · single use · expires in 48 hours
              </Text>
            </View>
          </View>
        </PressableScale>

        {/* A note for when they arrive */}
        <View style={{ backgroundColor: tint(LK.marigold, 0.62), borderRadius: theme.radii.lg, padding: 16 }}>
          <Text style={{
            fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 14.5,
            color: shade(LK.marigold, 0.5), marginBottom: 9,
          }}>
            A note for when they arrive 💛
          </Text>
          <TextInput
            value={welcomeMsg}
            onChangeText={setWelcomeMsg}
            multiline
            style={{
              fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 15,
              color: LK.espresso, lineHeight: 23,
              backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 12,
              padding: 12, minHeight: 92, textAlignVertical: 'top',
            }}
          />
          <PressableScale
            onPress={saveWelcomeMessage}
            haptic="soft"
            style={{
              alignSelf: 'flex-end', marginTop: 10, backgroundColor: shade(LK.marigold, 0.15),
              borderRadius: 9999, paddingHorizontal: 18, paddingVertical: 8,
            }}
          >
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: shade(LK.marigold, 0.55) }}>
              {msgSaved ? 'Saved ✓' : 'Save'}
            </Text>
          </PressableScale>
        </View>

        {/* Welcome letter prompt */}
        <PressableScale
          haptic="soft"
          scaleTo={0.98}
          onPress={() => setShowCompose(true)}
          accessibilityLabel="Write a welcome letter"
          style={{
            backgroundColor: tint(LK.blush, 0.7), borderRadius: theme.radii.lg,
            padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13,
          }}
        >
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: LK.blush, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="feather" size={20} color={shade(LK.blush, 0.55)} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 15.5, color: LK.espresso }}>
              Write a welcome letter ✍️
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70, marginTop: 2 }}>
              It'll be waiting when they open the app.
            </Text>
          </View>
          <Icon name="chevR" size={18} color={shade(LK.blush, 0.5)} />
        </PressableScale>
      </ScrollView>

      {showCompose && (
        <ComposeLetterModal
          isPremium={isPremium}
          onClose={() => setShowCompose(false)}
          onPaywall={() => setShowCompose(false)}
        />
      )}
      <SendMomentOverlay
        visible={onboardingPeak}
        name="onboarding-complete"
        message="Your story starts now 💛"
        onDismiss={() => setOnboardingPeak(false)}
      />
    </Shell>
  );
}
