import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { LK, theme } from '@/constants/theme';
import { Btn } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';

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
    if (error) { Alert.alert('Error', error.message); return; }
    setSent(true);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 30, justifyContent: 'center' }}>

          {/* Back */}
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32, alignSelf: 'flex-start', padding: 4 }}>
            <Icon name="chevron-left" size={24} color={LK.ink} />
          </TouchableOpacity>

          <View style={{ marginBottom: 36 }}>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 36, color: LK.ink, letterSpacing: -1 }}>
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
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={inputStyle}
                      placeholder="Email"
                      placeholderTextColor={LK.ink70}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.email && <Text style={errorStyle}>{errors.email.message}</Text>}
              </View>

              <Btn full kind="primary" onPress={handleSubmit(onSubmit)} disabled={loading}>
                <Text style={{ color: '#fff', fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 17 }}>
                  {loading ? 'Sending…' : 'Send reset link'}
                </Text>
              </Btn>
            </>
          ) : (
            <Btn full kind="outline" onPress={() => router.back()}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 17, color: LK.ink }}>
                Back to sign in
              </Text>
            </Btn>
          )}

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
