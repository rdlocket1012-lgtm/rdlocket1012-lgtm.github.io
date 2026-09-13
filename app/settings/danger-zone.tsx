import React, { useState } from 'react';
import { View, Text, TextInput, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { LK, tint, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { RoundIcon } from '@/components/ui/round-icon';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/feedback';

type Step = 'confirm' | 'type' | 'done';

export default function DangerZoneScreen() {
  const { signOut } = useAuth();
  const [step, setStep] = useState<Step>('confirm');
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleFinalDelete() {
    if (busy) return;
    setBusy(true);
    // The Edge Function derives the account from the caller's JWT — there is no
    // body. It returns only after the auth user is gone, so reaching 'done'
    // means the deletion actually happened.
    const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
    if (error) {
      setBusy(false);
      toast.error('Couldn’t delete your account — please try again.');
      return;
    }
    setStep('done');
    // The account no longer exists, so the session is already dead; this just
    // clears local state before we bounce out.
    await signOut();
    setTimeout(() => router.replace('/(auth)/sign-up'), 2600);
  }

  if (step === 'done') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: tint(LK.danger, 0.8), alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
          <Icon name="check" size={34} color={LK.danger} />
        </View>
        <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 28, color: LK.espresso, textAlign: 'center', letterSpacing: -0.5 }}>
          Your account is deleted
        </Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70, marginTop: 12, lineHeight: 22, textAlign: 'center', maxWidth: 280 }}>
          Your profile and private notes are gone for good. Thank you for the time you spent here.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8 }}>
        <RoundIcon onPress={() => router.back()}>
          <Icon name="chevL" size={20} color={LK.espresso} />
        </RoundIcon>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 26, paddingTop: 20 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: tint(LK.danger, 0.15), alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Icon name="trash" size={30} color={LK.danger} />
        </View>

        {step === 'confirm' && (
          <>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 28, color: LK.espresso, letterSpacing: -0.5, lineHeight: 32 }}>
              Delete your account?
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70, marginTop: 12, lineHeight: 22 }}>
              This deletes your account immediately and permanently. It can't be undone.
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70, marginTop: 12, lineHeight: 22 }}>
              Your profile, your private notes and your photo go for good. Your partner keeps the letters, milestones and pins you made together — they just won't have your name on them any more.
            </Text>
            <View style={{ flex: 1 }} />
            <ScalePressable
              scaleTo={0.97}
              onPress={() => setStep('type')}
              accessibilityLabel="Continue"
              style={{ backgroundColor: LK.danger, borderRadius: 9999, padding: 16, alignItems: 'center', marginBottom: 12 }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: '#fff' }}>Continue</Text>
            </ScalePressable>
            <ScalePressable
              scaleTo={0.97}
              onPress={() => router.back()}
              accessibilityLabel="Cancel"
              style={{ backgroundColor: 'rgba(42,33,26,0.08)', borderRadius: 9999, padding: 16, alignItems: 'center', marginBottom: 20 }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: LK.espresso }}>Cancel</Text>
            </ScalePressable>
          </>
        )}

        {step === 'type' && (
          <>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 28, color: LK.espresso, letterSpacing: -0.5, lineHeight: 32 }}>
              Type DELETE to confirm
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70, marginTop: 12, lineHeight: 22, marginBottom: 24 }}>
              There is no grace period and no way back.
            </Text>
            <TextInput
              autoFocus
              value={typed}
              onChangeText={setTyped}
              placeholder="DELETE"
              placeholderTextColor={LK.ink70}
              autoCapitalize="characters"
              style={{ backgroundColor: LK.ivory, borderRadius: 16, padding: 14, fontFamily: theme.fonts.body, fontSize: 20, color: LK.espresso, textAlign: 'center', letterSpacing: 4, ...theme.shadow.sm }}
            />
            <View style={{ flex: 1 }} />
            <ScalePressable
              scaleTo={0.97}
              onPress={handleFinalDelete}
              disabled={typed !== 'DELETE' || busy}
              accessibilityLabel="Delete my account"
              style={{ backgroundColor: typed === 'DELETE' && !busy ? LK.danger : 'rgba(42,33,26,0.15)', borderRadius: 9999, padding: 16, alignItems: 'center', marginBottom: 12 }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: typed === 'DELETE' && !busy ? '#fff' : LK.ink70 }}>
                {busy ? 'Deleting…' : 'Delete my account'}
              </Text>
            </ScalePressable>
            <ScalePressable
              scaleTo={0.97}
              onPress={() => { setStep('confirm'); setTyped(''); }}
              accessibilityLabel="Go back"
              style={{ backgroundColor: 'rgba(42,33,26,0.08)', borderRadius: 9999, padding: 16, alignItems: 'center', marginBottom: 20 }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: LK.espresso }}>Go back</Text>
            </ScalePressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
