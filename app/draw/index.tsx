import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Transition from 'react-native-screen-transitions';
import { useDrawStore, type Drawing } from '@/stores/draw.store';
import { useAuth } from '@/hooks/useAuth';
import { usePartner } from '@/hooks/usePartner';
import { LK, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { RoundIcon } from '@/components/ui/round-icon';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Skeleton } from '@/components/ui/Skeleton';

const SHADOW_DEFAULT = '0 2px 8px rgba(42,33,26,0.07)';

// ─── Skeleton cell ────────────────────────────────────────────────────────────

function SkeletonCell({ size }: { size: number }) {
  return <Skeleton width={size} height={size} radius={20} />;
}

// ─── Drawing cell ─────────────────────────────────────────────────────────────

function DrawingCell({
  drawing,
  size,
  onPress,
  onLongPress,
}: {
  drawing: Drawing;
  size: number;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const ts = new Date(drawing.created_at);
  const label = ts.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <View style={{ gap: 6 }}>
      {/* SOURCE of the cell→viewer morph (§10.13). The Trigger IS the image card,
          so the measured bound matches the viewer's square image destination. */}
      <Transition.Boundary.Trigger
        group="drawing"
        id={drawing.id}
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityLabel={`Drawing from ${label}`}
        style={{
          width: size,
          height: size,
          borderRadius: 20,
          borderCurve: 'continuous',
          overflow: 'hidden',
          boxShadow: SHADOW_DEFAULT,
          borderWidth: 1.5,
          borderColor: 'rgba(42,33,26,0.10)',
          backgroundColor: LK.parchment,
        } as any}
      >
        <Image
          source={{ uri: drawing.image_url }}
          style={{ width: size, height: size }}
          contentFit="contain"
          transition={200}
        />
      </Transition.Boundary.Trigger>
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: 10,
          color: LK.faded,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ─── Empty states ─────────────────────────────────────────────────────────────

function EmptyReceived({ partnerName }: { partnerName: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40, paddingVertical: 60 }}>
      <Image source="sf:pencil.and.outline" style={{ width: 48, height: 48 }} tintColor={LK.faded} />
      <Text style={{ fontFamily: theme.fonts.hand, fontSize: 16, color: LK.sepia, textAlign: 'center' }}>
        {`waiting for a drawing\nfrom ${partnerName || 'your person'}`}
      </Text>
    </View>
  );
}

function EmptySent({ partnerName }: { partnerName: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 40, paddingVertical: 60 }}>
      <Text style={{ fontFamily: theme.fonts.hand, fontSize: 16, color: LK.sepia, textAlign: 'center' }}>
        {`draw ${partnerName || 'them'} something little`}
      </Text>
      <Pressable
        onPress={() => router.push('/draw/compose')}
        style={{
          backgroundColor: LK.coral,
          borderRadius: 99,
          borderCurve: 'continuous',
          paddingHorizontal: 24,
          paddingVertical: 12,
        }}
      >
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: LK.vellum }}>
          Draw now
        </Text>
      </Pressable>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function DrawGalleryScreen() {
  const { profile } = useAuth();
  const { partner } = usePartner();
  const { received, sent, loading, fetchDrawings, subscribeToDrawings } = useDrawStore();
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const { width } = useWindowDimensions();

  const coupleId = profile?.couple_id ?? null;
  const userId = profile?.id ?? null;
  const partnerName = partner?.display_name ?? '';

  useEffect(() => {
    if (!coupleId || !userId) return;
    fetchDrawings(coupleId, userId);
    const unsub = subscribeToDrawings(coupleId, userId);
    return unsub;
  }, [coupleId, userId]);

  // 20px side gutters + 8px column gap → each cell gets (width - 48) / 2
  const CELL_SIZE = (width - 48) / 2;

  const drawings = tab === 'received' ? received : sent;

  function openViewer(item: Drawing) {
    router.push({ pathname: '/draw/viewer', params: { id: item.id } });
  }

  const segmentTabs = (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: LK.ivory,
        borderRadius: 99,
        borderCurve: 'continuous',
        borderWidth: 1.5,
        borderColor: 'rgba(42,33,26,0.10)',
        marginHorizontal: 20,
        marginTop: 14,
        marginBottom: 20,
        padding: 3,
      }}
    >
      {(['received', 'sent'] as const).map((t) => (
        <Pressable
          key={t}
          onPress={() => setTab(t)}
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 99,
            borderCurve: 'continuous',
            backgroundColor: tab === t ? LK.espresso : 'transparent',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: theme.fonts.body,
              fontWeight: '700',
              fontSize: 13,
              color: tab === t ? LK.vellum : LK.sepia,
            }}
          >
            {t === 'received' ? 'Received' : 'Sent'}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  // Custom in-screen header — the TransitionNativeStack renders native headers
  // (headerRight/back) as empty white circles (§10.13 GOTCHA 1), so we use the
  // standard ScreenHeader (RoundIcon back + right action) like the rest of the app.
  const header = (
    <ScreenHeader
      eyebrow="Little doodles"
      title="Draw"
      onBack={() => router.back()}
      right={
        <RoundIcon onPress={() => router.push('/draw/compose')}>
          <Icon name="pen" size={20} color={LK.coral} />
        </RoundIcon>
      }
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top']}>
        {header}
        {segmentTabs}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20 }}>
          {[0, 1, 2, 3].map((i) => <SkeletonCell key={i} size={CELL_SIZE} />)}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top']}>
      {header}

      <FlatList
        data={drawings}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{ gap: 8, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingBottom: 80, gap: 8 }}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={() => segmentTabs}
        ListEmptyComponent={
          tab === 'received'
            ? <EmptyReceived partnerName={partnerName} />
            : <EmptySent partnerName={partnerName} />
        }
        renderItem={({ item }) => (
          <DrawingCell
            drawing={item}
            size={CELL_SIZE}
            onPress={() => openViewer(item)}
            onLongPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              openViewer(item);
            }}
          />
        )}
      />
    </SafeAreaView>
  );
}
