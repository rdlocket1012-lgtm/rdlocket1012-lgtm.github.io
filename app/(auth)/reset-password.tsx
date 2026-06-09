import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { LK, theme } from '@/constants/theme';
import { Btn } from '@/components/ui';

const schema = z.object({
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[a-z]/, 'Needs a lowercase letter')
    .regex(/[A-Z]/, 'Needs an uppercase letter')
    .regex(/[0-9]/, 'Needs a number'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ['confirm'],
});
type FormData = z.infer<typeof schema>;

export default function ResetPasswordScreen() {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: data.password });
    setLoading(false);
    if (error) { Alert.alert('Error', error.message); return; }

    // Mark onboarding so routing works correctly
    await AsyncStorage.setItem('ai_consent_granted_at', new Date().toISOString());
    await AsyncStorage.setItem('onboarding_done', 'true');

    Alert.alert('Password updated', 'You can now sign in with your new password.', [
      { text: 'Continue', onPress: () => router.replace('/(tabs)') },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 30, justifyContent: 'center' }}>

          <View style={{ marginBottom: 36 }}>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 36, color: LK.ink, letterSpacing: -1 }}>
              New password
            </Text>
            <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 18, color: LK.ink70, marginTop: 8 }}>
              Choose something memorable.
            </Text>
          </View>

          <View style={{ gap: 16, marginBottom: 28 }}>
            <View>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={inputStyle}
                    placeholder="New password"
                    placeholderTextColor={LK.ink70}
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.password && <Text style={errorStyle}>{errors.password.message}</Text>}
            </View>
            <View>
              <Controller
                control={control}
                name="confirm"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={inputStyle}
                    placeholder="Confirm password"
                    placeholderTextColor={LK.ink70}
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.confirm && <Text style={errorStyle}>{errors.confirm.message}</Text>}
            </View>
          </View>

          <Btn full kind="primary" onPress={handleSubmit(onSubmit)} disabled={loading}>
            <Text style={{ color: '#fff', fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 17 }}>
              {loading ? 'Updating…' : 'Update password'}
            </Text>
          </Btn>

        </View>
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
