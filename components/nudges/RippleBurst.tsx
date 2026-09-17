import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { LK } from '@/constants/theme';

const { width: SW, height: SH } = Dimensions.get('window');
const CENTER_X = SW / 2;
const CENTER_Y = SH * 0.44;

// Three rings staggered 180 ms apart — each expands and fades.
const RING_COUNT = 3;
const RING_DELAY = 180;
const RING_DURATION = 1600;
const MAX_RADIUS = SW * 0.72;

type Ring = { id: number; anim: Animated.Value };

export function RippleBurst({ trigger }: { trigger: number }) {
  const [rings, setRings] = useState<Ring[]>([]);
  const idRef = useRef(0);
  const lastRef = useRef(trigger);

  useEffect(() => {
    if (trigger === lastRef.current) return;
    lastRef.current = trigger;
    if (trigger === 0) return;

    const newRings: Ring[] = Array.from({ length: RING_COUNT }, (_, i) => ({
      id: idRef.current++,
      anim: new Animated.Value(0),
    }));

    setRings((r) => [...r, ...newRings]);

    newRings.forEach((ring, i) => {
      Animated.timing(ring.anim, {
        toValue: 1,
        duration: RING_DURATION,
        delay: i * RING_DELAY,
        useNativeDriver: true,
      }).start();
    });

    // Clean up after the last ring finishes
    const timeout = setTimeout(() => {
      const ids = new Set(newRings.map((r) => r.id));
      setRings((r) => r.filter((x) => !ids.has(x.id)));
    }, RING_DURATION + RING_COUNT * RING_DELAY + 100);

    return () => clearTimeout(timeout);
  }, [trigger]);

  if (rings.length === 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {rings.map((ring) => {
        const scale = ring.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.05, 1],
        });
        const opacity = ring.anim.interpolate({
          inputRange: [0, 0.25, 0.8, 1],
          outputRange: [0, 0.55, 0.3, 0],
        });
        return (
          <Animated.View
            key={ring.id}
            style={{
              position: 'absolute',
              left: CENTER_X - MAX_RADIUS,
              top: CENTER_Y - MAX_RADIUS,
              width: MAX_RADIUS * 2,
              height: MAX_RADIUS * 2,
              borderRadius: MAX_RADIUS,
              borderWidth: 2.5,
              borderColor: LK.coral,
              backgroundColor: 'transparent',
              opacity,
              transform: [{ scale }],
            }}
          />
        );
      })}
    </View>
  );
}
