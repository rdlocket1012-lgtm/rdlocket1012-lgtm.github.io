import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { router } from 'expo-router';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { RoundIcon } from '@/components/ui';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useDetails } from '@/hooks/useDetails';
import { DETAIL_DEFS } from '@/constants/categories';
import type { Detail, Person } from '@/stores/details.store';

export default function AboutUsScreen() {
  const { profile } = useAuth();
  const { couple } = useCouple();
  const { details } = useDetails();

  const myInitial = ((profile?.display_name || 'Y').charAt(0) || 'Y').toUpperCase();
  const partnerName = details.find((d) => d.person === 'partner' && d.key === 'name')?.value || 'Partner';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream }}>
      <ScreenHeader eyebrow="Your details" title="About Us" onBack={() => router.back()} />

      <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5, color: LK.ink70, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 8, lineHeight: 22 }}>
        The details you never want to forget — for birthdays, gifts and little surprises.
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 60 }}>
        <ProfileCard
          initial={myInitial}
          avatarUrl={profile?.avatar_url ?? null}
          color={LK.coral}
          name={profile?.display_name ?? 'You'}
          subtitle="Your profile"
          details={details.filter((d) => d.person === 'me')}
          onPress={() => router.push('/profile/edit?person=me')}
        />

        <ProfileCard
          initial={partnerName.charAt(0).toUpperCase()}
          avatarUrl={null}
          color={LK.sky}
          name={partnerName}
          subtitle={couple ? 'Tap to edit or ask questions' : 'Not yet joined'}
          details={details.filter((d) => d.person === 'partner' && d.key !== 'name')}
          onPress={() => router.push('/profile/edit?person=partner')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileCard({ initial, avatarUrl, color, name, subtitle, details, onPress }: {
  initial: string;
  avatarUrl: string | null;
  color: string;
  name: string;
  subtitle: string;
  details: Detail[];
  onPress: () => void;
}) {
  // Build display rows: known defs first (with their value), then any custom keys.
  const rows = DETAIL_DEFS.map((def) => {
    const d = details.find((x) => x.key === def.key);
    return { key: def.key, icon: def.icon, label: def.label, value: d?.value ?? null, isQuestion: d?.is_question ?? false };
  });
  const customRows = details
    .filter((d) => !DETAIL_DEFS.some((def) => def.key === d.key))
    .map((d) => ({ key: d.key, icon: 'help', label: d.label, value: d.value, isQuestion: d.is_question }));
  const allRows = [...rows, ...customRows];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.lg, padding: 18, marginBottom: 14, ...theme.shadow.card }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={{ width: 52, height: 52, borderRadius: 26 }} />
        ) : (
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 22, color: '#fff' }}>{initial}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 20, color: LK.ink }}>{name}</Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70, marginTop: 2 }}>{subtitle}</Text>
        </View>
        <View style={{ backgroundColor: tint(color, 0.7), borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 5 }}>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11, color: shade(color, 0.5) }}>Edit</Text>
        </View>
      </View>

      <View style={{ gap: 10 }}>
        {allRows.slice(0, 6).map((row) => (
          <View key={row.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name={row.icon} size={16} color={LK.ink70} />
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 13.5, color: LK.ink70, flex: 1 }}>{row.label}</Text>
            <Text
              numberOfLines={1}
              style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 13.5, color: row.value ? LK.ink : (row.isQuestion ? shade(LK.gold, 0.5) : LK.ink70), maxWidth: 150 }}
            >
              {row.value ? row.value : (row.isQuestion ? 'Asked…' : '—')}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}
