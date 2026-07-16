import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  ZoomIn,
  Easing,
  ReduceMotion,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LK, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { ScalePressable } from '@/components/ui/scale-pressable';
import MascotAnimation from '@/components/ui/mascot-animation';
import { DrawCanvas, type Stroke } from '@/components/draw/DrawCanvas';
import { DrawToolbar } from '@/components/draw/DrawToolbar';
import { useAuthStore } from '@/stores/auth.store';
import { usePartner } from '@/hooks/usePartner';
import { useDrawSession, type DrawGameEvent } from '@/hooks/useDrawSession';
import { getWordOptions } from '@/constants/draw-words';
import { notifyPartner } from '@/lib/push';

const ROUND_DURATION = 90_000;
const ERASER_COLOR = LK.parchment;

type Phase = 'lobby' | 'word_pick' | 'drawing' | 'celebrating' | 'timeout';
type Role = 'drawer' | 'guesser';

function haptic(style: 'light' | 'medium' | 'success' = 'light') {
  if (process.env.EXPO_OS !== 'ios') return;
  try {
    if (style === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(
        style === 'medium'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light,
      );
    }
  } catch {}
}

// Simple confetti pieces rendered via Reanimated
function ConfettiPiece({
  x,
  color,
  delay,
  size,
}: {
  x: number;
  color: string;
  delay: number;
  size: number;
}) {
  const y = useSharedValue(-20);
  const rot = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const start = setTimeout(() => {
      y.value = withTiming(700, { duration: 2200, easing: Easing.in(Easing.quad) });
      rot.value = withTiming(720 * (Math.random() > 0.5 ? 1 : -1), { duration: 2200 });
      opacity.value = withTiming(0, { duration: 2200 });
    }, delay);
    return () => clearTimeout(start);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { rotate: `${rot.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          position: 'absolute',
          left: x,
          top: 0,
          width: size,
          height: size * 0.6,
          backgroundColor: color,
          borderRadius: 2,
        },
      ]}
      pointerEvents="none"
    />
  );
}

function ConfettiShower({ active }: { active: boolean }) {
  if (!active) return null;
  const pieces = useRef(
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: (i / 28) * 380 + Math.random() * 20 - 10,
      color: i % 3 === 0 ? LK.coral : i % 3 === 1 ? LK.marigold : LK.blush,
      delay: Math.random() * 600,
      size: 8 + Math.random() * 8,
    })),
  ).current;

  return (
    <View
      style={{ position: 'absolute', inset: 0 }}
      pointerEvents="none"
      accessibilityElementsHidden
    >
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} x={p.x} color={p.color} delay={p.delay} size={p.size} />
      ))}
    </View>
  );
}

// 3-dot pulsing indicator for "partner is drawing..."
function PulsingDots() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % 3), 380);
    return () => clearInterval(t);
  }, []);
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: active === i ? LK.sepia : 'rgba(110,98,83,0.30)',
          }}
        />
      ))}
    </View>
  );
}

export default function DrawAndGuessScreen() {
  const profile = useAuthStore((s) => s.profile);
  const { partner } = usePartner();

  const myId = profile?.id ?? null;
  const partnerId = partner?.id ?? null;
  const partnerName = partner?.display_name ?? 'Partner';
  const coupleId = profile?.couple_id ?? null;

  // Game state
  const [phase, setPhase] = useState<Phase>('lobby');
  const [role, setRole] = useState<Role>('drawer');
  // role is read inside long-lived closures (realtime handler, 90s timer) where
  // state can be a render stale — e.g. word_picked arriving in the same tick as
  // round_start. The ref is updated synchronously with setRole so those reads
  // never mislabel the player.
  const roleRef = useRef<Role>('drawer');
  const applyRole = (r: Role) => {
    roleRef.current = r;
    setRole(r);
  };
  const [roundNum, setRoundNum] = useState(0);
  const [roundId, setRoundId] = useState('');
  const [wordOptions, setWordOptions] = useState<[string, string, string]>(['?', '?', '?']);
  const [chosenWord, setChosenWord] = useState('');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [guessInput, setGuessInput] = useState('');
  const [revealWord, setRevealWord] = useState('');
  const [partnerDrawing, setPartnerDrawing] = useState(false);

  // Skribbl-style word hint for the guesser: array of template chars — '_' for a
  // still-hidden letter, the actual letter once revealed, and spaces/hyphens shown
  // from the start. The drawer owns the reveal schedule (see scheduleReveals).
  const [hint, setHint] = useState<string[]>([]);

  // Timer
  const timerProgress = useSharedValue(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Whole-second countdown shown as a numeric clock alongside the progress bar.
  const [secondsLeft, setSecondsLeft] = useState(ROUND_DURATION / 1000);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Pending letter-reveal timeouts (drawer only) — cleared when the round ends.
  const revealTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Drawing tool state (drawer only)
  const [drawColor, setDrawColor] = useState<string>(LK.espresso);
  const [brushWidth, setBrushWidth] = useState(5);
  const [erasing, setErasing] = useState(false);

  // `word` is passed explicitly: pickWord() calls this in the same tick as
  // setChosenWord, so reading chosenWord state here would give the *previous*
  // round's word ('' on round 1) and the timeout reveal would show the wrong word.
  function startTimer(word: string) {
    timerProgress.value = 1;
    timerProgress.value = withTiming(0, { duration: ROUND_DURATION, easing: Easing.linear });
    // Numeric countdown — both roles run it; only the drawer fires time_up.
    setSecondsLeft(ROUND_DURATION / 1000);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    timerRef.current = setTimeout(() => {
      if (roleRef.current === 'drawer') {
        send({ type: 'time_up', word });
        handleTimeUp(word);
      }
    }, ROUND_DURATION);
  }

  function clearTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = null;
    revealTimersRef.current.forEach(clearTimeout);
    revealTimersRef.current = [];
  }

  // ── Word-hint mask & progressive reveal (skribbl-style) ────────────────

  /** Template shown to the guesser: letters → '_', spaces/hyphens kept as-is. */
  function buildMask(word: string): string {
    return word.replace(/[a-z]/gi, '_');
  }

  function applyReveal(index: number, letter: string) {
    setHint((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const next = [...prev];
      next[index] = letter;
      return next;
    });
  }

  /**
   * Drawer only: schedule a handful of letters to reveal over the back half of
   * the round, staggered so hints appear "as the clock ticks down". Reveals ~35%
   * of the letters (never leaving fewer than two hidden), at random positions.
   */
  function scheduleReveals(word: string) {
    const letterIdx: number[] = [];
    for (let i = 0; i < word.length; i++) {
      if (/[a-z]/i.test(word[i])) letterIdx.push(i);
    }
    const count = Math.min(Math.floor(letterIdx.length * 0.35), Math.max(0, letterIdx.length - 2));
    if (count <= 0) return;
    const chosen = [...letterIdx].sort(() => Math.random() - 0.5).slice(0, count);
    chosen.forEach((idx, j) => {
      // Spread reveals between ~40% and ~90% of the round elapsed.
      const frac = 0.4 + 0.5 * ((j + 1) / (count + 1));
      const t = setTimeout(() => {
        const letter = word[idx];
        applyReveal(idx, letter);
        send({ type: 'reveal', index: idx, letter });
      }, Math.round(ROUND_DURATION * frac));
      revealTimersRef.current.push(t);
    });
  }

  const timerBarStyle = useAnimatedStyle(() => ({
    width: `${timerProgress.value * 100}%`,
    backgroundColor: timerProgress.value > 0.35 ? LK.coral : LK.marigold,
  }));

  function handleTimeUp(word: string) {
    clearTimer();
    setRevealWord(word);
    setPhase('timeout');
  }

  function handleCorrect(word: string) {
    clearTimer();
    haptic('success');
    setRevealWord(word);
    setPhase('celebrating');
  }

  const onDrawEvent = useCallback(
    (e: DrawGameEvent) => {
      switch (e.type) {
        case 'round_start': {
          const iAmDrawer = e.drawerUserId === myId;
          applyRole(iAmDrawer ? 'drawer' : 'guesser');
          setRoundId(e.roundId);
          // Sync the round counter from the starter so both devices agree on
          // "Round N" and on whose turn the next round is.
          if (typeof e.round === 'number') setRoundNum(e.round);
          setWordOptions(e.options);
          setStrokes([]);
          setGuesses([]);
          setGuessInput('');
          setRevealWord('');
          setHint([]);
          setPhase('word_pick');
          break;
        }
        case 'word_picked': {
          // Guesser receives this — drawer has picked, game starts.
          // roleRef (not role state) — this can arrive in the same tick as
          // round_start, before the role state has committed.
          if (roleRef.current === 'guesser') {
            setHint(e.mask ? e.mask.split('') : []);
            setPhase('drawing');
            startTimer(''); // guesser never broadcasts time_up; drawer owns the word
          }
          break;
        }
        case 'reveal': {
          applyReveal(e.index, e.letter);
          break;
        }
        case 'stroke': {
          setStrokes((prev) => {
            if (prev.length >= 200) return prev;
            return [...prev, e.stroke];
          });
          setPartnerDrawing(true);
          setTimeout(() => setPartnerDrawing(false), 1500);
          break;
        }
        case 'guess': {
          setGuesses((prev) => [...prev.slice(-6), e.text]);
          break;
        }
        case 'correct': {
          handleCorrect(e.word);
          break;
        }
        case 'time_up': {
          handleTimeUp(e.word);
          break;
        }
        case 'next_round': {
          setPhase('lobby');
          break;
        }
      }
    },
    // role is intentionally absent: handlers read roleRef so mid-tick events
    // (word_picked right after round_start) never see a stale role.
    [myId],
  );

  const { send, partnerOnline } = useDrawSession(coupleId, myId, onDrawEvent);

  // ── Invite / join flow ───────────────────────────────────────────────
  const [justInvited, setJustInvited] = useState(false);
  const invitedRef = useRef(false);
  const prevOnlineRef = useRef(false);

  const sendInvite = useCallback(() => {
    // Fall back past the 'You' default — the push reads on the partner's phone,
    // where "You wants to draw!" would be wrong.
    const first = (profile?.display_name?.trim() || 'Your partner').split(' ')[0];
    notifyPartner('draw_invite', `🎨 ${first} wants to draw!`, 'Tap to join a game of Draw & Guess');
  }, [profile?.display_name]);

  // Auto-ping the partner once when we're waiting in the lobby and they're not
  // here yet. Reset when they join so a fresh invite can be sent if they leave.
  useEffect(() => {
    if (phase === 'lobby' && coupleId && !partnerOnline && !invitedRef.current) {
      invitedRef.current = true;
      sendInvite();
    }
    if (partnerOnline) invitedRef.current = false;
  }, [phase, coupleId, partnerOnline, sendInvite]);

  // Celebrate the moment the partner joins the lobby.
  useEffect(() => {
    if (partnerOnline && !prevOnlineRef.current) haptic('success');
    prevOnlineRef.current = partnerOnline;
  }, [partnerOnline]);

  function inviteAgain() {
    haptic();
    sendInvite();
    setJustInvited(true);
    setTimeout(() => setJustInvited(false), 2500);
  }

  function startRound() {
    haptic();
    const newRoundNum = roundNum + 1;
    setRoundNum(newRoundNum);
    const newRoundId = Math.random().toString(36).slice(2);
    const options = getWordOptions();
    // Alternate drawer: odd rounds → me, even → partner
    const drawerUserId = newRoundNum % 2 === 1 ? (myId ?? '') : (partnerId ?? '');

    const event: DrawGameEvent = {
      type: 'round_start',
      roundId: newRoundId,
      drawerUserId,
      options,
      round: newRoundNum,
    };

    // Apply locally (self excluded from Realtime broadcast)
    const iAmDrawer = drawerUserId === myId;
    applyRole(iAmDrawer ? 'drawer' : 'guesser');
    setRoundId(newRoundId);
    setWordOptions(options);
    setStrokes([]);
    setGuesses([]);
    setGuessInput('');
    setRevealWord('');
    setHint([]);
    setPhase('word_pick');

    send(event);
  }

  function pickWord(word: string) {
    setChosenWord(word);
    const mask = buildMask(word);
    setHint(mask.split(''));
    setPhase('drawing');
    send({ type: 'word_picked', mask });
    startTimer(word);
    scheduleReveals(word);
  }

  function handleStroke(stroke: Stroke) {
    if (phase !== 'drawing') return;
    setStrokes((prev) => {
      if (prev.length >= 200) return prev;
      return [...prev, stroke];
    });
    send({ type: 'stroke', stroke });
  }

  function undoStroke() {
    setStrokes((prev) => prev.slice(0, -1));
  }

  function clearCanvas() {
    Alert.alert('Clear canvas?', 'This will remove all your strokes.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => setStrokes([]),
      },
    ]);
  }

  function submitGuess() {
    const text = guessInput.trim().toLowerCase();
    if (!text) return;
    setGuesses((prev) => [...prev.slice(-6), text]);
    setGuessInput('');
    send({ type: 'guess', text });

    const isCorrect = text === chosenWord.toLowerCase() ||
      // fuzzy: allow if word matches ignoring spaces
      text.replace(/\s/g, '') === chosenWord.toLowerCase().replace(/\s/g, '');

    if (isCorrect) {
      // Guesser can't know the word yet — server-side check would be ideal,
      // but since this is P2P, the guesser's guess is sent to the drawer who validates.
      // For simplicity: broadcast 'correct' from the drawer when they confirm.
      // But since we're client-side only, we use the honor system:
      // The guesser broadcasts their guess; the drawer's device compares and sends 'correct'.
    }
  }

  // Drawer side: evaluate incoming guesses
  useEffect(() => {
    if (phase !== 'drawing' || role !== 'drawer' || guesses.length === 0) return;
    const lastGuess = guesses[guesses.length - 1];
    const correct =
      lastGuess === chosenWord.toLowerCase() ||
      lastGuess.replace(/\s/g, '') === chosenWord.toLowerCase().replace(/\s/g, '');
    if (correct) {
      send({ type: 'correct', word: chosenWord });
      handleCorrect(chosenWord);
    }
  }, [guesses, phase, role, chosenWord]);

  function goNextRound() {
    haptic();
    send({ type: 'next_round' });
    setPhase('lobby');
  }

  function quit() {
    clearTimer();
    router.back();
  }

  // Belt-and-braces: clear all timers/reveals if the screen unmounts some other
  // way than quit() (hardware back, navigation), so nothing fires after teardown.
  useEffect(() => clearTimer, []);

  // ── Render helpers ──────────────────────────────────────────────────

  function renderTimerBar() {
    return (
      <View style={{ height: 4, backgroundColor: 'rgba(42,33,26,0.08)', width: '100%' }}>
        <Animated.View style={[{ height: 4, borderRadius: 2 }, timerBarStyle]} />
      </View>
    );
  }

  function renderCountdown() {
    const urgent = secondsLeft <= 15;
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          backgroundColor: urgent ? 'rgba(229,112,95,0.14)' : 'rgba(42,33,26,0.06)',
          borderRadius: 9999,
          borderCurve: 'continuous',
          paddingHorizontal: 12,
          paddingVertical: 6,
        }}
        accessibilityLabel={`${secondsLeft} seconds left`}
      >
        <Icon name="clockTab" size={14} color={urgent ? LK.danger : LK.sepia} strokeWidth={2.2} />
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: '700',
            fontSize: 14,
            color: urgent ? LK.danger : LK.espresso,
            fontVariant: ['tabular-nums'],
          }}
        >
          {secondsLeft}s
        </Text>
      </View>
    );
  }

  // Skribbl-style masked word: a slot per letter (underscore until revealed),
  // spaces render as gaps, punctuation (e.g. the hyphen in "yo-yo") shows up front.
  function renderHintBar() {
    if (!hint.length) return null;
    const letterCount = hint.filter((c) => c === '_' || /[a-z]/i.test(c)).length;
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end', gap: 6 }}>
        {hint.map((ch, i) => {
          if (ch === ' ') return <View key={i} style={{ width: 12 }} />;
          const hidden = ch === '_';
          const isLetterSlot = hidden || /[a-z]/i.test(ch);
          return (
            <View key={i} style={{ alignItems: 'center', width: 15 }}>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 19, lineHeight: 23, color: LK.espresso }}>
                {hidden ? ' ' : ch.toUpperCase()}
              </Text>
              {isLetterSlot && (
                <View style={{ width: 13, height: 2.5, borderRadius: 2, backgroundColor: hidden ? 'rgba(42,33,26,0.28)' : LK.coral }} />
              )}
            </View>
          );
        })}
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 11, color: LK.faded, marginLeft: 3, marginBottom: 1 }}>
          {letterCount}
        </Text>
      </View>
    );
  }

  function renderLobby() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 24 }}>
        <MascotAnimation name="lo-kit-idle" size={168} />
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text
            style={{
              fontFamily: theme.fonts.heading,
              fontWeight: '800',
              fontSize: 26,
              color: LK.espresso,
              letterSpacing: -0.5,
              textAlign: 'center',
            }}
          >
            Draw & Guess
          </Text>
          <Text
            style={{
              fontFamily: theme.fonts.hand,
              fontSize: 17,
              color: LK.sepia,
              textAlign: 'center',
            }}
          >
            one draws, one guesses — 90 seconds
          </Text>
        </View>

        {!coupleId && (
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, color: LK.sepia, textAlign: 'center' }}>
            Connect with your partner to play.
          </Text>
        )}

        {/* 2-player gate: only allow starting once the partner is also in the game. */}
        {coupleId && !partnerOnline && (
          <View style={{ alignItems: 'center', gap: 14 }}>
            <PulsingDots />
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5, color: LK.sepia, textAlign: 'center', maxWidth: 260, lineHeight: 21 }}>
              Waiting for {partnerName} to join…
            </Text>
            <Text style={{ fontFamily: theme.fonts.hand, fontSize: 15, color: LK.faded, textAlign: 'center' }}>
              we’ve sent them a nudge to hop in
            </Text>
            <ScalePressable
              scaleTo={0.97}
              onPress={inviteAgain}
              disabled={justInvited}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                backgroundColor: justInvited ? 'rgba(42,33,26,0.06)' : LK.coral,
                borderRadius: 9999,
                paddingHorizontal: 28,
                paddingVertical: 14,
                marginTop: 4,
              }}
              accessibilityLabel={`Invite ${partnerName}`}
            >
              <Icon name={justInvited ? 'check' : 'bell'} size={16} color={justInvited ? LK.sepia : '#fff'} strokeWidth={2} />
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: justInvited ? LK.sepia : '#fff' }}>
                {justInvited ? 'Invite sent' : `Invite ${partnerName}`}
              </Text>
            </ScalePressable>
          </View>
        )}

        {coupleId && partnerOnline && (
          <ScalePressable
            scaleTo={0.97}
            onPress={startRound}
            style={{
              backgroundColor: LK.coral,
              borderRadius: 9999,
              paddingHorizontal: 40,
              paddingVertical: 16,
              boxShadow: '0 4px 16px rgba(255,122,107,0.35)',
            }}
            accessibilityLabel="Start a round"
          >
            <Text
              style={{
                fontFamily: theme.fonts.body,
                fontWeight: '700',
                fontSize: 16,
                color: '#fff',
              }}
            >
              Start a round
            </Text>
          </ScalePressable>
        )}
      </View>
    );
  }

  function renderWordPick() {
    if (role === 'drawer') {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 24 }}>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: LK.faded }}>
            Pick a word to draw
          </Text>
          <Text style={{ fontFamily: theme.fonts.hand, fontSize: 16, color: LK.sepia }}>
            {partnerName} will guess it — choose wisely!
          </Text>
          <View style={{ width: '100%', gap: 12 }}>
            {(['Easy', 'Medium', 'Hard'] as const).map((label, i) => (
              <ScalePressable
                key={label}
                scaleTo={0.98}
                onPress={() => pickWord(wordOptions[i])}
                accessibilityLabel={`${label}: ${wordOptions[i]}`}
                style={{
                  backgroundColor: LK.vellum,
                  borderRadius: 16,
                  borderCurve: 'continuous',
                  borderWidth: 1.5,
                  borderColor: 'rgba(42,33,26,0.13)',
                  padding: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  ...theme.shadow.sm,
                }}
              >
                <View style={{ gap: 2 }}>
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 11, color: LK.faded, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {label}
                  </Text>
                  <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 22, color: LK.espresso }}>
                    {wordOptions[i]}
                  </Text>
                </View>
                <Icon name="chevR" size={18} color={LK.faded} />
              </ScalePressable>
            ))}
          </View>
        </View>
      );
    }

    // Guesser waiting
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <MascotAnimation name="lo-kit-idle" size={140} />
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 16, color: LK.espresso }}>
          {partnerName} is picking a word…
        </Text>
        <PulsingDots />
      </View>
    );
  }

  function renderDrawer() {
    return (
      <View style={{ flex: 1 }}>
        {renderTimerBar()}
        {/* Word pill + countdown */}
        <View style={{ alignItems: 'center', paddingVertical: 10, gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                backgroundColor: LK.espresso,
                borderRadius: 9999,
                borderCurve: 'continuous',
                paddingHorizontal: 18,
                paddingVertical: 7,
              }}
            >
              <Text
                style={{
                  fontFamily: theme.fonts.body,
                  fontWeight: '700',
                  fontSize: 14,
                  color: LK.vellum,
                }}
              >
                {chosenWord}
              </Text>
            </View>
            {renderCountdown()}
          </View>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: partnerOnline ? LK.sepia : LK.danger }}>
            {partnerOnline ? `${partnerName} is watching` : `${partnerName} left — waiting…`}
          </Text>
        </View>

        {/* Canvas */}
        <DrawCanvas
          mode="draw"
          strokes={strokes}
          color={erasing ? ERASER_COLOR : drawColor}
          brushWidth={erasing ? brushWidth * 2 : brushWidth}
          onStroke={handleStroke}
          style={{ flex: 1 }}
        />

        <DrawToolbar
          color={drawColor}
          brushWidth={brushWidth}
          erasing={erasing}
          onColorChange={setDrawColor}
          onBrushChange={setBrushWidth}
          onEraserToggle={() => setErasing((e) => !e)}
          onUndo={undoStroke}
          onClear={clearCanvas}
        />
      </View>
    );
  }

  function renderGuesser() {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        {renderTimerBar()}
        {/* Countdown + skribbl-style word hint */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 }}>
          {renderCountdown()}
          <View style={{ flex: 1 }}>{renderHintBar()}</View>
        </View>
        {/* Canvas — upper ~65% */}
        <DrawCanvas
          mode="watch"
          strokes={strokes}
          style={{ flex: 1 }}
        />

        {/* "Drawing…" indicator */}
        {partnerDrawing && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8 }}>
            <PulsingDots />
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: LK.sepia }}>
              {partnerName} is drawing…
            </Text>
          </View>
        )}

        {/* Guess history */}
        {guesses.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 6 }}
          >
            {guesses.map((g, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: LK.ivory,
                  borderRadius: 9999,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderWidth: 1,
                  borderColor: 'rgba(42,33,26,0.10)',
                }}
              >
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: LK.sepia }}>{g}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Guess input */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: LK.vellum,
            borderTopWidth: 1,
            borderTopColor: 'rgba(42,33,26,0.08)',
          }}
        >
          <TextInput
            value={guessInput}
            onChangeText={setGuessInput}
            onSubmitEditing={submitGuess}
            placeholder="What is it?"
            placeholderTextColor={LK.faded}
            returnKeyType="send"
            autoCorrect={false}
            autoCapitalize="none"
            style={{
              flex: 1,
              height: 44,
              backgroundColor: LK.ivory,
              borderRadius: 12,
              borderCurve: 'continuous',
              borderWidth: 1.5,
              borderColor: 'rgba(42,33,26,0.12)',
              paddingHorizontal: 14,
              fontFamily: theme.fonts.body,
              fontSize: 16,
              color: LK.espresso,
            }}
          />
          <ScalePressable
            onPress={submitGuess}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: LK.coral,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel="Submit guess"
          >
            <Icon name="plane" size={18} color="#fff" />
          </ScalePressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  function renderCelebration() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 32 }}>
        <ConfettiShower active />
        <MascotAnimation name="quiz-matched" size={184} />
        <Animated.Text
          entering={ZoomIn.springify().damping(theme.spring.bounce.damping).stiffness(theme.spring.bounce.stiffness).reduceMotion(ReduceMotion.System)}
          style={{
            fontFamily: theme.fonts.heading,
            fontWeight: '800',
            fontSize: 34,
            color: LK.coral,
            textAlign: 'center',
            letterSpacing: -0.5,
          }}
        >
          {revealWord}
        </Animated.Text>
        <Text
          style={{
            fontFamily: theme.fonts.hand,
            fontSize: 20,
            color: LK.sepia,
            textAlign: 'center',
          }}
        >
          you two know each other so well
        </Text>
        <ScalePressable
          scaleTo={0.97}
          onPress={goNextRound}
          accessibilityLabel="Next round"
          style={{
            backgroundColor: LK.espresso,
            borderRadius: 9999,
            paddingHorizontal: 36,
            paddingVertical: 14,
            marginTop: 8,
          }}
        >
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: LK.vellum }}>
            Next round
          </Text>
        </ScalePressable>
      </View>
    );
  }

  function renderTimeout() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 32 }}>
        <MascotAnimation name="quiz-wrong" size={168} />
        <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 22, color: LK.espresso, textAlign: 'center' }}>
          Time's up!
        </Text>
        <View
          style={{
            backgroundColor: LK.ivory,
            borderRadius: 16,
            borderCurve: 'continuous',
            paddingHorizontal: 24,
            paddingVertical: 14,
            borderWidth: 1.5,
            borderColor: 'rgba(42,33,26,0.12)',
          }}
        >
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.faded, textAlign: 'center', marginBottom: 4 }}>
            The word was
          </Text>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 26, color: LK.espresso, textAlign: 'center' }}>
            {revealWord}
          </Text>
        </View>
        <Text style={{ fontFamily: theme.fonts.hand, fontSize: 17, color: LK.sepia, textAlign: 'center' }}>
          so close — try again!
        </Text>
        <ScalePressable
          scaleTo={0.97}
          onPress={goNextRound}
          accessibilityLabel="Next round"
          style={{
            backgroundColor: LK.espresso,
            borderRadius: 9999,
            paddingHorizontal: 36,
            paddingVertical: 14,
          }}
        >
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: LK.vellum }}>
            Next round
          </Text>
        </ScalePressable>
      </View>
    );
  }

  const showHeader = phase !== 'drawing' || role !== 'drawer';

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: LK.parchment }}
      edges={phase === 'drawing' ? ['top', 'bottom'] : ['top', 'bottom']}
    >
      {/* Header — shown on all non-full-screen-draw phases */}
      {showHeader && (
        <View
          style={{
            height: 52,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            gap: 12,
          }}
        >
          <ScalePressable
            onPress={quit}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: LK.ivory,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1.5,
              borderColor: 'rgba(42,33,26,0.12)',
            }}
            accessibilityLabel="Leave game"
          >
            <Icon name="x" size={15} color={LK.sepia} />
          </ScalePressable>
          <Text
            style={{
              flex: 1,
              fontFamily: theme.fonts.heading,
              fontWeight: '700',
              fontSize: 18,
              color: LK.espresso,
              letterSpacing: -0.3,
            }}
          >
            Draw & Guess
          </Text>
          {phase === 'drawing' && role === 'guesser' && (
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.sepia }}>
              Round {roundNum}
            </Text>
          )}
        </View>
      )}

      {/* Compact header for full-screen drawer */}
      {!showHeader && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 6,
            gap: 8,
          }}
        >
          <ScalePressable
            onPress={() => {
              Alert.alert('Leave game?', 'Your partner will see "time up".', [
                { text: 'Stay', style: 'cancel' },
                { text: 'Leave', style: 'destructive', onPress: quit },
              ]);
            }}
            accessibilityLabel="Leave game"
            style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(42,33,26,0.08)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="x" size={14} color={LK.sepia} />
          </ScalePressable>
          <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 13, color: LK.sepia, textAlign: 'center' }}>
            Round {roundNum}
          </Text>
          <View style={{ width: 32 }} />
        </View>
      )}

      {/* Phase content */}
      {phase === 'lobby' && renderLobby()}
      {phase === 'word_pick' && renderWordPick()}
      {phase === 'drawing' && role === 'drawer' && renderDrawer()}
      {phase === 'drawing' && role === 'guesser' && renderGuesser()}
      {phase === 'celebrating' && renderCelebration()}
      {phase === 'timeout' && renderTimeout()}
    </SafeAreaView>
  );
}
