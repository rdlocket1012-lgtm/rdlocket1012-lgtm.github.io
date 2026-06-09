import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Easing, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { SparkleBurst } from '@/components/nudges/SparkleBurst';
import { useNudgeChannel, NudgeKind } from '@/hooks/useNudgeChannel';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function hugHaptic() {
  const seq: Haptics.ImpactFeedbackStyle[] = [
    Haptics.ImpactFeedbackStyle.Heavy,
    Haptics.ImpactFeedbackStyle.Medium,
    Haptics.ImpactFeedbackStyle.Heavy,
    Haptics.ImpactFeedbackStyle.Light,
    Haptics.ImpactFeedbackStyle.Medium,
  ];
  for (const s of seq) {
    try { await Haptics.impactAsync(s); } catch { /* no-op */ }
    await delay(130);
  }
}

export function NudgesLayer({
  open, onClose, coupleId, userId,
}: { open: boolean; onClose: () => void; coupleId: string | null; userId: string | null }) {
  const [burst, setBurst] = useState(0);
  const [kissOpen, setKissOpen] = useState(false);

  const { sendNudge, setHolding, partnerHolding } = useNudgeChannel(coupleId, userId, (kind) => {
    // Incoming nudge from partner.
    if (kind === 'sparkles') {
      setBurst((b) => b + 1);
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch { /* no-op */ }
    } else if (kind === 'hug') {
      hugHaptic();
    } else if (kind === 'kiss') {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch { /* no-op */ }
    }
  });

  function doSparkles() {
    setBurst((b) => b + 1);
    sendNudge('sparkles');
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { /* no-op */ }
    onClose();
  }
  function doHug() {
    hugHaptic();
    sendNudge('hug');
    onClose();
  }
  function doKiss() {
    onClose();
    setKissOpen(true);
    sendNudge('kiss');
  }

  return (
    <>
      <SparkleBurst trigger={burst} />

      <RadialMenu open={open} onClose={onClose} onSparkles={doSparkles} onHug={doHug} onKiss={doKiss} />

      {kissOpen && (
        <ThumbKiss
          partnerHolding={partnerHolding}
          onHoldChange={setHolding}
          onClose={() => { setHolding(false); setKissOpen(false); }}
        />
      )}
    </>
  );
}

const ACTIONS = [
  { key: 'sparkles', label: 'Sparkles', icon: 'sparkle', color: LK.gold },
  { key: 'hug', label: 'Hug', icon: 'heart', color: LK.coral },
  { key: 'kiss', label: 'Thumb-Kiss', icon: 'flower', color: LK.pink },
] as const;

function RadialMenu({ open, onClose, onSparkles, onHug, onKiss }: {
  open: boolean; onClose: () => void; onSparkles: () => void; onHug: () => void; onKiss: () => void;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: open ? 1 : 0, duration: 220, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true }).start();
  }, [open]);

  if (!open) return null;
  const handlers = { sparkles: onSparkles, hug: onHug, kiss: onKiss };

  return (
    <Modal visible={open} transparent animationType="fade">
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(20,15,10,0.45)', alignItems: 'center', justifyContent: 'center', padding: 28 }]} onPress={onClose}>
        <Animated.View style={{ width: '100%', maxWidth: 360, opacity: anim, transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }}>
          <Pressable style={{ backgroundColor: '#FFFDF7', borderRadius: 28, padding: 22, ...theme.shadow.card }}>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 22, color: LK.ink, textAlign: 'center' }}>Send a little love 💛</Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70, textAlign: 'center', marginTop: 4 }}>A nudge lands instantly on your partner's phone.</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 22 }}>
              {ACTIONS.map((a) => (
                <Pressable key={a.key} onPress={handlers[a.key]} style={{ alignItems: 'center', gap: 8, width: 92 }}>
                  <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: tint(a.color, 0.66), alignItems: 'center', justifyContent: 'center', ...theme.shadow.sm }}>
                    <Icon name={a.icon} size={32} color={shade(a.color, 0.5)} />
                  </View>
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: LK.ink70, textAlign: 'center' }}>{a.label}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function ThumbKiss({ partnerHolding, onHoldChange, onClose }: {
  partnerHolding: boolean; onHoldChange: (h: boolean) => void; onClose: () => void;
}) {
  const [holding, setHolding] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inSync = holding && partnerHolding;

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  function startHold() {
    setHolding(true);
    onHoldChange(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      try { Haptics.impactAsync(inSyncRef.current ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light); } catch { /* no-op */ }
    }, 220);
  }
  function endHold() {
    setHolding(false);
    onHoldChange(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }

  // keep latest inSync for the interval callback
  const inSyncRef = useRef(inSync);
  inSyncRef.current = inSync;

  return (
    <Modal visible transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(26,18,30,0.82)', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
        <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 60, right: 24 }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="x" size={26} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>

        <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 28, color: '#fff', textAlign: 'center', marginBottom: 8 }}>
          {inSync ? 'In sync 💋' : 'Thumb-Kiss'}
        </Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5, color: 'rgba(255,255,255,0.75)', textAlign: 'center', maxWidth: 260, lineHeight: 22, marginBottom: 40 }}>
          {inSync
            ? 'You’re both holding — feel the hum together.'
            : holding
            ? 'Holding… ask your partner to hold theirs too.'
            : 'Press and hold. When you both hold at once, your phones hum together.'}
        </Text>

        <Animated.View style={{ transform: [{ scale: holding ? pulse : 1 }] }}>
          <Pressable
            onPressIn={startHold}
            onPressOut={endHold}
            style={{
              width: 180, height: 180, borderRadius: 90,
              backgroundColor: inSync ? LK.pink : tint(LK.pink, 0.4),
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 6, borderColor: inSync ? '#fff' : 'rgba(255,255,255,0.3)',
            }}
          >
            <Icon name="flower" size={64} color={inSync ? shade(LK.pink, 0.5) : '#fff'} />
          </Pressable>
        </Animated.View>

        <View style={{ flexDirection: 'row', gap: 24, marginTop: 40 }}>
          <HoldDot label="You" on={holding} />
          <HoldDot label="Partner" on={partnerHolding} />
        </View>
      </View>
    </Modal>
  );
}

function HoldDot({ label, on }: { label: string; on: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: on ? LK.mint : 'rgba(255,255,255,0.25)' }} />
      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{label}</Text>
    </View>
  );
}
