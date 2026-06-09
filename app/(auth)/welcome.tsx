import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LK, theme } from '@/constants/theme';
import { Btn } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream }}>
      <View style={{ flex: 1, padding: 30, justifyContent: 'space-between' }}>
        {/* Hero */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{
            width: 88, height: 88, borderRadius: 44,
            backgroundColor: LK.ivory, alignItems: 'center', justifyContent: 'center',
            marginBottom: 28, ...theme.shadow.card,
          }}>
            <Icon name="heart" size={42} color={LK.ink} />
          </View>

          <Text style={{
            fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 52,
            color: LK.ink, letterSpacing: -2, textAlign: 'center',
          }}>
            Locket
          </Text>

          <Text style={{
            fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 23, lineHeight: 30,
            color: LK.ink, marginTop: 16, textAlign: 'center', maxWidth: 290,
          }}>
            Your relationship's living memory.
          </Text>

          <Text style={{
            fontFamily: theme.fonts.body, fontSize: 16, color: LK.ink70,
            marginTop: 14, lineHeight: 24, textAlign: 'center', maxWidth: 280,
          }}>
            Every milestone, letter and place — kept together, just for the two of you.
          </Text>
        </View>

        {/* Actions */}
        <View>
          <Btn full kind="primary" onPress={() => router.replace('/(onboarding)/ai-consent')}>
            <Text style={{ color: '#fff', fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 17 }}>
              Get Started
            </Text>
          </Btn>

          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')} style={{ marginTop: 18, alignItems: 'center' }}>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70 }}>
              Already have an account?{' '}
              <Text style={{ fontWeight: '700', color: LK.ink }}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
