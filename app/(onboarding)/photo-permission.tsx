import React from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LK, tint, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { Shell, PrimaryCta, QuietCta } from '@/components/onboarding/Shell';
import { success } from '@/lib/haptics';

function PreviewCard() {
  return (
    <View style={{ borderRadius: 24, overflow: 'hidden', height: 200, transform: [{ rotate: '-2deg' }], ...theme.shadow.card }}>
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
  async function done() {
    await AsyncStorage.multiSet([
      ['photo_permission_asked', 'true'],
      ['onboarding_done', 'true'],
    ]);
    router.replace('/(tabs)');
  }

  async function handleAllow() {
    await MediaLibrary.requestPermissionsAsync();
    success();
    await done();
  }

  return (
    <Shell
      step={6}
      total={6}
      title="One last thing — your photos"
      why="On This Day quietly resurfaces moments from this date in past years. Photos never leave your phone."
      footer={
        <>
          <PrimaryCta label="Allow photo access" onPress={handleAllow} />
          <QuietCta label="Maybe later" onPress={done} />
        </>
      }
    >
      <View style={{ marginTop: 34 }}>
        <PreviewCard />
        <Text style={{
          fontFamily: theme.fonts.body, fontSize: 12, color: LK.ink70,
          textAlign: 'center', marginTop: 22, lineHeight: 18,
        }}>
          Read locally, never uploaded. Privacy Policy lives in Settings.
        </Text>
      </View>
    </Shell>
  );
}
