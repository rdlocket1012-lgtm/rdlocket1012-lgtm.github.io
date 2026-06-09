import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';

const EMOJIS = ['✨', '💛', '⭐', '🌟', '💫', '🫶'];
const COUNT = 18;
const { width: SW, height: SH } = Dimensions.get('window');

type Burst = { id: number; anim: Animated.Value; particles: { angle: number; dist: number; emoji: string; size: number }[] };

/** Plays a celebratory particle burst whenever `trigger` increments. pointerEvents none. */
export function SparkleBurst({ trigger }: { trigger: number }) {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const idRef = useRef(0);
  const lastTrigger = useRef(trigger);

  useEffect(() => {
    if (trigger === lastTrigger.current) return;
    lastTrigger.current = trigger;
    if (trigger === 0) return;

    const id = idRef.current++;
    const anim = new Animated.Value(0);
    const particles = Array.from({ length: COUNT }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: 90 + Math.random() * 150,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      size: 18 + Math.random() * 16,
    }));
    setBursts((b) => [...b, { id, anim, particles }]);

    Animated.timing(anim, { toValue: 1, duration: 1100, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => {
      setBursts((b) => b.filter((x) => x.id !== id));
    });
  }, [trigger]);

  if (bursts.length === 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {bursts.map((burst) => (
        <View key={burst.id} style={{ position: 'absolute', left: SW / 2, top: SH * 0.42 }}>
          {burst.particles.map((p, i) => {
            const translateX = burst.anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(p.angle) * p.dist] });
            const translateY = burst.anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(p.angle) * p.dist - 40] });
            const opacity = burst.anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });
            const scale = burst.anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.4, 1.1, 0.7] });
            return (
              <Animated.Text key={i} style={{ position: 'absolute', fontSize: p.size, opacity, transform: [{ translateX }, { translateY }, { scale }] }}>
                {p.emoji}
              </Animated.Text>
            );
          })}
        </View>
      ))}
    </View>
  );
}
