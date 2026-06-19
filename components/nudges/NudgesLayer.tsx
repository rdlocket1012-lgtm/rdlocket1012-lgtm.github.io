import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, Animated,
  Easing, Pressable, StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { SparkleBurst } from '@/components/nudges/SparkleBurst';
import { RippleBurst } from '@/components/nudges/RippleBurst';
import { BiteBurst } from '@/components/nudges/BiteBurst';
import { useNudgeChannel, NudgeKind } from '@/hooks/useNudgeChannel';
import { notifyPartner } from '@/lib/push';
import { useBiteFx } from '@/stores/bite-fx.store';
import { useAuthStore } from '@/stores/auth.store';
import MascotAnimation from '@/components/ui/mascot-animation';

/** Whether incoming nudge buzzing is allowed for me (default on). */
const myHapticsOn = () => useAuthStore.getState().profile?.nudge_haptics !== false;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── Haptic patterns ────────────────────────────────────────────────────────

/** Warm blanket hug — soft escalating rumble that builds and gently fades. */
async function hugHaptic() {
  const ramp: Array<[Haptics.ImpactFeedbackStyle, number]> = [
    [Haptics.ImpactFeedbackStyle.Light,  130],
    [Haptics.ImpactFeedbackStyle.Light,  110],
    [Haptics.ImpactFeedbackStyle.Medium,  90],
    [Haptics.ImpactFeedbackStyle.Medium,  70],
    [Haptics.ImpactFeedbackStyle.Heavy,   55],
    [Haptics.ImpactFeedbackStyle.Heavy,   50],
    [Haptics.ImpactFeedbackStyle.Heavy,  300], // hold at peak
    [Haptics.ImpactFeedbackStyle.Medium, 220], // fade
    [Haptics.ImpactFeedbackStyle.Light,  280],
    [Haptics.ImpactFeedbackStyle.Light,    0],
  ];
  for (const [style, gap] of ramp) {
    try { await Haptics.impactAsync(style); } catch { /* no-op */ }
    if (gap) await sleep(gap);
  }
}

/** 3 rapid high-frequency micro-taps — playful kisses on the glass. */
async function kissHaptic() {
  for (let i = 0; i < 3; i++) {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { /* no-op */ }
    if (i < 2) await sleep(75);
  }
}

/** Soft success pulse — confirmation that she caught the kiss. */
async function confirmHaptic() {
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch { /* no-op */ }
}

/**
 * "Love Nibble" pinch — a light first contact then, ~60ms later, a noticeably
 * stronger snap (doubled Heavy) that mimics teeth closing shut.
 */
async function biteHaptic() {
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch { /* no-op */ }
  await sleep(60);
  // The "bite closing" — stronger second contact (stacked for emphasis).
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch { /* no-op */ }
  await sleep(22);
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch { /* no-op */ }
}

// ── Main layer ─────────────────────────────────────────────────────────────

export function NudgesLayer({
  open, onClose, coupleId, userId, partnerName, partnerAsleep, partnerSilent,
}: {
  open: boolean;
  onClose: () => void;
  coupleId: string | null;
  userId: string | null;
  partnerName?: string | null;
  partnerAsleep?: boolean;
  partnerSilent?: boolean;
}) {
  const partner = partnerName?.trim() || 'Your partner';
  const [sparkleTrigger, setSparkleTrigger] = useState(0);
  const [rippleTrigger, setRippleTrigger] = useState(0);
  const [biteTrigger, setBiteTrigger] = useState(0);
  const [kissOpen, setKissOpen] = useState(false);
  // "Catch It!" overlay — shown when we receive a kiss_request from partner
  const [catchItOpen, setCatchItOpen] = useState(false);
  // Confirmation overlay — shown on sender's side when kiss is accepted
  const [caughtOpen, setCaughtOpen] = useState(false);

  const { sendNudge, setHolding, partnerHolding } = useNudgeChannel(
    coupleId,
    userId,
    (kind: NudgeKind) => {
      // Respect my own "mute nudge buzzing" preference: the visual still plays,
      // only the haptics are skipped so I'm not disturbed.
      const buzz = myHapticsOn();
      switch (kind) {
        case 'sparkles':
          setSparkleTrigger((n) => n + 1);
          if (buzz) { try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {} }
          break;

        case 'hug':
          setRippleTrigger((n) => n + 1);
          if (buzz) hugHaptic();
          break;

        case 'kiss_request':
          // Partner is requesting a kiss — show the "Catch It!" consent screen.
          setCatchItOpen(true);
          if (buzz) kissHaptic(); // noticeable triple buzz so it's felt, not just seen
          break;

        case 'kiss_accepted':
          // Partner caught our kiss — celebrate on the sender's side.
          setCaughtOpen(true);
          setSparkleTrigger((n) => n + 1);
          if (buzz) confirmHaptic();
          break;

        case 'kiss':
          // Legacy / direct kiss (thumb-kiss sync flow)
          if (buzz) { try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {} }
          break;

        case 'bite':
          setBiteTrigger((n) => n + 1);
          if (buzz) biteHaptic();
          useBiteFx.getState().flash();
          break;

        case 'thumb_kiss_invite':
          // Partner opened the thumb-kiss and wants to hold together — pull us
          // straight in so the two phones can sync.
          setKissOpen(true);
          if (buzz) kissHaptic();
          break;
      }
    },
  );

  // ── Send actions ─────────────────────────────────────────────────────────

  function doSparkles() {
    setSparkleTrigger((n) => n + 1);
    sendNudge('sparkles');
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    notifyPartner('nudge_hug', '✨ Sparkles!', 'Your partner sent you sparkles.');
    onClose();
  }

  function doHug() {
    setRippleTrigger((n) => n + 1);
    hugHaptic();
    sendNudge('hug');
    notifyPartner('nudge_hug', '🤗 A warm hug!', 'Your partner sent you a hug.');
    onClose();
  }

  function doKissRequest() {
    sendNudge('kiss_request');
    notifyPartner('nudge_kiss_request', '💋 Kiss incoming!', 'Tap to catch it before it lands…');
    onClose();
    // Show the sender a "waiting" state (non-blocking — they can navigate away)
  }

  function doBite() {
    setBiteTrigger((n) => n + 1);
    biteHaptic();
    useBiteFx.getState().flash();
    sendNudge('bite');
    notifyPartner('bite', 'Ouch! 🦷', 'Your partner just playfully bit you over-the-air. Open to bite back!', 'bite');
    onClose();
  }

  function doThumbKiss() {
    // Open the sync screen for us, invite the partner in (in-app via broadcast,
    // out-of-app via push), then close the menu.
    setKissOpen(true);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    sendNudge('thumb_kiss_invite');
    notifyPartner('thumb_kiss', '💞 Thumb-Kiss?', 'Your partner wants to hold thumbs — open Locket and press together.');
    onClose();
  }

  // ── Catch It! handler (receiver taps accept) ──────────────────────────────

  function handleCatchIt() {
    setCatchItOpen(false);
    kissHaptic();
    setSparkleTrigger((n) => n + 1);
    sendNudge('kiss_accepted');   // tell sender she caught it
  }

  function handleDeclineKiss() {
    setCatchItOpen(false);
  }

  return (
    <>
      {/* Always-on overlays (pointer-events: none) */}
      <SparkleBurst trigger={sparkleTrigger} />
      <RippleBurst trigger={rippleTrigger} />
      <BiteBurst trigger={biteTrigger} />

      {/* Send menu */}
      <RadialMenu
        open={open}
        onClose={onClose}
        partnerName={partner}
        partnerAsleep={!!partnerAsleep}
        partnerSilent={!!partnerSilent}
        onSparkles={doSparkles}
        onHug={doHug}
        onKiss={doKissRequest}
        onBite={doBite}
        onThumbKiss={doThumbKiss}
      />

      {/* Thumb-kiss sync screen (existing feature) */}
      {kissOpen && (
        <ThumbKiss
          partnerName={partner}
          partnerHolding={partnerHolding}
          onHoldChange={setHolding}
          onClose={() => { setHolding(false); setKissOpen(false); }}
        />
      )}

      {/* Consent gate — receiver sees this */}
      {catchItOpen && (
        <CatchItOverlay
          partnerName={partner}
          onCatch={handleCatchIt}
          onDecline={handleDeclineKiss}
        />
      )}

      {/* Confirmation — sender sees this when kiss is caught */}
      {caughtOpen && (
        <CaughtConfirmation partnerName={partner} onClose={() => setCaughtOpen(false)} />
      )}
    </>
  );
}

// ── Send menu ──────────────────────────────────────────────────────────────

const ACTIONS = [
  { key: 'sparkles',  label: 'Sparkles',   icon: 'sparkle', emoji: null,  color: LK.marigold },
  { key: 'hug',       label: 'Hug',        icon: 'heart',   emoji: null,  color: LK.coral },
  { key: 'kiss',      label: 'Kiss',       icon: 'flower',  emoji: null,  color: LK.blush },
  { key: 'bite',      label: 'Bite',       icon: null,      emoji: '😈',  color: LK.lilac },
  { key: 'thumbkiss', label: 'Thumb-Kiss', icon: null,      emoji: '👍',  color: LK.sky },
] as const;

function RadialMenu({ open, onClose, partnerName, partnerAsleep, partnerSilent, onSparkles, onHug, onKiss, onBite, onThumbKiss }: {
  open: boolean;
  onClose: () => void;
  partnerName: string;
  partnerAsleep: boolean;
  partnerSilent: boolean;
  onSparkles: () => void;
  onHug: () => void;
  onKiss: () => void;
  onBite: () => void;
  onThumbKiss: () => void;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: open ? 1 : 0, duration: 220,
      easing: Easing.out(Easing.back(1.6)),
      useNativeDriver: true,
    }).start();
  }, [open]);

  if (!open) return null;

  const handlers = { sparkles: onSparkles, hug: onHug, kiss: onKiss, bite: onBite, thumbkiss: onThumbKiss };

  return (
    <Modal visible={open} transparent animationType="fade">
      <Pressable
        style={[StyleSheet.absoluteFill, {
          backgroundColor: 'rgba(20,15,10,0.45)',
          alignItems: 'center', justifyContent: 'center', padding: 28,
        }]}
        onPress={onClose}
      >
        <Animated.View style={{
          width: '100%', maxWidth: 360,
          opacity: anim,
          transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
        }}>
          <Pressable style={{ backgroundColor: LK.vellum, borderRadius: 28, padding: 22, ...theme.shadow.card }}>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 22, color: LK.espresso, textAlign: 'center' }}>
              Send a little love 💛
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70, textAlign: 'center', marginTop: 4 }}>
              A nudge lands instantly on your partner's phone.
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginTop: 22 }}>
              {ACTIONS.map((a) => (
                <Pressable key={a.key} onPress={handlers[a.key]} style={{ alignItems: 'center', gap: 8, width: 76 }}>
                  <View style={{
                    width: 72, height: 72, borderRadius: 36,
                    backgroundColor: tint(a.color, 0.66),
                    alignItems: 'center', justifyContent: 'center',
                    ...theme.shadow.sm,
                  }}>
                    {a.emoji
                      ? <Text style={{ fontSize: 32 }}>{a.emoji}</Text>
                      : <Icon name={a.icon as string} size={32} color={shade(a.color, 0.5)} />}
                  </View>
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: LK.ink70, textAlign: 'center' }}>
                    {a.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {/* Partner muted buzzing — nudges still land, just silently */}
            {partnerSilent && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, backgroundColor: tint(LK.sky, 0.5), borderRadius: 12, paddingVertical: 9, paddingHorizontal: 12 }}>
                <Text style={{ fontSize: 13 }}>🔕</Text>
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: shade(LK.sky, 0.55), fontWeight: '700', textAlign: 'center' }}>
                  {partnerName} muted buzzing — nudges arrive silently
                </Text>
              </View>
            )}
            {/* Gentle "it's late for them" cue — never blocks, just informs */}
            {partnerAsleep && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, backgroundColor: tint(LK.lilac, 0.5), borderRadius: 12, paddingVertical: 9, paddingHorizontal: 12 }}>
                <Text style={{ fontSize: 13 }}>😴</Text>
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: shade(LK.lilac, 0.5), fontWeight: '700', textAlign: 'center' }}>
                  It's late for {partnerName} — they'll find it in the morning
                </Text>
              </View>
            )}
            {/* Hint under kiss */}
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.ink70, textAlign: 'center', marginTop: partnerAsleep ? 10 : 14, lineHeight: 16 }}>
              💋 They'll need to tap "Catch It!" before the kiss lands
            </Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

// ── "Catch It!" consent overlay (receiver) ─────────────────────────────────

function CatchItOverlay({ partnerName, onCatch, onDecline }: { partnerName: string; onCatch: () => void; onDecline: () => void }) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 220 }),
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Modal visible transparent animationType="none">
      <Animated.View style={[
        StyleSheet.absoluteFill,
        { backgroundColor: 'rgba(20,15,10,0.72)', alignItems: 'center', justifyContent: 'center', padding: 30, opacity },
      ]}>
        <Animated.View style={{
          backgroundColor: LK.vellum, borderRadius: 30, padding: 30,
          alignItems: 'center', width: '100%', maxWidth: 340,
          ...theme.shadow.card,
          transform: [{ scale }],
        }}>
          <MascotAnimation name="kiss-receive" size={100} style={{ marginBottom: 8 }} />
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 26, color: LK.espresso, textAlign: 'center', letterSpacing: -0.5 }}>
            Incoming kiss!
          </Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70, textAlign: 'center', marginTop: 8, lineHeight: 22, maxWidth: 240 }}>
            {partnerName} is sending you a kiss. Tap before it floats away…
          </Text>

          <TouchableOpacity
            onPress={onCatch}
            activeOpacity={0.85}
            style={{
              marginTop: 28, backgroundColor: LK.blush,
              borderRadius: 9999, paddingHorizontal: 40, paddingVertical: 16,
              ...theme.shadow.sm,
            }}
          >
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 17, color: shade(LK.blush, 0.55) }}>
              Catch it!
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onDecline} style={{ marginTop: 16 }} hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 14, color: LK.ink70 }}>Later</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ── Caught confirmation (sender's side) ────────────────────────────────────

function CaughtConfirmation({ partnerName, onClose }: { partnerName: string; onClose: () => void }) {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 220 }),
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
    // Auto-dismiss after 3 s
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <Modal visible transparent animationType="none">
      <Animated.View style={[StyleSheet.absoluteFill, {
        backgroundColor: 'rgba(20,15,10,0.55)',
        alignItems: 'center', justifyContent: 'center', padding: 30, opacity,
      }]}>
        <Animated.View style={{
          backgroundColor: LK.vellum, borderRadius: 30, padding: 28,
          alignItems: 'center', width: '100%', maxWidth: 320,
          ...theme.shadow.card,
          transform: [{ scale }],
        }}>
          <MascotAnimation name="kiss-send" size={88} style={{ marginBottom: 6 }} />
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 24, color: LK.espresso, textAlign: 'center' }}>
            Caught it!
          </Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5, color: LK.ink70, textAlign: 'center', marginTop: 8, lineHeight: 21 }}>
            {partnerName} caught your kiss
          </Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ── Thumb-Kiss screen (existing, preserved) ────────────────────────────────

function ThumbKiss({ partnerName, partnerHolding, onHoldChange, onClose }: {
  partnerName: string;
  partnerHolding: boolean;
  onHoldChange: (h: boolean) => void;
  onClose: () => void;
}) {
  const [holding, setHolding] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inSync = holding && partnerHolding;
  const inSyncRef = useRef(inSync);
  inSyncRef.current = inSync;

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
      try {
        Haptics.impactAsync(
          inSyncRef.current
            ? Haptics.ImpactFeedbackStyle.Heavy
            : Haptics.ImpactFeedbackStyle.Light
        );
      } catch {}
    }, 220);
  }

  function endHold() {
    setHolding(false);
    onHoldChange(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }

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
            ? "You're both holding — feel the hum together."
            : holding
            ? `Holding… waiting for ${partnerName} to hold too.`
            : `Press and hold. When you and ${partnerName} hold at once, your phones hum together.`}
        </Text>

        <Animated.View style={{ transform: [{ scale: holding ? pulse : 1 }] }}>
          <Pressable
            onPressIn={startHold}
            onPressOut={endHold}
            style={{
              width: 180, height: 180, borderRadius: 90,
              backgroundColor: inSync ? LK.blush : tint(LK.blush, 0.4),
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 6, borderColor: inSync ? '#fff' : 'rgba(255,255,255,0.3)',
            }}
          >
            <Icon name="flower" size={64} color={inSync ? shade(LK.blush, 0.5) : '#fff'} />
          </Pressable>
        </Animated.View>

        <View style={{ flexDirection: 'row', gap: 24, marginTop: 40 }}>
          <HoldDot label="You" on={holding} />
          <HoldDot label={partnerName} on={partnerHolding} />
        </View>
      </View>
    </Modal>
  );
}

function HoldDot({ label, on }: { label: string; on: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: on ? LK.success : 'rgba(255,255,255,0.25)' }} />
      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{label}</Text>
    </View>
  );
}
