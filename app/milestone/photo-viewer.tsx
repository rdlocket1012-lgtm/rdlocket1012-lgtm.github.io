import React, { useState } from 'react';
import { View, Text, Pressable, FlatList, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, interpolate, ReduceMotion } from 'react-native-reanimated';
import { Icon } from '@/components/ui/Icon';
import { theme } from '@/constants/theme';

/**
 * Fullscreen photo viewer (§13.14). Modal route. Swipe horizontally between a
 * milestone's photos; swipe down to dismiss. Espresso backdrop.
 * Params: `photos` (JSON-encoded string[]), `index` (starting photo).
 */
export default function PhotoViewer() {
  const params = useLocalSearchParams<{ photos?: string; index?: string }>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const photos: string[] = (() => {
    try { return params.photos ? JSON.parse(params.photos) : []; } catch { return []; }
  })();
  const startIndex = Math.max(0, Math.min(Number(params.index ?? 0) || 0, photos.length - 1));
  const [page, setPage] = useState(startIndex);

  const translateY = useSharedValue(0);

  const dismiss = () => router.back();

  // Swipe down to dismiss; the backdrop fades as you drag.
  const pan = Gesture.Pan()
    .activeOffsetY(12)
    .failOffsetX([-16, 16])
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 800) {
        translateY.value = withSpring(height, { damping: 30, stiffness: 240, reduceMotion: ReduceMotion.Never });
        runOnJS(dismiss)();
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 260, reduceMotion: ReduceMotion.Never });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, height * 0.6], [1, 0.2], 'clamp'),
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Animated.View style={[{ position: 'absolute', inset: 0, backgroundColor: '#1A130D' }, backdropStyle]} />

      <GestureDetector gesture={pan}>
        <Animated.View style={[{ flex: 1 }, sheetStyle]}>
          <FlatList
            data={photos}
            keyExtractor={(uri, i) => `${i}-${uri}`}
            horizontal
            pagingEnabled
            initialScrollIndex={startIndex}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => (
              <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={{ uri: item }} style={{ width, height: height * 0.8 }} contentFit="contain" transition={150} />
              </View>
            )}
          />
        </Animated.View>
      </GestureDetector>

      {/* Close button */}
      <Pressable
        onPress={dismiss}
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={{ position: 'absolute', top: insets.top + 8, right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon name="x" size={22} color="#fff" strokeWidth={2.2} />
      </Pressable>

      {/* Page indicator */}
      {photos.length > 1 && (
        <View style={{ position: 'absolute', bottom: insets.bottom + 24, left: 0, right: 0, alignItems: 'center' }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: '#fff' }}>
              {page + 1} / {photos.length}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
