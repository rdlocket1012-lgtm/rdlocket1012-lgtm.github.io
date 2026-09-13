import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { LK, shade, theme } from '@/constants/theme';
import { useCouple } from '@/hooks/useCouple';
import { useAuth } from '@/hooks/useAuth';
import { usePartner } from '@/hooks/usePartner';
import { useUnseenStore } from '@/stores/unseen.store';
import { Avatar } from '@/components/ui/avatar';
import { RoundIcon } from '@/components/ui/round-icon';
import { Icon } from '@/components/ui/Icon';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { DoodleBackground } from '@/components/ui/doodle-background';
import { pickAndUploadCoverPhoto } from '@/lib/cover-photo';
import { toast } from '@/lib/feedback';

const COVER_FALLBACK = require('../../assets/illustrations/mascot/holding-hands.png');
const BORDER = 'rgba(42,33,26,0.15)';

// §13.16 feature-card illustrations — kawaii stickers (§7) instead of line icons.
const FEATURE_ILLUS: Record<string, number> = {
  letters: require('../../assets/illustrations/mascot/holding-letter.png'),
  coupons: require('../../assets/illustrations/milestones/custom.png'),
  map: require('../../assets/illustrations/empty-states/no-map-pins.png'),
  calendar: require('../../assets/illustrations/empty-states/no-milestones.png'),
  notes: require('../../assets/illustrations/moods/calm.png'),
  about: require('../../assets/illustrations/mascot/waving.png'),
};

type Feature = {
  key: string;
  title: string;
  /** One line of information. Static blurbs only where no live number exists —
   *  the feature stores aren't fetched until their screen is visited, so a count
   *  read from them here would show a confident, wrong "0". */
  blurb: string;
  icon: string;
  color: string;
  route: string;
  /** Unread count from the unseen store, which IS loaded app-wide (useUnseen is
   *  mounted in (tabs)/_layout). Only letters/coupons/milestones have one. */
  unread?: number;
};

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

  // Letters leads (the emotional core, and the most paywalled feature) and About
  // Us closes — two wide rows bracketing a 2x2 grid, so the hub isn't six
  // interchangeable squares.
  const letters: Feature = {
    key: 'letters', title: 'Letters', blurb: 'Write something they\u2019ll keep',
    icon: 'envelope', color: LK.gold, route: '/letters', unread: counts.letters,
  };
  const about: Feature = {
    key: 'about', title: 'About Us', blurb: 'Your details, side by side',
    icon: 'user', color: LK.coral, route: '/profile/about',
  };
  const grid: Feature[] = [
    { key: 'coupons', title: 'Coupons', blurb: 'Little favours to cash in', icon: 'gift', color: LK.marigold, route: '/coupons', unread: counts.coupons },
    { key: 'map', title: 'Map', blurb: 'Places that are yours', icon: 'mapPin', color: LK.sage, route: '/map' },
    { key: 'calendar', title: 'Calendar', blurb: 'Dates worth remembering', icon: 'calendar', color: LK.sky, route: '/calendar' },
    { key: 'notes', title: 'Notes', blurb: 'Private, just for you', icon: 'lock', color: LK.blush, route: '/notes' },
  ];

  async function changeCover() {
    if (!couple?.id || uploading) return;
    try {
      setUploading(true);
      await pickAndUploadCoverPhoto(couple.id);
    } catch {
      toast.error('Couldn’t update the cover — please try again.');
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

        {/* Letters — wide hero row */}
        <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 16 }}>
          <FeatureRow feature={letters} />
        </View>

        {/* 2x2 grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: theme.layout.screenX, paddingTop: 12, gap: 12 }}>
          {grid.map((f) => (
            <FeatureCard key={f.key} feature={f} width={cardW} />
          ))}
        </View>

        {/* About Us — wide row closes the hub */}
        <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 12 }}>
          <FeatureRow feature={about} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function useFeaturePress(feature: Feature) {
  return () => router.push(feature.route as never);
}

/** Unread pill — replaces the boolean dot, which told you something was new but
 *  never how much. */
function UnreadPill({ count }: { count: number }) {
  return (
    <View style={{ backgroundColor: LK.coral, borderRadius: 9999, paddingHorizontal: 7, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 11.5, color: '#fff' }}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}

/** Wide row — for the two features that earn top and bottom billing. */
function FeatureRow({ feature }: { feature: Feature }) {
  const press = useFeaturePress(feature);
  const unread = feature.unread ?? 0;

  return (
    <ScalePressable
      scaleTo={0.98}
      onPress={press}
      accessibilityRole="button"
      accessibilityLabel={unread > 0 ? `${feature.title}, ${unread} new` : feature.title}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: LK.ivory, borderRadius: theme.radii.md, borderCurve: 'continuous', borderWidth: 1.5, borderColor: BORDER, overflow: 'hidden', ...theme.shadow.sm }}>
        <DoodleBackground group="general" density="light" color={feature.color} />
        <View style={{ width: 92, height: 92, alignItems: 'center', justifyContent: 'center' }}>
          <Image source={FEATURE_ILLUS[feature.key]} contentFit="contain" accessible={false} style={{ width: 68, height: 68 }} />
        </View>
        <View style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 17, color: LK.espresso }}>{feature.title}</Text>
            {unread > 0 && <UnreadPill count={unread} />}
          </View>
          <Text numberOfLines={1} style={{ fontFamily: theme.fonts.body, fontWeight: '500', fontSize: 12.5, color: LK.sepia, marginTop: 2 }}>
            {feature.blurb}
          </Text>
        </View>
        <Icon name="chevR" size={17} color={LK.faded} />
        <View style={{ width: 14 }} />
        <View style={{ width: 4, alignSelf: 'stretch', backgroundColor: feature.color }} />
      </View>
    </ScalePressable>
  );
}

function FeatureCard({ feature, width }: { feature: Feature; width: number }) {
  const press = useFeaturePress(feature);
  const unread = feature.unread ?? 0;

  return (
    <ScalePressable
      scaleTo={0.96}
      onPress={press}
      accessibilityRole="button"
      accessibilityLabel={unread > 0 ? `${feature.title}, ${unread} new` : feature.title}
      style={{ width, aspectRatio: 1 / 1.05 }}
    >
      <View style={{ flex: 1, backgroundColor: LK.ivory, borderRadius: theme.radii.md, borderCurve: 'continuous', borderWidth: 1.5, borderColor: BORDER, overflow: 'hidden', ...theme.shadow.sm }}>
        {/* Faint accent-tinted ink layer under the sticker (§13.16) */}
        <DoodleBackground group="general" density="light" color={feature.color} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Image source={FEATURE_ILLUS[feature.key]} contentFit="contain" accessible={false} style={{ width: 76, height: 76 }} />
        </View>
        <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: LK.espresso }}>{feature.title}</Text>
          <Text numberOfLines={1} style={{ fontFamily: theme.fonts.body, fontWeight: '500', fontSize: 11, color: LK.sepia, marginTop: 2 }}>
            {feature.blurb}
          </Text>
        </View>
        <View style={{ height: 4, backgroundColor: feature.color }} />
        {unread > 0 && (
          <View style={{ position: 'absolute', top: 10, right: 10 }}>
            <UnreadPill count={unread} />
          </View>
        )}
      </View>
    </ScalePressable>
  );
}
