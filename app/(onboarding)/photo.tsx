import React, { useState } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LK, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { Shell, PrimaryCta, QuietCta } from '@/components/onboarding/Shell';
import { PressableScale } from '@/components/onboarding/PressableScale';
import { pickAndUploadAvatar } from '@/lib/avatar';
import { useAuthStore } from '@/stores/auth.store';
import { success } from '@/lib/haptics';
import { toast } from '@/lib/feedback';

export default function PhotoScreen() {
  const { joiner } = useLocalSearchParams<{ joiner?: string }>();
  const isJoiner = joiner === '1';
  const profile = useAuthStore((s) => s.profile);
  const [url, setUrl] = useState<string | null>(profile?.avatar_url ?? null);
  const [busy, setBusy] = useState(false);

  const initial = ((profile?.display_name ?? 'Y').trim().charAt(0) || 'Y').toUpperCase();

  async function pick() {
    if (busy) return;
    const pid = profile?.id;
    if (!pid) { finish(); return; }
    setBusy(true);
    try {
      const uploaded = await pickAndUploadAvatar(pid);
      if (uploaded) {
        setUrl(uploaded);
        success();
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Couldn’t upload that photo.');
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    // Both paths now pass through notification priming (§E3) — the joiner's flow
    // ends there, which is why it no longer closes onboarding out here.
    router.push(isJoiner ? '/(onboarding)/notification-permission?joiner=1' : '/(onboarding)/invite-partner');
  }

  return (
    <Shell
      step={isJoiner ? 2 : 4}
      total={isJoiner ? 3 : 7}
      title="Put a face to the name"
      why="so your person sees you — not a grey circle — the moment they open your space."
      footer={
        <>
          {url
            ? <PrimaryCta label="Continue" onPress={finish} />
            : <PrimaryCta label="Add a photo" onPress={pick} busy={busy} />}
          <QuietCta label="Maybe later" onPress={finish} />
        </>
      }
    >
      <View style={{ alignItems: 'center', marginTop: 44 }}>
        <PressableScale onPress={pick} haptic="soft" scaleTo={0.95} accessibilityLabel="Choose a profile photo">
          <View>
            {url ? (
              <Image source={{ uri: url }} style={{ width: 148, height: 148, borderRadius: 74 }} />
            ) : (
              <View style={{
                width: 148, height: 148, borderRadius: 74, backgroundColor: LK.coral,
                alignItems: 'center', justifyContent: 'center', ...theme.shadow.card,
              }}>
                <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 58, color: '#fff' }}>
                  {initial}
                </Text>
              </View>
            )}
            <View style={{
              position: 'absolute', right: 2, bottom: 2, width: 42, height: 42, borderRadius: 21,
              backgroundColor: LK.espresso, alignItems: 'center', justifyContent: 'center',
              borderWidth: 3, borderColor: LK.parchment,
            }}>
              {busy ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="camera" size={19} color="#fff" />}
            </View>
          </View>
        </PressableScale>
        <Text style={{
          fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70, marginTop: 16,
        }}>
          Tap to choose a photo
        </Text>
      </View>
    </Shell>
  );
}
