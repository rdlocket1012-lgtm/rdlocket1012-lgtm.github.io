import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LK, tint, shade, catColor, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { PIN_CATEGORIES } from '@/constants/categories';
import { PIN_ICON } from '@/constants/milestone-types';
import { useMap } from '@/hooks/useMap';
import { useCouple } from '@/hooks/useCouple';
import { useAuthStore } from '@/stores/auth.store';
import { DateField } from '@/components/ui/DateField';
import type { MapPin } from '@/stores/map.store';
import * as Location from 'expo-location';

interface Props {
  onClose: () => void;
  editing?: MapPin;
  coords?: { latitude: number; longitude: number };
}

export function AddPinModal({ onClose, editing, coords }: Props) {
  const { addPin, updatePin } = useMap();
  const { couple } = useCouple();
  const [category, setCategory] = useState(editing?.category ?? 'trip');
  const [name, setName] = useState(editing?.name ?? '');
  const [placeName, setPlaceName] = useState(editing?.place_name ?? '');
  const [visitedDate, setVisitedDate] = useState(editing?.visited_date ?? new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const c = catColor(category);
  const lat = coords?.latitude ?? editing?.latitude;
  const lng = coords?.longitude ?? editing?.longitude;

  async function handleSave() {
    if (!name.trim()) return;
    const coupleId = couple?.id ?? useAuthStore.getState().profile?.couple_id;
    if (!coupleId) {
      Alert.alert('Setting up', 'Your shared space is still loading. Try again in a moment.');
      return;
    }
    setSaving(true);
    try {
      // Resolve coordinates: use map-picked / existing coords, else geocode the place name.
      let latitude = lat;
      let longitude = lng;
      if (latitude == null || longitude == null) {
        const query = placeName.trim() || name.trim();
        try {
          const results = await Location.geocodeAsync(query);
          if (results[0]) {
            latitude = results[0].latitude;
            longitude = results[0].longitude;
          }
        } catch {
          // geocoding unavailable — fall through to the guard below
        }
      }
      if (latitude == null || longitude == null) {
        setSaving(false);
        Alert.alert(
          'Where is this place?',
          'Enter a recognizable place name (like a city) so we can locate it, or close this and tap the spot on the map.'
        );
        return;
      }

      if (editing) {
        await updatePin(editing.id, {
          name: name.trim(),
          category,
          place_name: placeName.trim() || null,
          visited_date: visitedDate,
          latitude,
          longitude,
        });
      } else {
        await addPin({
          couple_id: coupleId,
          name: name.trim(),
          category,
          place_name: placeName.trim() || null,
          latitude,
          longitude,
          country: null,
          visited_date: visitedDate,
          note: null,
          added_by: null,
          deleted_at: null,
        });
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.4)' }} onPress={onClose} activeOpacity={1} />
      <View style={{ backgroundColor: LK.cream, borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '80%' }}>
        <View style={{ paddingTop: 14, paddingBottom: 6, alignItems: 'center' }}>
          <View style={{ width: 38, height: 5, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.15)' }} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingBottom: 12 }}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15.5, color: LK.ink70 }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 18, color: LK.ink }}>{editing ? 'Edit pin' : 'Add a pin'}</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!name.trim() || saving}
            style={{ backgroundColor: name.trim() ? LK.ink : 'rgba(42,33,26,0.15)', borderRadius: 9999, paddingHorizontal: 18, paddingVertical: 10 }}
          >
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: name.trim() ? '#fff' : LK.ink70 }}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 40 }}>
          {/* Location indicator */}
          <View style={{ backgroundColor: LK.ivory, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18, ...theme.shadow.sm }}>
            <Icon name="mapPin" size={18} color={lat != null ? c.deep : LK.ink70} />
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: lat != null ? LK.ink : LK.ink70 }}>
              {lat != null && lng != null
                ? `Location set · ${lat.toFixed(3)}, ${lng.toFixed(3)}`
                : "We'll locate the place name you enter below"}
            </Text>
          </View>

          <FieldLabel>Name</FieldLabel>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. The little bridge"
            placeholderTextColor={LK.ink70}
            style={{ backgroundColor: LK.ivory, borderRadius: 16, padding: 14, fontFamily: theme.fonts.body, fontSize: 16, color: LK.ink, marginBottom: 18, ...theme.shadow.sm }}
          />

          <FieldLabel>Place</FieldLabel>
          <TextInput
            value={placeName}
            onChangeText={setPlaceName}
            placeholder="City or neighbourhood"
            placeholderTextColor={LK.ink70}
            style={{ backgroundColor: LK.ivory, borderRadius: 16, padding: 14, fontFamily: theme.fonts.body, fontSize: 16, color: LK.ink, marginBottom: 18, ...theme.shadow.sm }}
          />

          <FieldLabel>Category</FieldLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            {PIN_CATEGORIES.map((cat) => {
              const cc = catColor(cat.id);
              const on = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategory(cat.id)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    backgroundColor: on ? cc.base : tint(cc.base, 0.82),
                    borderRadius: 9999, paddingHorizontal: 13, paddingVertical: 9,
                  }}
                >
                  <Icon name={PIN_ICON[cat.id] ?? 'mapPin'} size={16} color={cc.deep} />
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: cc.deep }}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <FieldLabel>Date visited</FieldLabel>
          <DateField value={visitedDate} onChange={setVisitedDate} />
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
