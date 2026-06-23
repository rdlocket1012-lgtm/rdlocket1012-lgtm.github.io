import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import { useDrawStore, type Drawing } from '@/stores/draw.store';
import { useAuth } from '@/hooks/useAuth';
import { usePartner } from '@/hooks/usePartner';
import { LK, theme } from '@/constants/theme';

const SHADOW_DEFAULT  = '0 2px 8px rgba(42,33,26,0.07)';
const SHADOW_FLOATING = '0 8px 28px rgba(42,33,26,0.14)';

// ─── Skeleton cell ────────────────────────────────────────────────────────────

function SkeletonCell({ size }: { size: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 20,
        backgroundColor: LK.ivory,
        boxShadow: SHADOW_DEFAULT,
      } as any}
    />
  );
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
    <Pressable onPress={onPress} onLongPress={onLongPress} style={{ gap: 6 }}>
      <View
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
      </View>
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
    </Pressable>
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

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  drawing,
  isSent,
  partnerName,
  onClose,
}: {
  drawing: Drawing | null;
  isSent: boolean;
  partnerName: string;
  onClose: () => void;
}) {
  const { width } = useWindowDimensions();

  async function handleSave() {
    if (!drawing) return;
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to save drawings.');
      return;
    }
    try {
      await MediaLibrary.saveToLibraryAsync(drawing.image_url);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert('Couldn\'t save', 'Something went wrong saving this drawing.');
    }
  }

  if (!drawing) return null;

  const authorName = isSent ? 'you' : (partnerName || 'your person');
  const ts = new Date(drawing.created_at).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(42,33,26,0.85)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: width - 48,
            height: width - 48,
            borderRadius: 20,
            borderCurve: 'continuous',
            overflow: 'hidden',
            backgroundColor: LK.parchment,
            boxShadow: SHADOW_FLOATING,
          } as any}
        >
          <Image
            source={{ uri: drawing.image_url }}
            style={{ width: width - 48, height: width - 48 }}
            contentFit="contain"
          />
        </View>

        <View style={{ marginTop: 20, alignItems: 'center', gap: 4 }}>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: LK.ivory }}>
            {`by ${authorName}`}
          </Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: LK.faded }}>
            {ts}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
          <Pressable
            onPress={handleSave}
            style={{
              backgroundColor: LK.ivory,
              borderRadius: 99,
              borderCurve: 'continuous',
              paddingHorizontal: 20,
              paddingVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Image source="sf:square.and.arrow.down" style={{ width: 16, height: 16 }} tintColor={LK.espresso} />
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 14, color: LK.espresso }}>
              Save
            </Text>
          </Pressable>
          <Pressable
            onPress={onClose}
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 99,
              borderCurve: 'continuous',
              paddingHorizontal: 20,
              paddingVertical: 10,
            }}
          >
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 14, color: LK.ivory }}>
              Close
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function DrawGalleryScreen() {
  const { profile } = useAuth();
  const { partner } = usePartner();
  const { received, sent, loading, fetchDrawings, subscribeToDrawings } = useDrawStore();
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [lightbox, setLightbox] = useState<Drawing | null>(null);
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
  const isLightboxSent = lightbox ? sent.some((d) => d.id === lightbox.id) : false;

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

  const headerOptions = {
    title: 'Draw',
    headerLargeTitle: true,
    headerStyle: { backgroundColor: LK.parchment },
    headerShadowVisible: false,
    headerRight: () => (
      <Pressable onPress={() => router.push('/draw/compose')} hitSlop={12}>
        <Image source="sf:pencil.and.outline" style={{ width: 22, height: 22 }} tintColor={LK.coral} />
      </Pressable>
    ),
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['bottom']}>
        <Stack.Screen options={headerOptions} />
        {segmentTabs}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20 }}>
          {[0, 1, 2, 3].map((i) => <SkeletonCell key={i} size={CELL_SIZE} />)}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['bottom']}>
      <Stack.Screen options={headerOptions} />

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
            onPress={() => setLightbox(item)}
            onLongPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setLightbox(item);
            }}
          />
        )}
      />

      <Lightbox
        drawing={lightbox}
        isSent={isLightboxSent}
        partnerName={partnerName}
        onClose={() => setLightbox(null)}
      />
    </SafeAreaView>
  );
}
