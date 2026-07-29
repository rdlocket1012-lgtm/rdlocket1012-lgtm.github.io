import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  useWindowDimensions,
  type View as RNView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets, initialWindowMetrics } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { DrawCanvas, type Stroke } from '@/components/draw/DrawCanvas';
import { DrawToolbar } from '@/components/draw/DrawToolbar';
import { RoundIcon } from '@/components/ui/round-icon';
import { Icon } from '@/components/ui/Icon';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { useDrawStore } from '@/stores/draw.store';
import { useAuth } from '@/hooks/useAuth';
import { usePartner } from '@/hooks/usePartner';
import { success } from '@/lib/haptics';
import { confirm, toast } from '@/lib/feedback';
import { LK, theme } from '@/constants/theme';
import { Image } from 'expo-image';

const SHADOW_LIFTED = '0 4px 16px rgba(42,33,26,0.10), 0 1px 3px rgba(42,33,26,0.06)';
const MAX_STROKES = 200;

export default function ComposeDrawScreen() {
  const { profile } = useAuth();
  const { partner } = usePartner();
  const { sendDrawing } = useDrawStore();

  const canvasRef = useRef<RNView>(null);

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redo, setRedo] = useState<Stroke[]>([]);
  const [color, setColor] = useState<string>(LK.espresso);
  const [brushWidth, setBrushWidth] = useState(5);
  const [erasing, setErasing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Canvas is sized deterministically from the screen width (a measured/flex
  // canvas collapses in this navigator's sheets — see _layout note).
  const { width } = useWindowDimensions();
  const canvasSize = Math.min(width - 32, 420);

  // fullScreenModal renders under the status bar, and SafeAreaView's top edge
  // reports 0 inside a native modal — fall back to the launch-time window inset
  // (correct for the device) so the header always clears the notch.
  const insets = useSafeAreaInsets();
  const topInset = insets.top || initialWindowMetrics?.insets.top || 0;

  const coupleId = profile?.couple_id ?? null;
  const userId = profile?.id ?? null;
  const partnerName = partner?.display_name ?? 'your person';

  // In erase mode, draw with parchment color (paints over existing strokes).
  const activeColor = erasing ? LK.parchment : color;
  const isEmpty = strokes.length === 0;
  const isFull = strokes.length >= MAX_STROKES;

  function handleStroke(stroke: Stroke) {
    if (isFull) return;
    setStrokes((prev) => [...prev, stroke]);
    if (redo.length) setRedo([]);
  }

  function handleUndo() {
    if (strokes.length === 0) return;
    setRedo((r) => [...r, strokes[strokes.length - 1]]);
    setStrokes((prev) => prev.slice(0, -1));
  }

  function handleRedo() {
    if (redo.length === 0) return;
    const next = redo[redo.length - 1];
    setRedo((r) => r.slice(0, -1));
    setStrokes((prev) => [...prev, next]);
  }

  function handleClear() {
    if (strokes.length === 0) return;
    confirm({
      title: 'Clear canvas?',
      message: 'This will remove everything you’ve drawn.',
      confirmLabel: 'Clear',
      destructive: true,
      icon: 'eraser',
    }).then((ok) => { if (ok) { setStrokes([]); setRedo([]); } });
  }

  function handleClose() {
    if (sending) return;
    if (strokes.length > 0 && !sent) {
      confirm({
        title: 'Discard this drawing?',
        message: 'It hasn’t been sent yet.',
        confirmLabel: 'Discard',
        cancelLabel: 'Keep drawing',
        destructive: true,
      }).then((ok) => { if (ok) router.back(); });
      return;
    }
    router.back();
  }

  async function handleSend() {
    if (isEmpty) {
      toast('Draw something first!');
      return;
    }
    if (!coupleId || !userId) return;

    setSending(true);
    setError(null);
    try {
      await sendDrawing({ coupleId, userId, partnerName, canvasRef });
      try { success(); } catch {}
      setSent(true);
      setTimeout(() => router.back(), 1800);
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong — tap to retry.');
      setSending(false);
    }
  }

  const canSend = !isEmpty && !sending && !sent;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header — custom bar (X · title · Send). Top padding clears the notch
          manually since the native modal doesn't supply a top safe-area inset. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: topInset + 8, paddingBottom: 10 }}>
        <RoundIcon onPress={handleClose}>
          <Icon name="x" size={20} color={LK.espresso} />
        </RoundIcon>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text numberOfLines={1} style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: LK.espresso }}>
            Draw for {partnerName}
          </Text>
        </View>

        <ScalePressable
          onPress={handleSend}
          disabled={!canSend}
          scaleTo={0.94}
          accessibilityLabel="Send drawing"
          style={{
            minWidth: 44,
            height: 44,
            borderRadius: 22,
            borderCurve: 'continuous',
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            backgroundColor: canSend ? LK.coral : 'rgba(42,33,26,0.07)',
            opacity: sending ? 0.9 : 1,
            ...(canSend ? theme.shadow.sm : null),
          }}
        >
          {sending ? (
            <ActivityIndicator size="small" color={canSend ? '#fff' : LK.faded} />
          ) : (
            <>
              <Icon name="plane" size={16} color={canSend ? '#fff' : LK.faded} strokeWidth={2.2} />
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: canSend ? '#fff' : LK.faded }}>
                Send
              </Text>
            </>
          )}
        </ScalePressable>
      </View>

      {/* Canvas — a centered square Hero card, sized from the screen width.
          The flex:1 wrapper expands the sheet to full height AND centres the
          canvas vertically, so the toolbar sits flush at the bottom with no gap.
          (Canvas size is fixed, not measured, so it always renders.) */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}>
        <View
          style={{
            width: canvasSize,
            height: canvasSize,
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

        {/* Hint line under the canvas */}
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: 11.5,
            color: isFull ? LK.warning : LK.faded,
            marginTop: 14,
            height: 16,
          }}
        >
          {isFull
            ? 'Canvas full — undo or clear to keep drawing'
            : isEmpty
              ? 'Use your finger to sketch something little'
              : `${strokes.length} ${strokes.length === 1 ? 'stroke' : 'strokes'}`}
        </Text>
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
        onRedo={handleRedo}
        onClear={handleClear}
        canUndo={strokes.length > 0}
        canRedo={redo.length > 0}
      />

      {/* Error toast (tap to retry) */}
      {error && (
        <ScalePressable
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
        </ScalePressable>
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
