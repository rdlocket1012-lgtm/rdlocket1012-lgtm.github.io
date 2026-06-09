import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { LK, tint, shade, catColor, rgba, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { IconChip, RoundIcon } from '@/components/ui';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { BUCKET_CATEGORIES } from '@/constants/categories';
import { useBucketList } from '@/hooks/useBucketList';
import { useCouple } from '@/hooks/useCouple';
import { FREE_LIMITS } from '@/constants/free-limits';
import { PaywallModal } from '@/components/paywall/PaywallModal';
import { ScratchCard } from '@/components/bucket/ScratchCard';
import { dateIdeasForDay } from '@/constants/date-ideas';

const SCRATCH_COLORS = [LK.coral, LK.gold, LK.lilac, LK.mint, LK.pink, LK.sky];

export default function BucketListScreen() {
  const { items, addItem, toggleItem, deleteItem, updateItem } = useBucketList();
  const [scratchMode, setScratchMode] = useState(false);
  const dateIdeas = dateIdeasForDay(new Date(), 4);
  const { isPremium, couple } = useCouple();
  const [filter, setFilter] = useState<'todo' | 'done'>('todo');
  const [sheet, setSheet] = useState<'add' | 'paywall' | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState('travel');
  const [editingId, setEditingId] = useState<string | null>(null);

  function openAdd() {
    setEditingId(null);
    setNewTitle('');
    setNewCat('travel');
    setSheet('add');
  }

  function openEdit(item: { id: string; title: string; category: string }) {
    setEditingId(item.id);
    setNewTitle(item.title);
    setNewCat(item.category);
    setSheet('add');
  }

  function closeSheet() {
    setSheet(null);
    setEditingId(null);
    setNewTitle('');
  }

  const todo = items.filter((i) => !i.is_done);
  const done = items.filter((i) => i.is_done);
  const atCap = !isPremium && items.length >= FREE_LIMITS.BUCKET_LIST_ITEMS;
  const list = filter === 'todo' ? todo : done;

  async function handleAdd() {
    if (!newTitle.trim()) return;
    if (editingId) {
      await updateItem(editingId, { title: newTitle.trim(), category: newCat });
      closeSheet();
      return;
    }
    if (!couple?.id) {
      Alert.alert('Not ready', 'Your shared space is still setting up. Try again in a moment.');
      return;
    }
    await addItem({ couple_id: couple.id, added_by: null, title: newTitle.trim(), category: newCat, note: null, target_date: null, is_done: false, completed_at: null, deleted_at: null } as any);
    closeSheet();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Header */}
        <ScreenHeader
          eyebrow="Our"
          title="Bucket List"
          onBack={() => router.back()}
          right={
            <TouchableOpacity
              onPress={() => atCap ? setSheet('paywall') : openAdd()}
              style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: atCap ? tint(LK.gold, 0.7) : LK.ink, alignItems: 'center', justifyContent: 'center', ...theme.shadow.sm }}
            >
              <Icon name={atCap ? 'lock' : 'plus'} size={atCap ? 19 : 22} color={atCap ? shade(LK.gold, 0.5) : '#fff'} />
            </TouchableOpacity>
          }
        />

        {/* Scratch-Off mode toggle */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 6 }}>
          <TouchableOpacity
            onPress={() => setScratchMode((s) => !s)}
            activeOpacity={0.85}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: scratchMode ? LK.ink : tint(LK.lilac, 0.7), borderRadius: 16, paddingVertical: 12, paddingHorizontal: 15 }}
          >
            <Icon name="sparkle" size={18} color={scratchMode ? '#fff' : shade(LK.lilac, 0.5)} />
            <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 14, color: scratchMode ? '#fff' : shade(LK.lilac, 0.55) }}>
              {scratchMode ? 'Back to your list' : 'Scratch-Off date ideas'}
            </Text>
            <Icon name="chevR" size={16} color={scratchMode ? 'rgba(255,255,255,0.7)' : shade(LK.lilac, 0.5)} />
          </TouchableOpacity>
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
                <TouchableOpacity
                  key={k}
                  onPress={() => setFilter(k)}
                  style={{ backgroundColor: filter === k ? LK.ivory : 'transparent', borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13.5, color: filter === k ? LK.ink : LK.ink70 }}>{label}</Text>
                  <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.ink70 }}>{count}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: LK.ink70 }}>
            {done.length} of {items.length} done
          </Text>
        </View>

        {/* Cap meter */}
        {!isPremium && items.length > 0 && (
          <TouchableOpacity onPress={() => setSheet('paywall')} style={{ marginHorizontal: 20, marginBottom: 4, backgroundColor: LK.ivory, borderRadius: theme.radii.sm, padding: 14, ...theme.shadow.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: atCap ? shade(LK.gold, 0.5) : LK.ink }}>
                {atCap ? 'Free limit reached' : `${items.length} of ${FREE_LIMITS.BUCKET_LIST_ITEMS} on Free`}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="crown" size={13} color={shade(LK.gold, 0.5)} />
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12, color: shade(LK.gold, 0.5) }}>Unlimited</Text>
              </View>
            </View>
            <View style={{ height: 6, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.07)', overflow: 'hidden' }}>
              <View style={{ width: `${Math.min(100, items.length / FREE_LIMITS.BUCKET_LIST_ITEMS * 100)}%` as any, height: '100%', borderRadius: 9999, backgroundColor: atCap ? LK.gold : LK.ink }} />
            </View>
          </TouchableOpacity>
        )}

        {/* Items */}
        <View style={{ paddingHorizontal: 18, paddingTop: 14, gap: 12 }}>
          {items.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 40, gap: 14 }}>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 4 }}>
                {[LK.sky, LK.coral, LK.lilac].map((col, i) => (
                  <View key={i} style={{ width: 58, height: 58, borderRadius: 20, backgroundColor: tint(col, 0.7), alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={['plane', 'fork', 'mug'][i]} size={26} color={shade(col, 0.5)} />
                  </View>
                ))}
              </View>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 26, color: LK.ink, textAlign: 'center', maxWidth: 260, lineHeight: 30 }}>
                What do you dream of doing together?
              </Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5, color: LK.ink70, lineHeight: 22, textAlign: 'center', maxWidth: 250 }}>
                Start your shared list — big adventures and tiny cosy plans alike.
              </Text>
              <TouchableOpacity onPress={openAdd} style={{ backgroundColor: LK.ink, borderRadius: 9999, paddingHorizontal: 24, paddingVertical: 14, marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="plus" size={18} color="#fff" />
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: '#fff' }}>Add to list</Text>
              </TouchableOpacity>
            </View>
          ) : list.length === 0 ? (
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5, color: LK.ink70, textAlign: 'center', paddingTop: 40 }}>
              {filter === 'done' ? 'Nothing crossed off yet — go make a memory.' : 'All done! Dream up something new.'}
            </Text>
          ) : list.map((it) => {
            const catDef = BUCKET_CATEGORIES.find((c) => c.id === it.category);
            const color = catDef?.color ?? LK.sky;
            return (
              <View key={it.id} style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.lg, padding: 15, flexDirection: 'row', gap: 13, ...theme.shadow.card, opacity: it.is_done ? 0.92 : 1 }}>
                <TouchableOpacity
                  onPress={() => toggleItem(it.id, !it.is_done)}
                  style={{
                    width: 30, height: 30, borderRadius: 15, marginTop: 1, flexShrink: 0,
                    backgroundColor: it.is_done ? color : 'transparent',
                    borderWidth: it.is_done ? 0 : 2.5, borderColor: 'rgba(42,33,26,0.22)',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {it.is_done && <Icon name="check" size={18} color={shade(color, 0.55)} />}
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} onPress={() => openEdit(it)} style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{
                    fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 18, color: LK.ink, lineHeight: 22,
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
                    {it.is_done && it.completed_at && (
                      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12, color: LK.ink70 }}>
                        Done {new Date(it.completed_at).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
        </>)}
      </ScrollView>

      {/* Add item modal */}
      {sheet === 'add' && (
        <Modal animationType="slide" transparent>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.4)' }} onPress={closeSheet} activeOpacity={1} />
          <View style={{ backgroundColor: LK.cream, borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
            <View style={{ paddingTop: 14, alignItems: 'center' }}>
              <View style={{ width: 38, height: 5, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.15)' }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 12 }}>
              <TouchableOpacity onPress={closeSheet}>
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15.5, color: LK.ink70 }}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 18, color: LK.ink }}>{editingId ? 'Edit item' : 'Add to list'}</Text>
              <TouchableOpacity
                onPress={handleAdd}
                disabled={!newTitle.trim()}
                style={{ backgroundColor: newTitle.trim() ? LK.ink : 'rgba(42,33,26,0.15)', borderRadius: 9999, paddingHorizontal: 18, paddingVertical: 10 }}
              >
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: newTitle.trim() ? '#fff' : LK.ink70 }}>{editingId ? 'Save' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: 22, paddingBottom: 40 }}>
              <TextInput
                autoFocus
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="Something to do together…"
                placeholderTextColor={LK.ink70}
                style={{ backgroundColor: LK.ivory, borderRadius: 16, padding: 14, fontFamily: theme.fonts.body, fontSize: 16, color: LK.ink, marginBottom: 16, ...theme.shadow.sm }}
              />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {BUCKET_CATEGORIES.map((cat) => {
                  const on = newCat === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setNewCat(cat.id)}
                      style={{ backgroundColor: on ? cat.color : tint(cat.color, 0.75), borderRadius: 9999, paddingHorizontal: 13, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                    >
                      <Icon name={cat.icon} size={15} color={shade(cat.color, 0.5)} />
                      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: shade(cat.color, 0.5) }}>{cat.label}</Text>
                    </TouchableOpacity>
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
