import React, { useState } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Btn, StepDots, Sticker, IconChip } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/stores/auth.store';
import { useMilestonesStore } from '@/stores/milestones.store';

export default function FirstMilestoneScreen() {
  const [busy, setBusy] = useState(false);

  async function handleAdd() {
    if (busy) return;
    setBusy(true);
    try {
      const coupleId = useAuthStore.getState().profile?.couple_id;
      const startDate =
        (await AsyncStorage.getItem('onboarding_start_date')) ??
        new Date().toISOString().split('T')[0];
      if (coupleId) {
        await useMilestonesStore.getState().addMilestone({
          couple_id: coupleId,
          created_by: null,
          type: 'firstDate',
          title: 'The night we met',
          note: null,
          note_rich_html: null,
          milestone_date: startDate,
          deleted_at: null,
        });
      }
    } finally {
      setBusy(false);
      router.push('/(onboarding)/photo-permission');
    }
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
          fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 32,
          color: LK.ink, letterSpacing: -1, lineHeight: 38, maxWidth: 300, marginBottom: 12,
        }}>
          Where did you first meet?
        </Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70, marginBottom: 30 }}>
          We've started it for you — edit anytime.
        </Text>

        <Sticker color={LK.coral} tiltDeg={-1.5}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <IconChip color={LK.coral} size={54}><Icon name="heart" size={26} color={shade(LK.coral, 0.5)} /></IconChip>
            <View>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 21, color: LK.ink }}>The night we met</Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70, marginTop: 2 }}>First Date</Text>
            </View>
          </View>
          <View style={{
            marginTop: 16, padding: 13, borderRadius: 14,
            backgroundColor: 'rgba(255,255,255,0.6)',
          }}>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, color: LK.ink70, lineHeight: 21 }}>
              Add a note… a rainy Friday at Café Lune.
            </Text>
          </View>
        </Sticker>
      </View>

      <View style={{ padding: 22, paddingBottom: 36, gap: 16 }}>
        <Btn full kind="accent" onPress={handleAdd}>
          {busy
            ? <ActivityIndicator color={LK.ink} />
            : <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 17, color: LK.ink }}>
                Add this milestone
              </Text>}
        </Btn>
        <StepDots total={5} current={2} />
      </View>
    </SafeAreaView>
  );
}
