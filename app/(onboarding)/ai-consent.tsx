import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LK, theme } from '@/constants/theme';
import { Btn } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';

export default function AiConsentScreen() {
  async function handleContinue() {
    await AsyncStorage.setItem('ai_consent_granted_at', new Date().toISOString());
    router.replace('/(onboarding)/start-date');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 30, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: LK.ivory, alignItems: 'center', justifyContent: 'center',
            ...theme.shadow.card,
          }}>
            <Icon name="shield" size={38} color={LK.ink} />
          </View>
        </View>

        <Text style={{
          fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 32,
          color: LK.ink, letterSpacing: -1, lineHeight: 38, marginBottom: 20, textAlign: 'center',
        }}>
          Your memories, your privacy.
        </Text>

        <View style={{
          backgroundColor: LK.ivory, borderRadius: theme.radii.lg,
          padding: 22, marginBottom: 24, ...theme.shadow.sm,
        }}>
          <Text style={{
            fontFamily: theme.fonts.serif, fontSize: 18, color: LK.ink,
            lineHeight: 28, fontStyle: 'italic',
          }}>
            "Locket is a private app for you and your partner. Your memories — photos, letters, milestones — stay on your device and in your private encrypted database. We do not use AI to analyse your content."
          </Text>
        </View>

        <View style={{ gap: 14, marginBottom: 32 }}>
          {[
            ['lock', 'No AI processing', 'Your content is never analysed by AI or machine learning models.'],
            ['image', 'Photos stay local', 'On This Day reads photos directly from your device. They are never uploaded.'],
            ['shield', 'Encrypted database', 'Your data is stored in a private Supabase database. Only you and your partner can access it.'],
          ].map(([icon, title, desc]) => (
            <View key={icon} style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
              <View style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: LK.creamDeep,
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon name={icon} size={20} color={LK.ink} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: LK.ink }}>
                  {title}
                </Text>
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 13.5, color: LK.ink70, marginTop: 3, lineHeight: 20 }}>
                  {desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Btn full onPress={handleContinue} kind="primary">
          <Text style={{ color: '#fff', fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 17 }}>
            I Understand & Continue
          </Text>
        </Btn>

        <Text style={{
          fontFamily: theme.fonts.body, fontSize: 12, color: LK.ink70,
          textAlign: 'center', marginTop: 14, lineHeight: 18,
        }}>
          If AI features are added in a future update, you will be shown a new consent screen before any AI processes your data.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
