import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  Modal, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator, Image,
} from 'react-native';
import { LK, tint, shade, catColor, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { PIN_CATEGORIES } from '@/constants/categories';
import { PIN_ICON } from '@/constants/milestone-types';
import { useMap } from '@/hooks/useMap';
import { useCouple } from '@/hooks/useCouple';
import { useAuthStore } from '@/stores/auth.store';
import { DateField } from '@/components/ui/DateField';
import type { MapPin } from '@/stores/map.store';
import * as Location from 'expo-location';
import { enrichFromCoords, type PlacesEnrichment } from '@/lib/places';

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
  const [visitedDate, setVisitedDate] = useState(
    editing?.visited_date ?? new Date().toISOString().split('T')[0],
  );
  const [saving, setSaving] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);
  const [enrichment, setEnrichment] = useState<PlacesEnrichment | null>(
    // Pre-populate from existing pin data when editing
    editing?.place_id
      ? {
          place_id: editing.place_id,
          name: editing.name,
          address: editing.address ?? null,
          website: editing.website ?? null,
          photo_url: editing.photo_url ?? null,
        }
      : null,
  );
  const didAutofill = useRef(false);

  const c = catColor(category);
  const lat = coords?.latitude ?? editing?.latitude;
  const lng = coords?.longitude ?? editing?.longitude;

  // ── Auto-fill on new pin drop ───────────────────────────────────────────────
  // Layer 1: free Expo reverse-geocode (place label + street name)
  // Layer 2: Google Places enrichment (official name, address, photo)
  // Both run in parallel; Places result can arrive slightly later and updates
  // state again — the user sees a progressive reveal.
  useEffect(() => {
    if (editing || !coords || didAutofill.current) return;
    didAutofill.current = true;

    (async () => {
      setAutoFilling(true);

      // Layer 1 — free reverse-geocode (fast, always runs)
      try {
        const results = await Location.reverseGeocodeAsync({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        const r = results[0];
        if (r) {
          const placeLabel = [r.city ?? r.subregion ?? r.district, r.country]
            .filter(Boolean)
            .filter((v, i, a) => a.indexOf(v) === i)
            .slice(0, 2)
            .join(', ');
          if (placeLabel) setPlaceName((prev) => prev || placeLabel);
          const suggested = r.name && !/^\d+$/.test(r.name) ? r.name : '';
          if (suggested) setName((prev) => prev || suggested);
        }
      } catch {
        // Degrade gracefully
      }

      // Layer 2 — Google Places enrichment (may take a moment longer)
      const result = await enrichFromCoords(coords.latitude, coords.longitude);
      if (result) {
        setEnrichment(result);
        // Override the name with the official Google name (cleaner than OSM)
        setName((prev) => {
          // Only override if the user hasn't typed their own name yet,
          // or if the current value came from reverse-geocode (not user input)
          return result.name || prev;
        });
      }

      setAutoFilling(false);
    })();
  }, [coords, editing]);

  async function handleSave() {
    if (!name.trim()) return;
    const coupleId = couple?.id ?? useAuthStore.getState().profile?.couple_id;
    if (!coupleId) {
      Alert.alert('Setting up', 'Your shared space is still loading. Try again in a moment.');
      return;
    }
    setSaving(true);
    try {
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
        } catch {}
      }
      if (latitude == null || longitude == null) {
        setSaving(false);
        Alert.alert(
          'Where is this place?',
          'Enter a recognizable place name (like a city) so we can locate it, or tap the spot on the map.',
        );
        return;
      }

      const placeFields = {
        place_id: enrichment?.place_id ?? null,
        address: enrichment?.address ?? null,
        website: enrichment?.website ?? null,
        photo_url: enrichment?.photo_url ?? null,
      };

      if (editing) {
        await updatePin(editing.id, {
          name: name.trim(),
          category,
          place_name: placeName.trim() || null,
          visited_date: visitedDate,
          latitude,
          longitude,
          ...placeFields,
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
          ...placeFields,
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.4)' }}
          onPress={onClose}
          accessibilityLabel="Close"
        />
        <View style={{ backgroundColor: LK.parchment, borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '88%' }}>
          {/* Handle */}
          <View style={{ paddingTop: 14, paddingBottom: 6, alignItems: 'center' }}>
            <View style={{ width: 38, height: 5, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.15)' }} />
          </View>

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingBottom: 12 }}>
            <ScalePressable onPress={onClose} haptic={false} accessibilityRole="button" accessibilityLabel="Cancel" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ minHeight: 44, justifyContent: 'center', paddingRight: 8 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15.5, color: LK.ink70 }}>Cancel</Text>
            </ScalePressable>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 18, color: LK.espresso }}>
              {editing ? 'Edit pin' : 'Add a pin'}
            </Text>
            <ScalePressable
              onPress={handleSave}
              disabled={!name.trim() || saving || autoFilling}
              accessibilityLabel="Save pin"
              style={{
                backgroundColor: name.trim() && !autoFilling ? LK.espresso : 'rgba(42,33,26,0.15)',
                borderRadius: 9999, paddingHorizontal: 18, minHeight: 44, justifyContent: 'center',
              }}
            >
              {saving
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: name.trim() && !autoFilling ? '#fff' : LK.ink70 }}>Save</Text>
              }
            </ScalePressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 40 }}
          >
            {/* ── Photo banner (appears when Places returns a photo) ─────── */}
            {enrichment?.photo_url ? (
              <View style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 18, height: 160 }}>
                <Image
                  source={{ uri: enrichment.photo_url }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                {/* Subtle gradient overlay so text is legible if we add it */}
                <View style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: 48,
                  backgroundColor: 'rgba(0,0,0,0.22)',
                }} />
              </View>
            ) : null}

            {/* ── Location / auto-fill status ───────────────────────────── */}
            <View style={{
              backgroundColor: LK.ivory, borderRadius: 16, padding: 14,
              flexDirection: 'row', alignItems: 'center', gap: 10,
              marginBottom: 18, ...theme.shadow.sm,
            }}>
              <Icon name="mapPin" size={18} color={lat != null ? c.deep : LK.ink70} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: lat != null ? LK.espresso : LK.ink70 }}>
                  {autoFilling
                    ? 'Finding this place…'
                    : lat != null && lng != null
                    ? `Location set · ${lat.toFixed(3)}, ${lng.toFixed(3)}`
                    : "We'll locate the place name you enter below"}
                </Text>
                {enrichment?.address && !autoFilling && (
                  <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70, marginTop: 3 }}>
                    {enrichment.address}
                  </Text>
                )}
              </View>
              {autoFilling && <ActivityIndicator size="small" color={c.deep} />}
            </View>

            {/* ── Name ─────────────────────────────────────────────────── */}
            <FieldLabel>Name</FieldLabel>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. The little bridge"
              placeholderTextColor={LK.ink70}
              style={{
                backgroundColor: LK.ivory, borderRadius: 16, padding: 14,
                fontFamily: theme.fonts.body, fontSize: 16, color: LK.espresso,
                marginBottom: 18, ...theme.shadow.sm,
              }}
            />

            {/* ── Place ────────────────────────────────────────────────── */}
            <FieldLabel>Place</FieldLabel>
            <TextInput
              value={placeName}
              onChangeText={setPlaceName}
              placeholder="City or neighbourhood"
              placeholderTextColor={LK.ink70}
              style={{
                backgroundColor: LK.ivory, borderRadius: 16, padding: 14,
                fontFamily: theme.fonts.body, fontSize: 16, color: LK.espresso,
                marginBottom: 18, ...theme.shadow.sm,
              }}
            />

            {/* ── Website chip (if Places returned one) ─────────────────── */}
            {enrichment?.website && !autoFilling && (
              <View style={{ marginBottom: 18 }}>
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 8,
                  backgroundColor: tint(LK.sky, 0.75), borderRadius: 12,
                  paddingHorizontal: 14, paddingVertical: 10,
                  alignSelf: 'flex-start',
                }}>
                  <Icon name="share" size={14} color={shade(LK.sky, 0.5)} />
                  <Text
                    numberOfLines={1}
                    style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: shade(LK.sky, 0.5) }}
                  >
                    {enrichment.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                  </Text>
                </View>
              </View>
            )}

            {/* ── Category ────────────────────────────────────────────── */}
            <FieldLabel>Category</FieldLabel>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {PIN_CATEGORIES.map((cat) => {
                const cc = catColor(cat.id);
                const on = category === cat.id;
                return (
                  <ScalePressable
                    key={cat.id}
                    onPress={() => setCategory(cat.id)}
                    scaleTo={0.95}
                    accessibilityLabel={cat.label}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 6,
                      backgroundColor: on ? cc.base : tint(cc.base, 0.82),
                      borderRadius: 9999, paddingHorizontal: 13, paddingVertical: 9,
                    }}
                  >
                    <Icon name={PIN_ICON[cat.id] ?? 'mapPin'} size={16} color={cc.deep} />
                    <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: cc.deep }}>
                      {cat.label}
                    </Text>
                  </ScalePressable>
                );
              })}
            </View>

            {/* ── Date visited ─────────────────────────────────────────── */}
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
    <Text style={{
      fontFamily: theme.fonts.body, fontSize: 12, fontWeight: '800',
      letterSpacing: 0.8, textTransform: 'uppercase', color: LK.ink70, marginBottom: 8,
    }}>
      {children}
    </Text>
  );
}
