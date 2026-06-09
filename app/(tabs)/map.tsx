import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Platform, Animated } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { LK, tint, shade, catColor, rgba, theme } from '@/constants/theme';
import { useMap } from '@/hooks/useMap';
import { useCouple } from '@/hooks/useCouple';
import { FREE_LIMITS } from '@/constants/free-limits';
import { PIN_ICON } from '@/constants/milestone-types';
import { PIN_CATEGORIES } from '@/constants/categories';
import { IconChip, Chip } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';
import { TabHeader } from '@/components/ui/TabHeader';
import { AddPinModal } from '@/components/map/AddPinModal';
import { PaywallModal } from '@/components/paywall/PaywallModal';
import type { MapPin } from '@/stores/map.store';
import { FadeSlideIn } from '@/components/ui/FadeSlideIn';

// ─── Warm map style (Android / Google Maps) ────────────────────────────────
// Matches Locket's cream/ivory palette: parchment ground, muted sage parks,
// grey-blue water, minimal POI clutter.
const WARM_MAP_STYLE = [
  { elementType: 'geometry',            stylers: [{ color: '#f5ebe0' }] },
  { elementType: 'labels.text.fill',    stylers: [{ color: '#2a211a' }] },
  { elementType: 'labels.text.stroke',  stylers: [{ color: '#fdf6ec' }] },
  { featureType: 'road',               elementType: 'geometry',        stylers: [{ color: '#fff0d4' }] },
  { featureType: 'road.arterial',      elementType: 'geometry',        stylers: [{ color: '#ffe8b6' }] },
  { featureType: 'road.highway',       elementType: 'geometry',        stylers: [{ color: '#f8d49a' }] },
  { featureType: 'road.highway',       elementType: 'geometry.stroke', stylers: [{ color: '#e8c070' }] },
  { featureType: 'water',              elementType: 'geometry',        stylers: [{ color: '#c4d4e0' }] },
  { featureType: 'water',              elementType: 'labels.text.fill',stylers: [{ color: '#7a96aa' }] },
  { featureType: 'poi.park',           elementType: 'geometry',        stylers: [{ color: '#dde8d0' }] },
  { featureType: 'poi.park',           elementType: 'labels.text.fill',stylers: [{ color: '#7a9870' }] },
  { featureType: 'poi',                elementType: 'labels.icon',     stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',                                             stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative',     elementType: 'geometry.stroke', stylers: [{ color: '#d4c5b0' }] },
  { featureType: 'landscape.natural',  elementType: 'geometry',        stylers: [{ color: '#eee0cc' }] },
];

export default function MapScreen() {
  const { pins } = useMap();
  const { isPremium } = useCouple();
  const [selected, setSelected] = useState<MapPin | null>(null);
  const [sheet, setSheet] = useState<'addPin' | 'editPin' | 'paywall' | null>(null);
  const [view, setView] = useState<'map' | 'list'>('list');
  const [pendingCoords, setPendingCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const atCap = !isPremium && pins.length >= FREE_LIMITS.MAP_PINS;

  function handleAddPress() {
    if (atCap) { setSheet('paywall'); return; }
    setSelected(null);
    setPendingCoords(null); // manual entry — geocode from the place name
    setSheet('addPin');
  }

  function handleMapPress(e: any) {
    if (view !== 'map' || sheet) return;
    if (atCap) { setSheet('paywall'); return; }
    setPendingCoords(e.nativeEvent.coordinate);
    setSheet('addPin');
  }

  const catLabel = (catId: string) => PIN_CATEGORIES.find((c) => c.id === catId)?.label ?? catId;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{ latitude: 48.8566, longitude: 2.3522, latitudeDelta: 30, longitudeDelta: 30 }}
        showsUserLocation
        showsPointsOfInterest={false}
        showsTraffic={false}
        showsBuildings={false}
        mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
        customMapStyle={Platform.OS === 'android' ? WARM_MAP_STYLE : undefined}
        onPress={handleMapPress}
      >
        {pins.map((pin) => {
          const c = catColor(pin.category);
          const isSelected = selected?.id === pin.id;
          return (
            <Marker
              key={pin.id}
              coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
              onPress={() => setSelected(pin)}
              accessibilityLabel={pin.name}
              tracksViewChanges={false}
            >
              {/* Teardrop pin: circle icon + pointed tail */}
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  width: isSelected ? 46 : 38, height: isSelected ? 46 : 38,
                  borderRadius: isSelected ? 23 : 19,
                  backgroundColor: c.base,
                  borderWidth: 3, borderColor: isSelected ? LK.ivory : '#fff',
                  alignItems: 'center', justifyContent: 'center',
                  shadowColor: LK.ink, shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isSelected ? 0.35 : 0.2, shadowRadius: isSelected ? 10 : 6,
                  elevation: isSelected ? 8 : 4,
                }}>
                  <Icon name={PIN_ICON[pin.category] ?? 'mapPin'} size={isSelected ? 22 : 18} color="#fff" strokeWidth={2.5} />
                </View>
                {/* Tail */}
                <View style={{
                  width: 0, height: 0,
                  borderLeftWidth: 5, borderRightWidth: 5,
                  borderTopWidth: 7,
                  borderLeftColor: 'transparent', borderRightColor: 'transparent',
                  borderTopColor: c.base,
                  marginTop: -1,
                }} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* List-view backdrop: fills the whole screen so the map doesn't peek through behind the header */}
      {view === 'list' && <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: LK.cream }} />}

      {/* Map-view floating header (justified: it floats over the map) */}
      {view === 'map' && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 56, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ backgroundColor: rgba('#ffffff', 0.92), borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10, ...theme.shadow.sm }}>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', color: LK.ink70 }}>Our</Text>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 26, letterSpacing: -1, color: LK.ink, lineHeight: 28 }}>Map</Text>
          </View>
          <MapControls view={view} setView={setView} onAdd={handleAddPress} floating />
        </View>
      )}

      {/* List view overlay — full solid screen with a standard TabHeader */}
      {view === 'list' && (
        <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: LK.cream }}>
          <TabHeader
            eyebrow="Our"
            title="Map"
            right={<MapControls view={view} setView={setView} onAdd={handleAddPress} />}
          />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: theme.layout.screenX, paddingTop: 14, paddingBottom: 120, gap: 10 }}>
            {pins.length === 0 ? (
              <View style={{ alignItems: 'center', paddingTop: 60, gap: 12 }}>
                <IconChip color={LK.lilac} size={64}><Icon name="mapPin" size={30} color={shade(LK.lilac, 0.5)} /></IconChip>
                <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 22, color: LK.ink, textAlign: 'center' }}>No places pinned yet</Text>
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, color: LK.ink70, textAlign: 'center', maxWidth: 240, lineHeight: 21 }}>
                  Switch to the map and tap ＋ to drop your first pin.
                </Text>
              </View>
            ) : pins.map((pin) => {
              const cc = catColor(pin.category);
              return (
                <TouchableOpacity
                  key={pin.id}
                  onPress={() => setSelected(pin)}
                  activeOpacity={0.85}
                  style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.sm, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 13, ...theme.shadow.sm }}
                >
                  <IconChip color={cc.base} size={46}><Icon name={PIN_ICON[pin.category] ?? 'mapPin'} size={22} color={cc.deep} /></IconChip>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 18, color: LK.ink }}>{pin.name}</Text>
                    <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70, marginTop: 2 }}>
                      {[pin.place_name, pin.visited_date ? new Date(pin.visited_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : null].filter(Boolean).join(' · ') || catLabel(pin.category)}
                    </Text>
                  </View>
                  <Icon name="chevR" size={18} color={LK.ink70} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      )}

      {/* Hint */}
      {view === 'map' && pins.length === 0 && (
        <View style={{ position: 'absolute', top: 120, left: 14, right: 14, backgroundColor: rgba('#ffffff', 0.92), borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10, ...theme.shadow.sm }}>
          <Icon name="mapPin" size={18} color={LK.ink} />
          <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: LK.ink }}>
            Tap the map to drop a pin, or ＋ to add a place by name
          </Text>
        </View>
      )}

      {/* Stats bar — floats as a translucent card over the map */}
      {view === 'map' && (
        <View style={{ position: 'absolute', left: 14, right: 14, bottom: 90 }}>
          <View style={{ backgroundColor: rgba('#ffffff', 0.92), borderRadius: 22, padding: 14, ...theme.shadow.card }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
              <StatCell n={String(pins.length)} label="pins" />
              <View style={{ width: 1, height: 30, backgroundColor: LK.line }} />
              <StatCell n={String(new Set(pins.map((p) => p.country).filter(Boolean)).size)} label="countries" />
              <View style={{ width: 1, height: 30, backgroundColor: LK.line }} />
              <StatCell n={String(new Set(pins.map((p) => p.category).filter(Boolean)).size)} label="categories" />
            </View>
          </View>
        </View>
      )}

      {/* Pin detail sheet — slides up from bottom */}
      {selected && (
        <PinDetailSheet
          pin={selected}
          onClose={() => setSelected(null)}
          onEdit={() => setSheet('editPin')}
          catLabel={catLabel}
        />
      )}

      {sheet === 'addPin' && <AddPinModal coords={pendingCoords ?? undefined} onClose={() => { setSheet(null); setPendingCoords(null); }} />}
      {sheet === 'editPin' && selected && <AddPinModal editing={selected} onClose={() => { setSheet(null); setSelected(null); }} />}
      {sheet === 'paywall' && <PaywallModal onClose={() => setSheet(null)} />}
    </View>
  );
}

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
      Animated.spring(translateY, {
        toValue: 0, useNativeDriver: true,
        damping: 22, stiffness: 200, mass: 0.9,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1, duration: 220, useNativeDriver: true,
      }),
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
      {/* Dimmed backdrop */}
      <Animated.View style={{ flex: 1, backgroundColor: 'rgba(42,33,26,0.28)', opacity: backdropOpacity }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={dismiss} activeOpacity={1} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={{
        backgroundColor: LK.cream, borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: 22, paddingBottom: 120, ...theme.shadow.card,
        transform: [{ translateY }],
      }}>
        {/* Drag handle */}
        <View style={{ width: 38, height: 5, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.15)', alignSelf: 'center', marginBottom: 20 }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <IconChip color={cc.base} size={56}>
            <Icon name={PIN_ICON[pin.category] ?? 'mapPin'} size={26} color={cc.deep} />
          </IconChip>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 25, color: LK.ink, letterSpacing: -0.5 }}>{pin.name}</Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 13.5, fontWeight: '700', color: cc.deep, marginTop: 4 }}>
              {pin.place_name ?? pin.country ?? ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onEdit}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(42,33,26,0.06)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="pen" size={18} color={LK.ink} />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <Chip color={cc.base} active>{catLabel(pin.category)}</Chip>
          {pin.visited_date && (
            <Chip color={LK.sage}>{new Date(pin.visited_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</Chip>
          )}
        </View>

        {pin.note && (
          <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 18, color: LK.ink70, marginTop: 16, lineHeight: 26 }}>
            "{pin.note}"
          </Text>
        )}
      </Animated.View>
    </View>
  );
}

function StatCell({ n, label }: { n: string; label: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 24, color: LK.ink, lineHeight: 26 }}>{n}</Text>
      <Text style={{ fontFamily: theme.fonts.body, fontSize: 11, fontWeight: '700', color: LK.ink70, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

/** Map/list toggle + add-pin button. `floating` = translucent style for map overlay. */
function MapControls({ view, setView, onAdd, floating = false }: {
  view: 'map' | 'list';
  setView: (v: 'map' | 'list') => void;
  onAdd: () => void;
  floating?: boolean;
}) {
  const toggleBg = floating ? rgba('#ffffff', 0.92) : 'rgba(42,33,26,0.06)';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ flexDirection: 'row', backgroundColor: toggleBg, borderRadius: 9999, padding: 4, ...(floating ? theme.shadow.sm : {}) }}>
        {(['map', 'list'] as const).map((v) => (
          <TouchableOpacity
            key={v}
            onPress={() => setView(v)}
            style={{ width: 44, height: 44, borderRadius: 9999, backgroundColor: view === v ? LK.ink : 'transparent', alignItems: 'center', justifyContent: 'center' }}
            accessibilityLabel={`${v} view`}
          >
            <Icon name={v === 'map' ? 'mapPin' : 'list'} size={19} color={view === v ? '#fff' : LK.ink70} />
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        onPress={onAdd}
        accessibilityLabel="Add pin"
        style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: LK.ink, alignItems: 'center', justifyContent: 'center', ...theme.shadow.card }}
      >
        <Icon name="plus" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
