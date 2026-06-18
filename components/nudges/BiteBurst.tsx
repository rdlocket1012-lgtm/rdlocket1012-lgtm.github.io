import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, Text } from 'react-native';

/**
 * A cheeky "bite" micro-interaction. On each `trigger` increment a big mouth
 * emoji chomps twice (quick squash-and-stretch), a row of pastel teeth-marks
 * presses in, and a feisty caption pops before everything fades. Pointer-events
 * disabled so it never blocks touches.
 */
export function BiteBurst({ trigger }: { trigger: number }) {
  const [show, setShow] = useState(false);
  const chomp = useRef(new Animated.Value(0)).current;   // 0→1 scale-in
  const bite = useRef(new Animated.Value(1)).current;     // vertical squash for the chomp
  const teeth = useRef(new Animated.Value(0)).current;    // teeth-mark press-in
  const tag = useRef(new Animated.Value(0)).current;      // caption pop
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger === 0) return;
    setShow(true);
    chomp.setValue(0); bite.setValue(1); teeth.setValue(0); tag.setValue(0); opacity.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.spring(chomp, { toValue: 1, useNativeDriver: true, damping: 11, stiffness: 200 }),
        Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
      ]),
      // two quick chomps (squash the mouth vertically)
      Animated.timing(bite, { toValue: 0.55, duration: 90, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(bite, { toValue: 1, duration: 110, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(teeth, { toValue: 1, useNativeDriver: true, damping: 10, stiffness: 220 }),
      ]),
      Animated.timing(bite, { toValue: 0.6, duration: 90, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.timing(bite, { toValue: 1, duration: 120, easing: Easing.out(Easing.back(2)), useNativeDriver: true }),
      Animated.spring(tag, { toValue: 1, useNativeDriver: true, damping: 9, stiffness: 180 }),
      Animated.delay(900),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShow(false));
  }, [trigger]);

  if (!show) return null;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
      <Animated.View style={{ opacity, alignItems: 'center', transform: [{ scale: chomp }] }}>
        <Animated.Text style={{ fontSize: 92, transform: [{ scaleY: bite }] }}>😈</Animated.Text>

        {/* Pastel teeth-mark indents */}
        <Animated.View
          style={{
            flexDirection: 'row',
            gap: 5,
            marginTop: 2,
            opacity: teeth,
            transform: [{ scale: teeth.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={{
                width: 9,
                height: 14,
                borderBottomLeftRadius: 9,
                borderBottomRightRadius: 9,
                backgroundColor: 'rgba(244,143,177,0.85)',
              }}
            />
          ))}
        </Animated.View>

        <Animated.View
          style={{
            marginTop: 12,
            backgroundColor: '#3A0D1E',
            borderRadius: 9999,
            paddingHorizontal: 18,
            paddingVertical: 8,
            maxWidth: 280,
            opacity: tag,
            transform: [{ scale: tag }],
          }}
        >
          <Text style={{ color: '#FFE3ED', fontWeight: '800', fontSize: 15, textAlign: 'center' }}>
            Nom nom… someone's feeling feisty 🦈
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
