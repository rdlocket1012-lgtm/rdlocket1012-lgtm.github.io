import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { alert, toast } from '@/lib/feedback';
import { LK, theme } from '@/constants/theme';
import { Btn } from '@/components/ui/btn';
import { AnimatedField } from '@/components/ui/AnimatedField';

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
    if (error) { toast.error(error.message); return; }

    // Mark onboarding so routing works correctly
    await AsyncStorage.setItem('ai_consent_granted_at', new Date().toISOString());
    await AsyncStorage.setItem('onboarding_done', 'true');

    await alert('Password updated', 'You can now sign in with your new password.', 'Continue');
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 30, justifyContent: 'center' }}>

          <View style={{ marginBottom: 36 }}>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 36, color: LK.espresso, letterSpacing: -1 }}>
              New password
            </Text>
            <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 18, color: LK.ink70, marginTop: 8 }}>
              Choose something memorable.
            </Text>
          </View>

          <View style={{ gap: 16, marginBottom: 28 }}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <AnimatedField
                  placeholder="New password"
                  secureTextEntry
                  autoComplete="password-new"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="confirm"
              render={({ field: { onChange, onBlur, value } }) => (
                <AnimatedField
                  placeholder="Confirm password"
                  secureTextEntry
                  autoComplete="password-new"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirm?.message}
                />
              )}
            />
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
