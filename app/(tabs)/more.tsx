import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Animated } from 'react-native';
import { router } from 'expo-router';
import { LK, shade, tint, theme } from '@/constants/theme';
import { useCouple } from '@/hooks/useCouple';
import { useAuth } from '@/hooks/useAuth';
import { useBucketList } from '@/hooks/useBucketList';
import { useLetters } from '@/hooks/useLetters';
import { usePartner } from '@/hooks/usePartner';
import { useUnseenStore } from '@/stores/unseen.store';
import { Avatar } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';
import { TabHeader } from '@/components/ui/TabHeader';
import { FadeSlideIn } from '@/components/ui/FadeSlideIn';
import { usePressScale } from '@/hooks/usePressScale';

export default function MoreScreen() {
  const { couple, dayCount } = useCouple();
  const { profile } = useAuth();
  const { items } = useBucketList();
  const { letters } = useLetters();
  const { partner } = usePartner();
  const counts = useUnseenStore((s) => s.counts);

  const myInitial = ((profile?.display_name || 'Y').charAt(0) || 'Y').toUpperCase();
  const partnerInitial = ((partner?.display_name || 'P').charAt(0) || 'P').toUpperCase();
  const doneCount = items.filter((i) => i.is_done).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>
        <TabHeader eyebrow="Just" title="Us" />

        {/* Couple identity card */}
        <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 10, paddingBottom: 16 }}>
          <View style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.lg, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, ...theme.shadow.card }}>
            {/* Overlapping avatars */}
            <View style={{ flexDirection: 'row', flexShrink: 0 }}>
              <Avatar initial={myInitial} imageUrl={profile?.avatar_url} color={LK.coral} size={50} style={{ marginRight: -16, zIndex: 2, borderWidth: 3, borderColor: LK.ivory }} />
              <Avatar initial={partnerInitial} imageUrl={partner?.avatar_url ?? undefined} color={LK.sky} size={50} style={{ borderWidth: 3, borderColor: LK.ivory }} />
            </View>

            {/* Name + start date */}
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 19, color: LK.ink, lineHeight: 22 }}>
                {couple?.nickname ?? 'Your relationship'}
              </Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70, marginTop: 3 }}>
                {couple?.start_date ? `Since ${new Date(couple.start_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}` : ''}
              </Text>
            </View>

            {/* Day count pill */}
            {dayCount > 0 && (
              <View style={{ backgroundColor: tint(shade(LK.gold, 0.15), 0.82), borderRadius: 9999, paddingHorizontal: 11, paddingVertical: 7, alignItems: 'center', flexShrink: 0 }}>
                <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 18, color: shade(LK.gold, 0.5), lineHeight: 20, letterSpacing: -0.5 }}>
                  {dayCount.toLocaleString()}
                </Text>
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 9.5, letterSpacing: 1, textTransform: 'uppercase', color: shade(LK.gold, 0.45), marginTop: 1 }}>
                  days
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ paddingHorizontal: theme.layout.screenX, gap: 12 }}>
          <FadeSlideIn delay={80}><HubCard color={LK.coral} icon="user" title="About Us" sub="The little things that matter" onPress={() => router.push('/profile/about')} /></FadeSlideIn>
          <FadeSlideIn delay={140}><HubCard color={LK.mint} icon="list" title="Bucket List" sub={`${doneCount} of ${items.length} done together`} onPress={() => router.push('/bucket-list')} /></FadeSlideIn>
          <FadeSlideIn delay={200}><HubCard color={LK.pink} icon="envelope" title="Love Letters" sub={counts.letters > 0 ? `${counts.letters} new from your partner` : `${letters.length} ${letters.length === 1 ? 'letter' : 'letters'}, kept forever`} badge={counts.letters} onPress={() => router.push('/letters')} /></FadeSlideIn>
          <FadeSlideIn delay={260}><HubCard color={LK.amber} icon="gift" title="Love Coupons" sub={counts.coupons > 0 ? `${counts.coupons} new gift${counts.coupons === 1 ? '' : 's'} for you` : 'Redeem a little favour'} badge={counts.coupons} onPress={() => router.push('/coupons')} /></FadeSlideIn>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HubCard({ color, icon, title, sub, onPress, badge = 0 }: { color: string; icon: string; title: string; sub: string; onPress: () => void; badge?: number }) {
  const press = usePressScale(0.97);
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      activeOpacity={1}
      accessibilityLabel={title}
    >
    <Animated.View style={[{ backgroundColor: LK.ivory, borderRadius: theme.radii.lg, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, ...theme.shadow.card }, { transform: [{ scale: press.scale }] }]}>
      <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: color, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={26} color={shade(color, 0.55)} />
        {badge > 0 && (
          <View style={{
            position: 'absolute', top: -3, right: -3,
            minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5,
            backgroundColor: LK.coral, alignItems: 'center', justifyContent: 'center',
            borderWidth: 2, borderColor: LK.ivory,
          }}>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 11, color: '#fff' }}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 17, color: LK.ink, lineHeight: 21 }}>{title}</Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: badge > 0 ? shade(color, 0.5) : LK.ink70, fontWeight: badge > 0 ? '700' : '400', marginTop: 2 }}>{sub}</Text>
      </View>
      <Icon name="chevR" size={20} color={LK.ink70} />
    </Animated.View>
    </TouchableOpacity>
  );
}
