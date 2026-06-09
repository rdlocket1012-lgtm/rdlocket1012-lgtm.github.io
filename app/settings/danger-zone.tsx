import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import { LK, tint, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { RoundIcon } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

type Step = 'confirm' | 'type' | 'done';

export default function DangerZoneScreen() {
  const { signOut } = useAuth();
  const [step, setStep] = useState<Step>('confirm');
  const [typed, setTyped] = useState('');

  async function handleFinalDelete() {
    // In production: call Edge Function to schedule deletion after 30 days
    await signOut();
    router.replace('/(auth)/sign-up');
  }

  if (step === 'done') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: tint(LK.destructive, 0.8), alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
          <Icon name="check" size={34} color={LK.destructive} />
        </View>
        <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 28, color: LK.ink, textAlign: 'center', letterSpacing: -0.5 }}>
          Account scheduled for deletion
        </Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70, marginTop: 12, lineHeight: 22, textAlign: 'center', maxWidth: 280 }}>
          Your account will be permanently deleted in 30 days. Sign back in to cancel at any time.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8 }}>
        <RoundIcon onPress={() => router.back()}>
          <Icon name="chevL" size={20} color={LK.ink} />
        </RoundIcon>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 26, paddingTop: 20 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: tint(LK.destructive, 0.15), alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Icon name="trash" size={30} color={LK.destructive} />
        </View>

        {step === 'confirm' && (
          <>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 28, color: LK.ink, letterSpacing: -0.5, lineHeight: 32 }}>
              Delete your account?
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70, marginTop: 12, lineHeight: 22 }}>
              This will schedule your account for permanent deletion in 30 days. You can cancel at any time by signing back in.
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70, marginTop: 12, lineHeight: 22 }}>
              Your partner's account will remain unaffected.
            </Text>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={() => setStep('type')}
              style={{ backgroundColor: LK.destructive, borderRadius: 9999, padding: 16, alignItems: 'center', marginBottom: 12 }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: '#fff' }}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ backgroundColor: 'rgba(42,33,26,0.08)', borderRadius: 9999, padding: 16, alignItems: 'center', marginBottom: 20 }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: LK.ink }}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'type' && (
          <>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 28, color: LK.ink, letterSpacing: -0.5, lineHeight: 32 }}>
              Type DELETE to confirm
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70, marginTop: 12, lineHeight: 22, marginBottom: 24 }}>
              This action cannot be undone within the 30-day grace period.
            </Text>
            <TextInput
              autoFocus
              value={typed}
              onChangeText={setTyped}
              placeholder="DELETE"
              placeholderTextColor={LK.ink70}
              autoCapitalize="characters"
              style={{ backgroundColor: LK.ivory, borderRadius: 16, padding: 14, fontFamily: theme.fonts.body, fontSize: 20, color: LK.ink, textAlign: 'center', letterSpacing: 4, ...theme.shadow.sm }}
            />
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={handleFinalDelete}
              disabled={typed !== 'DELETE'}
              style={{ backgroundColor: typed === 'DELETE' ? LK.destructive : 'rgba(42,33,26,0.15)', borderRadius: 9999, padding: 16, alignItems: 'center', marginBottom: 12 }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: typed === 'DELETE' ? '#fff' : LK.ink70 }}>
                Delete my account
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setStep('confirm'); setTyped(''); }}
              style={{ backgroundColor: 'rgba(42,33,26,0.08)', borderRadius: 9999, padding: 16, alignItems: 'center', marginBottom: 20 }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: LK.ink }}>Go back</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
