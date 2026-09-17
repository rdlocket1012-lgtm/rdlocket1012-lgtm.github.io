import React, { useState } from 'react';
import { TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LK, theme } from '@/constants/theme';
import { Shell, PrimaryCta } from '@/components/onboarding/Shell';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

export default function NameScreen() {
  const { joiner } = useLocalSearchParams<{ joiner?: string }>();
  const isJoiner = joiner === '1';
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const prefill =
    profile?.display_name ||
    ((user?.user_metadata as Record<string, unknown> | undefined)?.display_name as string | undefined) ||
    '';
  const [name, setName] = useState(prefill);
  const [busy, setBusy] = useState(false);

  async function next() {
    const trimmed = name.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await AsyncStorage.setItem('display_name', trimmed);
      // Best-effort persistence — neither failure should block the flow.
      supabase.auth.updateUser({ data: { display_name: trimmed } }).then(() => {}, () => {});
      const pid = profile?.id ?? user?.id;
      if (pid) {
        try { await supabase.from('profiles').update({ display_name: trimmed }).eq('id', pid); } catch { /* best-effort */ }
      }
    } finally {
      setBusy(false);
    }
    router.push(isJoiner ? '/(onboarding)/photo?joiner=1' : '/(onboarding)/connect');
  }

  return (
    <Shell
      step={1}
      total={isJoiner ? 3 : 7}
      title="What should we call you?"
      why="petnames welcome — this stays between you two."
      showBack={false}
      keyboardAvoid
      footer={<PrimaryCta label="Continue" onPress={next} busy={busy} disabled={!name.trim()} />}
    >
      <TextInput
        value={name}
        onChangeText={setName}
        autoFocus
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={next}
        placeholder="Your name"
        placeholderTextColor={LK.ink45}
        style={{
          marginTop: 34, backgroundColor: LK.ivory, borderRadius: 20,
          paddingHorizontal: 22, paddingVertical: 20,
          fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 26,
          color: LK.espresso, ...theme.shadow.sm,
        }}
      />
    </Shell>
  );
}
