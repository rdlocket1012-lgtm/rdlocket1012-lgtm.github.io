import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LK, shade, theme } from '@/constants/theme';
import { useCouple } from '@/hooks/useCouple';
import { useAuth } from '@/hooks/useAuth';
import { usePartner } from '@/hooks/usePartner';
import { useUnseenStore } from '@/stores/unseen.store';
import { Avatar } from '@/components/ui/avatar';
import { RoundIcon } from '@/components/ui/round-icon';
import { Icon } from '@/components/ui/Icon';
import { pickAndUploadCoverPhoto } from '@/lib/cover-photo';

const COVER_FALLBACK = require('../../assets/illustrations/mascot/holding-hands.png');
const BORDER = 'rgba(42,33,26,0.15)';

type Feature = { key: string; title: string; icon: string; color: string; route: string; badge?: boolean };

export default function UsScreen() {
  const { couple } = useCouple();
  const { profile } = useAuth();
  const { partner } = usePartner();
  const counts = useUnseenStore((s) => s.counts);
  const { width } = useWindowDimensions();
  const [uploading, setUploading] = useState(false);

  const myInitial = ((profile?.display_name || 'Y').charAt(0) || 'Y').toUpperCase();
  const partnerInitial = ((partner?.display_name || 'P').charAt(0) || 'P').toUpperCase();
  const coverUrl = couple?.cover_photo_url ?? null;

  const cardW = (width - theme.layout.screenX * 2 - 12) / 2;

  const features: Feature[] = [
    { key: 'letters', title: 'Letters', icon: 'envelope', color: LK.gold, route: '/letters', badge: counts.letters > 0 },
    { key: 'coupons', title: 'Coupons', icon: 'gift', color: LK.marigold, route: '/coupons', badge: counts.coupons > 0 },
    { key: 'map', title: 'Map', icon: 'mapPin', color: LK.sage, route: '/map' },
    { key: 'calendar', title: 'Calendar', icon: 'calendar', color: LK.sky, route: '/calendar' },
    { key: 'notes', title: 'Notes', icon: 'lock', color: LK.blush, route: '/notes' },
    { key: 'about', title: 'About Us', icon: 'user', color: LK.coral, route: '/profile/about' },
  ];

  async function changeCover() {
    if (!couple?.id || uploading) return;
    try {
      setUploading(true);
      await pickAndUploadCoverPhoto(couple.id);
    } catch {
      Alert.alert('Couldn’t update cover', 'Please try again in a moment.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top']}>
      {/* Header (56pt) */}
      <View style={{ height: 56, paddingHorizontal: theme.layout.screenX, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 20, color: LK.espresso, letterSpacing: -0.5 }}>Us</Text>
        <RoundIcon onPress={() => router.push('/settings')}>
          <Icon name="gear" size={22} color={LK.espresso} strokeWidth={1.6} />
        </RoundIcon>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Cover photo hero card */}
        <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 6 }}>
          <Pressable onPress={() => router.push('/profile/about')} accessibilityRole="button" accessibilityLabel="About us">
            <View style={{ height: 180, borderRadius: theme.radii.md, borderCurve: 'continuous', overflow: 'hidden', backgroundColor: LK.parchmentDeep, ...theme.shadow.card }}>
              {coverUrl ? (
                <Image source={{ uri: coverUrl }} style={{ position: 'absolute', inset: 0 }} contentFit="cover" transition={200} />
              ) : (
                <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
                  <Image source={COVER_FALLBACK} style={{ width: 110, height: 110, opacity: 0.9 }} contentFit="contain" />
                </View>
              )}

              {/* Espresso gradient overlay (bottom) */}
              <LinearGradient
                colors={['transparent', 'rgba(42,33,26,0.70)']}
                locations={[0.3, 1]}
                style={{ position: 'absolute', inset: 0 }}
              />

              {/* Avatars + couple name (bottom-left) */}
              <View style={{ position: 'absolute', left: 16, bottom: 16, right: 16, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row' }}>
                  <Avatar initial={myInitial} imageUrl={profile?.avatar_url} color={LK.coral} size={44} style={{ marginRight: -14, zIndex: 2, borderWidth: 2, borderColor: LK.vellum }} />
                  <Avatar initial={partnerInitial} imageUrl={partner?.avatar_url ?? undefined} color={LK.sky} size={44} style={{ borderWidth: 2, borderColor: LK.vellum }} />
                </View>
                <Text numberOfLines={1} style={{ flex: 1, marginLeft: 10, fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 18, color: LK.vellum }}>
                  {couple?.nickname ?? 'Us'}
                </Text>
              </View>

              {/* Camera edit button (top-right) */}
              <Pressable
                onPress={changeCover}
                accessibilityRole="button"
                accessibilityLabel="Change cover photo"
                hitSlop={8}
                style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,253,247,0.45)', alignItems: 'center', justifyContent: 'center' }}
              >
                {uploading ? <ActivityIndicator size="small" color={LK.espresso} /> : <Icon name="camera" size={17} color={LK.espresso} strokeWidth={1.9} />}
              </Pressable>
            </View>
          </Pressable>
        </View>

        {/* Feature grid (2-col, 6 cards) */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: theme.layout.screenX, paddingTop: 16, gap: 12 }}>
          {features.map((f) => (
            <FeatureCard key={f.key} feature={f} width={cardW} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureCard({ feature, width }: { feature: Feature; width: number }) {
  function press() {
    if (process.env.EXPO_OS === 'ios') {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { /* no-op */ }
    }
    router.push(feature.route as never);
  }

  return (
    <Pressable
      onPress={press}
      accessibilityRole="button"
      accessibilityLabel={feature.title}
      style={({ pressed }) => ({ width, aspectRatio: 1 / 1.15, transform: [{ scale: pressed ? 0.96 : 1 }] })}
    >
      <View style={{ flex: 1, backgroundColor: LK.ivory, borderRadius: theme.radii.md, borderCurve: 'continuous', borderWidth: 1.5, borderColor: BORDER, overflow: 'hidden', ...theme.shadow.sm }}>
        {/* Illustration zone (top 60%) */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: feature.color, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={feature.icon} size={28} color={shade(feature.color, 0.55)} />
          </View>
        </View>
        {/* Title */}
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: LK.espresso, paddingHorizontal: 16, paddingBottom: 16 }}>
          {feature.title}
        </Text>
        {/* Bottom accent bar */}
        <View style={{ height: 4, backgroundColor: feature.color }} />
        {/* Unread dot */}
        {feature.badge && (
          <View style={{ position: 'absolute', top: 12, right: 12, width: 12, height: 12, borderRadius: 6, backgroundColor: LK.coral, borderWidth: 1.5, borderColor: LK.ivory }} />
        )}
      </View>
    </Pressable>
  );
}
