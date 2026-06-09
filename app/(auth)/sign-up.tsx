import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from '@/lib/supabase';
import { LK, theme } from '@/constants/theme';
import { Btn } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';

const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[a-z]/, 'Add a lowercase letter')
  .regex(/[A-Z]/, 'Add an uppercase letter')
  .regex(/[0-9]/, 'Add a number')
  .regex(/[^A-Za-z0-9]/, 'Add a special character');

const schema = z.object({
  name: z.string().min(1, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  password: passwordSchema,
});
type FormData = z.infer<typeof schema>;

export default function SignUpScreen() {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { display_name: data.name } },
    });
    setLoading(false);
    if (error) { Alert.alert('Sign up failed', error.message); return; }
    await AsyncStorage.setItem('has_account', 'true');
    router.replace('/(onboarding)/ai-consent');
  }

  async function handleAppleSignIn() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
      });
      if (error) { Alert.alert('Apple sign-in failed', error.message); return; }
      const hasAccount = await AsyncStorage.getItem('has_account');
      await AsyncStorage.multiSet([['has_account', 'true'], ['ai_consent_granted_at', new Date().toISOString()]]);
      // Returning Apple user → tabs. New Apple user → onboarding.
      if (hasAccount) {
        await AsyncStorage.setItem('onboarding_done', 'true');
        router.replace('/(tabs)');
      } else {
        router.replace('/(onboarding)/ai-consent');
      }
    } catch (e: unknown) {
      if ((e as { code?: string }).code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple sign-in failed', 'Please try again.');
      }
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, padding: 30, justifyContent: 'center' }}>
            <View style={{ marginBottom: 32 }}>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 46, color: LK.ink, letterSpacing: -1.5 }}>
                Locket
              </Text>
              <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 24, lineHeight: 30, color: LK.ink, marginTop: 16, maxWidth: 280 }}>
                Your relationship's living memory.
              </Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 16, color: LK.ink70, marginTop: 12, lineHeight: 24, maxWidth: 270 }}>
                Every milestone, letter and place — kept together, just for the two of you.
              </Text>
            </View>

            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={9999}
              style={{ height: 54, marginBottom: 12 }}
              onPress={handleAppleSignIn}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: LK.line }} />
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70 }}>or continue with email</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: LK.line }} />
            </View>

            <View style={{ gap: 12, marginBottom: 20 }}>
              {(['name', 'email', 'password'] as const).map((field) => (
                <View key={field}>
                  <Controller
                    control={control}
                    name={field}
                    render={({ field: { onChange, value } }) => (
                      <>
                        <TextInput
                          style={inputStyle}
                          placeholder={field === 'name' ? 'Your name' : field === 'email' ? 'Email' : 'Password'}
                          placeholderTextColor={LK.ink70}
                          keyboardType={field === 'email' ? 'email-address' : 'default'}
                          autoCapitalize={field === 'name' ? 'words' : 'none'}
                          secureTextEntry={field === 'password'}
                          value={value}
                          onChangeText={onChange}
                        />
                        {field === 'password' && <PasswordHints value={value ?? ''} />}
                      </>
                    )}
                  />
                  {field !== 'password' && errors[field] && <Text style={errorStyle}>{errors[field]?.message}</Text>}
                </View>
              ))}
            </View>

            <Btn full kind="primary" onPress={handleSubmit(onSubmit)} disabled={loading}>
              <Text style={{ color: '#fff', fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 17 }}>
                {loading ? 'Creating account…' : 'Create account'}
              </Text>
            </Btn>

            <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.ink70, textAlign: 'center', marginTop: 14, lineHeight: 17 }}>
              Apple sign-in keeps your email private. Your memories stay yours.
            </Text>

            <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')} style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70 }}>
                Already have an account?{' '}
                <Text style={{ fontWeight: '700', color: LK.ink }}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const PASSWORD_RULES: { label: string; test: (v: string) => boolean }[] = [
  { label: '8+ characters', test: (v) => v.length >= 8 },
  { label: 'Lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'Uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'Number', test: (v) => /[0-9]/.test(v) },
  { label: 'Special character', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

function PasswordHints({ value }: { value: string }) {
  return (
    <View style={{ marginTop: 8, gap: 5, paddingHorizontal: 4 }}>
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(value);
        return (
          <View key={rule.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <View style={{ width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: met ? LK.mint : 'rgba(42,33,26,0.10)' }}>
              {met && <Icon name="check" size={10} color="#fff" />}
            </View>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: met ? LK.ink70 : LK.ink70 }}>
              {rule.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const inputStyle = {
  backgroundColor: LK.ivory, borderRadius: 16,
  padding: 16, fontFamily: theme.fonts.body, fontSize: 16, color: LK.ink,
  shadowColor: LK.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
};
const errorStyle = { fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.destructive, marginTop: 5 };
