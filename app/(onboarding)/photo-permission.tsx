import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Btn, StepDots } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';

function PreviewCard() {
  return (
    <View style={{ borderRadius: 24, overflow: 'hidden', height: 200, transform: [{ rotate: '-2deg' }] }}>
      <View style={{ flex: 1, backgroundColor: tint(LK.sky, 0.35) }}>
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(20,15,10,0.55)' }} />
        <View style={{ position: 'absolute', bottom: 16, left: 18 }}>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.9)' }}>1 YEAR AGO TODAY</Text>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 24, color: '#fff' }}>Sunset at Oia</Text>
        </View>
        <View style={{ position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Icon name="image" size={14} color="rgba(255,255,255,0.85)" />
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.85)' }}>Santorini</Text>
        </View>
      </View>
    </View>
  );
}

export default function PhotoPermissionScreen() {
  async function handleAllow() {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    await AsyncStorage.setItem('photo_permission_asked', 'true');
    await AsyncStorage.setItem('onboarding_done', 'true');
    router.replace('/(tabs)');
  }

  async function handleSkip() {
    await AsyncStorage.setItem('photo_permission_asked', 'true');
    await AsyncStorage.setItem('onboarding_done', 'true');
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream }}>
      <TouchableOpacity
        onPress={() => router.back()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={{ position: 'absolute', top: 56, left: 22, zIndex: 10, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(42,33,26,0.06)', alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon name="chevL" size={22} color={LK.ink} />
      </TouchableOpacity>
      <View style={{ flex: 1, padding: 30, justifyContent: 'center' }}>
        <Text style={{
          fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 31,
          color: LK.ink, letterSpacing: -1, lineHeight: 36, marginBottom: 12,
        }}>
          Bring your photos to life
        </Text>
        <Text style={{
          fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70,
          lineHeight: 24, maxWidth: 295, marginBottom: 28,
        }}>
          Locket can surface your existing photos in{' '}
          <Text style={{ fontWeight: '700', color: LK.ink }}>On This Day</Text>
          . Your photos never leave your device.
        </Text>
        <PreviewCard />
        <Text style={{
          fontFamily: theme.fonts.body, fontSize: 12, color: LK.ink70,
          textAlign: 'center', marginTop: 20, lineHeight: 18,
        }}>
          Photos are read locally and never uploaded. Read our Privacy Policy in Settings.
        </Text>
      </View>

      <View style={{ padding: 22, paddingBottom: 36, gap: 12 }}>
        <Btn full kind="primary" onPress={handleAllow}>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 17, color: '#fff' }}>Allow photo access</Text>
        </Btn>
        <Btn full kind="ghost" onPress={handleSkip}>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: LK.ink70 }}>Not now</Text>
        </Btn>
        <StepDots total={5} current={4} />
      </View>
    </SafeAreaView>
  );
}
