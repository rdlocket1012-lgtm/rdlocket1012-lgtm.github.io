import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import * as AppleAuthentication from 'expo-apple-authentication';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';
import { routeAfterAuth } from '@/lib/post-auth';
import { LK, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { Canvas, BackOrb, PrimaryCta, T } from '@/components/onboarding/Shell';
import { PressableScale } from '@/components/onboarding/PressableScale';

const schema = z.object({
  name: z.string().min(1, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});
type FormData = z.infer<typeof schema>;

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    const { data: res, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      // Deep-link the confirmation back into the app (same mechanism as the
      // password-reset link), so tapping it opens onboarding instead of the
      // dashboard Site URL (which 404s). Must be allow-listed in Supabase →
      // Authentication → URL Configuration → Redirect URLs.
      options: { data: { display_name: data.name }, emailRedirectTo: 'locket://confirm-email' },
    });
    setLoading(false);
    if (error) { Alert.alert('Sign up failed', error.message); return; }
    await AsyncStorage.multiSet([
      ['has_account', 'true'],
      ['display_name', data.name.trim()],
      ['ai_consent_granted_at', new Date().toISOString()],
    ]);
    // With PKCE, email sign-up returns no session until the address is
    // confirmed — don't walk them into onboarding without a real account.
    if (!res.session) {
      Alert.alert(
        'Confirm your email',
        "We just sent a confirmation link to your inbox. Tap it, then come back and sign in — we'll set up your Locket from there.",
        [{ text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }],
      );
      return;
    }
    router.replace((await routeAfterAuth(res.user?.id)) as never);
  }

  async function handleAppleSignIn() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const { data: res, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
      });
      if (error) { Alert.alert('Apple sign-in failed', error.message); return; }
      await AsyncStorage.multiSet([['has_account', 'true'], ['ai_consent_granted_at', new Date().toISOString()]]);
      // Couple-aware: returning Apple user → home, brand-new → onboarding,
      // pending invite → resume the join.
      router.replace((await routeAfterAuth(res.user?.id)) as never);
    } catch (e: unknown) {
      if ((e as { code?: string }).code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple sign-in failed', 'Please try again.');
      }
    }
  }

  return (
    <Canvas>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1, paddingTop: insets.top + 10, paddingBottom: Math.max(insets.bottom, 18),
            paddingHorizontal: theme.layout.screenX,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <BackOrb />

          <Animated.View entering={FadeInDown.delay(70).springify().damping(19).reduceMotion(ReduceMotion.Never)} style={{ paddingTop: 30 }}>
            <Text style={T.title}>Create your Locket</Text>
            <Text style={T.why}>One account. One private space for the two of you.</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(170).springify().damping(19).reduceMotion(ReduceMotion.Never)} style={{ marginTop: 30 }}>
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={9999}
              style={{ height: 56 }}
              onPress={handleAppleSignIn}
            />
            <Text style={{
              fontFamily: theme.fonts.body, fontSize: 12, color: LK.ink70,
              textAlign: 'center', marginTop: 12, lineHeight: 18,
            }}>
              Private to the two of you — encrypted, never analysed by AI.{'\n'}
              Apple sign-in keeps even your email yours.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(250).springify().damping(19).reduceMotion(ReduceMotion.Never)} style={{ marginTop: 18 }}>
            {!emailOpen ? (
              <PressableScale haptic="soft" onPress={() => setEmailOpen(true)} style={{ alignItems: 'center', paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: LK.ink70 }}>
                  Use email instead
                </Text>
                <Icon name="chevD" size={15} color={LK.ink70} />
              </PressableScale>
            ) : (
              <Animated.View entering={FadeInDown.springify().damping(19).reduceMotion(ReduceMotion.Never)} style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 2 }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: LK.hairline }} />
                  <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70 }}>with email</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: LK.hairline }} />
                </View>
                {(['name', 'email', 'password'] as const).map((field) => (
                  <View key={field}>
                    <Controller
                      control={control}
                      name={field}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={inputStyle}
                          placeholder={field === 'name' ? 'Your name' : field === 'email' ? 'Email' : 'Password (8+ characters)'}
                          placeholderTextColor={LK.ink70}
                          keyboardType={field === 'email' ? 'email-address' : 'default'}
                          autoCapitalize={field === 'name' ? 'words' : 'none'}
                          secureTextEntry={field === 'password'}
                          value={value}
                          onChangeText={onChange}
                        />
                      )}
                    />
                    {errors[field] && <Text style={errorStyle}>{errors[field]?.message}</Text>}
                  </View>
                ))}
                <PrimaryCta
                  label={loading ? 'Creating account…' : 'Create account'}
                  busy={loading}
                  onPress={handleSubmit(onSubmit)}
                />
              </Animated.View>
            )}
          </Animated.View>

          <View style={{ flex: 1 }} />

          <Animated.View entering={FadeInDown.delay(330).springify().damping(19).reduceMotion(ReduceMotion.Never)}>
            <PressableScale haptic="soft" onPress={() => router.push('/(auth)/sign-in')} style={{ alignItems: 'center', paddingVertical: 12 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70 }}>
                Already have an account?{' '}
                <Text style={{ fontWeight: '700', color: LK.espresso }}>Sign in</Text>
              </Text>
            </PressableScale>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Canvas>
  );
}

const inputStyle = {
  backgroundColor: LK.ivory, borderRadius: 16,
  padding: 16, fontFamily: theme.fonts.body, fontSize: 16, color: LK.espresso,
  shadowColor: LK.espresso, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
} as const;
const errorStyle = { fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.danger, marginTop: 5 } as const;
