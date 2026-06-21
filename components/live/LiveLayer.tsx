import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { SwipeCard } from '@/components/game/SwipeCard';
import MascotAnimation from '@/components/ui/mascot-animation';
import { useLiveSession, type LiveEvent } from '@/hooks/useLiveSession';
import { notifyPartner } from '@/lib/push';
import { LIVE_PROMPTS, categoryIndices, categoryOfIndex, fillNames } from '@/constants/live-games';

const ROUNDS = 8;

type Mode = 'idle' | 'inviting' | 'invited' | 'playing' | 'summary';

/** After Dark spice tiers, shown in the picker before an After Dark game starts. */
const SPICE: Record<1 | 2 | 3, { name: string; blurb: string }> = {
  1: { name: 'Flirty', blurb: 'Sweet, teasing, warm' },
  2: { name: 'Steamy', blurb: 'Sensual & bold' },
  3: { name: 'Explicit', blurb: 'No holding back' },
};

function shuffledOrder(categoryId?: string | null, level?: 1 | 2 | 3 | null): number[] {
  const idx = categoryIndices(categoryId, level);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, ROUNDS);
}

// Total deterministic order over two equal-length arrays, so both clients pick
// the same one when resolving a simultaneous-invite tie.
function lexLess(a: number[], b: number[]): boolean {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) return a[i] < b[i];
  }
  return a.length < b.length;
}

const tap = () => { try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {} };
const pop = () => { try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {} };

/**
 * "You're both online" live presence + a co-op This-or-That game.
 * Renders a floating banner when the partner is online and overlays for the
 * invite handshake and the game itself.
 */
export type LiveHandle = { start: (categoryId?: string) => void };

export const LiveLayer = forwardRef<LiveHandle, {
  coupleId: string | null;
  userId: string | null;
  partnerName?: string | null;
  myName?: string | null;
  onWatch?: () => void;
}>(function LiveLayer({ coupleId, userId, partnerName, myName, onWatch }, ref) {
  const partner = partnerName?.trim().split(' ')[0] || 'your partner';

  // For "Who's more likely" prompts the two answers are the partners' names.
  // Both phones must agree which name is option 'a' vs 'b' (the match check is
  // keyed on 'a'/'b'), so we sort the two first names into a stable shared order.
  const myFirst = myName?.trim().split(' ')[0] || 'You';
  const partnerFirst = partnerName?.trim().split(' ')[0] || 'Partner';
  const [name1, name2] = [myFirst, partnerFirst].sort((x, y) => x.localeCompare(y));

  const [mode, setMode] = useState<Mode>('idle');
  const [order, setOrder] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const [myChoice, setMyChoice] = useState<'a' | 'b' | null>(null);
  const [partnerChoice, setPartnerChoice] = useState<'a' | 'b' | null>(null);
  // When set, the After Dark spice picker is showing (holds the category id).
  const [spiceFor, setSpiceFor] = useState<string | null>(null);
  const results = useRef<Record<number, boolean>>({});

  // Keep refs so the memoized broadcast handler always sees the latest values
  // (it's created once, so closing over state directly would go stale).
  const roundRef = useRef(round);
  roundRef.current = round;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const orderRef = useRef(order);
  orderRef.current = order;

  const onEvent = useCallback((e: LiveEvent) => {
    switch (e.kind) {
      case 'invite':
        // Only surface an invite if we're not already mid-game.
        if (modeRef.current === 'idle' || modeRef.current === 'invited') {
          setOrder(e.order);
          setMode('invited');
          pop();
        } else if (modeRef.current === 'inviting') {
          // Both tapped "Play" at once — each is waiting for the other to
          // accept, which would deadlock. Converge instead: both sides already
          // hold each other's order, so pick the same one deterministically
          // (lexicographically smaller wins) and start together.
          const ord = lexLess(e.order, orderRef.current) ? e.order : orderRef.current;
          setOrder(ord);
          startGame();
        } else if (modeRef.current === 'playing' || modeRef.current === 'summary') {
          // We already accepted and moved on, but the partner is still inviting
          // — our accept was dropped. Re-affirm so they catch up. (We keep our
          // own order, which is the one they sent us, so we stay in sync.)
          send({ kind: 'accept' });
        }
        break;
      case 'accept':
        if (modeRef.current === 'inviting') startGame();
        break;
      case 'decline':
        if (modeRef.current === 'inviting') setMode('idle');
        break;
      case 'answer':
        if (e.round === roundRef.current) setPartnerChoice(e.choice);
        break;
      case 'next':
        if (e.round > roundRef.current) applyNext(e.round);
        break;
      case 'end':
        resetToIdle();
        break;
    }
  }, []);

  const { partnerOnline, send } = useLiveSession(coupleId, userId, onEvent);

  // Allow the home screen to launch an invite from a dedicated button (works
  // even if the partner is offline — they get a push and the invite re-sends
  // once they come online).
  useImperativeHandle(ref, () => ({ start: (categoryId?: string) => {
    if (modeRef.current !== 'idle') return;
    // After Dark first asks how spicy; every other deck starts straight away.
    if (categoryId === 'after-dark') { setSpiceFor(categoryId); tap(); return; }
    invite(categoryId);
  } }), []);

  function pickSpice(level: 1 | 2 | 3) {
    const id = spiceFor ?? 'after-dark';
    setSpiceFor(null);
    invite(id, level);
  }

  function resetToIdle() {
    setMode('idle');
    setRound(0);
    setMyChoice(null);
    setPartnerChoice(null);
    results.current = {};
  }

  function startGame() {
    setRound(0);
    setMyChoice(null);
    setPartnerChoice(null);
    results.current = {};
    setMode('playing');
  }

  function applyNext(nr: number) {
    if (nr >= orderRef.current.length) { setMode('summary'); return; }
    setRound(nr);
    setMyChoice(null);
    setPartnerChoice(null);
  }

  // ── Initiate ───────────────────────────────────────────────────────────
  function invite(categoryId?: string, level?: 1 | 2 | 3) {
    const ord = shuffledOrder(categoryId, level);
    setOrder(ord);
    setMode('inviting');
    tap();
    send({ kind: 'invite', order: ord });
    notifyPartner('live_invite', '💞 Play together?', 'Your partner wants to play This or That — tap to join');
  }

  // Broadcasts are fire-and-forget and occasionally dropped, which made the
  // invite feel hit-or-miss. While we're waiting, keep re-sending the invite on
  // an interval until the partner accepts (we leave 'inviting') or we give up.
  // This also covers the partner opening the app from the push after the first
  // broadcast was missed — the next tick reaches them.
  useEffect(() => {
    if (mode !== 'inviting' || !order.length) return;
    send({ kind: 'invite', order });
    const id = setInterval(() => send({ kind: 'invite', order }), 2000);
    return () => clearInterval(id);
  }, [mode, order, send]);

  // Give up waiting after a while so the inviter isn't stuck.
  useEffect(() => {
    if (mode !== 'inviting') return;
    const t = setTimeout(() => setMode('idle'), 45000);
    return () => clearTimeout(t);
  }, [mode]);

  // Rounds ride the same fire-and-forget broadcast, so a dropped 'answer' or
  // 'next' would strand a partner ("Waiting for…", or stuck on the reveal while
  // the other moves on). While playing, re-assert our state on an interval until
  // it has clearly landed. Both sends are idempotent on the receiver:
  //  - resend my answer until this round advances (clears myChoice) — guarantees
  //    the partner gets it even if they already revealed and are waiting on me;
  //  - resend the round advance until the partner reaches this round (signalled
  //    by their answer arriving, i.e. partnerChoice set) — pulls a laggard fwd.
  useEffect(() => {
    if (mode !== 'playing') return;
    const beat = () => {
      if (myChoice) send({ kind: 'answer', round, choice: myChoice });
      if (round > 0 && partnerChoice == null) send({ kind: 'next', round });
    };
    const id = setInterval(beat, 1500);
    return () => clearInterval(id);
  }, [mode, round, myChoice, partnerChoice, send]);

  function accept() {
    tap();
    send({ kind: 'accept' });
    startGame();
  }
  function decline() {
    send({ kind: 'decline' });
    setMode('idle');
  }

  function choose(c: 'a' | 'b') {
    if (myChoice) return; // locked once chosen this round
    tap();
    setMyChoice(c);
    send({ kind: 'answer', round, choice: c });
  }

  function next() {
    const nr = round + 1;
    send({ kind: 'next', round: nr });
    applyNext(nr);
  }

  function quit() {
    send({ kind: 'end' });
    resetToIdle();
  }

  // Record the round result once both have answered.
  const revealed = !!myChoice && !!partnerChoice;
  const matched = revealed && myChoice === partnerChoice;
  useEffect(() => {
    if (mode === 'playing' && revealed) results.current[round] = matched;
  }, [revealed, matched, round, mode]);

  const matchCount = Object.values(results.current).filter(Boolean).length;

  // The category being played is encoded in the synced order, so both phones
  // show the same label and "Play again" replays the same set.
  const playedCat = order.length ? categoryOfIndex(order[0]) : null;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating "both online" banner */}
      {mode === 'idle' && partnerOnline && (
        <View pointerEvents="box-none" style={styles.bannerWrap}>
          <View style={styles.banner}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: LK.success }} />
            <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: LK.espresso }}>
              You're both online 💞
            </Text>
            {onWatch && (
              <TouchableOpacity onPress={() => { tap(); onWatch(); }} style={[styles.bannerBtn, { backgroundColor: tint(LK.coral, 0.5) }]}>
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 12.5, color: shade(LK.coral, 0.55) }}>Watch</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => invite()} style={styles.bannerBtn}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 12.5, color: '#fff' }}>Play</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* After Dark spice picker (inviter chooses the exact tier) */}
      <CenterModal visible={!!spiceFor}>
        <Text style={styles.h}>How spicy tonight? 🌶️</Text>
        <Text style={styles.p}>Pick a level — you'll both get questions at exactly that heat.</Text>
        <View style={{ gap: 10, marginTop: 16 }}>
          {([1, 2, 3] as const).map((lvl) => (
            <TouchableOpacity
              key={lvl}
              onPress={() => pickSpice(lvl)}
              activeOpacity={0.85}
              accessibilityLabel={`${SPICE[lvl].name} — level ${lvl}`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: tint(LK.coral, lvl === 1 ? 0.6 : lvl === 2 ? 0.42 : 0.26), borderRadius: 16, padding: 14 }}
            >
              <Text style={{ fontSize: 18 }}>{'🌶️'.repeat(lvl)}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 16, color: LK.espresso }}>{SPICE[lvl].name}</Text>
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70 }}>{SPICE[lvl].blurb}</Text>
              </View>
              <Icon name="chevR" size={18} color={shade(LK.coral, 0.5)} />
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ marginTop: 14 }}>
          <GhostBtn label="Cancel" onPress={() => setSpiceFor(null)} />
        </View>
      </CenterModal>

      {/* Inviting (waiting) */}
      <CenterModal visible={mode === 'inviting'}>
        <Text style={styles.h}>Waiting for {partner}…</Text>
        <Text style={styles.p}>We've sent an invite to play This or That. Hang tight 💛</Text>
        <View style={{ marginTop: 18 }}>
          <GhostBtn label="Cancel" onPress={() => { send({ kind: 'end' }); setMode('idle'); }} />
        </View>
      </CenterModal>

      {/* Invited (accept/decline) */}
      <CenterModal visible={mode === 'invited'}>
        <View style={{ alignItems: 'center', marginBottom: 4 }}>
          <MascotAnimation name="connected" size={80} />
        </View>
        <Text style={styles.h}>{partner} wants to play</Text>
        <Text style={styles.p}>This or That — answer together and see how in sync you are.</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
          <View style={{ flex: 1 }}><GhostBtn label="Not now" onPress={decline} /></View>
          <View style={{ flex: 1.4 }}><SolidBtn label="Join" onPress={accept} /></View>
        </View>
      </CenterModal>

      {/* Playing */}
      <Modal visible={mode === 'playing'} animationType="fade" onRequestClose={quit} statusBarTranslucent>
        <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top', 'bottom']}>
          {/* Lilac progress bar (§13.20) */}
          <View style={{ height: 4, backgroundColor: 'rgba(155,140,255,0.20)' }}>
            <View style={{ height: 4, borderRadius: 2, backgroundColor: LK.lilac, width: `${(round / Math.max(order.length, 1)) * 100}%` }} />
          </View>

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
            <View style={{ flex: 1 }}>
              {playedCat && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: playedCat.color }} />
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 11.5, color: shade(playedCat.color, 0.45), letterSpacing: 0.6 }}>
                    {playedCat.name.toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: LK.sepia, marginTop: 2 }}>
                {round + 1} of {order.length}
              </Text>
            </View>
            <TouchableOpacity onPress={quit} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(42,33,26,0.07)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="x" size={18} color={LK.sepia} />
            </TouchableOpacity>
          </View>

          {/* Game area */}
          <View style={{ flex: 1, paddingHorizontal: 20, justifyContent: 'center' }}>
            {order[round] != null && (() => {
              const prompt = LIVE_PROMPTS[order[round]];
              const fill = (s: string) => fillNames(s, name1, name2);

              if (!myChoice && !revealed) {
                // ── Swipe phase ──────────────────────────────────
                return (
                  <View>
                    <Text style={{ fontFamily: theme.fonts.handMedium, fontSize: 15, color: LK.sepia, textAlign: 'center', marginBottom: 20 }}>
                      Swipe to answer — you both go at once
                    </Text>
                    <SwipeCard
                      key={`round-${round}`}
                      prompt={prompt}
                      name1={name1}
                      name2={name2}
                      disabled={false}
                      onChoose={(c) => choose(c)}
                    />
                  </View>
                );
              }

              if (myChoice && !revealed) {
                // ── Waiting for partner ──────────────────────────
                return (
                  <View style={{ alignItems: 'center', gap: 20 }}>
                    <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: tint(LK.sky, 0.55), alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 22, color: shade(LK.sky, 0.5) }}>
                        {partner.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <PulsingDots />
                    <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: LK.sepia }}>
                      Waiting for {partner}…
                    </Text>
                    <View style={{ backgroundColor: LK.ivory, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 10, borderWidth: 1.5, borderColor: myChoice === 'a' ? tint(LK.coral, 0.6) : tint(LK.sky, 0.6) }}>
                      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13.5, color: LK.espresso }}>
                        Your pick: {fill(prompt[myChoice])}
                      </Text>
                    </View>
                  </View>
                );
              }

              // ── Reveal ───────────────────────────────────────
              const myText = fill(prompt[myChoice!]);
              const partnerText = fill(prompt[partnerChoice!]);
              return (
                <View style={{ alignItems: 'center', gap: 16 }}>
                  {matched ? (
                    <>
                      <MascotAnimation name="quiz-matched" size={120} />
                      <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 22, color: LK.espresso }}>
                        Matched!
                      </Text>
                      <View style={{ backgroundColor: 'rgba(95,199,155,0.18)', borderRadius: 9999, borderWidth: 1.5, borderColor: tint(LK.success, 0.5), paddingHorizontal: 20, paddingVertical: 10 }}>
                        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: LK.espresso }}>{myText}</Text>
                      </View>
                      {matchCount > 1 && (
                        <View style={{ backgroundColor: tint(LK.coral, 0.65), borderRadius: 9999, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                          <Image source={require('../../assets/doodles/flame.svg')} style={{ width: 14, height: 14 }} contentFit="contain" tintColor={LK.coral} />
                          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 13, color: shade(LK.coral, 0.55) }}>{matchCount} streak</Text>
                        </View>
                      )}
                    </>
                  ) : (
                    <>
                      <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 22, color: LK.espresso }}>
                        Different taste!
                      </Text>
                      <Text style={{ fontFamily: theme.fonts.body, fontSize: 13.5, color: LK.sepia, textAlign: 'center' }}>
                        Opposites keep it interesting
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                        <View style={{ flex: 1, backgroundColor: tint(LK.coral, 0.6), borderRadius: 16, padding: 14, alignItems: 'center' }}>
                          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11, color: shade(LK.coral, 0.55), marginBottom: 4 }}>You</Text>
                          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: LK.espresso, textAlign: 'center' }}>{myText}</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: tint(LK.sky, 0.6), borderRadius: 16, padding: 14, alignItems: 'center' }}>
                          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11, color: shade(LK.sky, 0.55), marginBottom: 4 }}>{partner}</Text>
                          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: LK.espresso, textAlign: 'center' }}>{partnerText}</Text>
                        </View>
                      </View>
                    </>
                  )}
                  <TouchableOpacity
                    onPress={next}
                    style={{ backgroundColor: LK.espresso, borderRadius: 9999, paddingHorizontal: 32, paddingVertical: 14, marginTop: 8, ...theme.shadow.sm }}
                  >
                    <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 15, color: '#fff' }}>
                      {round + 1 >= order.length ? 'See results →' : 'Next card →'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })()}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Summary */}
      <CenterModal visible={mode === 'summary'}>
        <View style={{ alignItems: 'center', marginBottom: 4 }}>
          <MascotAnimation name="quiz-matched" size={100} />
        </View>
        <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 48, color: LK.espresso, textAlign: 'center', letterSpacing: -1.5, fontVariant: ['tabular-nums'] }}>
          {Math.round((matchCount / Math.max(order.length, 1)) * 100)}%
        </Text>
        <Text style={styles.h}>{matchCount} of {order.length} matched</Text>
        <Text style={styles.p}>
          {matchCount >= order.length * 0.6
            ? "You two really are in sync"
            : 'Opposites keep it interesting — play again?'}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
          <View style={{ flex: 1 }}><GhostBtn label="Done" onPress={quit} /></View>
          <View style={{ flex: 1.4 }}><SolidBtn label="Play again" onPress={() => invite(playedCat?.id)} /></View>
        </View>
      </CenterModal>
    </>
  );
});

// ── Small pieces ─────────────────────────────────────────────────────────
function PulsingDots() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((d) => (d + 1) % 3), 420);
    return () => clearInterval(id);
  }, []);
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: LK.sepia, opacity: active === i ? 1 : 0.28 }} />
      ))}
    </View>
  );
}

function CenterModal({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.5)', justifyContent: 'center', paddingHorizontal: 28 }}>
        <View style={{ backgroundColor: LK.parchment, borderRadius: 26, padding: 24 }}>{children}</View>
      </View>
    </Modal>
  );
}
function SolidBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: LK.espresso, borderRadius: 9999, paddingVertical: 14, alignItems: 'center' }}>
      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 15, color: '#fff' }}>{label}</Text>
    </TouchableOpacity>
  );
}
function GhostBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: 'rgba(42,33,26,0.07)', borderRadius: 9999, paddingVertical: 14, alignItems: 'center' }}>
      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: LK.ink70 }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bannerWrap: { position: 'absolute', left: 0, right: 0, bottom: 96, alignItems: 'center', paddingHorizontal: 16 },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: LK.vellum, borderRadius: 9999, paddingLeft: 16, paddingRight: 6, paddingVertical: 6,
    ...theme.shadow.card, maxWidth: 360, width: '100%',
  },
  bannerBtn: { backgroundColor: LK.espresso, borderRadius: 9999, paddingHorizontal: 14, paddingVertical: 9 },
  h: { fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 21, color: LK.espresso, textAlign: 'center', marginTop: 8 },
  p: { fontFamily: theme.fonts.body, fontSize: 13.5, color: LK.ink70, textAlign: 'center', marginTop: 6, lineHeight: 20 },
});
