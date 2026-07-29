import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal, KeyboardAvoidingView, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, ReduceMotion } from 'react-native-reanimated';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { toast } from '@/lib/feedback';
import { LK, tint, shade, catColor, rgba, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { IconChip } from '@/components/ui/icon-chip';
import { RoundIcon } from '@/components/ui/round-icon';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { BUCKET_CATEGORIES } from '@/constants/categories';
import { useBucketList } from '@/hooks/useBucketList';
import { useCouple } from '@/hooks/useCouple';
import { FREE_LIMITS } from '@/constants/free-limits';
import { PaywallModal } from '@/components/paywall/PaywallModal';
import { ScratchCard } from '@/components/bucket/ScratchCard';
import { dateIdeasForDay } from '@/constants/date-ideas';

const SCRATCH_COLORS = [LK.coral, LK.marigold, LK.lilac, LK.success, LK.blush, LK.sky];

// First-6-only entrance stagger (§10.3) — matches the timeline/letters card feel.
const stagger = (i: number) =>
  i < 6 ? FadeInUp.duration(300).delay(i * 40).reduceMotion(ReduceMotion.System) : undefined;

export default function BucketListScreen() {
  const { category: initCategory } = useLocalSearchParams<{ category?: string }>();
  const { items, loading, addItem, toggleItem, deleteItem, updateItem } = useBucketList();
  const [scratchMode, setScratchMode] = useState(false);
  const dateIdeas = dateIdeasForDay(new Date(), 4);
  const { isPremium, couple } = useCouple();
  const [filter, setFilter] = useState<'todo' | 'done'>('todo');
  const [catFilter, setCatFilter] = useState<string>(initCategory ?? 'all');
  const [sheet, setSheet] = useState<'add' | 'paywall' | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState('travel');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState('');
  const [geocoding, setGeocoding] = useState(false);

  function openAdd() {
    setEditingId(null);
    setNewTitle('');
    setNewCat('travel');
    setNewLocation('');
    setSheet('add');
  }

  function openEdit(item: { id: string; title: string; category: string; location_name?: string | null }) {
    setEditingId(item.id);
    setNewTitle(item.title);
    setNewCat(item.category);
    setNewLocation(item.location_name ?? '');
    setSheet('add');
  }

  function closeSheet() {
    setSheet(null);
    setEditingId(null);
    setNewTitle('');
    setNewLocation('');
  }

  const filteredByCat = catFilter === 'all' ? items : items.filter((i) => i.category === catFilter);
  const todo = filteredByCat.filter((i) => !i.is_done);
  const done = filteredByCat.filter((i) => i.is_done);
  const atCap = !isPremium && items.length >= FREE_LIMITS.BUCKET_LIST_ITEMS;
  const list = filter === 'todo' ? todo : done;

  async function handleAdd() {
    if (!newTitle.trim()) return;
    setGeocoding(true);

    // Geocode the optional location
    let latitude: number | null = null;
    let longitude: number | null = null;
    const locStr = newLocation.trim();
    if (locStr) {
      try {
        const results = await Location.geocodeAsync(locStr);
        if (results[0]) { latitude = results[0].latitude; longitude = results[0].longitude; }
      } catch {}
    }

    setGeocoding(false);

    if (editingId) {
      await updateItem(editingId, {
        title: newTitle.trim(),
        category: newCat,
        location_name: locStr || null,
        latitude,
        longitude,
      });
      closeSheet();
      return;
    }
    if (!couple?.id) {
      toast('Your shared space is still setting up. Try again in a moment.');
      return;
    }
    await addItem({
      couple_id: couple.id,
      added_by: null,
      title: newTitle.trim(),
      category: newCat,
      note: null,
      target_date: null,
      is_done: false,
      completed_at: null,
      deleted_at: null,
      latitude,
      longitude,
      location_name: locStr || null,
    });
    closeSheet();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Header */}
        <ScreenHeader
          eyebrow="Our"
          title="Bucket List"
          onBack={() => router.back()}
          right={
            <ScalePressable
              onPress={() => atCap ? setSheet('paywall') : openAdd()}
              accessibilityLabel={atCap ? 'Upgrade to add more' : 'Add to list'}
              style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: atCap ? tint(LK.marigold, 0.7) : LK.espresso, alignItems: 'center', justifyContent: 'center', ...theme.shadow.sm }}
            >
              <Icon name={atCap ? 'lock' : 'plus'} size={atCap ? 19 : 22} color={atCap ? shade(LK.marigold, 0.5) : '#fff'} />
            </ScalePressable>
          }
        />

        {/* Category filter chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 'all', label: 'All', icon: 'star', color: LK.espresso }, ...BUCKET_CATEGORIES]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 8 }}
          renderItem={({ item: cat }) => {
            const on = catFilter === cat.id;
            const col = cat.id === 'all' ? LK.espresso : cat.color;
            return (
              <ScalePressable
                onPress={() => setCatFilter(cat.id)}
                scaleTo={0.95}
                accessibilityLabel={`Filter ${cat.label}`}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: on ? col : tint(col, 0.7), borderRadius: 9999, paddingHorizontal: 14, paddingVertical: 9 }}
              >
                <Icon name={cat.icon} size={13} color={on ? '#fff' : shade(col, 0.55)} />
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: on ? '#fff' : shade(col, 0.55) }}>{cat.label}</Text>
              </ScalePressable>
            );
          }}
        />

        {/* Scratch-Off mode toggle */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 6 }}>
          <ScalePressable
            onPress={() => setScratchMode((s) => !s)}
            scaleTo={0.98}
            accessibilityLabel="Toggle date idea scratch cards"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: scratchMode ? LK.espresso : tint(LK.lilac, 0.7), borderRadius: 16, borderCurve: 'continuous', paddingVertical: 12, paddingHorizontal: 15 }}
          >
            <Icon name="sparkle" size={18} color={scratchMode ? '#fff' : shade(LK.lilac, 0.5)} />
            <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 14, color: scratchMode ? '#fff' : shade(LK.lilac, 0.55) }}>
              {scratchMode ? 'Back to your list' : 'Scratch-Off date ideas'}
            </Text>
            <Icon name="chevR" size={16} color={scratchMode ? 'rgba(255,255,255,0.7)' : shade(LK.lilac, 0.5)} />
          </ScalePressable>
        </View>

        {scratchMode && (
          <View style={{ paddingHorizontal: 18, paddingTop: 8, gap: 12 }}>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 13.5, color: LK.ink70, lineHeight: 20, paddingHorizontal: 4 }}>
              Today's surprise date ideas — scratch the foil to reveal each one. You and your partner see the same set today.
            </Text>
            {dateIdeas.map((idea, i) => (
              <ScratchCard key={i} idea={idea} color={SCRATCH_COLORS[i % SCRATCH_COLORS.length]} />
            ))}
          </View>
        )}

        {!scratchMode && (<>
        {/* Filter + count */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flexDirection: 'row', backgroundColor: 'rgba(42,33,26,0.06)', borderRadius: 9999, padding: 4 }}>
            {(['todo', 'done'] as const).map((k) => {
              const label = k === 'todo' ? 'To Do' : 'Done';
              const count = k === 'todo' ? todo.length : done.length;
              return (
                <ScalePressable
                  key={k}
                  onPress={() => setFilter(k)}
                  scaleTo={0.96}
                  style={{ backgroundColor: filter === k ? LK.ivory : 'transparent', borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13.5, color: filter === k ? LK.espresso : LK.ink70 }}>{label}</Text>
                  <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.ink70 }}>{count}</Text>
                </ScalePressable>
              );
            })}
          </View>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: LK.ink70 }}>
            {done.length} of {items.length} done
          </Text>
        </View>

        {/* Cap meter */}
        {!isPremium && items.length > 0 && (
          <ScalePressable onPress={() => setSheet('paywall')} scaleTo={0.98} accessibilityLabel="See Premium options" containerStyle={{ marginHorizontal: 20, marginBottom: 4 }} style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.sm, borderCurve: 'continuous', padding: 14, ...theme.shadow.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: atCap ? shade(LK.marigold, 0.5) : LK.espresso }}>
                {atCap ? 'Free limit reached' : `${items.length} of ${FREE_LIMITS.BUCKET_LIST_ITEMS} on Free`}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="crown" size={13} color={shade(LK.marigold, 0.5)} />
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12, color: shade(LK.marigold, 0.5) }}>Unlimited</Text>
              </View>
            </View>
            <View style={{ height: 6, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.07)', overflow: 'hidden' }}>
              <View style={{ width: `${Math.min(100, items.length / FREE_LIMITS.BUCKET_LIST_ITEMS * 100)}%` as any, height: '100%', borderRadius: 9999, backgroundColor: atCap ? LK.marigold : LK.espresso }} />
            </View>
          </ScalePressable>
        )}

        {/* Items */}
        <View style={{ paddingHorizontal: 18, paddingTop: 14, gap: 12 }}>
          {/* Loading has to come BEFORE the empty check: `items` is [] until the
              fetch lands, so a user with a full list used to be shown the
              "you have nothing yet" pitch and then a pop. */}
          {loading ? (
            [0, 1, 2, 3].map((i) => <Skeleton key={i} height={68} radius={theme.radii.sm} />)
          ) : items.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 40, gap: 14 }}>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 4 }}>
                {[LK.sky, LK.coral, LK.lilac].map((col, i) => (
                  <View key={i} style={{ width: 58, height: 58, borderRadius: 20, backgroundColor: tint(col, 0.7), alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={['plane', 'fork', 'mug'][i]} size={26} color={shade(col, 0.5)} />
                  </View>
                ))}
              </View>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 26, color: LK.espresso, textAlign: 'center', maxWidth: 260, lineHeight: 30 }}>
                What do you dream of doing together?
              </Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5, color: LK.ink70, lineHeight: 22, textAlign: 'center', maxWidth: 250 }}>
                Start your shared list — big adventures and tiny cosy plans alike.
              </Text>
              <ScalePressable scaleTo={0.97} onPress={openAdd} accessibilityLabel="Add to list" style={{ backgroundColor: LK.espresso, borderRadius: 9999, paddingHorizontal: 24, paddingVertical: 14, marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="plus" size={18} color="#fff" />
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: '#fff' }}>Add to list</Text>
              </ScalePressable>
            </View>
          ) : list.length === 0 ? (
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5, color: LK.ink70, textAlign: 'center', paddingTop: 40 }}>
              {filter === 'done' ? 'Nothing crossed off yet — go make a memory.' : 'All done! Dream up something new.'}
            </Text>
          ) : list.map((it, idx) => {
            const catDef = BUCKET_CATEGORIES.find((c) => c.id === it.category);
            const color = catDef?.color ?? LK.sky;
            return (
              <Animated.View key={it.id} entering={stagger(idx)} style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.lg, padding: 15, flexDirection: 'row', gap: 13, ...theme.shadow.card, opacity: it.is_done ? 0.92 : 1 }}>
                <ScalePressable
                  onPress={() => toggleItem(it.id, !it.is_done)}
                  scaleTo={0.9}
                  accessibilityLabel={it.is_done ? 'Mark as not done' : 'Mark as done'}
                  containerStyle={{ flexShrink: 0, marginLeft: -7 }}
                  style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
                >
                  <View style={{
                    width: 30, height: 30, borderRadius: 15,
                    backgroundColor: it.is_done ? color : 'transparent',
                    borderWidth: it.is_done ? 0 : 2.5, borderColor: 'rgba(42,33,26,0.22)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {it.is_done && <Icon name="check" size={18} color={shade(color, 0.55)} />}
                  </View>
                </ScalePressable>
                <ScalePressable scaleTo={0.99} haptic={false} onPress={() => openEdit({ ...it })} accessibilityLabel={`Edit ${it.title}`} containerStyle={{ flex: 1, minWidth: 0 }}>
                  <Text style={{
                    fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 18, color: LK.espresso, lineHeight: 22,
                    textDecorationLine: it.is_done ? 'line-through' : 'none',
                  }}>
                    {it.title}
                  </Text>
                  {it.note && (
                    <Text numberOfLines={1} style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70, marginTop: 5, lineHeight: 18 }}>{it.note}</Text>
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 9, flexWrap: 'wrap' }}>
                    <View style={{ backgroundColor: tint(color, 0.75), borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Icon name={catDef?.icon ?? 'star'} size={13} color={shade(color, 0.5)} />
                      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12, color: shade(color, 0.5) }}>{catDef?.label ?? it.category}</Text>
                    </View>
                    {it.location_name && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(42,33,26,0.06)', borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 4 }}>
                        <Icon name="mapPin" size={11} color={LK.ink70} />
                        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 11.5, color: LK.ink70 }}>{it.location_name}</Text>
                      </View>
                    )}
                    {it.is_done && it.completed_at && (
                      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12, color: LK.ink70 }}>
                        Done {new Date(it.completed_at).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </ScalePressable>
              </Animated.View>
            );
          })}
        </View>
        </>)}
      </ScrollView>

      {/* Add item modal */}
      {sheet === 'add' && (
        <Modal animationType="slide" transparent>
          <KeyboardAvoidingView behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.4)' }} onPress={closeSheet} accessibilityLabel="Close" />
          <View style={{ backgroundColor: LK.parchment, borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
            <View style={{ paddingTop: 14, alignItems: 'center' }}>
              <View style={{ width: 38, height: 5, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.15)' }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 12 }}>
              <ScalePressable onPress={closeSheet} haptic={false} accessibilityRole="button" accessibilityLabel="Cancel" style={{ minHeight: 44, justifyContent: 'center', paddingRight: 8 }}>
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15.5, color: LK.ink70 }}>Cancel</Text>
              </ScalePressable>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 18, color: LK.espresso }}>{editingId ? 'Edit item' : 'Add to list'}</Text>
              <ScalePressable
                onPress={handleAdd}
                disabled={!newTitle.trim()}
                accessibilityLabel={editingId ? 'Save item' : 'Add item'}
                style={{ backgroundColor: newTitle.trim() ? LK.espresso : 'rgba(42,33,26,0.15)', borderRadius: 9999, paddingHorizontal: 18, minHeight: 44, justifyContent: 'center' }}
              >
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: newTitle.trim() ? '#fff' : LK.ink70 }}>{editingId ? 'Save' : 'Add'}</Text>
              </ScalePressable>
            </View>
            <View style={{ paddingHorizontal: 22, paddingBottom: 40 }}>
              <TextInput
                autoFocus
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="Something to do together…"
                placeholderTextColor={LK.ink70}
                style={{ backgroundColor: LK.ivory, borderRadius: 16, padding: 14, fontFamily: theme.fonts.body, fontSize: 16, color: LK.espresso, marginBottom: 12, ...theme.shadow.sm }}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: LK.ivory, borderRadius: 16, paddingHorizontal: 14, marginBottom: 16, ...theme.shadow.sm }}>
                <View style={{ marginRight: 8 }}><Icon name="mapPin" size={16} color={LK.ink70} /></View>
                <TextInput
                  value={newLocation}
                  onChangeText={setNewLocation}
                  placeholder="Location (optional)"
                  placeholderTextColor={LK.ink70}
                  style={{ flex: 1, fontFamily: theme.fonts.body, fontSize: 15, color: LK.espresso, paddingVertical: 14 }}
                />
                {geocoding && <ActivityIndicator size="small" color={LK.ink70} style={{ marginLeft: 8 }} />}
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {BUCKET_CATEGORIES.map((cat) => {
                  const on = newCat === cat.id;
                  return (
                    <ScalePressable
                      key={cat.id}
                      onPress={() => setNewCat(cat.id)}
                      scaleTo={0.95}
                      accessibilityLabel={cat.label}
                      style={{ backgroundColor: on ? cat.color : tint(cat.color, 0.75), borderRadius: 9999, paddingHorizontal: 13, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                    >
                      <Icon name={cat.icon} size={15} color={shade(cat.color, 0.5)} />
                      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: shade(cat.color, 0.5) }}>{cat.label}</Text>
                    </ScalePressable>
                  );
                })}
              </View>
            </View>
          </View>
          </KeyboardAvoidingView>
        </Modal>
      )}

      {sheet === 'paywall' && <PaywallModal onClose={() => setSheet(null)} />}
    </SafeAreaView>
  );
}
