import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { LK, shade, tint, theme } from '@/constants/theme';
import { useCouple } from '@/hooks/useCouple';
import { useAuth } from '@/hooks/useAuth';
import { useBucketList } from '@/hooks/useBucketList';
import { useLetters } from '@/hooks/useLetters';
import { usePartner } from '@/hooks/usePartner';
import { useUnseenStore } from '@/stores/unseen.store';
import { Avatar, IconChip } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';
import { TabHeader } from '@/components/ui/TabHeader';

export default function MoreScreen() {
  const { couple } = useCouple();
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <TabHeader eyebrow="Just" title="Us" />

        {/* Couple strip */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: theme.layout.screenX, paddingTop: 14, paddingBottom: 18 }}>
          <View style={{ flexDirection: 'row' }}>
            <Avatar initial={myInitial} imageUrl={profile?.avatar_url} color={LK.coral} size={46} style={{ marginRight: -14, zIndex: 2, borderWidth: 3, borderColor: LK.cream }} />
            <Avatar initial={partnerInitial} imageUrl={partner?.avatar_url ?? undefined} color={LK.sky} size={46} style={{ borderWidth: 3, borderColor: LK.cream }} />
          </View>
          <View>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 20, color: LK.ink, lineHeight: 22 }}>
              {couple?.nickname ?? 'Your relationship'}
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70, marginTop: 3 }}>
              {couple?.start_date ? `Together since ${new Date(couple.start_date).toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: theme.layout.screenX, gap: 12 }}>
          <HubCard color={LK.coral} icon="user" title="About Us" sub="The little things that matter" onPress={() => router.push('/profile/about')} />
          <HubCard color={LK.mint} icon="list" title="Bucket List" sub={`${doneCount} of ${items.length} done together`} onPress={() => router.push('/bucket-list')} />
          <HubCard color={LK.pink} icon="envelope" title="Love Letters" sub={counts.letters > 0 ? `${counts.letters} new from your partner` : `${letters.length} ${letters.length === 1 ? 'letter' : 'letters'}, kept forever`} badge={counts.letters} onPress={() => router.push('/letters')} />
          <HubCard color={LK.amber} icon="receipt" title="Love Coupons" sub={counts.coupons > 0 ? `${counts.coupons} new gift${counts.coupons === 1 ? '' : 's'} for you` : 'Redeem a little favour'} badge={counts.coupons} onPress={() => router.push('/coupons')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HubCard({ color, icon, title, sub, onPress, badge = 0 }: { color: string; icon: string; title: string; sub: string; onPress: () => void; badge?: number }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel={title}
      style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.lg, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, ...theme.shadow.card }}
    >
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
        <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 21, color: LK.ink, lineHeight: 24 }}>{title}</Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: badge > 0 ? shade(color, 0.5) : LK.ink70, fontWeight: badge > 0 ? '700' : '400', marginTop: 2 }}>{sub}</Text>
      </View>
      <Icon name="chevR" size={20} color={LK.ink70} />
    </TouchableOpacity>
  );
}
