import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { IconChip } from '@/components/ui/icon-chip';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { useUnseenStore } from '@/stores/unseen.store';
import { parseLocalDate } from '@/utils/date';

type Feed = {
  id: string;
  icon: string;
  color: string;
  title: string;
  subtitle: string;
  unseen?: boolean;
  onPress: () => void;
};

function relativePast(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const day = 86_400_000;
  if (diff < day) return 'Today';
  if (diff < 2 * day) return 'Yesterday';
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function untilLabel(dateStr: string): string {
  const target = parseLocalDate(dateStr);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `In ${days} days`;
  return target.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function NotificationsScreen() {
  // Freeze the seen marker as it was when this screen opened, then mark the
  // activity seen. Order matters: marking seen clears the Home bell dot and the
  // app-icon badge, but the rows must keep showing which items are new for as
  // long as the user is looking at them.
  const [seenAtOnEntry] = useState(() => useUnseenStore.getState().activitySeenAt);
  const { items, upcoming } = useActivityFeed(seenAtOnEntry);

  // Opening the feed is the "I've seen what's new" signal. It deliberately does
  // NOT mark letters or coupons themselves as read — those clear on their own
  // screens, so a letter you never opened still reads as unread there.
  useFocusEffect(
    useCallback(() => {
      void useUnseenStore.getState().markActivitySeen();
    }, []),
  );

  const comingUp: Feed[] = upcoming.slice(0, 5).map((e) => ({
    id: `up-${e.id}`,
    icon: e.icon,
    color: e.color,
    title: e.title,
    subtitle: untilLabel(e.date),
    onPress: () => router.push('/calendar'),
  }));

  const recent: Feed[] = items.map((a) => ({
    id: a.id,
    icon: a.icon,
    color: a.color,
    title: a.title,
    subtitle: relativePast(a.at),
    unseen: a.unseen,
    onPress: () => router.push(a.href as never),
  }));

  const isEmpty = comingUp.length === 0 && recent.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top']}>
      <ScreenHeader eyebrow="What's new" title="Activity" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 80 }}>
        {isEmpty ? (
          <View style={{ alignItems: 'center', paddingTop: 80, gap: 14 }}>
            <IconChip color={LK.sage} size={64}>
              <Icon name="bell" size={30} color={shade(LK.sage, 0.5)} />
            </IconChip>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 22, color: LK.espresso, textAlign: 'center' }}>
              You're all caught up
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, color: LK.ink70, textAlign: 'center', maxWidth: 250, lineHeight: 21 }}>
              Letters, coupons, drawings and memories from your partner will show up here.
            </Text>
          </View>
        ) : (
          <>
            {recent.length > 0 && (
              <Section title="Recent">
                {recent.map((f) => <FeedRow key={f.id} item={f} />)}
              </Section>
            )}
            {comingUp.length > 0 && (
              <Section title="Coming up">
                {comingUp.map((f) => <FeedRow key={f.id} item={f} />)}
              </Section>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 22 }}>
      <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', color: LK.ink70, marginBottom: 10 }}>
        {title}
      </Text>
      <View style={{ gap: 8 }}>{children}</View>
    </View>
  );
}

function FeedRow({ item }: { item: Feed }) {
  return (
    <ScalePressable
      scaleTo={0.98}
      onPress={item.onPress}
      accessibilityLabel={item.title}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: LK.ivory, borderRadius: theme.radii.sm, padding: 13, ...theme.shadow.sm }}
    >
      <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: tint(item.color, 0.6), alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={item.icon} size={20} color={shade(item.color, 0.5)} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 15.5, color: LK.espresso }}>{item.title}</Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.sepia, marginTop: 2 }}>{item.subtitle}</Text>
      </View>
      {item.unseen && (
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: LK.coral, flexShrink: 0 }} />
      )}
      <Icon name="chevR" size={18} color={LK.ink70} />
    </ScalePressable>
  );
}
