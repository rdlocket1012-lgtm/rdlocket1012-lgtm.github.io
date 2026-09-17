import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { LK, theme } from '@/constants/theme';
import { Canvas, BackOrb, PrimaryCta, T } from '@/components/onboarding/Shell';

/**
 * Person B's manual entry point — for when they got a spoken/texted code
 * instead of tapping the invite link. Submitting routes into the same
 * /invite?token= join flow the deep link uses.
 */
export default function RedeemCodeScreen() {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const clean = code.trim().toUpperCase().replace(/\s+/g, '');
  const valid = clean.length >= 6;

  function submit() {
    if (!valid) return;
    router.replace(`/invite?token=${encodeURIComponent(clean)}`);
  }

  return (
    <Canvas>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{
          flex: 1, paddingTop: insets.top + 10, paddingBottom: Math.max(insets.bottom, 18),
          paddingHorizontal: theme.layout.screenX,
        }}>
          <BackOrb />

          <Animated.View entering={FadeInDown.delay(70).springify().damping(19).reduceMotion(ReduceMotion.System)} style={{ paddingTop: 30 }}>
            <Text style={T.title}>Join your person</Text>
            <Text style={T.why}>Enter the code from their invite — or just tap the link they sent.</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).springify().damping(19).reduceMotion(ReduceMotion.System)} style={{ marginTop: 34 }}>
            <TextInput
              value={code}
              onChangeText={setCode}
              autoFocus
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="XUMMKA"
              placeholderTextColor={LK.ink45}
              onSubmitEditing={submit}
              returnKeyType="go"
              style={{
                backgroundColor: LK.ivory, borderRadius: 20, height: 78,
                fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 30,
                letterSpacing: 9, textAlign: 'center', color: LK.espresso,
                ...theme.shadow.sm,
              }}
            />
            <Text style={{
              fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70,
              textAlign: 'center', marginTop: 12,
            }}>
              Codes are single-use and expire after 48 hours.
            </Text>
          </Animated.View>

          <View style={{ flex: 1 }} />

          <Animated.View entering={FadeInDown.delay(260).springify().damping(19).reduceMotion(ReduceMotion.System)}>
            <PrimaryCta label="Join" onPress={submit} disabled={!valid} />
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Canvas>
  );
}
