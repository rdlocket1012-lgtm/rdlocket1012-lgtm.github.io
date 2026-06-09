import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Btn } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});
type FormData = z.infer<typeof schema>;

export default function SignInScreen() {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
    setLoading(false);
    if (error) { Alert.alert('Sign in failed', error.message); return; }
    // Mark onboarding as done so index.tsx routes correctly on next launch
    await AsyncStorage.setItem('ai_consent_granted_at', new Date().toISOString());
    await AsyncStorage.setItem('onboarding_done', 'true');
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, padding: 30, justifyContent: 'center' }}>
            <View style={{ marginBottom: 36 }}>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 46, color: LK.ink, letterSpacing: -1.5 }}>
                Locket
              </Text>
              <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 22, color: LK.ink70, marginTop: 8 }}>
                Welcome back.
              </Text>
            </View>

            <View style={{ gap: 16, marginBottom: 24 }}>
              <View>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={inputStyle}
                      placeholder="Email"
                      placeholderTextColor={LK.ink70}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.email && <Text style={errorStyle}>{errors.email.message}</Text>}
              </View>
              <View>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={inputStyle}
                      placeholder="Password"
                      placeholderTextColor={LK.ink70}
                      secureTextEntry
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.password && <Text style={errorStyle}>{errors.password.message}</Text>}
              </View>
            </View>

            <Btn full kind="primary" onPress={handleSubmit(onSubmit)} disabled={loading}>
              <Text style={{ color: '#fff', fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 17 }}>
                {loading ? 'Signing in…' : 'Sign in'}
              </Text>
            </Btn>

            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70 }}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')} style={{ marginTop: 12, alignItems: 'center' }}>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70 }}>
                No account?{' '}
                <Text style={{ fontWeight: '700', color: LK.ink }}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const inputStyle = {
  backgroundColor: LK.ivory, borderRadius: 16,
  padding: 16, fontFamily: theme.fonts.body, fontSize: 16, color: LK.ink,
  shadowColor: LK.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
};
const errorStyle = { fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.destructive, marginTop: 5 };
