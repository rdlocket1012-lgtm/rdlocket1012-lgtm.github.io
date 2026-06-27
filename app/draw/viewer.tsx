import React from 'react';
import { View, Text, Pressable, Alert, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import Transition from 'react-native-screen-transitions';
import { useDrawStore } from '@/stores/draw.store';
import { useAuth } from '@/hooks/useAuth';
import { usePartner } from '@/hooks/usePartner';
import { LK, theme } from '@/constants/theme';

const SHADOW_FLOATING = '0 8px 28px rgba(42,33,26,0.14)';

/**
 * Full-screen drawing viewer — the DESTINATION of the gallery cell→viewer morph
 * (§10.13). The tapped cell (`Boundary.Trigger group="drawing" id`) grows into
 * the image card below (`Boundary.View group="drawing" id`); sharedBoundTag
 * 'drawing'. Rendered as a transparent modal by the SharedAppleMusic preset, so
 * the gallery stays mounted behind the scrim. Looks itself up by `id` from the
 * draw store, mirroring the letter/milestone detail screens.
 */
export default function DrawViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { received, sent } = useDrawStore();
  const { profile } = useAuth();
  const { partner } = usePartner();
  const { width } = useWindowDimensions();

  const drawing = [...received, ...sent].find((d) => d.id === id);
  if (!drawing) return null;

  const isSent = drawing.sender_id === profile?.id;
  const partnerName = partner?.display_name ?? '';
  const authorName = isSent ? 'you' : (partnerName || 'your person');
  const ts = new Date(drawing.created_at).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  });
  const size = width - 48;

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

  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(42,33,26,0.85)', alignItems: 'center', justifyContent: 'center' }}>
      <Transition.Boundary.View
        group="drawing"
        id={drawing.id}
        style={{
          width: size,
          height: size,
          borderRadius: 20,
          borderCurve: 'continuous',
          overflow: 'hidden',
          backgroundColor: LK.parchment,
          boxShadow: SHADOW_FLOATING,
        }}
      >
        <Image source={{ uri: drawing.image_url }} style={{ width: size, height: size }} contentFit="contain" />
      </Transition.Boundary.View>

      <View style={{ marginTop: 20, alignItems: 'center', gap: 4 }}>
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: LK.ivory }}>
          {`by ${authorName}`}
        </Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: LK.faded }}>{ts}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
        <Pressable
          onPress={handleSave}
          style={{ backgroundColor: LK.ivory, borderRadius: 99, borderCurve: 'continuous', paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <Image source="sf:square.and.arrow.down" style={{ width: 16, height: 16 }} tintColor={LK.espresso} />
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 14, color: LK.espresso }}>Save</Text>
        </Pressable>
        <Pressable
          onPress={() => router.back()}
          style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 99, borderCurve: 'continuous', paddingHorizontal: 20, paddingVertical: 10 }}
        >
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 14, color: LK.ivory }}>Close</Text>
        </Pressable>
      </View>
    </View>
  );
}
