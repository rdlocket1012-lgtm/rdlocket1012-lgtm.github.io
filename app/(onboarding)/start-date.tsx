import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LK, tint, shade, rgba, theme } from '@/constants/theme';
import { Btn, StepDots, Sticker } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';
import { ensureCoupleSession } from '@/lib/bootstrap';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function StartDateScreen() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [day, setDay] = useState(today.getDate());
  const [year, setYear] = useState(today.getFullYear());

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() - i);

  const [busy, setBusy] = useState(false);

  async function handleContinue() {
    if (busy) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setBusy(true);
    try {
      await AsyncStorage.setItem('onboarding_start_date', dateStr);
      // Establish the authenticated session + couple now, so every later
      // step (milestones, letters, pins) can actually persist data.
      await ensureCoupleSession(dateStr);
      router.push('/(onboarding)/invite-partner');
    } catch (e: any) {
      Alert.alert(
        'Setup failed',
        `${e?.message ?? 'Unknown error'}\n\nIf this mentions anonymous sign-in, enable it in Supabase → Authentication → Providers → Anonymous.`
      );
    } finally {
      setBusy(false);
    }
  }

  function Picker({ values, selected, onSelect }: { values: (string | number)[]; selected: number; onSelect: (i: number) => void }) {
    const prev = (selected - 1 + values.length) % values.length;
    const next = (selected + 1) % values.length;
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <TouchableOpacity
          onPress={() => onSelect(prev)}
          hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
          style={{ width: 40, height: 32, borderRadius: 10, backgroundColor: 'rgba(42,33,26,0.06)', alignItems: 'center', justifyContent: 'center' }}
        >
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <Icon name="chevD" size={18} color={LK.ink70} />
          </View>
        </TouchableOpacity>
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 22, color: LK.ink, paddingVertical: 6 }}>{String(values[selected])}</Text>
        <TouchableOpacity
          onPress={() => onSelect(next)}
          hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
          style={{ width: 40, height: 32, borderRadius: 10, backgroundColor: 'rgba(42,33,26,0.06)', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="chevD" size={18} color={LK.ink70} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream }}>
      <View style={{ flex: 1, padding: 30, justifyContent: 'center' }}>
        <Text style={{
          fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 34,
          color: LK.ink, letterSpacing: -1, lineHeight: 40, maxWidth: 300, marginBottom: 14,
        }}>
          When did your story begin?
        </Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 15.5, color: LK.ink70, marginBottom: 34, lineHeight: 22 }}>
          This date anchors your day counter and your whole timeline.
        </Text>

        <Sticker color={LK.gold} tiltDeg={0}>
          <View style={{ flexDirection: 'row', height: 160 }}>
            <Picker values={MONTHS} selected={month} onSelect={setMonth} />
            <Picker values={days} selected={day - 1} onSelect={(i) => setDay(i + 1)} />
            <Picker values={years} selected={years.indexOf(year)} onSelect={(i) => setYear(years[i])} />
          </View>
        </Sticker>
      </View>

      <View style={{ padding: 22, paddingBottom: 36, gap: 16 }}>
        <Btn full kind="accent" onPress={handleContinue}>
          {busy
            ? <ActivityIndicator color={LK.ink} />
            : <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 17, color: LK.ink }}>Continue</Text>}
        </Btn>
        <StepDots total={5} current={0} />
      </View>
    </SafeAreaView>
  );
}
