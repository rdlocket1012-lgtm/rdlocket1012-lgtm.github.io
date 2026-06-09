import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LK, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { RoundIcon } from '@/components/ui';
import { useLetters } from '@/hooks/useLetters';

export default function LetterReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { letters } = useLetters();

  const letter = letters.find((l) => l.id === id);
  if (!letter) return null;

  const bodyText = letter.body_rich_html.replace(/<[^>]+>/g, '');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF3E0' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 6 }}>
        <RoundIcon onPress={() => router.back()}>
          <Icon name="chevL" size={20} color={LK.ink} />
        </RoundIcon>
        <RoundIcon onPress={() => {}}>
          <Icon name="dots" size={20} color={LK.ink} />
        </RoundIcon>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 30, paddingVertical: 18, paddingBottom: 60 }}>
        {/* Sender header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 24 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: LK.coral, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 18, color: '#fff' }}>
              {letter.sender_id ? 'Y' : 'P'}
            </Text>
          </View>
          <View>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 15, color: LK.ink }}>
              From {letter.sender_id ? 'You' : 'Partner'}
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70 }}>
              {letter.sent_at ? new Date(letter.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
            </Text>
          </View>
        </View>

        {/* Letter body */}
        <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 20.5, color: '#3a2e22', lineHeight: 34 }}>
          {bodyText}
        </Text>

        {/* Privacy note */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 34 }}>
          <Icon name="lock" size={12} color={LK.ink70} />
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.ink70 }}>
            This letter is read-only and private to you both.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
