import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
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
import { Canvas, BackOrb, PrimaryCta, T } from '@/components/onboarding/Shell';
import { PressableScale } from '@/components/onboarding/PressableScale';
import { AnimatedField } from '@/components/ui/AnimatedField';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});
type FormData = z.infer<typeof schema>;

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

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
      await AsyncStorage.multiSet([
        ['has_account', 'true'],
        ['ai_consent_granted_at', new Date().toISOString()],
      ]);
      router.replace((await routeAfterAuth(res.user?.id)) as never);
    } catch (e: unknown) {
      if ((e as { code?: string }).code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple sign-in failed', 'Please try again.');
      }
    }
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    const { data: res, error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
    setLoading(false);
    if (error) { Alert.alert('Sign in failed', error.message); return; }
    await AsyncStorage.multiSet([
      ['ai_consent_granted_at', new Date().toISOString()],
      ['has_account', 'true'],
    ]);
    // Couple-aware: existing couple → home, signed in but not set up → onboarding.
    router.replace((await routeAfterAuth(res.user?.id)) as never);
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

          <Animated.View entering={FadeInDown.delay(70).springify().damping(19).reduceMotion(ReduceMotion.System)} style={{ paddingTop: 30 }}>
            <Text style={T.title}>Welcome back</Text>
            <Text style={T.why}>Pick up right where you two left off.</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(170).springify().damping(19).reduceMotion(ReduceMotion.System)} style={{ marginTop: 30 }}>
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={9999}
              style={{ height: 56 }}
              onPress={handleAppleSignIn}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(240).springify().damping(19).reduceMotion(ReduceMotion.System)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 18 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: LK.hairline }} />
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70 }}>or email</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: LK.hairline }} />
            </View>

            <View style={{ gap: 12 }}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AnimatedField
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AnimatedField
                    placeholder="Password"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                  />
                )}
              />
              <PrimaryCta
                label={loading ? 'Signing in…' : 'Sign in'}
                busy={loading}
                onPress={handleSubmit(onSubmit)}
              />
            </View>
          </Animated.View>

          <View style={{ flex: 1 }} />

          <Animated.View entering={FadeInDown.delay(310).springify().damping(19).reduceMotion(ReduceMotion.System)}>
            <PressableScale haptic="soft" onPress={() => router.push('/(auth)/forgot-password')} style={{ alignItems: 'center', paddingVertical: 10 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70 }}>Forgot password?</Text>
            </PressableScale>
            <PressableScale haptic="soft" onPress={() => router.push('/(auth)/sign-up')} style={{ alignItems: 'center', paddingVertical: 10 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70 }}>
                No account?{' '}
                <Text style={{ fontWeight: '700', color: LK.espresso }}>Sign up</Text>
              </Text>
            </PressableScale>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Canvas>
  );
}
