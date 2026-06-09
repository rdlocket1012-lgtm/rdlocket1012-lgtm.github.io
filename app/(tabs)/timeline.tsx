import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useUnseenStore } from '@/stores/unseen.store';
import { TabHeader } from '@/components/ui/TabHeader';
import { LK, tint, shade, catColor, theme } from '@/constants/theme';
import { useMilestones } from '@/hooks/useMilestones';
import { useCouple } from '@/hooks/useCouple';
import { FREE_LIMITS } from '@/constants/free-limits';
import { TYPE_ICON } from '@/constants/milestone-types';
import { RoundIcon, IconChip } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';
import { AddMilestoneModal } from '@/components/milestone/AddMilestoneModal';
import { PaywallModal } from '@/components/paywall/PaywallModal';
import type { Milestone } from '@/stores/milestones.store';

export default function TimelineScreen() {
  const { milestones } = useMilestones();
  const { isPremium } = useCouple();
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
  const [sheet, setSheet] = useState<'add' | 'paywall' | null>(null);

  const atCap = !isPremium && milestones.length >= FREE_LIMITS.MILESTONES;
  const years = [...new Set(milestones.map((m) => new Date(m.milestone_date).getFullYear()))].sort((a, b) => b - a);

  // Clear the milestones badge whenever the timeline is viewed.
  useFocusEffect(useCallback(() => { useUnseenStore.getState().markSeen('milestones'); }, []));

  function handleAdd() {
    if (atCap) { setSheet('paywall'); return; }
    setSheet('add');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Header */}
        <TabHeader
          eyebrow="Our"
          title="Timeline"
          right={<RoundIcon onPress={handleAdd}><Icon name="plus" size={22} color={LK.ink} /></RoundIcon>}
        />

        {/* Free cap meter */}
        {!isPremium && (
          <TouchableOpacity
            onPress={() => setSheet('paywall')}
            style={{ marginHorizontal: theme.layout.screenX, marginTop: 14, marginBottom: 4, backgroundColor: LK.ivory, borderRadius: theme.radii.sm, padding: 14, ...theme.shadow.sm }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13.5, color: LK.ink }}>
                {milestones.length} of {FREE_LIMITS.MILESTONES} milestones
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="crown" size={13} color={shade(LK.gold, 0.5)} />
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: shade(LK.gold, 0.5) }}>Go unlimited</Text>
              </View>
            </View>
            <View style={{ height: 7, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.08)', overflow: 'hidden' }}>
              <View style={{ width: `${Math.min(100, milestones.length / FREE_LIMITS.MILESTONES * 100)}%`, height: '100%', borderRadius: 9999, backgroundColor: LK.gold }} />
            </View>
          </TouchableOpacity>
        )}

        {/* Timeline by year */}
        <View style={{ paddingHorizontal: 22, paddingTop: 14 }}>
          {years.length === 0 && (
            <View style={{ alignItems: 'center', paddingTop: 60, gap: 14 }}>
              <IconChip color={LK.coral} size={72}><Icon name="heart" size={34} color={shade(LK.coral, 0.5)} /></IconChip>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 26, color: LK.ink, textAlign: 'center' }}>Your story starts here</Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5, color: LK.ink70, textAlign: 'center', lineHeight: 22, maxWidth: 260 }}>
                Add your first milestone — the moment your story began.
              </Text>
              <TouchableOpacity onPress={handleAdd} style={{ backgroundColor: LK.ink, borderRadius: 9999, paddingHorizontal: 24, paddingVertical: 14, marginTop: 8 }}>
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: '#fff' }}>Add milestone</Text>
              </TouchableOpacity>
            </View>
          )}
          {years.map((yr) => {
            const items = milestones.filter((m) => new Date(m.milestone_date).getFullYear() === yr);
            const isCol = collapsed[yr];
            return (
              <View key={yr} style={{ marginBottom: 8 }}>
                <TouchableOpacity
                  onPress={() => setCollapsed((c) => ({ ...c, [yr]: !c[yr] }))}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}
                  accessibilityLabel={`${yr}, ${items.length} milestones`}
                >
                  <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 30, color: LK.ink, letterSpacing: -1 }}>{yr}</Text>
                  <View style={{ backgroundColor: 'rgba(42,33,26,0.06)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 }}>
                    <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: LK.ink70 }}>{items.length}</Text>
                  </View>
                  <View style={{ flex: 1, height: 2, backgroundColor: 'rgba(42,33,26,0.07)', borderRadius: 2 }} />
                  <Icon name="chevD" size={18} color={LK.ink70} />
                </TouchableOpacity>
                {!isCol && (
                  <View>
                    {items.map((m, idx) => (
                      <MilestoneRow key={m.id} m={m} onPress={() => router.push(`/milestone/${m.id}`)} last={idx === items.length - 1} />
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {sheet === 'add' && <AddMilestoneModal onClose={() => setSheet(null)} isPremium={isPremium} onPaywall={() => setSheet('paywall')} />}
      {sheet === 'paywall' && <PaywallModal onClose={() => setSheet(null)} />}
    </SafeAreaView>
  );
}

function MilestoneRow({ m, onPress, last }: { m: Milestone; onPress: () => void; last: boolean }) {
  const c = catColor(m.type);
  return (
    <View style={{ flexDirection: 'row', gap: 14 }}>
      <View style={{ alignItems: 'center', flexShrink: 0, width: 46 }}>
        <IconChip color={c.base} size={46}><Icon name={TYPE_ICON[m.type] ?? 'star'} size={22} color={c.deep} /></IconChip>
        {!last && <View style={{ flex: 1, width: 2.5, backgroundColor: 'rgba(42,33,26,0.09)', marginVertical: 2, borderRadius: 2 }} />}
      </View>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={{ flex: 1, minWidth: 0, marginBottom: 14, backgroundColor: LK.ivory, borderRadius: theme.radii.sm, padding: 14, ...theme.shadow.sm }}
        accessibilityLabel={m.title}
      >
        <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 18.5, color: LK.ink, lineHeight: 24 }}>{m.title}</Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, fontWeight: '700', color: c.deep, marginTop: 3 }}>
          {new Date(m.milestone_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>
        {m.note && (
          <Text numberOfLines={2} style={{ fontFamily: theme.fonts.body, fontSize: 13.5, color: LK.ink70, marginTop: 6, lineHeight: 20 }}>{m.note}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
