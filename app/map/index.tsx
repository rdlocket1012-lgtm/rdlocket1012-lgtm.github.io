import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, ScrollView,
  Platform, Animated, Image, Linking,
} from 'react-native';
import Mapbox, {
  MapView, Camera, PointAnnotation, UserLocation,
} from '@rnmapbox/maps';
import { LinearGradient } from 'expo-linear-gradient';
import { LK, tint, shade, catColor, rgba, theme } from '@/constants/theme';
import { useMap } from '@/hooks/useMap';
import { useCouple } from '@/hooks/useCouple';
import { useBucketList } from '@/hooks/useBucketList';
import { FREE_LIMITS } from '@/constants/free-limits';
import { PIN_ICON } from '@/constants/milestone-types';
import { PIN_CATEGORIES } from '@/constants/categories';
import { LOCKET_MAP_STYLE } from '@/constants/map-style';
import { router } from 'expo-router';
import { IconChip } from '@/components/ui/icon-chip';
import { Chip } from '@/components/ui/chip';
import { RoundIcon } from '@/components/ui/round-icon';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { Icon } from '@/components/ui/Icon';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { AddPinModal } from '@/components/map/AddPinModal';
import { PaywallModal } from '@/components/paywall/PaywallModal';
import type { MapPin } from '@/stores/map.store';
import { FadeSlideIn } from '@/components/ui/FadeSlideIn';

// Default camera: centered roughly on Europe / world overview
const DEFAULT_CENTER: [number, number] = [2.3522, 48.8566]; // [lng, lat]
const DEFAULT_ZOOM = 2;

export default function MapScreen() {
  const { pins, loading } = useMap();
  const { isPremium } = useCouple();
  const { items: bucketItems } = useBucketList();
  const wishlistPins = bucketItems.filter(
    (b) => !b.is_done && b.latitude != null && b.longitude != null,
  );

  const [selected, setSelected] = useState<MapPin | null>(null);
  const [sheet, setSheet] = useState<'addPin' | 'editPin' | 'paywall' | null>(null);
  const [view, setView] = useState<'map' | 'list'>('map');
  const [filter, setFilter] = useState<string>('all');
  const [pendingCoords, setPendingCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const atCap = !isPremium && pins.length >= FREE_LIMITS.MAP_PINS;

  // Category filter (§13.15) — applied to both map markers and the list.
  const visiblePins = filter === 'all' ? pins : pins.filter((p) => p.category === filter);

  function handleAddPress() {
    if (atCap) { setSheet('paywall'); return; }
    setSelected(null);
    setPendingCoords(null);
    setSheet('addPin');
  }

  function handleMapPress(feature: GeoJSON.Feature) {
    if (view !== 'map' || sheet) return;
    if (atCap) { setSheet('paywall'); return; }
    const coords = (feature.geometry as GeoJSON.Point).coordinates;
    setPendingCoords({ latitude: coords[1], longitude: coords[0] });
    setSheet('addPin');
  }

  const catLabel = (catId: string) =>
    PIN_CATEGORIES.find((c) => c.id === catId)?.label ?? catId;

  return (
    <View style={{ flex: 1 }}>
      {/* ── Mapbox map (always rendered underneath) ─────────────────────── */}
      <MapView
        style={{ flex: 1 }}
        styleURL={LOCKET_MAP_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled={false}
        scaleBarEnabled={false}
        onPress={handleMapPress}
      >
        <Camera
          defaultSettings={{ centerCoordinate: DEFAULT_CENTER, zoomLevel: DEFAULT_ZOOM }}
          animationMode="easeTo"
          animationDuration={400}
        />

        <UserLocation visible />

        {/* Visited pins */}
        {visiblePins.map((pin) => {
          const c = catColor(pin.category);
          const isSelected = selected?.id === pin.id;
          return (
            <PointAnnotation
              key={pin.id}
              id={pin.id}
              coordinate={[pin.longitude, pin.latitude]}
              onSelected={() => setSelected(pin)}
            >
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  width: isSelected ? 46 : 38,
                  height: isSelected ? 46 : 38,
                  borderRadius: isSelected ? 23 : 19,
                  backgroundColor: c.base,
                  borderWidth: 3,
                  borderColor: isSelected ? LK.ivory : '#fff',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: LK.espresso,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isSelected ? 0.35 : 0.2,
                  shadowRadius: isSelected ? 10 : 6,
                  elevation: isSelected ? 8 : 4,
                }}>
                  <Icon
                    name={PIN_ICON[pin.category] ?? 'mapPin'}
                    size={isSelected ? 22 : 18}
                    color="#fff"
                    strokeWidth={2.5}
                  />
                </View>
                {/* Teardrop tail */}
                <View style={{
                  width: 0, height: 0,
                  borderLeftWidth: 5, borderRightWidth: 5,
                  borderTopWidth: 7,
                  borderLeftColor: 'transparent',
                  borderRightColor: 'transparent',
                  borderTopColor: c.base,
                  marginTop: -1,
                }} />
              </View>
            </PointAnnotation>
          );
        })}

        {/* Wishlist pins (bucket list items with a location) */}
        {wishlistPins.map((b) => (
          <PointAnnotation
            key={`wish-${b.id}`}
            id={`wish-${b.id}`}
            coordinate={[b.longitude!, b.latitude!]}
          >
            <View style={{ alignItems: 'center' }}>
              <View style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: LK.ivory,
                borderWidth: 2.5, borderColor: LK.marigold,
                alignItems: 'center', justifyContent: 'center',
                shadowColor: LK.espresso,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.15, shadowRadius: 5,
                elevation: 3,
              }}>
                <Icon name="star" size={16} color={shade(LK.marigold, 0.45)} strokeWidth={2.5} />
              </View>
              <View style={{
                width: 0, height: 0,
                borderLeftWidth: 4, borderRightWidth: 4, borderTopWidth: 6,
                borderLeftColor: 'transparent', borderRightColor: 'transparent',
                borderTopColor: LK.marigold, marginTop: -1,
              }} />
            </View>
          </PointAnnotation>
        ))}
      </MapView>

      {/* ── List-view solid backdrop ─────────────────────────────────────── */}
      {view === 'list' && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: LK.parchment }} />
      )}

      {/* ── Map-view floating overlay: back · controls · filter chips ─────── */}
      {view === 'map' && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }} pointerEvents="box-none">
          {/* Parchment gradient keeps chips legible over any map tile */}
          <LinearGradient
            colors={[rgba(LK.parchment, 0.9), 'transparent']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 170 }}
            pointerEvents="none"
          />
          <View style={{ paddingTop: 56, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ backgroundColor: rgba('#ffffff', 0.92), borderRadius: 22, ...theme.shadow.sm }}>
              <RoundIcon onPress={() => router.back()}><Icon name="chevL" size={20} color={LK.espresso} /></RoundIcon>
            </View>
            <MapControls view={view} setView={setView} onAdd={handleAddPress} atCap={atCap} floating />
          </View>
          <FilterChips filter={filter} setFilter={setFilter} style={{ marginTop: 12 }} />
        </View>
      )}

      {/* ── List view overlay ────────────────────────────────────────────── */}
      {view === 'list' && (
        <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: LK.parchment }}>
          <ScreenHeader
            eyebrow="Our"
            title="Map"
            onBack={() => router.back()}
            right={<MapControls view={view} setView={setView} onAdd={handleAddPress} atCap={atCap} />}
          />
          <FilterChips filter={filter} setFilter={setFilter} style={{ marginTop: 6, marginBottom: 4, flexGrow: 0, flexShrink: 0 }} />
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: theme.layout.screenX, paddingTop: 8, paddingBottom: 120, gap: 10 }}
          >
            {loading ? (
              <View style={{ paddingTop: 20, gap: 10 }}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height={74} radius={theme.radii.sm} />
                ))}
              </View>
            ) : pins.length === 0 ? (
              <View style={{ alignItems: 'center', paddingTop: 60, gap: 12 }}>
                <IconChip color={LK.lilac} size={64}>
                  <Icon name="mapPin" size={30} color={shade(LK.lilac, 0.5)} />
                </IconChip>
                <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 22, color: LK.espresso, textAlign: 'center' }}>
                  No places pinned yet
                </Text>
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, color: LK.ink70, textAlign: 'center', maxWidth: 240, lineHeight: 21 }}>
                  Switch to the map and tap ＋ to drop your first pin.
                </Text>
              </View>
            ) : visiblePins.length === 0 ? (
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5, color: LK.sepia, textAlign: 'center', paddingTop: 48 }}>
                No pins in this filter yet.
              </Text>
            ) : visiblePins.map((pin) => {
              const cc = catColor(pin.category);
              return (
                <ScalePressable
                  key={pin.id}
                  scaleTo={0.98}
                  onPress={() => setSelected(pin)}
                  accessibilityLabel={pin.name}
                  style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.sm, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 13, ...theme.shadow.sm }}
                >
                  <IconChip color={cc.base} size={46}>
                    <Icon name={PIN_ICON[pin.category] ?? 'mapPin'} size={22} color={cc.deep} />
                  </IconChip>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 18, color: LK.espresso }}>{pin.name}</Text>
                    <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70, marginTop: 2 }}>
                      {[pin.place_name, pin.visited_date
                        ? new Date(pin.visited_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
                        : null]
                        .filter(Boolean).join(' · ') || catLabel(pin.category)}
                    </Text>
                  </View>
                  <Icon name="chevR" size={18} color={LK.ink70} />
                </ScalePressable>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      )}

      {/* ── First-use hint ───────────────────────────────────────────────── */}
      {view === 'map' && pins.length === 0 && (
        <View style={{
          position: 'absolute', top: 120, left: 14, right: 14,
          backgroundColor: rgba('#ffffff', 0.92), borderRadius: 16,
          paddingVertical: 12, paddingHorizontal: 16,
          flexDirection: 'row', alignItems: 'center', gap: 10, ...theme.shadow.sm,
        }}>
          <Icon name="mapPin" size={18} color={LK.espresso} />
          <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: LK.espresso }}>
            Tap the map to drop a pin, or ＋ to add a place by name
          </Text>
        </View>
      )}

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      {view === 'map' && (
        <View style={{ position: 'absolute', left: 14, right: 14, bottom: 90 }}>
          <View style={{ backgroundColor: rgba('#ffffff', 0.92), borderRadius: 22, padding: 14, ...theme.shadow.card }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
              <StatCell n={String(pins.length)} label="visited" />
              <View style={{ width: 1, height: 30, backgroundColor: LK.hairline }} />
              <StatCell n={String(wishlistPins.length)} label="wishlist" />
              <View style={{ width: 1, height: 30, backgroundColor: LK.hairline }} />
              <StatCell n={String(new Set(pins.map((p) => p.country).filter(Boolean)).size)} label="countries" />
            </View>
          </View>
        </View>
      )}

      {/* ── Pin detail sheet ─────────────────────────────────────────────── */}
      {selected && (
        <PinDetailSheet
          pin={selected}
          onClose={() => setSelected(null)}
          onEdit={() => setSheet('editPin')}
          catLabel={catLabel}
        />
      )}

      {sheet === 'addPin' && (
        <AddPinModal
          coords={pendingCoords ?? undefined}
          onClose={() => { setSheet(null); setPendingCoords(null); }}
        />
      )}
      {sheet === 'editPin' && selected && (
        <AddPinModal
          editing={selected}
          onClose={() => { setSheet(null); setSelected(null); }}
        />
      )}
      {sheet === 'paywall' && <PaywallModal onClose={() => setSheet(null)} />}
    </View>
  );
}

// ─── Pin Detail Sheet ─────────────────────────────────────────────────────────
function PinDetailSheet({ pin, onClose, onEdit, catLabel }: {
  pin: MapPin;
  onClose: () => void;
  onEdit: () => void;
  catLabel: (id: string) => string;
}) {
  const translateY = useRef(new Animated.Value(320)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 200, mass: 0.9 }),
      Animated.timing(backdropOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  function dismiss() {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 320, duration: 220, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(onClose);
  }

  const cc = catColor(pin.category);

  return (
    <View style={{ position: 'absolute', inset: 0 }}>
      <Animated.View style={{ flex: 1, backgroundColor: 'rgba(42,33,26,0.28)', opacity: backdropOpacity }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={dismiss} activeOpacity={1} />
      </Animated.View>

      <Animated.View style={{
        backgroundColor: LK.parchment, borderTopLeftRadius: 32, borderTopRightRadius: 32,
        paddingBottom: 120, ...theme.shadow.card,
        transform: [{ translateY }],
      }}>
        {/* Drag handle */}
        <View style={{ width: 38, height: 5, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.15)', alignSelf: 'center', marginTop: 14, marginBottom: 16 }} />

        {/* Photo banner */}
        {pin.photo_url ? (
          <View style={{ marginHorizontal: 22, borderRadius: 20, overflow: 'hidden', marginBottom: 18, height: 150 }}>
            <Image
              source={{ uri: pin.photo_url }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
        ) : null}

        <View style={{ paddingHorizontal: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <IconChip color={cc.base} size={56}>
              <Icon name={PIN_ICON[pin.category] ?? 'mapPin'} size={26} color={cc.deep} />
            </IconChip>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 25, color: LK.espresso, letterSpacing: -0.5 }}>
                {pin.name}
              </Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 13.5, fontWeight: '700', color: cc.deep, marginTop: 4 }}>
                {pin.place_name ?? pin.country ?? ''}
              </Text>
            </View>
            <ScalePressable
              onPress={onEdit}
              accessibilityLabel="Edit pin"
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(42,33,26,0.06)', alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name="pen" size={18} color={LK.espresso} />
            </ScalePressable>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <Chip color={cc.base} active>{catLabel(pin.category)}</Chip>
            {pin.visited_date && (
              <Chip color={LK.sage}>
                {new Date(pin.visited_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
              </Chip>
            )}
          </View>

          {/* Address */}
          {pin.address && (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 14 }}>
              <View style={{ marginTop: 2 }}>
                <Icon name="mapPin" size={15} color={LK.ink70} />
              </View>
              <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontSize: 14, color: LK.ink70, lineHeight: 20 }}>
                {pin.address}
              </Text>
            </View>
          )}

          {/* Website */}
          {pin.website && (
            <TouchableOpacity
              onPress={() => Linking.openURL(pin.website!).catch(() => {})}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}
            >
              <Icon name="share" size={15} color={shade(LK.sky, 0.5)} />
              <Text numberOfLines={1} style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: shade(LK.sky, 0.5) }}>
                {pin.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
              </Text>
            </TouchableOpacity>
          )}

          {pin.note && (
            <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 18, color: LK.ink70, marginTop: 16, lineHeight: 26 }}>
              "{pin.note}"
            </Text>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Stat Cell ────────────────────────────────────────────────────────────────
function StatCell({ n, label }: { n: string; label: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 24, color: LK.espresso, lineHeight: 26 }}>{n}</Text>
      <Text style={{ fontFamily: theme.fonts.body, fontSize: 11, fontWeight: '700', color: LK.ink70, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

// ─── Filter chips (§13.15) ──────────────────────────────────────────────────
function FilterChips({ filter, setFilter, style }: {
  filter: string;
  setFilter: (id: string) => void;
  style?: any;
}) {
  const chips = [{ id: 'all', label: 'All' }, ...PIN_CATEGORIES];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      style={style}
    >
      {chips.map((c) => {
        const active = filter === c.id;
        return (
          <TouchableOpacity
            key={c.id}
            onPress={() => setFilter(c.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={{
              height: 36, paddingHorizontal: 16, borderRadius: 99,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: active ? LK.coral : rgba(LK.vellum, 0.85),
              borderWidth: active ? 0 : 1.5, borderColor: LK.hairline,
              ...theme.shadow.sm,
            }}
          >
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: active ? '700' : '500', fontSize: 13, color: active ? LK.vellum : LK.espresso }}>
              {c.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── Map Controls ─────────────────────────────────────────────────────────────
function MapControls({ view, setView, onAdd, atCap = false, floating = false }: {
  view: 'map' | 'list';
  setView: (v: 'map' | 'list') => void;
  onAdd: () => void;
  atCap?: boolean;
  floating?: boolean;
}) {
  const toggleBg = floating ? rgba('#ffffff', 0.92) : 'rgba(42,33,26,0.06)';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ flexDirection: 'row', backgroundColor: toggleBg, borderRadius: 9999, padding: 4, ...(floating ? theme.shadow.sm : {}) }}>
        {(['map', 'list'] as const).map((v) => (
          <ScalePressable
            key={v}
            onPress={() => setView(v)}
            style={{
              width: 44, height: 44, borderRadius: 9999,
              backgroundColor: view === v ? LK.espresso : 'transparent',
              alignItems: 'center', justifyContent: 'center',
            }}
            accessibilityLabel={`${v} view`}
          >
            <Icon name={v === 'map' ? 'mapPin' : 'list'} size={19} color={view === v ? '#fff' : LK.ink70} />
          </ScalePressable>
        ))}
      </View>
      <ScalePressable
        onPress={onAdd}
        accessibilityLabel="Add pin"
        style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: LK.coral, alignItems: 'center', justifyContent: 'center', ...theme.shadow.card }}
      >
        <Icon name="plus" size={26} color="#fff" />
        {atCap && (
          <View style={{ position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: LK.gold, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: LK.vellum }}>
            <Icon name="lock" size={10} color="#fff" strokeWidth={2.5} />
          </View>
        )}
      </ScalePressable>
    </View>
  );
}
