import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { LK, tint, shade, catColor, rgba, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { MILESTONE_TYPES, TYPE_ICON, MilestoneTypeId } from '@/constants/milestone-types';
import { useMilestones } from '@/hooks/useMilestones';
import { useCouple } from '@/hooks/useCouple';
import { useAuthStore } from '@/stores/auth.store';
import { DateField } from '@/components/ui/DateField';
import { notifyPartner } from '@/lib/push';
import type { Milestone } from '@/stores/milestones.store';

interface Props {
  onClose: () => void;
  isPremium: boolean;
  onPaywall: () => void;
  editing?: Milestone;
}

export function AddMilestoneModal({ onClose, isPremium, onPaywall, editing }: Props) {
  const { addMilestone, updateMilestone } = useMilestones();
  const { couple } = useCouple();
  const [type, setType] = useState<MilestoneTypeId>((editing?.type as MilestoneTypeId) ?? 'trip');
  const [title, setTitle] = useState(editing?.title ?? '');
  const [note, setNote] = useState(editing?.note ?? '');
  const [date, setDate] = useState(editing?.milestone_date ?? new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const c = catColor(type);

  async function handleSave() {
    if (!title.trim()) return;
    const coupleId = couple?.id ?? useAuthStore.getState().profile?.couple_id;
    if (!coupleId) {
      Alert.alert('Setting up', 'Your shared space is still loading. Try again in a moment.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateMilestone(editing.id, {
          type,
          title: title.trim(),
          note: note.trim() || null,
          milestone_date: date,
        });
      } else {
        const myId = useAuthStore.getState().profile?.id ?? null;
        await addMilestone({
          couple_id: coupleId,
          created_by: myId,
          type,
          title: title.trim(),
          note: note.trim() || null,
          note_rich_html: null,
          milestone_date: date,
          deleted_at: null,
        });
        const name = (useAuthStore.getState().profile?.display_name || 'Your partner').split(' ')[0];
        notifyPartner('milestone', 'A new memory ✨', `${name} added "${title.trim()}" to your timeline`);
      }
      onClose();
    } catch (e: any) {
      Alert.alert('Could not save', e?.message ?? 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.4)' }} onPress={onClose} activeOpacity={1} />
      <View style={{ backgroundColor: LK.cream, borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '88%' }}>
        <View style={{ paddingTop: 14, paddingBottom: 6, alignItems: 'center' }}>
          <View style={{ width: 38, height: 5, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.15)' }} />
        </View>

        {/* Header row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingBottom: 12 }}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15.5, color: LK.ink70 }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 18, color: LK.ink }}>{editing ? 'Edit milestone' : 'New milestone'}</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!title.trim() || saving}
            style={{ backgroundColor: title.trim() ? LK.ink : 'rgba(42,33,26,0.15)', borderRadius: 9999, paddingHorizontal: 18, paddingVertical: 10 }}
          >
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: title.trim() ? '#fff' : LK.ink70 }}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 40 }}>
          {/* Type grid — 3-column responsive so labels never break mid-word */}
          <FieldLabel>Type</FieldLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10, marginBottom: 18 }}>
            {MILESTONE_TYPES.map(({ id, label }) => {
              const cc = catColor(id);
              const on = type === id;
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => setType(id)}
                  style={{
                    backgroundColor: on ? cc.base : tint(cc.base, 0.82),
                    borderRadius: 16, paddingVertical: 13, paddingHorizontal: 6,
                    alignItems: 'center', justifyContent: 'center', gap: 6,
                    width: '31.5%', minHeight: 78,
                    borderWidth: on ? 2 : 0, borderColor: on ? cc.deep : 'transparent',
                  }}
                >
                  <Icon name={TYPE_ICON[id] ?? 'star'} size={22} color={cc.deep} />
                  <Text numberOfLines={2} style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12, color: cc.deep, textAlign: 'center', lineHeight: 15 }}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Title */}
          <FieldLabel>Name</FieldLabel>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Our first trip"
            placeholderTextColor={LK.ink70}
            style={{ backgroundColor: LK.ivory, borderRadius: 16, padding: 14, fontFamily: theme.fonts.body, fontSize: 16, color: LK.ink, marginBottom: 18, ...theme.shadow.sm }}
          />

          {/* Date */}
          <FieldLabel>Date</FieldLabel>
          <View style={{ marginBottom: 18 }}>
            <DateField value={date} onChange={setDate} />
          </View>

          {/* Note */}
          <FieldLabel>Note</FieldLabel>
          <View style={{ position: 'relative' }}>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Tell the story…"
              placeholderTextColor={LK.ink70}
              multiline
              editable={isPremium}
              style={{
                backgroundColor: LK.ivory, borderRadius: 16, padding: 14,
                fontFamily: theme.fonts.serif, fontStyle: 'italic',
                fontSize: 17, color: LK.ink, minHeight: 96,
                textAlignVertical: 'top', lineHeight: 26,
                opacity: isPremium ? 1 : 0.5,
                ...theme.shadow.sm,
              }}
            />
            {!isPremium && (
              <TouchableOpacity
                onPress={onPaywall}
                style={{ position: 'absolute', inset: 0, borderRadius: 16, backgroundColor: rgba(LK.cream, 0.4), alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 } as any}
              >
                <Icon name="crown" size={16} color={shade(LK.gold, 0.5)} />
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13.5, color: shade(LK.gold, 0.5) }}>Rich notes are Premium</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', color: LK.ink70, marginBottom: 8 }}>
      {children}
    </Text>
  );
}
