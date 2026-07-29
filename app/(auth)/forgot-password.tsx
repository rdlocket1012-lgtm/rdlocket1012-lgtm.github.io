import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/feedback';
import { LK, theme } from '@/constants/theme';
import { Btn } from '@/components/ui/btn';
import { Icon } from '@/components/ui/Icon';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { AnimatedField } from '@/components/ui/AnimatedField';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: 'locket://reset-password',
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 30, justifyContent: 'center' }}>

          {/* Back */}
          <ScalePressable onPress={() => router.back()} scaleTo={0.9} haptic={false} accessibilityLabel="Back" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} containerStyle={{ marginBottom: 32, alignSelf: 'flex-start' }} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevron-left" size={24} color={LK.espresso} />
          </ScalePressable>

          <View style={{ marginBottom: 36 }}>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 36, color: LK.espresso, letterSpacing: -1 }}>
              Reset password
            </Text>
            <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 18, color: LK.ink70, marginTop: 8, lineHeight: 26 }}>
              {sent
                ? "Check your email — we've sent you a reset link."
                : "Enter your email and we'll send you a link."}
            </Text>
          </View>

          {!sent ? (
            <>
              <View style={{ marginBottom: 24 }}>
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
              </View>

              <Btn full kind="primary" onPress={handleSubmit(onSubmit)} disabled={loading}>
                <Text style={{ color: '#fff', fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 17 }}>
                  {loading ? 'Sending…' : 'Send reset link'}
                </Text>
              </Btn>
            </>
          ) : (
            <Btn full kind="outline" onPress={() => router.back()}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 17, color: LK.espresso }}>
                Back to sign in
              </Text>
            </Btn>
          )}

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
