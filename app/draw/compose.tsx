import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  type View as RNView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { DrawCanvas, type Stroke } from '@/components/draw/DrawCanvas';
import { DrawToolbar } from '@/components/draw/DrawToolbar';
import { useDrawStore } from '@/stores/draw.store';
import { useAuth } from '@/hooks/useAuth';
import { usePartner } from '@/hooks/usePartner';
import { LK, theme } from '@/constants/theme';
import { Image } from 'expo-image';

const SHADOW_LIFTED = '0 4px 16px rgba(42,33,26,0.10), 0 1px 3px rgba(42,33,26,0.06)';

export default function ComposeDrawScreen() {
  const { profile } = useAuth();
  const { partner } = usePartner();
  const { sendDrawing } = useDrawStore();

  const canvasRef = useRef<RNView>(null);

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState<string>(LK.espresso);
  const [brushWidth, setBrushWidth] = useState(5);
  const [erasing, setErasing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendScale = useSharedValue(1);
  const sendAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
  }));

  const coupleId = profile?.couple_id ?? null;
  const userId = profile?.id ?? null;
  const partnerName = partner?.display_name ?? 'your person';

  // In erase mode, draw with parchment color (paints over existing strokes)
  const activeColor = erasing ? LK.parchment : color;

  function handleStroke(stroke: Stroke) {
    if (strokes.length >= 200) return;
    setStrokes((prev) => [...prev, stroke]);
  }

  function handleUndo() {
    setStrokes((prev) => prev.slice(0, -1));
  }

  function handleClear() {
    if (strokes.length === 0) return;
    Alert.alert('Clear canvas?', 'This will remove all strokes.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => setStrokes([]) },
    ]);
  }

  async function handleSend() {
    if (strokes.length === 0) {
      Alert.alert('Nothing to send', 'Draw something first!');
      return;
    }
    if (!coupleId || !userId) return;

    sendScale.value = withSpring(0.94, theme.spring.bounce, () => {
      sendScale.value = withSpring(1, theme.spring.bounce);
    });

    setSending(true);
    setError(null);
    try {
      await sendDrawing({ coupleId, userId, partnerName, canvasRef });
      setSent(true);
      setTimeout(() => router.back(), 2000);
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong — tap to retry.');
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: '',
          headerStyle: { backgroundColor: LK.parchment },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={12} disabled={sending}>
              <Image source="sf:xmark" style={{ width: 20, height: 20 }} tintColor={LK.sepia} />
            </Pressable>
          ),
          headerRight: () => (
            <Animated.View style={sendAnimStyle}>
              <Pressable
                onPress={handleSend}
                hitSlop={12}
                disabled={sending || sent || strokes.length === 0}
              >
                {sending
                  ? <ActivityIndicator size="small" color={LK.coral} />
                  : (
                    <Image
                      source="sf:paperplane.fill"
                      style={{ width: 22, height: 22 }}
                      tintColor={strokes.length === 0 ? LK.faded : LK.coral}
                    />
                  )
                }
              </Pressable>
            </Animated.View>
          ),
        }}
      />

      {/* Title */}
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: '700',
          fontSize: 17,
          color: LK.espresso,
          textAlign: 'center',
          paddingTop: 4,
          paddingBottom: 20,
        }}
      >
        {`Draw for ${partnerName}`}
      </Text>

      {/* Canvas — Vellum Hero card, 28px radius, Level 2 shadow */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
        <View
          style={{
            width: 280,
            height: 280,
            borderRadius: 28,
            borderCurve: 'continuous',
            overflow: 'hidden',
            backgroundColor: LK.parchment,
            boxShadow: SHADOW_LIFTED,
            borderWidth: 1.5,
            borderColor: 'rgba(42,33,26,0.10)',
          } as any}
        >
          <DrawCanvas
            ref={canvasRef}
            mode="draw"
            strokes={strokes}
            color={activeColor}
            brushWidth={brushWidth}
            onStroke={handleStroke}
            style={{ flex: 1 }}
          />
        </View>

        {strokes.length > 0 && strokes.length < 200 && (
          <Text
            style={{
              fontFamily: theme.fonts.body,
              fontSize: 11,
              color: LK.faded,
              marginTop: 8,
            }}
          >
            {strokes.length} {strokes.length === 1 ? 'stroke' : 'strokes'}
          </Text>
        )}
        {strokes.length >= 200 && (
          <Text
            style={{
              fontFamily: theme.fonts.body,
              fontSize: 11,
              color: LK.warning,
              marginTop: 8,
            }}
          >
            canvas full — undo or clear to keep drawing
          </Text>
        )}
      </View>

      {/* Toolbar */}
      <DrawToolbar
        color={color}
        brushWidth={brushWidth}
        erasing={erasing}
        onColorChange={setColor}
        onBrushChange={setBrushWidth}
        onEraserToggle={() => setErasing((e) => !e)}
        onUndo={handleUndo}
        onClear={handleClear}
      />

      {/* Error toast (tap to retry) */}
      {error && (
        <Pressable
          onPress={handleSend}
          style={{
            position: 'absolute',
            bottom: 120,
            left: 20,
            right: 20,
            backgroundColor: LK.danger,
            borderRadius: 14,
            borderCurve: 'continuous',
            padding: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 13, color: LK.vellum }}>
            {error}
          </Text>
        </Pressable>
      )}

      {/* Sent confirmation overlay */}
      {sent && (
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: LK.parchment,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <Image source="sf:heart.fill" style={{ width: 48, height: 48 }} tintColor={LK.coral} />
          <Text style={{ fontFamily: theme.fonts.hand, fontSize: 22, color: LK.espresso }}>
            sent with love!
          </Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, color: LK.sepia }}>
            {`${partnerName} will see it on their home screen`}
          </Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
